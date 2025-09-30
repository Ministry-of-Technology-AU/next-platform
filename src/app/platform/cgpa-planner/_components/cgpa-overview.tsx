import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CGPAOverviewProps {
    calculatedCGPA: {
        semesterGPA: string;
        newCGPA: string;
        creditsEarned: number;
        totalGpaCredits: number;
        totalGradePoints: number;
        totalEarnedCredits: number;
    } | null;
    getCurrentCGPA: () => number;
    getCurrentCredits: () => number;
}

export default function CGPAOverview({ calculatedCGPA, getCurrentCGPA, getCurrentCredits }: CGPAOverviewProps) {
    return(
                            <CardContent className="p-2">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex flex-wrap items-end gap-2">
                                <Button
                                    variant="outline"
                                    className="text-sm text-white font-bold text-left bg-primary p-4 rounded-lg hover:bg-primary hover:text-white"
                                >
                                    CGPA: {calculatedCGPA ? calculatedCGPA.newCGPA : getCurrentCGPA().toFixed(2)}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-sm text-white font-bold text-left bg-primary p-4 rounded-lg hover:bg-primary hover:text-white"
                                >
                                    Credits: {calculatedCGPA ? calculatedCGPA.totalGpaCredits : getCurrentCredits()}
                                </Button>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                Retakes are auto-detected—only your best attempt counts toward CGPA.
                            </div>
                        </div>
                    </CardContent>
    );
}