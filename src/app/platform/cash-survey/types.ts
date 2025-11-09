export interface CASHSurveyData {
  section1A: {
    cohort: string;
    batch: string;
    isVisitingStudent: string;
    livesOnCampus: string;
  };
  section1B: {
    genderIdentity: string[];
    genderIdentityOther: string;
    nationality: string;
    nationalityOther: string;
    age: number;
    sexualOrientation: string[];
    customOrientation: string;
    casteCategory: string;
    disabilityStatus: string;
  };
  section2: {
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
  };
  section3: {
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
  };
  section4: {
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
  };
  section5: {
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
  };
  section6: {
    personAffiliation: string[];
    personRelationshipOther: string;
    personRelationship: string[];
    personGender: string[];
    personGenderOther: string;
    repeatedIncidents: string;
  };
  section7: {
    cashReportSubstanceAbuse: string;
    cashJurisdiction: string[];
    offCampusPersonCanReport: string;
    noEvidenceCanReport: string;
  };
  section8: {
    experiencedDifficulty: string;
    difficultyAreas: string[];
    improvementSuggestions: string;
    improvementDetails: string[];
  };
}
