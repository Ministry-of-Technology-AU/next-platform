"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, ExternalLink } from "lucide-react";
import { PFCreditsComponent } from "./pf-credits";

interface CGPAFormProps {
    gradeInput: string;
    setGradeInput: React.Dispatch<React.SetStateAction<string>>;
    pfCredits: string;
    setPfCredits: React.Dispatch<React.SetStateAction<string>>;
    handleCalculate: () => void;
}

/**
 * CGPA Form Component
 * Allows users to input their grades and PF credits to calculate CGPA
 */
export default function CGPAForm({ 
    gradeInput, 
    setGradeInput, 
    pfCredits, 
    setPfCredits, 
    handleCalculate 
}: CGPAFormProps) {
    const isDisabled = !gradeInput.trim();

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Grade Input Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="gradeInput" className="text-sm font-medium">
                                Grade Data Input
                            </Label>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => window.open('https://ams.ashoka.edu.in/Contents/CourseManagement/StudentCourseReport_Student.aspx', '_blank')}
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open AMS
                            </Button>
                        </div>
                        <Textarea
                            id="gradeInput"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            placeholder="Go to AMS → Grades and Evaluations → My Course Report and Degree/Diploma Status. Then copy the ENTIRE page (Ctrl+A or Cmd+A on Mac), paste it here (Ctrl+V or Cmd+V), and click Calculate CGPA."
                            rows={10}
                            className="text-sm font-mono resize-y"
                        />
                    </div>

                    {/* PF Credits Section */}
                    <div className="space-y-2">
                        <PFCreditsComponent
                            pfCredits={pfCredits}
                            setPfCredits={setPfCredits}
                        />
                    </div>

                    {/* Calculate Button */}
                    <div className="flex justify-center">
                        <Button
                            onClick={handleCalculate}
                            className="w-full md:w-auto px-8 py-6 text-lg"
                            disabled={isDisabled}
                            size="lg"
                        >
                            <Calculator className="mr-2 h-5 w-5" />
                            Calculate CGPA
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}