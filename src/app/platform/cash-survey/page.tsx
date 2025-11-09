"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";
import Section1A from "./_components/section-1a";
import Section1B from "./_components/section-1b";
import Section2 from "./_components/section-2";
import Section3 from "./_components/section-3";
import Section4 from "./_components/section-4";
import Section5 from "./_components/section-5";
import Section6 from "./_components/section-6";
import Section7 from "./_components/section-7";
import Section8 from "./_components/section-8";
import { CASHSurveyData } from "./types";
import { isSectionComplete, getMissingFields } from "./validation-utils";

export default function CASHSurveyPage() {
  const [currentTab, setCurrentTab] = useState("section-1a");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [lastSavedSection, setLastSavedSection] = useState<string | null>(null);

  const [formData, setFormData] = useState<CASHSurveyData>({
    section1A: {
      cohort: "",
      batch: "",
      isVisitingStudent: "",
      livesOnCampus: "",
    },
    section1B: {
      genderIdentity: [],
      genderIdentityOther: "",
      nationality: "",
      nationalityOther: "",
      age: 18,
      sexualOrientation: [],
      customOrientation: "",
      casteCategory: "",
      disabilityStatus: "",
    },
    section2: {
      knownPolicies: "",
      policyComprehensible: "",
      attentionCheck: "",
      knowsReportingBody: "",
      reportingBody: "",
      reportingLikelihood: "",
      awareCASH: "",
      awareFormalProcedure: "",
      notConfidentAspects: [],
      navigateCASHProcess: "",
      awareCASHSupportGroup: "",
      supportGroupFamiliarity: "",
      knowsCASHMember: "",
      attendedWorkshops: "",
      workshopHelpfulness: "",
      workshopComments: "",
    },
    section3: {
      jokesSexualAcquaintances: "",
      jokesSexualFriends: "",
      jokesSexualClassroom: "",
      displaySexualMaterials: "",
      staringStalkingLeering: "",
      unwantedComments: "",
      pressureSexualFavours: "",
      sexistJokes: "",
      repeatedDatingAsks: "",
      unwantedPhysicalAdvances: "",
      harassmentSexualOrientation: "",
      spreadingSexualRumours: "",
      showingPornography: "",
      prevalenceSexualHarassment: "",
      experienceSexualHarassmentAttentionCheck: "",
      likelyExperienceHarassment: "",
      ashokaProvidesGuidance: "",
      cashFairInvestigation: "",
      cashConfidentiality: "",
      cashProtectFromHarm: "",
      cashPsychologicalAssistance: "",
      cashAppropriateAction: "",
      cashStructuralChanges: "",
      safeInClubsAndOrgs: "",
      cashTakesReportSeriously: "",
      likelyApproachCASHSG: "",
    },
    section4: {
      unwelcomePhysicalConduct: "",
      forcedSexualActs: "",
      physicalForceCompulsion: "",
      rewardsThreatsCompulsion: "",
      inappropriateComments: "",
      persistentContact: "",
      unwantedSexualMessagesOnline: "",
      talkSexualMatters: "",
      sharingIntimateContent: "",
      spyingStalking: "",
      sexistRemarks: "",
      offensiveRemarksLGBTQIA: "",
      substanceAbuse: "",
      experiencedUnwantedExperiences: "",
    },
    section5: {
      reportedTo: [],
      recentContactDate: "",
      approachedCASHSG: "",
      approachedCASHSGMembers: [],
      cashSGInteractionHelpfulness: "",
      cashSGExperience: "",
      reportedToCASH: "",
      cashExperience: "",
      reasonsNotReported: [],
      reasonsNotReportedOther: "",
      knowSupportFriend: "",
    },
    section6: {
      personAffiliation: [],
      personRelationshipOther: "",
      personRelationship: [],
      personGender: [],
      personGenderOther: "",
      repeatedIncidents: "",
    },
    section7: {
      cashReportSubstanceAbuse: "",
      cashJurisdiction: [],
      offCampusPersonCanReport: "",
      noEvidenceCanReport: "",
    },
    section8: {
      experiencedDifficulty: "",
      difficultyAreas: [],
      improvementSuggestions: "",
      improvementDetails: [],
    },
  });

  const handleUpdateSection = (section: string, data: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [section]: {
        ...prevFormData[section as keyof CASHSurveyData],
        ...data,
      },
    }));
    setLastSavedSection(section);
  };

  const handleSaveSection = (section: string) => {
    setLastSavedSection(section);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/platform/cash-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }

      toast.success("Survey submitted successfully!", {
        description: "Thank you for completing the CASH survey.",
        duration: 5000,
      });
      
      // Optionally reset form or redirect after delay
      setTimeout(() => {
        // You can redirect here if needed
      }, 1000);
    } catch (error) {
      toast.error("Failed to submit survey", {
        description: error instanceof Error ? error.message : "An error occurred",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: "section-1a", label: "Section 1A - Identifiable Info", tab: "1a" },
    { id: "section-1b", label: "Section 1B - Demographics", tab: "1b" },
    { id: "section-2", label: "Section 2 - Campus Resources", tab: "2" },
    { id: "section-3", label: "Section 3 - Perception", tab: "3" },
    { id: "section-4", label: "Section 4 - Unwanted Experiences", tab: "4" },
    { id: "section-5", label: "Section 5 - Reporting", tab: "5" },
    { id: "section-6", label: "Section 6 - Elaboration", tab: "6" },
    { id: "section-7", label: "Section 7 - CASH Policy Awareness", tab: "7" },
    { id: "section-8", label: "Section 8 - Survey Experience", tab: "8" },
  ];

  // Validation function to check if a section is complete
  const validateSection = (sectionId: string): boolean => {
    // Convert section-1a to section1A, section-1b to section1B, etc.
    let sectionKey = sectionId.replace("section-", "section");
    // Handle special cases: 1a -> 1A, 1b -> 1B, 2 -> 2, etc.
    if (sectionKey === "section1a") sectionKey = "section1A";
    else if (sectionKey === "section1b") sectionKey = "section1B";
    
    const sectionData = formData[sectionKey as keyof CASHSurveyData];
    
    return isSectionComplete(sectionKey, sectionData);
  };

  // Get the current section index
  const currentSectionIndex = sections.findIndex(s => s.id === currentTab);

  return (
    <div className="w-full min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-2xl md:text-3xl">CASH Survey</CardTitle>
            <CardDescription>
              Committee Against Sexual Harassment (CASH) - Student Experience Survey
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col h-full">
                {/* Tab List - Responsive grid without horizontal scroll */}
                <div className="flex-shrink-0 border-b w-full">
                  <TabsList className="w-full flex flex-wrap gap-0">
                    {sections.map((section, index) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        disabled={index > currentSectionIndex}
                        className="relative text-xs md:text-sm py-2 px-2 md:px-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          {section.tab}
                          {completedSections.has(section.id as keyof CASHSurveyData) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Tab Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {/* Save indicator */}
                  {lastSavedSection && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      <span>Section data updated</span>
                    </div>
                  )}

                  <TabsContent value="section-1a" className="mt-0">
                    <Section1A
                      data={formData.section1A}
                      onUpdate={(data: any) => handleUpdateSection("section1A", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-1b" className="mt-0">
                    <Section1B
                      data={formData.section1B}
                      onUpdate={(data: any) => handleUpdateSection("section1B", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-2" className="mt-0">
                    <Section2
                      data={formData.section2}
                      onUpdate={(data: any) => handleUpdateSection("section2", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-3" className="mt-0">
                    <Section3
                      data={formData.section3}
                      onUpdate={(data: any) => handleUpdateSection("section3", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-4" className="mt-0">
                    <Section4
                      data={formData.section4}
                      onUpdate={(data: any) => handleUpdateSection("section4", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-5" className="mt-0">
                    <Section5
                      data={formData.section5}
                      onUpdate={(data: any) => handleUpdateSection("section5", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-6" className="mt-0">
                    <Section6
                      data={formData.section6}
                      onUpdate={(data: any) => handleUpdateSection("section6", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-7" className="mt-0">
                    <Section7
                      data={formData.section7}
                      onUpdate={(data: any) => handleUpdateSection("section7", data)}
                    />
                  </TabsContent>

                  <TabsContent value="section-8" className="mt-0">
                    <Section8
                      data={formData.section8}
                      onUpdate={(data: any) => handleUpdateSection("section8", data)}
                    />
                  </TabsContent>
                </div>

                {/* Navigation Buttons - Fixed at bottom */}
                <div className="flex-shrink-0 border-t pt-6 mt-6 flex gap-3 justify-between flex-col sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currentIndex = sections.findIndex(
                        (s) => s.id === currentTab
                      );
                      if (currentIndex > 0) {
                        handleSaveSection(currentTab);
                        setCurrentTab(sections[currentIndex - 1].id);
                      }
                    }}
                    disabled={currentTab === sections[0].id}
                    className="w-full sm:w-auto"
                  >
                    Previous
                  </Button>

                  {currentTab !== sections[sections.length - 1].id ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (!validateSection(currentTab)) {
                          toast.error("Please fill all required fields", {
                            description: "All fields marked with * are mandatory in this section.",
                            duration: 3000,
                          });
                          return;
                        }
                        const currentIndex = sections.findIndex(
                          (s) => s.id === currentTab
                        );
                        if (currentIndex < sections.length - 1) {
                          handleSaveSection(currentTab);
                          setCurrentTab(sections[currentIndex + 1].id);
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Survey"}
                    </Button>
                  )}
                </div>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
