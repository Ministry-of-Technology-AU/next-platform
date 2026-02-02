"use client";

import {
  TextInput,
  SingleSelect,
  MultiSelectCheckbox,
} from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Section1BData {
  genderIdentity: string[];
  genderIdentityOther: string;
  nationality: string;
  nationalityOther: string;
  age: number;
  sexualOrientation: string[];
  customOrientation: string;
  casteCategory: string;
  disabilityStatus: string;
}

interface Section1BProps {
  data: Section1BData;
  onUpdate: (data: Partial<Section1BData>) => void;
}

export default function Section1B({ data, onUpdate }: Section1BProps) {
  const genderOptions = [
    { value: "man", label: "Man" },
    { value: "woman", label: "Woman" },
    { value: "non-binary", label: "Non-binary" },
    { value: "trans-man", label: "Transgender Man" },
    { value: "trans-woman", label: "Transgender Woman" },
    { value: "gender-queer", label: "Gender Queer" },
    { value: "gender-nonconforming", label: "Gender Non-conforming" },
    { value: "other", label: "Other (please specify)" },
  ];

  const nationalityOptions = [
    { value: "india", label: "India" },
    { value: "usa", label: "USA" },
    { value: "uk", label: "UK" },
    { value: "canada", label: "Canada" },
    { value: "other", label: "Other" },
  ];

  const orientationOptions = [
    { value: "heterosexual", label: "Heterosexual" },
    { value: "gay", label: "Gay" },
    { value: "lesbian", label: "Lesbian" },
    { value: "bisexual", label: "Bisexual" },
    { value: "asexual", label: "Asexual" },
    { value: "pansexual", label: "Pansexual" },
    { value: "queer", label: "Queer" },
    { value: "questioning", label: "Questioning" },
    { value: "not-listed", label: "Not listed" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  const casteOptions = [
    { value: "sc", label: "Scheduled Caste (SC)" },
    { value: "st", label: "Scheduled Tribe (ST)" },
    { value: "obc", label: "Other Backward Class (OBC)" },
    { value: "general", label: "General" },
    { value: "prefer-not-to-say", label: "Prefer Not to Say" },
  ];

  const disabilityOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 1B - Demographic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <MultiSelectCheckbox
          title="What is your gender identity?"
          description="Select all that apply"
          items={genderOptions}
          value={data.genderIdentity}
          onChange={(value) => onUpdate({ genderIdentity: value })}
          isRequired
        />

        {data.genderIdentity.includes("other") && (
          <TextInput
            title="Please specify your gender identity"
            placeholder="Describe your gender identity"
            value={data.genderIdentityOther}
            onChange={(value) => onUpdate({ genderIdentityOther: value })}
          />
        )}

        <SingleSelect
          title="What is your nationality?"
          description="Select your nationality"
          placeholder="Choose your nationality"
          items={nationalityOptions}
          value={data.nationality}
          onChange={(value) => onUpdate({ nationality: value })}
          isRequired
        />

        {data.nationality === "other" && (
          <TextInput
            title="Please specify your nationality"
            placeholder="Enter your nationality"
            value={data.nationalityOther}
            onChange={(value) => onUpdate({ nationalityOther: value })}
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="age" className="text-base font-medium">
            Age <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <input
              id="age"
              type="range"
              min={13}
              max={80}
              step={1}
              value={data.age}
              onChange={(e) => onUpdate({ age: parseInt(e.target.value) })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-lg font-semibold w-12 text-right">
              {data.age}
            </span>
          </div>
        </div>

        <MultiSelectCheckbox
          title="Do you identify as:"
          description="Select all that apply"
          items={orientationOptions}
          value={data.sexualOrientation}
          onChange={(value) => onUpdate({ sexualOrientation: value })}
        />

        {data.sexualOrientation.includes("not-listed") && (
          <TextInput
            title="Please describe your orientation"
            placeholder="Describe your sexual orientation"
            value={data.customOrientation}
            onChange={(value) => onUpdate({ customOrientation: value })}
          />
        )}

        <SingleSelect
          title="Do you belong to a Scheduled Caste (SC), Scheduled Tribe (ST) or Other Backward Class (OBC)?"
          description="Select the category that applies to you"
          placeholder="Choose an option"
          items={casteOptions}
          value={data.casteCategory}
          onChange={(value) => onUpdate({ casteCategory: value })}
          isRequired
        />

        <SingleSelect
          title="Do you have a physical and/or non-apparent disability?"
          description="This information helps us provide better support"
          placeholder="Choose an option"
          items={disabilityOptions}
          value={data.disabilityStatus}
          onChange={(value) => onUpdate({ disabilityStatus: value })}
          isRequired
        />
      </CardContent>
    </Card>
  );
}
