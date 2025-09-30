"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
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
                        <Label htmlFor="gradeInput" className="text-sm font-medium">
                            Grade Data Input
                        </Label>
                        <Textarea
                            id="gradeInput"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            placeholder="Go to the Grades & Evaluations' page on your AMS → Ctrl+A → Ctrl+C → navigate back to this page → Ctrl+V in this box. On Macs, use Cmd instead of Ctrl."
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