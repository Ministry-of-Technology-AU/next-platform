"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MailPlus, Send } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import PageTitle from "@/components/page-title"
import { toast } from "sonner"
import {
  TextInput,
  SingleSelect,
  MultiSelectCheckbox,
  FileUpload,
  SubmitButton,
  FormContainer,
  InstructionsField
} from "@/components/form"
// Use dynamic import with ssr: false to avoid hydration issues with the editor
const Editor = dynamic(() => import("@/components/editor"), { 
  ssr: false,
  loading: () => <div className="border rounded-md min-h-[300px] p-4">Loading editor...</div>
});

// Sample data for categories and recipients
const mailCategories = [
  { value: "Inductions", label: "Inductions" },
  { value: "Lost and Found", label: "Lost and Found" },
  { value: "Jobs and Internships", label: "Jobs and Internships" },
  { value: "Surveys", label: "Surveys" },
  { value: "Campaigns", label: "Campaigns" },
  { value: "Fundraisers", label: "Fundraisers" },
  { value: "Events and Invitations", label: "Events and Invitations" },
  { value: "Promotions", label: "Promotions" }
];

const recipients = [
  { value: "all-students", label: "All Students", description: "students@ashoka.edu.in" },
  { value: "asp25", label: "ASP25", description: "asp25@ashoka.edu.in" },
  { value: "ug26", label: "UG26", description: "ug26@ashoka.edu.in" },
  { value: "ug2023", label: "UG2023", description: "ug2023@ashoka.edu.in" },
  { value: "ug2024", label: "UG2024", description: "ug2024@ashoka.edu.in" },
  { value: "ug2025", label: "UG2025", description: "ug2025@ashoka.edu.in" }
];

export default function ComposeNew() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = React.useState("")
  const [selectedRecipients, setSelectedRecipients] = React.useState<string[]>([])
  const [subject, setSubject] = React.useState("")
  const [mailDraft, setMailDraft] = React.useState("")
  const [additionalNotes, setAdditionalNotes] = React.useState("")
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([])

  // Email templates for quick insertion
  const emailTemplates = {
    event: `<p>Dear Students,</p>
<p>We are excited to announce our upcoming event:</p>
<ul>
<li><strong>Event Name:</strong> [Event Name]</li>
<li><strong>Date & Time:</strong> [Date and Time]</li>
<li><strong>Venue:</strong> [Location]</li>
<li><strong>Registration:</strong> [Registration Details]</li>
</ul>
<p>For more information, please contact us.</p>
<p>Best regards,<br>[Your Name]</p>`,
    
    announcement: `<p>Dear Students,</p>
<p>[Your announcement message here]</p>
<p><strong>Key Points:</strong></p>
<ul>
<li>[Point 1]</li>
<li>[Point 2]</li>
<li>[Point 3]</li>
</ul>
<p>If you have any questions, please don't hesitate to reach out.</p>
<p>Best regards,<br>[Your Name]</p>`,
    
    reminder: `<p>Dear Students,</p>
<p>This is a friendly reminder about [Event/Deadline/Activity].</p>
<p><strong>Important Details:</strong></p>
<ul>
<li><strong>What:</strong> [Description]</li>
<li><strong>When:</strong> [Date and Time]</li>
<li><strong>Where:</strong> [Location if applicable]</li>
<li><strong>Action Required:</strong> [What students need to do]</li>
</ul>
<p>Thank you for your attention.</p>
<p>Best regards,<br>[Your Name]</p>`
  }

  const insertTemplate = (templateKey: keyof typeof emailTemplates) => {
    // Set the HTML template directly
    setMailDraft(emailTemplates[templateKey]);
    // Set a meaningful subject based on the template type
    if (subject === "") {
      switch(templateKey) {
        case 'announcement':
          setSubject("[Announcement] ");
          break;
        case 'event':
          setSubject("[Event] ");
          break;
        case 'reminder':
          setSubject("[Reminder] ");
          break;
      }
    }
    
    // Show toast notification
    toast.success(`${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} template inserted`, {
      description: "You can now edit the template with your content."
    });
  }





  const handleSubmit = async (action: 'request' | 'cancel') => {
    if (action === 'request') {
      try {
        // Debug log to verify HTML content
        console.log('HTML content being submitted:', mailDraft);
        
        let response;
        
        if (attachedFiles.length > 0) {
          // Use FormData for file uploads
          const formData = new FormData();
          formData.append('selectedCategory', selectedCategory);
          formData.append('selectedRecipients', JSON.stringify(selectedRecipients));
          formData.append('subject', subject);
          formData.append('mailDraft', mailDraft);
          formData.append('additionalNotes', additionalNotes);
          
          // Append all files
          attachedFiles.forEach((file) => {
            formData.append('files', file);
          });
          
          console.log('Submitting form data with files');
          
          // Submit FormData (no Content-Type header needed, browser sets it automatically)
          response = await fetch('/api/platform/sg-compose/new', {
            method: 'POST',
            body: formData
          });
        } else {
          // Use JSON for requests without files
          const jsonData = {
            selectedCategory,
            selectedRecipients,
            subject,
            mailDraft,
            additionalNotes
          };
          
          console.log('Submitting JSON data:', jsonData);

          response = await fetch('/api/platform/sg-compose/new', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
          });
        }
        
        const result = await response.json();
        
        if (result.success) {
          alert('Email request submitted successfully! It will be reviewed by the administrators.');
          // Navigate to outbox
          router.push('/sg-compose/outbox');
        } else {
          alert(`Error: ${result.error || 'Failed to submit email request'}`);
        }
        
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit email request. Please try again.');
      }
    } else {
      // Cancel action - just navigate back
      router.push('/platform/sg-compose/outbox');
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit("request");
  };

  return (
    <>
              <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
    <div className="space-y-6 max-w-8xl mx-auto p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <PageTitle
            text="Compose a new mail"
            subheading="Moving Forward; Not Just Forwards - SG Compose is a streamlined email management platform designed for Student Government, allowing students to submit requests that can be quickly approved and automatically sent to targeted groups. The system includes rich text editing, alias-based organization, and options for directing emails to specific audiences within Ashoka University."
            icon={MailPlus}
          />
        </div>
      </div>


      {/* Form Card */}
      <Card className="w-full">
        <CardHeader>
         <InstructionsField
          heading="Email Composition Guidelines"
          subheading="Please follow these guidelines for effective email composition"
          body={[
            "Select appropriate category and recipients for your email",
            "Write a clear and descriptive subject line",
            "Use the rich text editor to format your message professionally",
            "Add attachments if necessary (max 10MB total)",
            "Include any additional notes for the administrators"
          ]}
        />
        </CardHeader>

        <FormContainer onSubmit={handleFormSubmit} className="w-full">
          {/* Category Selection */}
          <SingleSelect
            title="Select Your Category of Mail"
            placeholder="Choose a category"
            items={mailCategories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            isRequired={true}
          />

          {/* Recipients Selection */}
          <MultiSelectCheckbox
            title="Select Recipients"
            description={selectedRecipients.length > 0 ? `${selectedRecipients.length} recipient(s) selected` : undefined}
            items={recipients}
            value={selectedRecipients}
            onChange={setSelectedRecipients}
            isRequired={true}
          />

          {/* Subject */}
          <TextInput
            title="Subject"
            placeholder="Enter email subject"
            value={subject}
            onChange={setSubject}
            isRequired={true}
          />

          {/* Mail Draft with Template Buttons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Mail Draft <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate('announcement')}
                  className="hover:bg-primary/10 transition-colors duration-200"
                >
                  📢 Announcement
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate('event')}
                  className="hover:bg-primary/10 transition-colors duration-200"
                >
                  📅 Event
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate('reminder')}
                  className="hover:bg-primary/10 transition-colors duration-200"
                >
                  ⏰ Reminder
                </Button>
              </div>
            </div>
            <div className="border rounded-md overflow-hidden">
              <Editor
                value={mailDraft}
                onChange={setMailDraft}
                placeholder="Compose your email message here... You can use rich text formatting, add images, tables, and links. Or start with a template using the buttons above."
                className="min-h-[300px]"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Use the rich text editor to format your email. You can add headings, bold/italic text, links, images, and tables. Use the template buttons above for quick starts.
            </p>
          </div>

          {/* File Attachment */}
          <FileUpload
            title="File Attachment (if any)"
            description="Maximum total size: 10MB | Supported: Images, Documents, Presentations, Archives"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            multiple={true}
            maxSize={10}
            value={attachedFiles}
            onChange={setAttachedFiles}
          />

          {/* Additional Notes */}
          <TextInput
            title="Additional Notes (if any)"
            placeholder="Any additional notes or special instructions..."
            isParagraph={true}
            value={additionalNotes}
            onChange={setAdditionalNotes}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <SubmitButton
              text="Request Email"
              disabled={
                !selectedCategory || 
                selectedRecipients.length === 0 || 
                !subject || 
                !mailDraft.trim()
              }
              description="Submit your email request for administrative review"
            />
            <Button variant="outline" onClick={() => handleSubmit("cancel")}>
              Cancel Email
            </Button>
          </div>
        </FormContainer>
      </Card>
    </div>
    </>
  );
}