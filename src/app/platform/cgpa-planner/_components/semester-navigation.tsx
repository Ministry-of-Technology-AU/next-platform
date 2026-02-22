"use client";

import { BookOpen, RotateCcw, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import type { ParsedCGPAData, ParsedSemester } from "@/lib/cgpa-types";

// Type definitions for the clear actions
type ActionResponse = {
    success: boolean;
    message?: string;
    error?: string;
};
type CGPAApiResponse = ActionResponse;

interface SemesterNavigationProps {
    resetActiveTab: () => void;
    setIsFormView: (value: boolean) => void;
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

async function clearCGPAData(): Promise<{ success: boolean; message?: string; error?: string }> {
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
    upcomingSemesters,
    pastSemesters,
    selectedSemester,
    setSelectedSemester,
}: SemesterNavigationProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleResyncFromAMS = async () => {
        if (!confirm('This will delete all your saved CGPA data and require you to paste it from AMS again. Proceed?')) {
            return;
        }
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

    const handleResetData = () => {
        if (!confirm('Are you sure you want to clear your current form inputs?')) {
            return;
        }

        resetActiveTab();
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