// Define required fields for each section
// Fields NOT in this set are optional
export const REQUIRED_FIELDS: Record<string, Set<string>> = {
  section1A: new Set([
    "cohort",
    "batch",
    "isVisitingStudent",
    "livesOnCampus",
  ]),
  
  section1B: new Set([
    "genderIdentity",
    "nationality",
    "age",
    "casteCategory",
    "disabilityStatus",
  ]),
  
  section2: new Set([
    "knownPolicies",
    "attentionCheck",
    "knowsReportingBody",
    "reportingLikelihood",
    "awareCASH",
    "awareFormalProcedure",
  ]),
  
  // Section 3 has no required fields
  section3: new Set([]),
  
  // Section 4 has no required fields
  section4: new Set([]),
  
  // Section 5 has no required fields
  section5: new Set([]),
  
  // Section 6 has no required fields
  section6: new Set([]),
  
  section7: new Set([
    "cashReportSubstanceAbuse",
    "cashJurisdiction",
    "offCampusPersonCanReport",
    "noEvidenceCanReport",
  ]),
  
  // Section 8 has no required fields
  section8: new Set([]),
};

// Define conditional required fields - fields that are only required if a certain condition is met
// Structure: [sectionKey]: { [triggerFieldKey]: { triggerValue: [requiredFields] } }
export const CONDITIONAL_REQUIRED_FIELDS: Record<
  string,
  Record<string, Record<string, string[]>>
> = {
  section1B: {
    genderIdentity: {
      "other": ["genderIdentityOther"],
    },
    nationality: {
      "other": ["nationalityOther"],
    },
    sexualOrientation: {
      "not-listed": ["customOrientation"],
    },
  },
  
  section2: {
    knownPolicies: {
      "yes": ["policyComprehensible"],
    },
    knowsReportingBody: {
      "yes": ["reportingBody"],
    },
    awareFormalProcedure: {
      "yes": ["notConfidentAspects"],
    },
    awareCASHSupportGroup: {
      "yes": ["supportGroupFamiliarity", "knowsCASHMember"],
    },
    attendedWorkshops: {
      "yes": ["workshopHelpfulness", "workshopComments"],
    },
  },
};
