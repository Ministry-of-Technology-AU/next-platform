"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import * as Form from "@/components/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RTIForm() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [information, setInformation] = useState("");
  const [details, setDetails] = useState("");
  const [timeline, setTimeline] = useState("standard");
  const [urgentReason, setUrgentReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Load user data from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      setFiles([...files, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!information.trim()) {
      toast.error("Please provide the information requested (short answer)");
      return;
    }

    if (timeline === "urgent" && !urgentReason.trim()) {
      toast.error("Please provide a one-line reason for urgency");
      return;
    }

    const form = new FormData();
    form.append("anonymous", anonymous ? "1" : "0");
    form.append("name", name);
    form.append("email", email);
    form.append("information", information);
    form.append("details", details);
    form.append("timeline", timeline);
    form.append("urgentReason", urgentReason);
    files.forEach((file) => form.append("files", file));

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/platform/rti", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit RTI");

      toast.success("RTI submitted successfully.");
      // reset
      setName("");
      setEmail("");
      setAnonymous(false);
      setInformation("");
      setDetails("");
      setTimeline("standard");
      setUrgentReason("");
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-6xl py-8 mx-auto">
      <Form.FormContainer onSubmit={onSubmit}>
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Information will be posted on the{" "}
            <a 
              href="https://drive.google.com/drive/folders/0B1MDFq4W1AY7NktWVVRMMGJtb2s?resourcekey=0-ekyASsNU1kc1WI2g_YPa-g&usp=drive_link" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline font-medium"
            >
              SG Public Drive
            </a>
            . If you share your email, a response will be emailed to you directly as well. Please refer to the{" "}
            <a 
              href="https://docs.google.com/document/d/1NJLt-HrDHPPwrnL7vn9axOdE98LeOsOqFM-LiBIM7NE/edit?tab=t.0" 
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline font-medium"
            >
              RTI Policy
            </a>{" "}
            for more details.
          </p>
        </div>

        <Form.TextInput
          title="Name"
          placeholder="Your name"
          value={name}
          onChange={setName}
          isRequired
        />

        <Form.TextInput
          title="Email ID"
          placeholder="you@domain.com"
          type="email"
          value={email}
          onChange={setEmail}
          isRequired
        />

        <Form.CheckboxComponent
          title="Submit Anonymously"
          value={anonymous}
          onChange={setAnonymous}
        />

        <Form.TextInput
          title="Information Requested"
          placeholder="Brief statement of information requested"
          value={information}
          onChange={setInformation}
          isRequired
        />

        <Form.TextInput
          title="Additional Details / Context"
          placeholder="Background or clarification (optional)"
          value={details}
          onChange={setDetails}
          isParagraph
        />

        <div className="space-y-2">
          <label className="text-base font-medium">Urgency / Preferred Timeline</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="timeline"
                value="standard"
                checked={timeline === "standard"}
                onChange={() => setTimeline("standard")}
                className="cursor-pointer"
              />
              <span className="text-sm">Standard (10 working days)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="timeline"
                value="urgent"
                checked={timeline === "urgent"}
                onChange={() => setTimeline("urgent")}
                className="cursor-pointer"
              />
              <span className="text-sm">Urgent</span>
            </label>
          </div>
          {timeline === "urgent" && (
            <Form.TextInput
              title="Reason for Urgency"
              placeholder="One-line reason for urgency"
              value={urgentReason}
              onChange={setUrgentReason}
              isRequired
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium">File Attachments (Optional)</label>
          <div
            ref={dragRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max size: 10MB per file
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Upload className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <Form.SubmitButton text="Submit RTI" isLoading={isSubmitting} />
          <Button variant="outline" className="hover:bg-gray-300">Cancel Request</Button>
        </div>
      </Form.FormContainer>
    </Card>
  );
}
