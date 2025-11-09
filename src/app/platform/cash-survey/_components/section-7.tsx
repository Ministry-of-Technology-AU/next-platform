"use client";

import {
  SingleSelect,
  MultiSelectCheckbox,
} from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section7Data {
  cashReportSubstanceAbuse: string;
  cashJurisdiction: string[];
  offCampusPersonCanReport: string;
  noEvidenceCanReport: string;
}

interface Section7Props {
  data: Section7Data;
  onUpdate: (data: Partial<Section7Data>) => void;
}

export default function Section7({ data, onUpdate }: Section7Props) {
  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const jurisdictionOptions = [
    { value: "transportation", label: "Transportation (Ashoka shuttle buses)" },
    { value: "off-campus-events", label: "Off-Campus Events" },
    { value: "semester-abroad", label: "Semester Abroad and/or Summer Abroad" },
    { value: "internships", label: "Internal/Ashoka-related Internships" },
    { value: "excursions", label: "Study Excursions and/or Tours" },
    {
      value: "off-campus-residence",
      label: "Off-Campus Residence (TDI Lake Grove and/or Parker Residency)",
    },
    { value: "on-campus-events", label: "On-Campus Academic/Cultural/Sports Fests" },
    {
      value: "ashoka-vicinity",
      label: "Spaces within Ashoka's Vicinity (ASG, Vada Pav Cafe, Roti Boti etc.)",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 7 - CASH Policy Awareness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SingleSelect
          title="If a sexual assault/sexual harassment incident involves substance abuse in any form (alcohol, cigarettes, drugs etc.), does CASH report it to the Committee Against Disciplinary Infractions (CADI)?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.cashReportSubstanceAbuse}
          onChange={(value) => onUpdate({ cashReportSubstanceAbuse: value })}
          isRequired
        />

        <MultiSelectCheckbox
          title="Which of the following Ashoka-related settings fall under the jurisdiction of CASH?"
          description="Select all that apply - if an incident occurred in any of these spaces, you would be able to file a report with CASH"
          items={jurisdictionOptions}
          value={data.cashJurisdiction}
          onChange={(value) => onUpdate({ cashJurisdiction: value })}
          isRequired
        />

        <SingleSelect
          title="Person A is a student from Ashoka University and has been subjected to sexual assault/sexual harassment by Person B, who is not associated with Ashoka University (not a student or employee), but was visiting a place or event organized by Ashoka University. Can Person A file a case with CASH?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.offCampusPersonCanReport}
          onChange={(value) => onUpdate({ offCampusPersonCanReport: value })}
          isRequired
        />

        <SingleSelect
          title="If a person does not have any evidence (physical and/or digital) and/or witnesses, can they still file a report to CASH?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.noEvidenceCanReport}
          onChange={(value) => onUpdate({ noEvidenceCanReport: value })}
          isRequired
        />
      </CardContent>
    </Card>
  );
}
