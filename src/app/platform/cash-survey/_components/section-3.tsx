"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Section3Data {
  jokesSexualAcquaintances: string;
  jokesSexualFriends: string;
  jokesSexualClassroom: string;
  displaySexualMaterials: string;
  staringStalkingLeering: string;
  unwantedComments: string;
  pressureSexualFavours: string;
  sexistJokes: string;
  repeatedDatingAsks: string;
  unwantedPhysicalAdvances: string;
  harassmentSexualOrientation: string;
  spreadingSexualRumours: string;
  showingPornography: string;
  prevalenceSexualHarassment: string;
  experienceSexualHarassmentAttentionCheck: string;
  likelyExperienceHarassment: string;
  ashokaProvidesGuidance: string;
  cashFairInvestigation: string;
  cashConfidentiality: string;
  cashProtectFromHarm: string;
  cashPsychologicalAssistance: string;
  cashAppropriateAction: string;
  cashStructuralChanges: string;
  safeInClubsAndOrgs: string;
  cashTakesReportSeriously: string;
  likelyApproachCASHSG: string;
}

interface Section3Props {
  data: Section3Data;
  onUpdate: (data: Partial<Section3Data>) => void;
}

const scaleOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const ScaleQuestion = ({
  title,
  description,
  value,
  onChange,
  labels = ["Not at All", "A Little", "Somewhat", "Very", "Extremely"],
}: {
  title: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  labels?: string[];
}) => (
  <div className="space-y-3 p-4 border rounded-lg">
    <div>
      <p className="font-medium text-sm">{title}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    <div className="grid grid-cols-5 gap-1 md:gap-2 w-full">
      {scaleOptions.map((option, index) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className="w-full text-xs md:text-sm px-1 md:px-2 py-1 md:py-2 h-8 md:h-10"
          title={labels[index]}
        >
          {option.label}
        </Button>
      ))}
    </div>
    <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground">
      {labels.map((label) => (
        <span key={label} className="text-center truncate text-[10px] md:text-xs leading-tight">
          {label}
        </span>
      ))}
    </div>
  </div>
);

export default function Section3({ data, onUpdate }: Section3Props) {
  const perceptionQuestions = [
    {
      key: "jokesSexualAcquaintances",
      label: "Do you think jokes of a sexual nature between acquaintances or strangers constitute sexual harassment?",
    },
    {
      key: "jokesSexualFriends",
      label: "Do you think jokes of a sexual nature between friends constitute sexual harassment?",
    },
    {
      key: "jokesSexualClassroom",
      label: "Do you think making sexual jokes, remarks, or comments made in a classroom or academic setting constitutes sexual harassment?",
    },
    {
      key: "displaySexualMaterials",
      label: "Do you think the display of sexually offensive materials in a public space constitutes sexual harassment?",
    },
    {
      key: "staringStalkingLeering",
      label: "Do you think staring, stalking, leering, or making gestures of a sexual nature constitutes sexual harassment?",
    },
    {
      key: "unwantedComments",
      label: "Do you think unwanted comments on appearance or physical attributes constitute sexual harassment?",
    },
    {
      key: "pressureSexualFavours",
      label: "Do you think the pressure for sexual favours constitutes sexual harassment?",
    },
    {
      key: "sexistJokes",
      label: "Do you think sexist jokes constitute sexual harassment?",
    },
    {
      key: "repeatedDatingAsks",
      label: "Do you think repeatedly asking someone to go on dates, despite their lack of interest, constitutes sexual harassment?",
    },
    {
      key: "unwantedPhysicalAdvances",
      label: "Do you think unwanted physical or sexual advances constitute sexual harassment?",
    },
    {
      key: "harassmentSexualOrientation",
      label: "Do you think harassment based on sexual orientation constitutes sexual harassment?",
    },
    {
      key: "spreadingSexualRumours",
      label: "Do you think spreading sexual rumours constitutes sexual harassment?",
    },
    {
      key: "showingPornography",
      label: "Do you think showing someone pornography constitutes sexual harassment?",
    },
  ];

  const attitudinalQuestions = [
    {
      key: "prevalenceSexualHarassment",
      label: "How prevalent do you think sexual harassment is at Ashoka University?",
      isAttentionCheck: true,
    },
    {
      key: "likelyExperienceHarassment",
      label: "How likely do you think it is that you will experience sexual harassment on campus?",
    },
    {
      key: "ashokaProvidesGuidance",
      label: "If you face sexual harassment, how likely do you think it is that Ashoka University would provide you with guidance and advice on the course of action open to you?",
    },
    {
      key: "cashFairInvestigation",
      label: "If you filed a report with CASH, how likely do you think it is that they would conduct a fair investigation?",
    },
    {
      key: "cashConfidentiality",
      label: "If you filed a report with CASH, how likely do you think it is that they would maintain the confidentiality of the case and the investigation taking place?",
    },
    {
      key: "cashProtectFromHarm",
      label: "If you filed a report with CASH, how likely do you think it is that they would take steps to protect you from further harm/intimidation by the accused?",
    },
    {
      key: "cashPsychologicalAssistance",
      label: "If you filed a report with CASH, how likely do you think it is that they would provide necessary psychological assistance during the investigation, if needed?",
    },
    {
      key: "cashAppropriateAction",
      label: "If you filed a report with CASH, how likely do you think it is that they would take appropriate action against the accused?",
    },
    {
      key: "cashStructuralChanges",
      label: "If you filed a report with CASH, how likely do you think it is that they would take action to address the larger structural reasons that may have led to sexual harassment?",
    },
    {
      key: "safeInClubsAndOrgs",
      label: "Do you think you feel safe in events, meetings and/or other interactions and engagements with people from your clubs, societies, Ministries, initiatives and/or collectives?",
    },
    {
      key: "cashTakesReportSeriously",
      label: "If you filed a report with CASH, how likely do you think it is that they would take your report seriously?",
    },
    {
      key: "likelyApproachCASHSG",
      label: "How likely are you to approach the CASH Support Group?",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 3 - Perception</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Do you think the following constitute sexual harassment?
          </h3>
          <div className="space-y-4">
            {perceptionQuestions.map((question) => (
              <ScaleQuestion
                key={question.key}
                title={question.label}
                value={data[question.key as keyof Section3Data]}
                onChange={(value) =>
                  onUpdate({ [question.key]: value })
                }
              />
            ))}
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The following section includes an attention check. For the first question "How prevalent do you think sexual harassment is at Ashoka University?", please select "4" (Very).
            </AlertDescription>
          </Alert>

          <h3 className="text-lg font-semibold">Your attitudes towards CASH and campus safety</h3>
          <div className="space-y-4">
            {attitudinalQuestions.map((question) => (
              <ScaleQuestion
                key={question.key}
                title={question.label}
                description={question.isAttentionCheck ? "(Attention Check - Select 4)" : undefined}
                value={data[question.key as keyof Section3Data]}
                onChange={(value) =>
                  onUpdate({ [question.key]: value })
                }
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
