"use client";
import * as Form from "@/components/form";
import { useState } from "react";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function NewMailForm(onSubmit: ()=>void) {
    const [category, setCategory] = useState("");
  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      {" "}
      {/* TODO: Make responsive, fix alignment */}
      <DialogHeader>
        <h3 className="text-primary">Moving Forward; Not Just Forwards</h3>
        <p className="text-muted-foreground">
          SG Compose is a streamlined email management platform designed for
          Student Government, allowing students to submit requests that can be
          quickly approved and automatically sent to targeted groups. The system
          includes rich text editing, alias-based organization, and options for
          directing emails to specific audiences within Ashoka University.
        </p>
      </DialogHeader>
      <Form.FormContainer>
        <Form.SingleSelect
          title="Select Your Category of Mail"
          isRequired
          value={category}
          onChange={(setCategory)}
          placeholder="Choose a category"
          items={[
            { value: "inductions", label: "Inductions" },
            { value: "lost-and-found", label: "Lost and Found" },
            { value: "jobs-and-internships", label: "Jobs and Internships" },
            { value: "surveys", label: "Surveys" },
            { value: "campaigns", label: "Campaigns" },
            { value: "fundraisers", label: "Fundraisers" },
            {
              value: "events-and-invitations",
              label: "Events and Invitations",
            },
            { value: "promotions", label: "Promotions" },
          ]}
        />
        {/* TODO: FIX THIS MULTISELECT COMPONENT */}
        <Form.MultiSelectDropdown
          title="Select Recipients"
          placeholder="Select"
          isRequired
          items={[
            {
              value: "all-students",
              label: "All Students",
              isDefault: true,
              email: "students@ashoka.edu.in",
            },
            { value: "asp25", label: "ASP25", email: "asp25@ashoka.edu.in" },
            { value: "ug26", label: "UG26", email: "ug26@ashoka.edu.in" },
            { value: "ug2023", label: "UG2023", email: "ug2023@ashoka.edu.in" },
            { value: "ug2024", label: "UG2024", email: "ug2024@ashoka.edu.in" },
            { value: "ug2025", label: "UG2025", email: "ug2025@ashoka.edu.in" },
          ]}
        />
      </Form.FormContainer>
      <Form.TextInput
        title="Subject"
        placeholder="Enter the subject of your email"
        isRequired
      />
      <Form.TextInput
        title="Mail Draft"
        placeholder="Make this a rich text editor"
        isParagraph
        isRequired
      />{" "}
      {/** TODO: MAKE THIS A RICH TEXT EDITOR */}
      <Form.FileUpload title="File Attachments (if any)" />{" "}
      {/** TODO: MAKE THE DRAG AND DROP WORK */}
      <Form.TextInput
        title="Additional Notes (if any)"
        placeholder="Add any additional notes or special instructions (this won't be part of the mail)"
        isParagraph
      />
      <div className="flex flex-col-2 max-w-4xl gap-4 mt-4"> {/* TODO: Fix alignment */}
        <Form.SubmitButton onClick={onSubmit} />
        <Button variant="outline" className="hover:bg-gray-300">Cancel Request</Button>
      </div>
    </DialogContent>
  );
}