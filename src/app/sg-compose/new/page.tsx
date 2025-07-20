"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Sample data for categories and recipients
const mailCategories = [
  { value: "academic", label: "Academic Affairs" },
  { value: "student-life", label: "Student Life" },
  { value: "administrative", label: "Administrative" },
  { value: "cultural", label: "Cultural Events" },
  { value: "sports", label: "Sports & Recreation" },
  { value: "general", label: "General Announcement" },
]

const recipients = [
  { id: "all-students", label: "All Students", email: "students@ashoka.edu.in" },
  { id: "faculty", label: "Faculty", email: "faculty@ashoka.edu.in" },
  { id: "staff", label: "Staff", email: "staff@ashoka.edu.in" },
  { id: "ug-students", label: "Undergraduate Students", email: "ug@ashoka.edu.in" },
  { id: "pg-students", label: "Postgraduate Students", email: "pg@ashoka.edu.in" },
  { id: "phd-students", label: "PhD Students", email: "phd@ashoka.edu.in" },
  { id: "alumni", label: "Alumni", email: "alumni@ashoka.edu.in" },
  { id: "parents", label: "Parents", email: "parents@ashoka.edu.in" },
]

export default function ComposeNew() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = React.useState("")
  const [selectedRecipients, setSelectedRecipients] = React.useState<string[]>([])
  const [subject, setSubject] = React.useState("")
  const [mailDraft, setMailDraft] = React.useState("")
  const [additionalNotes, setAdditionalNotes] = React.useState("")
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleRecipientChange = (recipientId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients(prev => [...prev, recipientId])
    } else {
      setSelectedRecipients(prev => prev.filter(id => id !== recipientId))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (action: 'request' | 'cancel') => {
    if (action === 'request') {
      // Handle form submission
      console.log({
        category: selectedCategory,
        recipients: selectedRecipients,
        subject,
        mailDraft,
        additionalNotes,
        attachedFiles,
      })
      // You can add form validation and submission logic here
      alert('Email request submitted successfully!')
    }
    
    // Navigate back to outbox
    router.push('/sg-compose/outbox')
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
          <h1 className="text-3xl font-bold tracking-tight">Compose New Mail</h1>
        </div>
        <p className="text-muted-foreground">
          Create and send emails to various groups within the university community
        </p>
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
              Select Your Category of Mail <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                      <div className="text-xs text-muted-foreground">{recipient.email}</div>
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
              Subject (of mail) <span className="text-destructive">*</span>
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
            <Label htmlFor="mail-draft" className="text-sm font-medium">
              Mail Draft
            </Label>
            <RichTextEditor
              value={mailDraft}
              onChange={setMailDraft}
              placeholder="Compose your email content here..."
              className="w-full"
            />
          </div>

          {/* File Attachment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">File Attachment</Label>
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
                  Maximum file size: 10MB per file
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
                  <Label className="text-xs font-medium text-muted-foreground">
                    Attached Files:
                  </Label>
                  <div className="space-y-1">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <span className="text-sm truncate flex-1">{file.name}</span>
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
              Additional Notes
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
              onClick={() => handleSubmit('request')}
              className="gap-2"
              disabled={!selectedCategory || selectedRecipients.length === 0 || !subject}
            >
              <Send className="h-4 w-4" />
              Request Email
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit('cancel')}
            >
              Cancel Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}