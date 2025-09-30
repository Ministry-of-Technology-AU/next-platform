import { NextRequest, NextResponse } from 'next/server'
import { strapiPost } from '@/lib/apis/strapi'
import { uploadToDrive } from '@/lib/apis/drive'
import { auth } from '@/auth'
import { getUserIdByEmail } from '@/lib/userid'

// Helper function to sanitize input
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// Helper function to sanitize rich text content (preserves HTML tags)
function sanitizeRichText(input: string): string {
  // Only trim whitespace and do basic XSS prevention while preserving HTML
  return input.trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
}

// Helper function to validate email alias
function validateAlias(alias: string): boolean {
  const validAliases = [
    "Inductions",
    "Lost and Found", 
    "Jobs and Internships",
    "Surveys",
    "Campaigns",
    "Fundraisers",
    "Promotions",
    "Events and Invitations"
  ]
  return validAliases.includes(alias)
}

// Helper function to process recipients array into a string
function processRecipients(recipients: string[]): string {
  return recipients.join(', ')
}

// POST /api/sg-compose/new - Create a new SG mail request
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Get user ID from email
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    const contentType = request.headers.get('content-type') || '';
    
    let selectedCategory: string;
    let selectedRecipients: string[];
    let subject: string;
    let mailDraft: string;
    let additionalNotes: string;
    let files: File[] = [];
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data (multipart/form-data) for file uploads
      const formData = await request.formData();
      
      // Extract fields from form data
      selectedCategory = formData.get('selectedCategory') as string;
      selectedRecipients = JSON.parse(formData.get('selectedRecipients') as string || '[]');
      subject = formData.get('subject') as string;
      mailDraft = formData.get('mailDraft') as string;
      additionalNotes = formData.get('additionalNotes') as string || '';
      
      // Handle file uploads
      files = formData.getAll('files') as File[];
    } else {
      // Handle JSON data (application/json)
      const body = await request.json();
      
      selectedCategory = body.selectedCategory;
      selectedRecipients = body.selectedRecipients;
      subject = body.subject;
      mailDraft = body.mailDraft;
      additionalNotes = body.additionalNotes || '';
      
      // Files would be empty for JSON requests
      files = [];
    }
    
    // Validate file size and count
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
    let totalSize = 0;
    
    for (const file of files) {
      totalSize += file.size;
    }
    
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Total file size exceeds 10MB. Your files total: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 400 });
    }
    
    // Server-side validation
    const requiredFields = {
      selectedCategory,
      selectedRecipients,
      subject,
      mailDraft
    }
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (Array.isArray(value) && value.length === 0) || 
          (typeof value === 'string' && value.toString().trim() === '')) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 })
      }
    }
    
    // Validate alias/category
    if (!validateAlias(selectedCategory)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email category selected'
      }, { status: 400 })
    }
    
    // Validate recipients array
    if (!Array.isArray(selectedRecipients) || selectedRecipients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one recipient must be selected'
      }, { status: 400 })
    }
    
    // Validate subject length
    if (subject.length > 255) {
      return NextResponse.json({
        success: false,
        error: 'Subject must be 255 characters or less'
      }, { status: 400 })
    }
    
    // Process recipients
    const recipientsString = processRecipients(selectedRecipients)
    
    // Upload files to Google Drive
    const attachmentPaths: string[] = []
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const fileBuffer = await file.arrayBuffer()
          const uploadedFile = await uploadToDrive({
            filename: file.name,
            content: Buffer.from(fileBuffer),
            contentType: file.type
          })
          attachmentPaths.push(uploadedFile.webViewLink)
        } catch (error) {
          console.error(`Failed to upload file ${file.name}:`, error)
          return NextResponse.json({
            success: false,
            error: `Failed to upload file: ${file.name}`
          }, { status: 500 })
        }
      }
    }
    
    // Prepare data for Strapi according to the schema
    const sgMailData = {
      data: {
        sender: userId,
        alias: selectedCategory,
        mail_body: sanitizeRichText(mailDraft), // Use sanitizeRichText to preserve HTML
        subject: sanitizeInput(subject),
        recipients: recipientsString,
        notes: additionalNotes ? sanitizeInput(additionalNotes) : '',
        attachment_path: attachmentPaths.join(','),
        status: "pending"
        // approver is left blank as requested
      }
    }
    
    console.log("Submitting SG mail data:", sgMailData)
    
    // Submit to Strapi
    const response = await strapiPost('/sg-mails', sgMailData)
    
    console.log("SG mail created successfully:", response)
    
    return NextResponse.json({
      success: true,
      message: 'Email request submitted successfully',
      data: response
    }, { status: 201 })
    
  } catch (error) {
    console.error("Error creating SG mail:", error)
    
    // Handle specific Strapi errors
    if (error instanceof Error) {
      // Check if it's a validation error from Strapi
      if (error.message.includes('400')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid data provided. Please check your inputs and try again.'
        }, { status: 400 })
      }
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('403')) {
        return NextResponse.json({
          success: false,
          error: 'Authentication failed. Please try again.'
        }, { status: 401 })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to submit email request. Please try again.'
    }, { status: 500 })
  }
}

// GET /api/sg-compose/new - Get form metadata (if needed)
export async function GET() {
  try {
    // Return form configuration data
    const formConfig = {
      categories: [
        "Inductions",
        "Lost and Found",
        "Jobs and Internships", 
        "Surveys",
        "Campaigns",
        "Fundraisers",
        "Promotions",
        "Events and Invitations"
      ],
      recipients: [
        {
          id: "all-students",
          label: "All Students",
          email: "students@ashoka.edu.in",
        },
        { id: "asp25", label: "ASP25", email: "asp25@ashoka.edu.in" },
        { id: "ug26", label: "UG26", email: "ug26@ashoka.edu.in" },
        { id: "ug2023", label: "UG2023", email: "ug2023@ashoka.edu.in" },
        { id: "ug2024", label: "UG2024", email: "ug2024@ashoka.edu.in" },
        { id: "ug2025", label: "UG2025", email: "ug2025@ashoka.edu.in" }
      ],
      maxSubjectLength: 255,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif']
    }
    
    return NextResponse.json({
      success: true,
      data: formConfig
    }, { status: 200 })
    
  } catch (error) {
    console.error("Error fetching form config:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch form configuration'
    }, { status: 500 })
  }
}
