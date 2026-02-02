"use client";

import {
  SingleSelect,
  MultiSelectCheckbox,
  TextInput,
} from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section6Data {
  personAffiliation: string[];
  personRelationshipOther: string;
  personRelationship: string[];
  personGender: string[];
  personGenderOther: string;
  repeatedIncidents: string;
}

interface Section6Props {
  data: Section6Data;
  onUpdate: (data: Partial<Section6Data>) => void;
}

export default function Section6({ data, onUpdate }: Section6Props) {
  const affiliationOptions = [
    { value: "student", label: "Student" },
    { value: "faculty", label: "Faculty" },
    { value: "teaching-fellow", label: "Teaching Fellow (TF)" },
    { value: "teaching-assistant", label: "Teaching Assistant (TA)" },
    {
      value: "coach-trainer",
      label: "Coach and/or Trainer (sports, extracurriculars etc.)",
    },
    {
      value: "admin-staff",
      label: "Administrative Staff (centres, departments, offices etc.)",
    },
    {
      value: "support-staff",
      label: "Support Staff (Dining, IT, Housekeeping, Security, Transport etc.)",
    },
    {
      value: "program-affiliate",
      label: "Individual affiliated with a university program (internship, study abroad etc.)",
    },
    { value: "not-affiliated", label: "Not affiliated with Ashoka University" },
    { value: "unsure", label: "I am unsure of their affiliation with Ashoka University" },
  ];

  const relationshipOptions = [
    { value: "romantic-current", label: "Someone who was romantically involved or intimate with me" },
    {
      value: "romantic-past",
      label: "Someone who had been romantically involved or intimate with me in the past",
    },
    { value: "faculty-member", label: "Faculty Member" },
    { value: "teaching-fellow", label: "Teaching Fellow (TF)" },
    { value: "teaching-assistant", label: "Teaching Assistant (TA)" },
    {
      value: "admin-staff",
      label: "Administrative Staff (centres, departments, offices etc.)",
    },
    {
      value: "support-staff",
      label: "Support Staff (Dining, IT, Housekeeping, Security, Transport etc.)",
    },
    { value: "friend", label: "Friend" },
    { value: "acquaintance", label: "Acquaintance" },
    {
      value: "org-leader",
      label: "Individual in a position of power in a student-led organization (club/society/Ministry/collective)",
    },
    {
      value: "substance-influence",
      label: "Individual in a position of power under the influence of alcohol/substance",
    },
    { value: "stranger", label: "Stranger" },
    { value: "party-social", label: "Someone I met at a party or social gathering" },
    { value: "dont-know", label: "I don't know" },
    { value: "other", label: "Other (please specify)" },
  ];

  const genderOptions = [
    { value: "man", label: "Man" },
    { value: "woman", label: "Woman" },
    { value: "non-binary", label: "Non binary" },
    { value: "trans-woman", label: "Transgender woman" },
    { value: "trans-man", label: "Transgender man" },
    { value: "genderqueer", label: "Genderqueer" },
    { value: "gender-nonconforming", label: "Gender nonconforming" },
    { value: "dont-know", label: "I don't know" },
    { value: "other", label: "Other (please specify)" },
  ];

  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 6 - Further Elaboration of Sexual Harassment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <MultiSelectCheckbox
          title="How was the person(s) who behaved this way(s) associated with Ashoka University?"
          description="Select all that apply"
          items={affiliationOptions}
          value={data.personAffiliation}
          onChange={(value) => onUpdate({ personAffiliation: value })}
        />

        <MultiSelectCheckbox
          title="At the time of the incident(s), what was this person(s) relationship to you?"
          description="Select all that apply"
          items={relationshipOptions}
          value={data.personRelationship}
          onChange={(value) => onUpdate({ personRelationship: value })}
        />

        {data.personRelationship.includes("other") && (
          <TextInput
            title="Please specify the relationship"
            placeholder="Describe the relationship"
            value={data.personRelationshipOther}
            onChange={(value) => onUpdate({ personRelationshipOther: value })}
          />
        )}

        <MultiSelectCheckbox
          title="What was the gender of the person(s) who behaved this way with you?"
          description="Select all that apply"
          items={genderOptions}
          value={data.personGender}
          onChange={(value) => onUpdate({ personGender: value })}
        />

        {data.personGender.includes("other") && (
          <TextInput
            title="Please specify the gender"
            placeholder="Describe the gender"
            value={data.personGenderOther}
            onChange={(value) => onUpdate({ personGenderOther: value })}
          />
        )}

        <SingleSelect
          title="During your time at Ashoka, have you faced unwanted sexual experiences with the same person(s) more than once?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.repeatedIncidents}
          onChange={(value) => onUpdate({ repeatedIncidents: value })}
        />
      </CardContent>
    </Card>
  );
}
