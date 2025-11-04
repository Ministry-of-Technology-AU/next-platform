import { NextRequest, NextResponse } from 'next/server'
import { strapiGet, strapiPut } from '@/lib/apis/strapi'
import { sendMailSG } from '@/lib/apis/mail'
import { getEmailAttachments, deleteFromDrive, extractFileIds } from '@/lib/apis/drive'

// GET /api/sg-compose/dashboard - Fetch all pending emails for admin dashboard
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Build query parameters
        const queryParams: any = {
            populate: {
                sender: {
                    fields: ['id', 'email', 'username']
                },
                approver: {
                    fields: ['id', 'email', 'username']
                }
            },
            filters: {
                status: {
                    $eq: 'pending'
                }
            }
        };
        
        // Add pagination if provided
        if (searchParams.get('page')) {
            queryParams.pagination = { page: parseInt(searchParams.get('page')!) };
        }
        if (searchParams.get('pageSize')) {
            queryParams.pagination = { ...queryParams.pagination, pageSize: parseInt(searchParams.get('pageSize')!) };
        }
        
        const response = await strapiGet('/sg-mails', queryParams);
        
        return NextResponse.json({
            success: true,
            data: response.data || [],
            meta: response.meta || {}
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching pending sg-mails:', error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to fetch pending emails' 
        }, { status: 500 });
    }
}

// POST /api/sg-compose/dashboard - Approve or reject emails
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { emailId, action, rejectReason } = body;
        
        // Validate required fields
        if (!emailId || !action) {
            return NextResponse.json({
                success: false,
                error: 'Email ID and action are required'
            }, { status: 400 });
        }
        
        // Validate action
        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({
                success: false,
                error: 'Action must be either "approve" or "reject"'
            }, { status: 400 });
        }
        
        // First, fetch the email details to get sender and email content
        const emailResponse = await strapiGet(`/sg-mails/${emailId}`, {
            populate: {
                sender: {
                    fields: ['id', 'email', 'username']
                }
            }
        });
        
        if (!emailResponse.data) {
            return NextResponse.json({
                success: false,
                error: 'Email not found'
            }, { status: 404 });
        }
        
        const emailData = emailResponse.data;        
        const senderEmail = emailData.attributes.sender.data.attributes.email;
        const approverId = 1; // TODO: Replace with actual approver ID from JWT or session
        
        if (!senderEmail) {
            return NextResponse.json({
                success: false,
                error: 'Sender email not found'
            }, { status: 400 });
        }
        
        // Prepare update data
        const updateData = {
            data: {
                status: action === 'approve' ? 'approved' : 'rejected',
                approver: approverId
            }
        };
        
        if (action === 'approve') {
            // Handle approval - send the actual email to recipients
            try {
                // Get attachments from Drive
                const attachments = await getEmailAttachments(emailData.attributes.attachment_path || '');
                
                // Add footer to email body
                let emailHtml = emailData.attributes.mail_body;
                emailHtml += `<br/><p style="color:rgb(177, 58, 58);font-size:12px;">${emailData.attributes.sender.data.attributes.username || 'User'} used <a href="https://sg.ashoka.edu.in/platform/sg-compose">SG Compose</a>, because emails deserve a little tech flair — courtesy of the Ministry of Technology.</p>`;
                
                // Send email to recipients
                await sendMailSG({
                    // from: 'technology.ministry@ashoka.edu.in', // Use a proper from email
                    alias: emailData.attributes.alias,
                    to: emailData.attributes.recipients,
                    // to: 'vansh.bothra_ug25@ashoka.edu.in', //TODO: Replace with actual recipient emails
                    cc: senderEmail,
                    subject: emailData.attributes.subject,
                    html: emailHtml,
                    attachments: attachments.map(att => ({
                        filename: att.filename,
                        content: att.content,
                        contentType: att.contentType
                    }))
                });
                
                // Delete files from Google Drive after successful sending
                if (emailData.attributes.attachment_path) {
                    const fileIds = extractFileIds(emailData.attributes.attachment_path);
                    for (const fileId of fileIds) {
                        try {
                            await deleteFromDrive(fileId);
                        } catch (error) {
                            console.error(`Error deleting file ${fileId}:`, error);
                        }
                    }
                }
                
            } catch (emailError) {
                console.error('Error sending approval email:', emailError);
                return NextResponse.json({
                    success: false,
                    error: 'Failed to send email to recipients'
                }, { status: 500 });
            }
            
        } else {
            // Handle rejection - send rejection notification to sender
            try {
                await sendMailSG({
                    from: 'technology.ministry@ashoka.edu.in',
                    alias: 'SG Compose',
                    to: senderEmail,
                    subject: 'Email to Students Not Approved',
                    text: `Dear Student,\n\nYour mail could not be sent to the recipients due to non-compliance with the policy. Kindly reach out to the SG for further clarification by replying to this email.\n\nReason for rejection: ${rejectReason || 'Not specified'}\n\nSG Compose (feature by Ministry of Technology)`,
                    // Note: Add replyTo if you have approver email
                });
                
                // Delete files from Google Drive after rejection
                if (emailData.attributes.attachment_path) {
                    const fileIds = extractFileIds(emailData.attributes.attachment_path);
                    for (const fileId of fileIds) {
                        try {
                            await deleteFromDrive(fileId);
                        } catch (error) {
                            console.error(`Error deleting file ${fileId}:`, error);
                        }
                    }
                }
                
            } catch (emailError) {
                console.error('Error sending rejection email:', emailError);
                return NextResponse.json({
                    success: false,
                    error: 'Failed to send rejection notification'
                }, { status: 500 });
            }
        }
        
        // Update the email status in Strapi
        const response = await strapiPut(`/sg-mails/${emailId}`, updateData);
        
        return NextResponse.json({
            success: true,
            message: `Email ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
            data: response
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error updating email status:', error);
        
        // Handle specific Strapi errors
        if (error instanceof Error) {
            if (error.message.includes('400')) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid data provided. Please check your inputs and try again.'
                }, { status: 400 });
            }
            
            if (error.message.includes('404')) {
                return NextResponse.json({
                    success: false,
                    error: 'Email not found.'
                }, { status: 404 });
            }
            
            if (error.message.includes('401') || error.message.includes('403')) {
                return NextResponse.json({
                    success: false,
                    error: 'Authentication failed. Please try again.'
                }, { status: 401 });
            }
        }
        
        return NextResponse.json({
            success: false,
            error: 'Failed to update email status. Please try again.'
        }, { status: 500 });
    }
}
