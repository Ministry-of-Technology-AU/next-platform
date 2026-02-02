"use client";

import {
  TextInput,
  SingleSelect,
  MultiSelectCheckbox,
} from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section2Data {
  knownPolicies: string;
  policyComprehensible: string;
  attentionCheck: string;
  knowsReportingBody: string;
  reportingBody: string;
  reportingLikelihood: string;
  awareCASH: string;
  awareFormalProcedure: string;
  notConfidentAspects: string[];
  navigateCASHProcess: string;
  awareCASHSupportGroup: string;
  supportGroupFamiliarity: string;
  knowsCASHMember: string;
  attendedWorkshops: string;
  workshopHelpfulness: string;
  workshopComments: string;
}

interface Section2Props {
  data: Section2Data;
  onUpdate: (data: Partial<Section2Data>) => void;
}

export default function Section2({ data, onUpdate }: Section2Props) {
  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const reportingLikelihoodOptions = [
    { value: "very-likely", label: "Very likely" },
    { value: "somewhat-likely", label: "Somewhat likely" },
    { value: "somewhat-unlikely", label: "Somewhat unlikely" },
    { value: "very-unlikely", label: "Very unlikely" },
  ];

  const familiarityOptions = [
    { value: "very-familiar", label: "Very familiar" },
    { value: "somewhat-familiar", label: "Somewhat familiar" },
    { value: "somewhat-unfamiliar", label: "Somewhat unfamiliar" },
    { value: "very-unfamiliar", label: "Very unfamiliar" },
  ];

  const helpfulnessOptions = [
    { value: "very-helpful", label: "Very helpful" },
    { value: "somewhat-helpful", label: "Somewhat helpful" },
    { value: "somewhat-unhelpful", label: "Somewhat unhelpful" },
    { value: "very-unhelpful", label: "Very unhelpful" },
  ];

  const notConfidentOptions = [
    { value: "reporting-process", label: "Reporting process" },
    { value: "investigation-process", label: "Investigation process" },
    { value: "support-available", label: "Support available" },
    { value: "confidentiality", label: "Confidentiality protections" },
    { value: "appeal-process", label: "Appeal process" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 2 - Campus Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SingleSelect
          title="Do you know where to find the policy against sexual harassment?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.knownPolicies}
          onChange={(value) => onUpdate({ knownPolicies: value })}
          isRequired
        />

        {data.knownPolicies === "yes" && (
          <SingleSelect
            title="If yes, was it easy to comprehend?"
            placeholder="Select an option"
            items={yesNoOptions}
            value={data.policyComprehensible}
            onChange={(value) => onUpdate({ policyComprehensible: value })}
          />
        )}

        <TextInput
          title="A1. Attention Check: What is the answer to 2+2?"
          placeholder="Enter the answer"
          value={data.attentionCheck}
          onChange={(value) => onUpdate({ attentionCheck: value })}
          isRequired
        />

        <SingleSelect
          title="Do you know which body to approach to formally report an incident of sexual assault/sexual harassment?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.knowsReportingBody}
          onChange={(value) => onUpdate({ knowsReportingBody: value })}
          isRequired
        />

        {data.knowsReportingBody === "yes" && (
          <TextInput
            title="If yes, which body would you approach?"
            placeholder="Describe the body/department"
            isParagraph
            value={data.reportingBody}
            onChange={(value) => onUpdate({ reportingBody: value })}
          />
        )}

        <SingleSelect
          title="How likely are you to report any experience of sexual assault/sexual harassment?"
          placeholder="Select an option"
          items={reportingLikelihoodOptions}
          value={data.reportingLikelihood}
          onChange={(value) => onUpdate({ reportingLikelihood: value })}
          isRequired
        />

        <SingleSelect
          title="Are you aware of the Committee Against Sexual Harassment (CASH)?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.awareCASH}
          onChange={(value) => onUpdate({ awareCASH: value })}
          isRequired
        />

        <SingleSelect
          title="Are you aware of the formal procedure that is followed when a student reports an incident of sexual assault/sexual harassment at Ashoka University?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.awareFormalProcedure}
          onChange={(value) => onUpdate({ awareFormalProcedure: value })}
          isRequired
        />

        {data.awareFormalProcedure === "yes" && (
          <MultiSelectCheckbox
            title="Which aspects of the process are you not confident about?"
            description="Select all that apply"
            items={notConfidentOptions}
            value={data.notConfidentAspects}
            onChange={(value) => onUpdate({ notConfidentAspects: value })}
          />
        )}

        <SingleSelect
          title="SD1. If you ever needed to, would you know how to navigate every step of the CASH process?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.navigateCASHProcess}
          onChange={(value) => onUpdate({ navigateCASHProcess: value })}
        />

        <SingleSelect
          title="Are you aware of the CASH Support Group?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.awareCASHSupportGroup}
          onChange={(value) => onUpdate({ awareCASHSupportGroup: value })}
        />

        {data.awareCASHSupportGroup === "yes" && (
          <>
            <SingleSelect
              title="How familiar are you about the functions of the CASH Support Group?"
              placeholder="Select an option"
              items={familiarityOptions}
              value={data.supportGroupFamiliarity}
              onChange={(value) => onUpdate({ supportGroupFamiliarity: value })}
            />

            <SingleSelect
              title="Do you know how to get in touch with at least one member of the CASH Support Group?"
              placeholder="Select an option"
              items={yesNoOptions}
              value={data.knowsCASHMember}
              onChange={(value) => onUpdate({ knowsCASHMember: value })}
            />
          </>
        )}

        <SingleSelect
          title="Have you attended any of the sexual harassment sensitization workshops conducted by Ashoka University?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.attendedWorkshops}
          onChange={(value) => onUpdate({ attendedWorkshops: value })}
        />

        {data.attendedWorkshops === "yes" && (
          <>
            <SingleSelect
              title="How helpful did you find Ashoka University's sexual harassment sensitization workshops?"
              placeholder="Select an option"
              items={helpfulnessOptions}
              value={data.workshopHelpfulness}
              onChange={(value) => onUpdate({ workshopHelpfulness: value })}
            />

            <TextInput
              title="Do you have any comments on the workshops?"
              placeholder="Share your feedback"
              isParagraph
              value={data.workshopComments}
              onChange={(value) => onUpdate({ workshopComments: value })}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
