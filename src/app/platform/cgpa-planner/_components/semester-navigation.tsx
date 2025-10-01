import { BookOpen, RotateCcw, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParsedSemester } from "../types";

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
                                                onClick={resetActiveTab}
                                            >
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <RotateCcw className="h-4 w-4" />
                                                    Reset Data
                                                </span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full h-12 justify-between"
                                                onClick={() => setIsFormView(true)}
                                            >
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <Upload className="h-4 w-4" />
                                                    Re-sync from AMS
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