"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormContainer } from "@/components/form";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export default function RTIForm() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [information, setInformation] = useState("");
  const [details, setDetails] = useState("");
  const [timeline, setTimeline] = useState("standard");
  const [urgentReason, setUrgentReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

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
    if (file) form.append("file", file);

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
      setFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer onSubmit={onSubmit} className="max-w-3xl mx-auto">
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
          . If you share your email, a response will be emailed to you directly as well. Please refer to the <a href="https://docs.google.com/document/d/1NJLt-HrDHPPwrnL7vn9axOdE98LeOsOqFM-LiBIM7NE/edit?tab=t.0" className="underline hover:no-underline font-medium">RTI Policy</a>   for more details.
        </p>        
      </div>
      <div className="space-y-4">
        <div>
          <Label className="mb-1">Name</Label>
          {!anonymous && (
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name" 
              disabled={!!session?.user?.name}
            />
          )}
        </div>

        <div>
          <Label className="mb-1">Email ID</Label>
          {!anonymous && (
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@domain.com" 
              disabled={!!session?.user?.email}
            />
          )}
        </div>

        <div className="flex items-center">
          <Checkbox id="rti-anonymous" checked={anonymous} onCheckedChange={(v) => setAnonymous(Boolean(v))} />
          <Label htmlFor="rti-anonymous" className="ml-2">Submit Anonymously</Label>
        </div>

        <div>
          <Label className="mb-1">Information Requested (Required)</Label>
          <Input value={information} onChange={(e) => setInformation(e.target.value)} placeholder="Brief statement of information requested" required />
        </div>

        <div>
          <Label className="mb-1">Additional Details / Context (Optional)</Label>
          <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Background or clarification (long answer)" />
        </div>

        <div>
          <Label className="mb-1">Urgency / Preferred Timeline</Label>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2">
              <input type="radio" name="timeline" value="standard" checked={timeline === "standard"} onChange={() => setTimeline("standard")} />
              <span>Standard (10 working days)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="timeline" value="urgent" checked={timeline === "urgent"} onChange={() => setTimeline("urgent")} />
              <span>Urgent</span>
            </label>
          </div>
          {timeline === "urgent" && (
            <Input value={urgentReason} onChange={(e) => setUrgentReason(e.target.value)} placeholder="One-line reason for urgency" />
          )}
        </div>

        <div>
          <Label className="mb-1">File Upload (Optional)</Label>
          <div className="space-y-2">
            <input 
              type="file" 
              id="file-upload" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="hidden"
            />
            <div className="flex gap-2 items-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{file.name}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFile(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit RTI"}
          </Button>
        </div>
      </div>
    </FormContainer>
  );
}
