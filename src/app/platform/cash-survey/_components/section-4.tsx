"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Section4Data {
  unwelcomePhysicalConduct: string;
  forcedSexualActs: string;
  physicalForceCompulsion: string;
  rewardsThreatsCompulsion: string;
  inappropriateComments: string;
  persistentContact: string;
  unwantedSexualMessagesOnline: string;
  talkSexualMatters: string;
  sharingIntimateContent: string;
  spyingStalking: string;
  sexistRemarks: string;
  offensiveRemarksLGBTQIA: string;
  substanceAbuse: string;
  experiencedUnwantedExperiences: string;
}

interface Section4Props {
  data: Section4Data;
  onUpdate: (data: Partial<Section4Data>) => void;
}

const frequencyOptions = [
  { value: "never", label: "Never" },
  { value: "once", label: "Once" },
  { value: "more-than-once", label: "More than Once" },
  { value: "unsure", label: "Unsure" },
];

const FrequencyQuestion = ({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-3 p-4 border rounded-lg">
    <div>
      <p className="font-medium text-sm">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 w-full">
      {frequencyOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className="w-full text-xs md:text-sm px-1 md:px-2 py-1 md:py-2 h-8 md:h-10"
        >
          {option.label}
        </Button>
      ))}
    </div>
  </div>
);

export default function Section4({ data, onUpdate }: Section4Props) {
  const experienceQuestions = [
    {
      key: "unwelcomePhysicalConduct",
      label: "Have you faced unwelcome physical conduct of a sexual nature, including kissing, touching, or fondling without consent?",
    },
    {
      key: "forcedSexualActs",
      label: "Have you faced forced sexual acts like oral sex or penetration?",
    },
    {
      key: "physicalForceCompulsion",
      label: "Has anyone used or threatened to use physical force against you or someone close to you to compel you to engage in sexual acts with them?",
    },
    {
      key: "rewardsThreatsCompulsion",
      label: "Has anyone attempted or had sexual contact with you by promising rewards and/or threatening serious non-physical harm, so that you felt you had to comply?",
    },
    {
      key: "inappropriateComments",
      label: "Has someone made inappropriate sexual comments about your body, appearance, or sexual activities?",
    },
    {
      key: "persistentContact",
      label: "Has someone persistently called you up, sent emails, letters and/or text messages after you asked them to stop contacting you?",
    },
    {
      key: "unwantedSexualMessagesOnline",
      label: "Has someone sent you unwanted sexual messages, images, videos, or requests online (social media sites, videogame sites/applications, etc.)?",
    },
    {
      key: "talkSexualMatters",
      label: "Has someone tried to get you to talk about sexual matters when you didn't want to?",
    },
    {
      key: "sharingIntimateContent",
      label: "Has someone posted, or threatened to post or share sexually intimate messages, pictures or videos without your consent?",
    },
    {
      key: "spyingStalking",
      label: "Has someone spied on, stalked, watched or followed you, either in person or using technology in a way that made you feel unsafe?",
    },
    {
      key: "sexistRemarks",
      label: "Has someone made sexist remarks or jokes that have made you feel uncomfortable/unsafe?",
    },
    {
      key: "offensiveRemarksLGBTQIA",
      label: "Has someone made offensive remarks or jokes on your sexuality and/or the LGBTQIA+ community in a way that made you feel uncomfortable/unsafe?",
    },
    {
      key: "substanceAbuse",
      label: "Has someone used/attempted to use substances (drugs/alcohol/etc) to put you in a state in which you could not give informed consent?",
    },
  ];

  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 4 - Unwanted Sexual Experiences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This section asks about personal experiences. Please take your time and answer honestly. Your responses are confidential.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Have you experienced any of the following during your time at Ashoka University?
          </h3>
          <p className="text-sm text-muted-foreground">
            Select the frequency that best describes your experience. If you answered "Never" for ALL of the following questions, you will select "No" at the end of this section.
          </p>
          <div className="space-y-4">
            {experienceQuestions.map((question) => (
              <FrequencyQuestion
                key={question.key}
                title={question.label}
                value={data[question.key as keyof Section4Data]}
                onChange={(value) => onUpdate({ [question.key]: value })}
              />
            ))}
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-3">
              If you answered "Never" for ALL the above questions, select 'No'. If you answered 'Unsure', 'Once' or 'More than Once' for ANY of the above questions, select 'Yes'.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              {yesNoOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={data.experiencedUnwantedExperiences === option.value ? "default" : "outline"}
                  onClick={() => onUpdate({ experiencedUnwantedExperiences: option.value })}
                  className="w-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
