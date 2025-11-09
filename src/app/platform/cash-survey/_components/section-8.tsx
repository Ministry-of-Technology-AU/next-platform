"use client";

import {
  SingleSelect,
  MultiSelectCheckbox,
  TextInput,
} from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section8Data {
  experiencedDifficulty: string;
  difficultyAreas: string[];
  improvementSuggestions: string;
  improvementDetails: string[];
}

interface Section8Props {
  data: Section8Data;
  onUpdate: (data: Partial<Section8Data>) => void;
}

export default function Section8({ data, onUpdate }: Section8Props) {
  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const difficultyOptions = [
    { value: "emotional", label: "Emotional Difficulty" },
    { value: "clarity", label: "Clarity of Wording" },
  ];

  const improvementOptions = [
    { value: "wording", label: "Improve the wording" },
    { value: "more-choices", label: "Add more choices for certain questions" },
    { value: "reduce-length", label: "Reduce the length of the survey" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 8 - Survey Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SingleSelect
          title="Did you experience any difficulty in responding to the survey?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.experiencedDifficulty}
          onChange={(value) => onUpdate({ experiencedDifficulty: value })}
        />

        {data.experiencedDifficulty === "yes" && (
          <MultiSelectCheckbox
            title="What did you experience difficulty in?"
            description="Select all that apply"
            items={difficultyOptions}
            value={data.difficultyAreas}
            onChange={(value) => onUpdate({ difficultyAreas: value })}
          />
        )}

        <SingleSelect
          title="Is there anything you think we can improve upon in terms of survey design?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.improvementSuggestions}
          onChange={(value) => onUpdate({ improvementSuggestions: value })}
        />

        {data.improvementSuggestions === "yes" && (
          <MultiSelectCheckbox
            title="How can we design the survey better?"
            description="Select all that apply"
            items={improvementOptions}
            value={data.improvementDetails}
            onChange={(value) => onUpdate({ improvementDetails: value })}
          />
        )}
      </CardContent>
    </Card>
  );
}
