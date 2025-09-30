"use client";

import { useState } from "react";
import { FormContainer, TextInput, SingleSelect, MultiSelectCheckbox, SubmitButton } from "@/components/form";

export default function CreateTickets() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [ministries, setMinistries] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { value: "mot", label: "Ministry of Technology", selected: false, email:"technology.ministry@ashoka.edu.in" },
    { value: "maa", label: "Ministry of Academic Affairs", selected: false, email:"academicaffairs.ministry@ashoka.edu.in" },
    { value: "jazbaa", label: "Cultural Ministry (Jazbaa)", selected: false, email:"culturalministry@ashoka.edu.in"},
    { value: "mcwb", label: "Ministry of Community Well Being", selected: false, email:"cwb.ministry@ashoka.edu.in" },
    { value: "sports", label: "Sports Ministry", selected: false, email:"sports.ministry@ashoka.edu.in" },
    { value: "env", label: "Environment Ministry", selected: false, email:"environmentministry@ashoka.edu.in" },
    { value: "clm", label: "Campus Life Ministry", selected: false, email:"campus.life@ashoka.edu.in" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = {
        subject,
        content,
        category,
        subcategory,
        ministries
      };

      const response = await fetch('/api/create-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Ticket created successfully!");
        // Reset form fields
        setSubject("");
        setContent("");
        setCategory("");
        setSubcategory("");
        setMinistries([]);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create ticket'}`);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert("An error occurred while creating the ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <TextInput
        title="Subject"
        description="Enter a clear and descriptive subject for your ticket."
        placeholder="Enter ticket subject"
        isRequired
        value={subject}
        onChange={setSubject}
      />
      
      <TextInput
        title="Ticket Content"
        description="Describe your issue or request in detail."
        placeholder="Describe your issue or request"
        isRequired
        isParagraph
        value={content}
        onChange={setContent}
      />
      
      <SingleSelect
        title="Category"
        description="Select the category that best fits your ticket (optional)."
        placeholder="Select a category"
        items={categoryOptions}
        value={category}
        onChange={(value) => {
          setCategory(value);
          setSubcategory(""); // Reset subcategory when category changes
        }}
      />
      
      {category && subcategoryOptions[category] && (
        <SingleSelect
          title="Subcategory"
          description="Select a more specific subcategory for your ticket."
          placeholder="Select a subcategory"
          items={subcategoryOptions[category]}
          value={subcategory}
          onChange={setSubcategory}
        />
      )}
      
      <MultiSelectCheckbox
        title="Ministries to Tag"
        description="Select which ministries should be notified about this ticket."
        items={ministryOptions}
        value={ministries}
        onChange={setMinistries}
      />
      
      <SubmitButton 
        text="Create Ticket" 
        isLoading={isSubmitting}
        onClick={() => handleSubmit({} as React.FormEvent)}
      />
    </FormContainer>
  );
}