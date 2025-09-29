import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { sendMail } from '@/lib/apis/mail';
import fs from 'fs';
import path from 'path';

// Helper function to create ticket ID
function createTicketId(prefix: string, length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to write to file (simulating jsonfile.writeFile)
function writeToFile(filePath: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log('📁 Writing to file:', filePath);
      console.log('📦 Data to write:', JSON.stringify(data, null, 2));
      
      const dir = path.dirname(filePath);
      console.log('📂 Directory:', dir);
      
      if (!fs.existsSync(dir)) {
        console.log('📁 Creating directory:', dir);
        fs.mkdirSync(dir, { recursive: true });
      }
      
      let existingData = [];
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          existingData = JSON.parse(fileContent);
          console.log('📖 Existing data loaded, entries:', existingData.length);
        } catch (error) {
          console.warn('⚠️ Could not parse existing file, starting fresh:', error);
          existingData = [];
        }
      } else {
        console.log('📄 File does not exist, creating new one');
      }
      
      existingData.push(data);
      console.log('📝 Total entries after adding new:', existingData.length);
      
      const jsonString = JSON.stringify(existingData, null, 2);
      
      fs.writeFile(filePath, jsonString, (err) => {
        if (err) {
          console.error('❌ File write error:', err);
          reject(err);
        } else {
          console.log('✅ File written successfully');
          resolve();
        }
      });
    } catch (error) {
      console.error('❌ Error in writeToFile:', error);
      reject(error);
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    
    // Get user data from Strapi
    const userData = await strapiGet('/users', {
      filters: {
        email: { $eqi: user.email }
      }
    });
    
    const strapiUser = userData[0];
    
    return NextResponse.json({
      phone: strapiUser?.phone || ''
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    const formData = await request.json();
    
    // Debug: Log the received form data
    console.log('=== WiFi Ticket Form Data ===');
    console.log('Full form data:', JSON.stringify(formData, null, 2));
    console.log('Phone:', formData.phone);
    console.log('Download Speed:', formData.downloadSpeed);
    console.log('Additional Details:', formData.message);
    console.log('Location:', formData.location);
    console.log('Specific Location:', formData.specificLocation);
    console.log('Submission Timestamp:', formData.submissionTimestamp);
    console.log('WiFi Status:', formData.wifiStatus);
    console.log('=============================');
    
    // Update user phone number in Strapi
    if (formData.phone) {
      try {
        const userData = await strapiGet('/users', {
          filters: {
            email: { $eqi: user.email }
          }
        });
        
        if (userData && userData[0]) {
          const strapiUser = userData[0];
          strapiUser.phone = formData.phone;
          
          await strapiPut(`/users/${strapiUser.id}`, strapiUser);
          console.log('✅ Phone number updated in Strapi:', formData.phone);
        }
      } catch (strapiError) {
        console.error('❌ Error updating phone in Strapi:', strapiError);
        // Continue with ticket creation even if phone update fails
      }
    }
    
    // Generate ticket ID
    const ticketId = createTicketId("WIFI", 8);
    const isOnAshokaWifi = formData.wifiStatus === "onWifi";
    
    // Ensure we have a timestamp
    const timestamp = formData.submissionTimestamp || new Date().toISOString();
    
    // Create WiFi ticket object with all fields properly mapped
    const wifiTicket = {
      ticketId: ticketId,
      user: user.email,
      phone: formData.phone || 'Not provided',
      networkStatus: isOnAshokaWifi ? "On Ashoka WiFi" : "Not on Ashoka WiFi",
      downloadSpeed: isOnAshokaWifi ? (formData.downloadSpeed ? formData.downloadSpeed + " Mbps" : "Not provided") : "N/A",
      complaintType: formData.complaintType || 'Not specified',
      location: formData.location || 'Not specified',
      specificLocation: formData.specificLocation || 'Not specified',
      additionalDetails: formData.message || formData.additionalDetails || 'No additional details provided',
      submissionTimestamp: timestamp,
      // Add raw form data for debugging
      rawFormData: formData
    };
    
    console.log('📝 WiFi Ticket Object:');
    console.log(JSON.stringify(wifiTicket, null, 2));
    
    // Write to file (you may want to configure this path)
    const wifiTicketFile = path.join(process.cwd(), 'data', 'wifi-tickets.json');
    try {
      await writeToFile(wifiTicketFile, wifiTicket);
      console.log('✅ WiFi ticket saved to file:', wifiTicketFile);
    } catch (fileError) {
      console.error('❌ Error saving to file:', fileError);
      // Continue with email sending even if file save fails
    }
    
    // Send email notification
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #f5f5f5; }
              .warning { color: #dc3545; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>New WiFi Issue Ticket</h2>
              ${!isOnAshokaWifi ? 
                  '<p class="warning">Note: User was not able to submit this page through Ashoka Wifi, as it was not working for them.</p>' : ''}
              <table>
                  <tr>
                      <th>Ticket ID</th>
                      <td>${ticketId}</td>
                  </tr>
                  <tr>
                      <th>User</th>
                      <td>${user.email}</td>
                  </tr>
                  <tr>
                      <th>Phone Number</th>
                      <td>${wifiTicket.phone}</td>
                  </tr>
                  <tr>
                      <th>Network Status</th>
                      <td>${wifiTicket.networkStatus}</td>
                  </tr>
                  <tr>
                      <th>Download Speed</th>
                      <td>${wifiTicket.downloadSpeed}</td>
                  </tr>
                  <tr>
                      <th>Complaint Type</th>
                      <td>${wifiTicket.complaintType}</td>
                  </tr>
                  <tr>
                      <th>Location</th>
                      <td>${wifiTicket.location}</td>
                  </tr>
                  <tr>
                      <th>Room/Floor</th>
                      <td>${wifiTicket.specificLocation}</td>
                  </tr>
                  <tr>
                      <th>Additional Details</th>
                      <td>${wifiTicket.additionalDetails}</td>
                  </tr>
                  <tr>
                      <th>Date Submitted</th>
                      <td>${wifiTicket.submissionTimestamp}</td>
                  </tr>
              </table>
              <br>
          </div>
      </body>
      </html>
    `;
    
    try {
      console.log('📧 Sending email notification...');
      console.log('To:', process.env.WIFI_SUPPORT);
      console.log('CC:', user.email);
      console.log('Subject:', `WiFi Issue Ticket #${ticketId} - ${wifiTicket.complaintType}`);
      
      await sendMail({
        from: `WiFi Tickets <${process.env.TECHMAIL_ID}>`,
        to: process.env.WIFI_SUPPORT!,
        cc: user.email,
        subject: `WiFi Issue Ticket #${ticketId} - ${wifiTicket.complaintType}`,
        html: emailHtml
      });
      
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      // Continue and return success even if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: "WiFi ticket submitted successfully! You will receive a confirmation email shortly.",
      ticketId: ticketId
    });
    
  } catch (error) {
    console.error('Error processing WiFi ticket:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit WiFi ticket. Please try again.' 
      },
      { status: 500 }
    );
  }
}
