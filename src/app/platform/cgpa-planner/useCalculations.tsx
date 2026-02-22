import { useState, useMemo, useEffect } from "react";
import { gradePointsMap, gradeOptions } from "@/app/platform/cgpa-planner/data";
import { ParsedCGPAData, ParsedSemester, GradeKey } from "@/lib/cgpa-types";
import { saveCGPAData } from "./_components/semester-navigation";
import { getCourseKey, computeBestCourseSummary } from "@/lib/cgpa-utils";
import { toast } from "sonner";

export const useCalculations = (initialData?: ParsedCGPAData) => {
    // State management
    const [isFormView, setIsFormView] = useState(() => {
        if (initialData && initialData.semesters && initialData.semesters.length > 0) {
            return false;
        }
        return true;
    });
    const [gradeInput, setGradeInput] = useState<string>('');
    const [cgpaData, setCgpaData] = useState<ParsedCGPAData>(
        initialData ?? {
            degreeCGPA: 0,
            majorCGPA: 0,
            totalCredits: 0,
            semesters: [] as ParsedSemester[],
        }
    );

    // Selected semester for viewing (null means current semester)
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

    // Current semester grades input by user
    const [currentSemesterGrades, setCurrentSemesterGrades] = useState<Record<number, string>>({});

    // Calculated new CGPA
    const [calculatedCGPA, setCalculatedCGPA] = useState<{
        semesterGPA: string;
        newCGPA: string;
        creditsEarned: number;
        totalGpaCredits: number;
        totalGradePoints: number;
        totalEarnedCredits: number;
    } | null>(null);

    // Baseline details
    const [baselineSummary, setBaselineSummary] = useState<{
        totalGradePoints: number;
        totalGpaCredits: number;
        totalEarnedCredits: number;
    }>({
        totalGradePoints: 0,
        totalGpaCredits: 0,
        totalEarnedCredits: 0
    });

    // Retake states
    const [autoDetectedRetakeKeys, setAutoDetectedRetakeKeys] = useState<Set<string>>(new Set());
    const [userDefinedRetakes, setUserDefinedRetakes] = useState<Record<number, string>>({});
    const [ignoredRetakeKeys, setIgnoredRetakeKeys] = useState<string[]>([]);
    const [detachedPastIndices, setDetachedPastIndices] = useState<string[]>([]);
    const [userDefinedPastRetakes, setUserDefinedPastRetakes] = useState<Record<string, string>>({});
    const [overwrittenPastIndices, setOverwrittenPastIndices] = useState<Set<string>>(new Set());
    const [activeRetakePastIndices, setActiveRetakePastIndices] = useState<Set<string>>(new Set());

    // Simplified GPA calculator states
    const [desiredCGPA, setDesiredCGPA] = useState<string>('');
    const [remainingCredits, setRemainingCredits] = useState<string>('');
    const [projectedAverage, setProjectedAverage] = useState<string>('');

    // New calculator states for the two main features
    const [creditsThisSemester, setCreditsThisSemester] = useState<string>('');
    const [targetCGPA, setTargetCGPA] = useState<string>('');
    const [plannedAverage, setPlannedAverage] = useState<string>('');
    const [plannedCredits, setPlannedCredits] = useState<string>('');
    const [raiseTargetCGPA, setRaiseTargetCGPA] = useState<string>('');
    const [maintainedAverageCGPA, setMaintainedAverageCGPA] = useState<string>('');

    // Results for the new features
    const [requiredSemesterAverage, setRequiredSemesterAverage] = useState<string>('');
    const [projectedCGPA, setProjectedCGPA] = useState<string>('');
    const [requiredCreditsToRaise, setRequiredCreditsToRaise] = useState<string>('');

    // UI state: active tab
    const [activeTab, setActiveTab] = useState<'upcoming' | 'grade-planner' | 'calculator'>('upcoming');

    const semesterPartitions = useMemo(() => {
        const upcomingRaw = cgpaData.semesters.filter(sem => sem.semesterCreditsEarned === 0 && sem.gpa === 0);
        const pastRaw = cgpaData.semesters.filter(sem => sem.semesterCreditsEarned !== 0 || sem.gpa !== 0);

        return {
            upcomingRaw,
            pastRaw,
            upcomingUI: [...upcomingRaw].reverse(),
            pastUI: [...pastRaw].reverse(),
            currentUpcoming: upcomingRaw.length > 0 ? upcomingRaw[upcomingRaw.length - 1] : null,
        };
    }, [cgpaData.semesters]);

    const rawPastSemesters = semesterPartitions.pastRaw;
    const upcomingSemesters = semesterPartitions.upcomingUI;
    const pastSemesters = semesterPartitions.pastUI;
    const currentUpcomingSemester = semesterPartitions.currentUpcoming;

    // Fetch baseline stats from backend when cgpaData changes
    useEffect(() => {
        const calculateStats = () => {
            if (!cgpaData || cgpaData.semesters.length === 0) return;
            try {
                const summary = computeBestCourseSummary(
                    rawPastSemesters,
                    null,
                    {},
                    {},
                    [],
                    []
                );

                setBaselineSummary({
                    totalGradePoints: summary.totalGradePoints,
                    totalGpaCredits: summary.totalGpaCredits,
                    totalEarnedCredits: summary.totalEarnedCredits
                });
            } catch (err) {
                console.error("Failed to calculate baseline", err);
            }
        };
        calculateStats();
    }, [cgpaData, rawPastSemesters]);

    // Fetch retake status from backend when inputs change
    useEffect(() => {
        const calculateRetakes = () => {
            if (!cgpaData || cgpaData.semesters.length === 0) return;
            try {
                const summary = computeBestCourseSummary(
                    rawPastSemesters,
                    currentUpcomingSemester,
                    currentSemesterGrades,
                    userDefinedRetakes,
                    ignoredRetakeKeys,
                    detachedPastIndices,
                    userDefinedPastRetakes
                );

                setAutoDetectedRetakeKeys(new Set(summary.autoDetectedRetakeKeys));
                setOverwrittenPastIndices(new Set(summary.overwrittenPastIndices));
                setActiveRetakePastIndices(new Set(summary.activeRetakePastIndices));
            } catch (err) {
                console.error("Failed to calculate retakes", err);
            }
        };
        calculateRetakes();
    }, [cgpaData, rawPastSemesters, currentUpcomingSemester, currentSemesterGrades, userDefinedRetakes, ignoredRetakeKeys, detachedPastIndices]);


    const handleCalculate = async () => {
        if (!gradeInput.trim()) {
            alert('Please paste your grade data first.');
            return;
        }

        try {
            const res = await fetch('/api/platform/cgpa-planner/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: gradeInput,
                    saveToStrapi: true
                })
            });

            const data = await res.json();
            if (data.success && data.data) {
                setCgpaData(data.data);
                setIsFormView(false);
            } else {
                console.error(data.error);
                alert('Failed to parse CGPA data.');
            }
        } catch (error) {
            console.error('Error posting CGPA data:', error);
            alert('Error posting CGPA data.');
        }
    };

    // Handle grade selection for current semester
    const handleGradeChange = (courseIndex: number, grade: GradeKey) => {
        setCurrentSemesterGrades(prev => ({
            ...prev,
            [courseIndex]: grade
        }));
    };

    // Calculate new CGPA based on current semester grades
    const calculateNewCGPA = () => {
        if (!currentUpcomingSemester) {
            alert('No upcoming semester found to calculate grades for.');
            return;
        }

        try {
            const summary = computeBestCourseSummary(
                rawPastSemesters,
                currentUpcomingSemester,
                currentSemesterGrades,
                userDefinedRetakes,
                ignoredRetakeKeys,
                detachedPastIndices,
                userDefinedPastRetakes
            );

            // Keep local calculations purely for displaying the current semester GPA safely on frontend
            let totalCurrentGradePoints = 0;
            let totalCurrentCredits = 0;
            let creditsEarned = 0;

            currentUpcomingSemester.courses.forEach((course, index) => {
                const selectedGrade = currentSemesterGrades[index] as GradeKey;
                if (!selectedGrade || selectedGrade === 'Select') return;

                const credits = course.creditsRegistered || 0;

                if (selectedGrade === 'AU' || selectedGrade === 'TP (w/o credits)') {
                    return;
                }
                if (selectedGrade === 'F (w P/F)' || selectedGrade === 'P') {
                    if (selectedGrade === 'P') creditsEarned += credits;
                    return;
                }
                if (selectedGrade === 'TP (w credits)') {
                    creditsEarned += 2;
                    return;
                }

                const gradePoints = gradePointsMap[selectedGrade as keyof typeof gradePointsMap] ?? 0;
                totalCurrentGradePoints += gradePoints * credits;
                totalCurrentCredits += credits;
                if (selectedGrade.startsWith('F')) {
                    // Normally F does not give earned credits unless TP
                } else {
                    creditsEarned += credits;
                }
            });

            const currentSemesterGPA = totalCurrentCredits > 0 ? totalCurrentGradePoints / totalCurrentCredits : 0;
            const newCGPA = summary.totalGpaCredits > 0 ? summary.totalGradePoints / summary.totalGpaCredits : 0;

            setCalculatedCGPA({
                semesterGPA: currentSemesterGPA.toFixed(2),
                newCGPA: newCGPA.toFixed(2),
                creditsEarned,
                totalGpaCredits: summary.totalGpaCredits,
                totalGradePoints: summary.totalGradePoints,
                totalEarnedCredits: summary.totalEarnedCredits,
            });

            setAutoDetectedRetakeKeys(new Set(summary.autoDetectedRetakeKeys || []));
            setOverwrittenPastIndices(new Set(summary.overwrittenPastIndices || []));
            setActiveRetakePastIndices(new Set(summary.activeRetakePastIndices || []));

            toast.success('CGPA calculated successfully!', { duration: 3000 });
        } catch (error) {
            console.error("Calculation fetch failed", error);
            alert("Error reaching calculation server");
        }
    };

    // Get current credits and grade points
    const getCurrentCredits = () => {
        if (calculatedCGPA) {
            return calculatedCGPA.totalGpaCredits;
        }

        if (baselineSummary.totalGpaCredits > 0) {
            return baselineSummary.totalGpaCredits;
        }

        return cgpaData.totalCredits;
    };

    const getCurrentGradePoints = () => {
        if (calculatedCGPA) {
            return calculatedCGPA.totalGradePoints;
        }

        if (baselineSummary.totalGpaCredits > 0) {
            return baselineSummary.totalGradePoints;
        }

        if (cgpaData.totalCredits > 0) {
            return cgpaData.degreeCGPA * cgpaData.totalCredits;
        }

        return 0;
    };

    const getCurrentCGPA = () => {
        const credits = getCurrentCredits();
        if (credits > 0) {
            return getCurrentGradePoints() / credits;
        }

        return cgpaData.degreeCGPA;
    };

    // Rounding helpers to mitigate floating-point quirks
    const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    const fmt2 = (n: number) => round2(n).toFixed(2);

    // Feature 1: Calculate required semester average to reach target CGPA
    const calculateRequiredAverage = () => {
        const currentCGPA = getCurrentCGPA();
        const currentCredits = getCurrentCredits();
        const credits = parseFloat(creditsThisSemester);
        const target = parseFloat(targetCGPA);

        // Input validation
        if (!creditsThisSemester.trim() || !targetCGPA.trim()) {
            setRequiredSemesterAverage('');
            return;
        }

        if (isNaN(credits) || credits <= 0) {
            setRequiredSemesterAverage('Invalid credits');
            return;
        }

        if (isNaN(target) || target < 0 || target > 4.0) {
            setRequiredSemesterAverage('Invalid CGPA (0-4.0)');
            return;
        }

        if (currentCredits === 0) {
            setRequiredSemesterAverage('Need current CGPA data');
            return;
        }

        if (target <= currentCGPA) {
            setRequiredSemesterAverage('Target already achieved');
            return;
        }

        const requiredAverage = (target * (currentCredits + credits) - currentCGPA * currentCredits) / credits;

        if (requiredAverage > 4.0) {
            setRequiredSemesterAverage('Impossible (>4.0)');
        } else if (requiredAverage < 0) {
            setRequiredSemesterAverage('Already achievable');
        } else {
            setRequiredSemesterAverage(fmt2(requiredAverage));
        }
    };

    // Feature 2: Calculate future CGPA based on planned average
    const calculateProjectedCGPA = () => {
        const currentCGPA = getCurrentCGPA();
        const currentCredits = getCurrentCredits();
        const average = parseFloat(plannedAverage);
        const credits = parseFloat(plannedCredits);

        // Input validation
        if (!plannedAverage.trim() || !plannedCredits.trim()) {
            setProjectedCGPA('');
            return;
        }

        if (isNaN(average) || average < 0 || average > 4.0) {
            setProjectedCGPA('Invalid GPA (0-4.0)');
            return;
        }

        if (isNaN(credits) || credits <= 0) {
            setProjectedCGPA('Invalid credits');
            return;
        }

        if (currentCredits === 0) {
            setProjectedCGPA('Need current CGPA data');
            return;
        }

        const futureGPA = (currentCGPA * currentCredits + average * credits) / (currentCredits + credits);

        if (futureGPA > 4.0) {
            setProjectedCGPA('Error: >4.0');
        } else {
            setProjectedCGPA(fmt2(futureGPA));
        }
    };

    const calculateCreditsNeeded = () => {
        const currentCGPA = getCurrentCGPA();
        const currentCredits = getCurrentCredits();
        const currentGradePoints = getCurrentGradePoints();
        const target = parseFloat(raiseTargetCGPA);
        const maintain = parseFloat(maintainedAverageCGPA);

        if (!raiseTargetCGPA.trim() || !maintainedAverageCGPA.trim()) {
            setRequiredCreditsToRaise('');
            return;
        }

        if (isNaN(target) || target < 0 || target > 4.0) {
            setRequiredCreditsToRaise('Invalid CGPA (0-4.0)');
            return;
        }

        if (isNaN(maintain) || maintain <= 0 || maintain > 4.0) {
            setRequiredCreditsToRaise('Invalid average (0-4.0)');
            return;
        }

        if (currentCredits === 0) {
            setRequiredCreditsToRaise('Need current CGPA data');
            return;
        }

        if (target <= currentCGPA) {
            setRequiredCreditsToRaise('Target already achieved');
            return;
        }

        const denominator = maintain - target;

        if (denominator <= 0) {
            setRequiredCreditsToRaise('Average must exceed target');
            return;
        }

        const numerator = target * currentCredits - currentGradePoints;

        if (numerator <= 0) {
            setRequiredCreditsToRaise('Target already achieved');
            return;
        }

        const neededCredits = numerator / denominator;

        if (!Number.isFinite(neededCredits) || neededCredits <= 0) {
            setRequiredCreditsToRaise('Impossible with given average');
            return;
        }

        setRequiredCreditsToRaise(fmt2(neededCredits));
    };

    // Recalculate when inputs change to avoid stale state onChange issues
    useEffect(() => {
        // Required semester average recalculation
        if (!creditsThisSemester.trim() && !targetCGPA.trim()) {
            setRequiredSemesterAverage('');
            return;
        }
        calculateRequiredAverage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [creditsThisSemester, targetCGPA, calculatedCGPA, cgpaData.degreeCGPA, cgpaData.totalCredits]);

    useEffect(() => {
        // Projected CGPA recalculation
        if (!plannedAverage.trim() && !plannedCredits.trim()) {
            setProjectedCGPA('');
            return;
        }
        calculateProjectedCGPA();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plannedAverage, plannedCredits, calculatedCGPA, cgpaData.degreeCGPA, cgpaData.totalCredits]);

    useEffect(() => {
        if (!raiseTargetCGPA.trim() && !maintainedAverageCGPA.trim()) {
            setRequiredCreditsToRaise('');
            return;
        }
        calculateCreditsNeeded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [raiseTargetCGPA, maintainedAverageCGPA, calculatedCGPA, cgpaData.degreeCGPA, cgpaData.totalCredits]);

    // Store calculator inputs (placeholder for backend integration)
    const handleCalculatorSave = () => {
        const calculatorData = {
            desiredCGPA: parseFloat(desiredCGPA) || 0,
            remainingCredits: parseFloat(remainingCredits) || 0,
            projectedAverage: parseFloat(projectedAverage) || 0
        };
        console.log('Calculator data to save:', calculatorData);
        // TODO: Send to backend
    };

    // Reset inputs for the active tab
    const resetActiveTab = () => {
        if (activeTab === 'upcoming') {
            // Clear grade selects and calculated results
            setCurrentSemesterGrades({});
            setCalculatedCGPA(null);
        } else if (activeTab === 'calculator') {
            setDesiredCGPA('');
            setRemainingCredits('');
            setProjectedAverage('');
            setCreditsThisSemester('');
            setTargetCGPA('');
            setPlannedAverage('');
            setPlannedCredits('');
            setRequiredSemesterAverage('');
            setProjectedCGPA('');
            setRaiseTargetCGPA('');
            setMaintainedAverageCGPA('');
            setRequiredCreditsToRaise('');
        } else if (activeTab === 'grade-planner') {
            // nothing to clear yet
        }
    };

    // Determine which semester to display
    const displaySemester = selectedSemester === null ?
        (upcomingSemesters.length > 0 ? upcomingSemesters[0] : null) :
        pastSemesters[selectedSemester];

    const isCurrentSemester = selectedSemester === null;

    // Return all the values and functions that the component needs
    return {
        // State values
        isFormView,
        setIsFormView,
        gradeInput,
        setGradeInput,
        cgpaData,
        setCgpaData,
        selectedSemester,
        setSelectedSemester,
        currentSemesterGrades,
        setCurrentSemesterGrades,
        calculatedCGPA,
        setCalculatedCGPA,
        desiredCGPA,
        setDesiredCGPA,
        remainingCredits,
        setRemainingCredits,
        projectedAverage,
        setProjectedAverage,
        creditsThisSemester,
        setCreditsThisSemester,
        targetCGPA,
        setTargetCGPA,
        plannedAverage,
        setPlannedAverage,
        plannedCredits,
        setPlannedCredits,
        raiseTargetCGPA,
        setRaiseTargetCGPA,
        maintainedAverageCGPA,
        setMaintainedAverageCGPA,
        requiredSemesterAverage,
        setRequiredSemesterAverage,
        projectedCGPA,
        setProjectedCGPA,
        requiredCreditsToRaise,
        setRequiredCreditsToRaise,
        activeTab,
        setActiveTab,

        // Constants and options
        gradePointsMap,
        gradeOptions,

        // Computed values
        semesterPartitions,
        rawPastSemesters,
        upcomingSemesters,
        pastSemesters,
        currentUpcomingSemester,
        baselineSummary,
        autoDetectedRetakeKeys,
        userDefinedRetakes,
        setUserDefinedRetakes,
        ignoredRetakeKeys,
        setIgnoredRetakeKeys,
        detachedPastIndices,
        setDetachedPastIndices,
        overwrittenPastIndices,
        activeRetakePastIndices,
        userDefinedPastRetakes,
        setUserDefinedPastRetakes,
        displaySemester,
        isCurrentSemester,

        // Functions
        getCourseKey,
        handleCalculate,
        handleGradeChange,
        calculateNewCGPA,
        getCurrentCredits,
        getCurrentCGPA,
        resetActiveTab,
    };
};