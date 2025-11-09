"use client";

import {
  TextInput,
  SingleSelect,
  MultiSelectCheckbox,
} from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Section5Data {
  reportedTo: string[];
  recentContactDate: string;
  approachedCASHSG: string;
  approachedCASHSGMembers: string[];
  cashSGInteractionHelpfulness: string;
  cashSGExperience: string;
  reportedToCASH: string;
  cashExperience: string;
  reasonsNotReported: string[];
  reasonsNotReportedOther: string;
  knowSupportFriend: string;
}

interface Section5Props {
  data: Section5Data;
  onUpdate: (data: Partial<Section5Data>) => void;
}

export default function Section5({ data, onUpdate }: Section5Props) {
  const reportedToOptions = [
    { value: "acwb", label: "Ashoka Centre for Well-Being (ACWB)" },
    { value: "faculty", label: "Faculty" },
    { value: "family", label: "Family" },
    { value: "friends", label: "Friends" },
    { value: "ra", label: "Resident Assistant(s) (RAs)" },
    { value: "not-revealed", label: "I did not reveal it to anyone else" },
    { value: "other", label: "Other (please specify)" },
  ];

  const cashSGMemberOptions = [
    { value: "member-1", label: "CSG Member 1" },
    { value: "member-2", label: "CSG Member 2" },
    { value: "member-3", label: "CSG Member 3" },
  ];

  const helpfulnessOptions = [
    { value: "very-helpful", label: "Very helpful" },
    { value: "somewhat-helpful", label: "Somewhat helpful" },
    { value: "somewhat-unhelpful", label: "Somewhat unhelpful" },
    { value: "very-unhelpful", label: "Very unhelpful" },
  ];

  const reportedToCASHOptions = [
    { value: "yes", label: "Yes" },
    {
      value: "attempted",
      label: "I attempted to but I couldn't complete the process",
    },
    { value: "no", label: "No" },
  ];

  const reasonsOptions = [
    { value: "not-knew-where", label: "I did not know where or how to report the incident" },
    { value: "time-consuming", label: "The process was too time-consuming" },
    { value: "heard-negative", label: "I heard that CASH doesn't handle cases well" },
    {
      value: "no-investigation",
      label: "I did not think any formal investigation would take place",
    },
    { value: "confidentiality", label: "I was concerned about confidentiality" },
    { value: "ashamed", label: "I felt ashamed or embarrassed" },
    {
      value: "emotionally-difficult",
      label: "I found it emotionally difficult and/or overwhelming to go through with the process",
    },
    { value: "fear-retaliation", label: "I feared retaliation by peers and/or faculty" },
    {
      value: "fear-consequences",
      label: "I feared negative social and/or personal consequences",
    },
    {
      value: "not-want-trouble",
      label: "I did not want the person(s) involved to get into trouble",
    },
    { value: "not-serious", label: "I did not think the incident was serious enough to report" },
    {
      value: "not-constitute",
      label: "I did not think it constituted sexual assault or harassment",
    },
    { value: "not-on-campus", label: "The incident did not occur on campus" },
    { value: "resolved-independently", label: "I resolved it independently of CASH" },
    { value: "other", label: "Other (please specify)" },
  ];

  const yesNoOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section 5 - Reporting Unwanted Sexual Experiences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <MultiSelectCheckbox
          title="Whom did you approach to report unwanted sexual experiences?"
          description="Select all that apply"
          items={reportedToOptions}
          value={data.reportedTo}
          onChange={(value) => onUpdate({ reportedTo: value })}
        />

        <TextInput
          title="When did you most recently contact them about these experiences?"
          type="text"
          placeholder="Enter date or time period"
          value={data.recentContactDate}
          onChange={(value) => onUpdate({ recentContactDate: value })}
        />

        <SingleSelect
          title="Did you go to the CASH Support Group?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.approachedCASHSG}
          onChange={(value) => onUpdate({ approachedCASHSG: value })}
        />

        {data.approachedCASHSG === "yes" && (
          <>
            <MultiSelectCheckbox
              title="Whom did you approach from the CASH Support Group?"
              items={cashSGMemberOptions}
              value={data.approachedCASHSGMembers}
              onChange={(value) => onUpdate({ approachedCASHSGMembers: value })}
            />

            <SingleSelect
              title="How helpful did you find the interaction with the CASH Support Group member?"
              placeholder="Select an option"
              items={helpfulnessOptions}
              value={data.cashSGInteractionHelpfulness}
              onChange={(value) =>
                onUpdate({ cashSGInteractionHelpfulness: value })
              }
            />

            <TextInput
              title="If you are comfortable with it, please describe your experience with the CASH Support Group member"
              description="This could include accessibility, guidance, trust etc."
              placeholder="Share your experience"
              isParagraph
              value={data.cashSGExperience}
              onChange={(value) => onUpdate({ cashSGExperience: value })}
            />
          </>
        )}

        <SingleSelect
          title="Did you report the incident to CASH?"
          placeholder="Select an option"
          items={reportedToCASHOptions}
          value={data.reportedToCASH}
          onChange={(value) => onUpdate({ reportedToCASH: value })}
        />

        {(data.reportedToCASH === "yes" ||
          data.reportedToCASH === "attempted") && (
          <TextInput
            title="If you are comfortable with it, please describe your experience with CASH"
            description="This could include accessibility, guidance, trust etc."
            placeholder="Share your experience"
            isParagraph
            value={data.cashExperience}
            onChange={(value) => onUpdate({ cashExperience: value })}
          />
        )}

        {data.reportedToCASH === "no" && (
          <>
            <MultiSelectCheckbox
              title="Listed below are reasons why most people do not report incidents to CASH. Select all of those that apply to you and your situation."
              items={reasonsOptions}
              value={data.reasonsNotReported}
              onChange={(value) => onUpdate({ reasonsNotReported: value })}
            />

            {data.reasonsNotReported.includes("other") && (
              <TextInput
                title="Other reason (please specify)"
                placeholder="Describe other reasons"
                isParagraph
                value={data.reasonsNotReportedOther}
                onChange={(value) => onUpdate({ reasonsNotReportedOther: value })}
              />
            )}
          </>
        )}

        <SingleSelect
          title="SD2. If a friend disclosed an encounter with sexual assault/sexual harassment to you, would you know the best way to support them?"
          placeholder="Select an option"
          items={yesNoOptions}
          value={data.knowSupportFriend}
          onChange={(value) => onUpdate({ knowSupportFriend: value })}
        />
      </CardContent>
    </Card>
  );
}
