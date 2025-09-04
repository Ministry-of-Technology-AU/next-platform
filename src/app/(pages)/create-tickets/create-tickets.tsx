"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function CreateTickets() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [ministries, setMinistries] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ subject?: string; content?: string }>({});

  // Dummy data
  const categoryOptions = [
    { value: "it", label: "IT" },
    { value: "hostel", label: "Hostel" },
    { value: "mess", label: "Mess" },
    { value: "other", label: "Other" },
  ];
  const subcategoryOptions: Record<string, { value: string; label: string }[]> = {
    it: [
      { value: "wifi", label: "Wifi" },
      { value: "hardware", label: "Hardware" },
      { value: "software", label: "Software" },
    ],
    hostel: [
      { value: "cleaning", label: "Cleaning" },
      { value: "maintenance", label: "Maintenance" },
    ],
    mess: [
      { value: "food", label: "Food" },
      { value: "hygiene", label: "Hygiene" },
    ],
    other: [
      { value: "general", label: "General" },
    ],
  };
  const ministryOptions = [
    { value: "mot", label: "Ministry of Technology" },
    { value: "maa", label: "Ministry of Academic Affairs" },
    { value: "jazbaa", label: "Cultural Ministry (Jazbaa)" },
    { value: "mcwb", label: "Ministry of Community Well Being" },
    { value: "sports", label: "Sports Ministry" },
    { value: "env", label: "Environment Ministry" },
    { value: "clm", label: "Campus Life Ministry" },
  ];

  const handleMinistryChange = (value: string) => {
    setMinistries((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!subject.trim()) newErrors.subject = "Subject is required.";
    if (!content.trim()) newErrors.content = "Ticket content is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    alert("Ticket created! (In a real app, this would send data to an API.)");
    // Reset form (optional)
    setSubject("");
    setContent("");
    setCategory("");
    setSubcategory("");
    setMinistries([]);
  };

  return (
    <CardContent className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter ticket subject"
            className={errors.subject ? "border-destructive" : ""}
          />
          {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
        </div>
        {/* Ticket Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Ticket Content <span className="text-destructive">*</span></Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your issue or request"
            className={errors.content ? "border-destructive" : "min-h-[100px]"}
          />
          {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
        </div>
        {/* Category (optional) */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(val) => { setCategory(val); setSubcategory(""); }}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Subcategory (optional, conditional) */}
        {category && (
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger id="subcategory">
                <SelectValue placeholder="Select a subcategory (optional)" />
              </SelectTrigger>
              <SelectContent>
                {subcategoryOptions[category]?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {/* Ministries to tag (multi-select) */}
        <div className="space-y-2">
          <Label>Ministries to tag</Label>
          <div className="flex flex-wrap gap-2">
            {ministryOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`px-3 py-1 rounded-md border text-sm transition-colors ${ministries.includes(option.value) ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                onClick={() => handleMinistryChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {/* Submit Button */}
        <Button type="submit" variant="animated" className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Create Ticket
        </Button>
      </form>
    </CardContent>
  );
}