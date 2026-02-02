"use client";

import {
  TextInput,
  SingleSelect,
  MultiSelectCheckbox,
} from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section1AData {
  cohort: string;
  batch: string;
  isVisitingStudent: string;
  livesOnCampus: string;
}

interface Section1AProps {
  data: Section1AData;
  onUpdate: (data: Partial<Section1AData>) => void;
}

export default function Section1A({ data, onUpdate }: Section1AProps) {
  const batchOptions = [
    { value: "ug-2025-2029", label: "UG 2025-2029" },
    { value: "ug-2024-2028", label: "UG 2024-2028" },
    { value: "ug-2023-2027", label: "UG 2023-2027" },
    { value: "ug-2022-2026", label: "UG 2022-2026" },
    { value: "masters", label: "Masters" },
    { value: "phd", label: "PhD" },
    { value: "yif", label: "YIF" },
  ];

  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 1A - Identifiable Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TextInput
          title="Cohort ID"
          description="Please provide your cohort ID"
          placeholder="Enter your cohort ID"
          value={data.cohort}
          onChange={(value) => onUpdate({ cohort: value })}
          isRequired
        />

        <SingleSelect
          title="Batch"
          description="Select your batch"
          placeholder="Choose your batch"
          items={batchOptions}
          value={data.batch}
          onChange={(value) => onUpdate({ batch: value })}
          isRequired
        />

        <SingleSelect
          title="Are you a visiting student?"
          description="Indicate whether you are a visiting student"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.isVisitingStudent}
          onChange={(value) => onUpdate({ isVisitingStudent: value })}
          isRequired
        />

        <SingleSelect
          title="Do you live on campus?"
          description="Indicate your residence status"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.livesOnCampus}
          onChange={(value) => onUpdate({ livesOnCampus: value })}
          isRequired
        />
      </CardContent>
    </Card>
  );
}
