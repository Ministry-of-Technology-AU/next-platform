"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Send, X, MailPlus } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import PageTitle from "@/components/page-title"
import { toast } from "sonner"
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
  { id: "all-students", label: "All Students", email: "students@ashoka.edu.in" },
  { id: "asp25", label: "ASP25", email: "asp25@ashoka.edu.in" },
  { id: "ug26", label: "UG26", email: "ug26@ashoka.edu.in" },
  { id: "ug2023", label: "UG2023", email: "ug2023@ashoka.edu.in" },
  { id: "ug2024", label: "UG2024", email: "ug2024@ashoka.edu.in" },
  { id: "ug2025", label: "UG2025", email: "ug2025@ashoka.edu.in" }
];

export default function ComposeNew() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = React.useState("")
  const [selectedRecipients, setSelectedRecipients] = React.useState<string[]>([])
  const [subject, setSubject] = React.useState("")
  const [mailDraft, setMailDraft] = React.useState("")
  const [additionalNotes, setAdditionalNotes] = React.useState("")
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleRecipientChange = (recipientId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients(prev => [...prev, recipientId])
    } else {
      setSelectedRecipients(prev => prev.filter(id => id !== recipientId))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Validate file size (10MB per file)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const invalidFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
      
      if (invalidFiles.length > 0) {
        alert(`The following files exceed the 10MB limit:\n${invalidFiles.map(f => f.name).join('\n')}`);
        return;
      }
      
      // Check total size limit
      const currentTotalSize = attachedFiles.reduce((sum, file) => sum + file.size, 0);
      const newTotalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
      const totalSize = currentTotalSize + newTotalSize;
      
      if (totalSize > MAX_FILE_SIZE) {
        alert(`Total file size would exceed 10MB limit. Current: ${(currentTotalSize / 1024 / 1024).toFixed(2)}MB, Adding: ${(newTotalSize / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    
    // Reset the input value so the same file can be selected again if needed
    if (event.target) {
      event.target.value = '';
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {/* <h1 className="text-3xl font-bold tracking-tight">
            Compose New Mail
          </h1> */}
          <PageTitle
            text="Compose a new mail"
            subheading=" Moving Forward; Not Just Forwards - SG Compose is a streamlined email
          management platform designed for Student Government, allowing students
          to submit requests that can be quickly approved and automatically sent
          to targeted groups. The system includes rich text editing, alias-based
          organization, and options for directing emails to specific audiences
          within Ashoka University."
          icon={MailPlus}
          />
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Select Your Category of Mail{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {mailCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Select Recipients <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border rounded-md bg-muted/20">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={recipient.id}
                    checked={selectedRecipients.includes(recipient.id)}
                    onCheckedChange={(checked) =>
                      handleRecipientChange(recipient.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={recipient.id}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    <div>
                      <div className="font-medium">{recipient.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {recipient.email}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            {selectedRecipients.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedRecipients.length} recipient(s) selected
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Mail Draft */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="mail-draft" className="text-sm font-medium">
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
            <p className="text-xs text-muted-foreground">
              Use the rich text editor to format your email. You can add headings, bold/italic text, links, images, and tables. Use the template buttons above for quick starts.
            </p>
          </div>

          {/* File Attachment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              File Attachment (if any)
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Files
                </Button>
                <span className="text-xs text-muted-foreground">
                  Maximum total size: 10MB | Supported: Images, Documents, Presentations, Archives
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />

              {/* Display attached files */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Attached Files ({attachedFiles.length}):
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Total: {(attachedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="space-y-1">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {file.type.split('/')[0] || 'file'}
                          </span>
                          <span className="text-sm truncate flex-1">
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additional-notes" className="text-sm font-medium">
              Additional Notes (if any)
            </Label>
            <Textarea
              id="additional-notes"
              placeholder="Any additional notes or special instructions..."
              className="min-h-[80px] resize-y"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleSubmit("request")}
              className="gap-2"
              disabled={
                !selectedCategory || 
                selectedRecipients.length === 0 || 
                !subject || 
                !mailDraft.trim()
              }
            >
              <Send className="h-4 w-4" />
              Request Email
            </Button>
            <Button variant="outline" onClick={() => handleSubmit("cancel")}>
              Cancel Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}