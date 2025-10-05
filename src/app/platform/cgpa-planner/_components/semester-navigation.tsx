
"use client";

import { BookOpen, RotateCcw, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import type { ParsedCGPAData, ParsedSemester } from "../types";

type CGPAApiResponse = {
    success: boolean;
    message?: string;
    error?: string;
};

interface SemesterNavigationProps {
    resetActiveTab: () => void;
    setIsFormView: (value: boolean) => void;
    pfCredits: string;
    setPfCredits: (value: string) => void;
    upcomingSemesters: ParsedSemester[];
    pastSemesters: ParsedSemester[];
    selectedSemester: number | null;
    setSelectedSemester: (value: number | null) => void;
}

// API functions for CGPA operations
export async function saveCGPAData(cgpaData: ParsedCGPAData): Promise<CGPAApiResponse> {
    try {
        const response = await fetch('/api/platform/cgpa-planner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cgpaData),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }
        return result;
    } catch (error) {
        console.error('Error saving CGPA data:', error);
        return {
            success: false,
            error: 'Failed to save CGPA data'
        };
    }
}

async function clearCGPAData(): Promise<{success: boolean; message?: string; error?: string}> {
  try {
    const response = await fetch('/api/platform/cgpa-planner', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Error clearing CGPA data:', error);
    return {
      success: false,
      error: 'Failed to clear CGPA data'
    };
  }
}

export default function SemesterNavigation({
    resetActiveTab,
    setIsFormView,
    pfCredits,
    setPfCredits,
    upcomingSemesters,
    pastSemesters,
    selectedSemester,
    setSelectedSemester,
}: SemesterNavigationProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleResyncFromAMS = async () => {
        setIsSyncing(true);
        try {
            // First clear existing data
            const clearResult = await clearCGPAData();
            if (clearResult.success) {
                console.log('CGPA data cleared successfully');
                // Then redirect to form view to input new data
                setIsFormView(true);
            } else {
                console.error('Failed to clear CGPA data:', clearResult.error);
                alert('Failed to clear existing data. Please try again.');
            }
        } catch (error) {
            console.error('Error during resync:', error);
            alert('An error occurred during resync. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleResetData = async () => {
        if (!confirm('Are you sure you want to reset all CGPA data? This action cannot be undone.')) {
            return;
        }
        
        setIsClearing(true);
        try {
            const result = await clearCGPAData();
            if (result.success) {
                console.log('CGPA data reset successfully');
                resetActiveTab();
                // Optionally refresh the page to reflect changes
                window.location.reload();
            } else {
                console.error('Failed to reset CGPA data:', result.error);
                alert('Failed to reset data. Please try again.');
            }
        } catch (error) {
            console.error('Error during reset:', error);
            alert('An error occurred during reset. Please try again.');
        } finally {
            setIsClearing(false);
        }
    };

    return (
                                    <div className="lg:col-span-1">
                                <Card className="h-fit">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Semester Navigation</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full h-12 justify-between"
                                                onClick={handleResetData}
                                                disabled={isClearing}
                                            >
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <RotateCcw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
                                                    {isClearing ? 'Resetting...' : 'Reset Data'}
                                                </span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full h-12 justify-between"
                                                onClick={handleResyncFromAMS}
                                                disabled={isSyncing}
                                            >
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <Upload className={`h-4 w-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                                                    {isSyncing ? 'Syncing...' : 'Re-sync from AMS'}
                                                </span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full h-12"
                                                asChild
                                            >
                                                <div className="flex items-center justify-between w-full gap-3 px-4">
                                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                                        <BookOpen className="h-4 w-4" />
                                                        Pass/Fail Credits
                                                    </span>
                                                    <Input
                                                        id="pfCreditsUpdate"
                                                        type="number"
                                                        value={pfCredits}
                                                        onChange={(e) => {
                                                            const val = Math.max(0, Math.min(8, Number(e.target.value)));
                                                            setPfCredits(Number.isFinite(val) ? val.toString() : '');
                                                        }}
                                                        className="w-20 h-9 text-center"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </Button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                                            {/* Current Semester Button */}
                                            {upcomingSemesters.length > 0 && (
                                                <Button
                                                    variant={selectedSemester === null ? "default" : "outline"}
                                                    className="w-full justify-start text-sm"
                                                    onClick={() => setSelectedSemester(null)}
                                                >
                                                    Current Semester
                                                </Button>
                                            )}

                                            {/* Past Semesters */}
                                            {pastSemesters.length > 0 ? (
                                                pastSemesters.map((semester, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={selectedSemester === index ? "default" : "outline"}
                                                        className="w-full justify-start text-sm"
                                                        onClick={() => setSelectedSemester(index)}
                                                    >
                                                        {semester.semester}
                                                    </Button>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No past semesters found</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Calculate Button - only show when viewing the current semester */}
                                {/* ...removed calculate button and stats from right column... */}
                            </div>
    )
}