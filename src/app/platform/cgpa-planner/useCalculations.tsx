import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { gradePointsMap, gradeOptions } from "./data";
import { ParsedCGPAData, ParsedSemester, ParsedCourse, GradeKey, AttemptSource, CourseAttempt } from "./types";
import { saveCGPAData } from "./_components/semester-navigation";

type CGPAUpdateResult = { success: boolean; error?: string };

const cloneCgpaData = (data: ParsedCGPAData): ParsedCGPAData =>
    JSON.parse(JSON.stringify(data));

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

    // Simplified GPA calculator states
    const [desiredCGPA, setDesiredCGPA] = useState<string>('');
    const [remainingCredits, setRemainingCredits] = useState<string>('');
    const [projectedAverage, setProjectedAverage] = useState<string>('');
    const [pfCredits, setPfCredits] = useState<string>('');

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

    const getCourseKey = (course: ParsedCourse) => {
        const rawCode = course.code?.trim();
        if (rawCode && rawCode !== '--') {
            return rawCode.toUpperCase();
        }

        const rawTitle = course.title?.trim();
        if (rawTitle && rawTitle !== '--') {
            return rawTitle.toUpperCase();
        }

        return null;
    };

    const normalizeGrade = (grade: string | null | undefined): GradeKey | null => {
        if (!grade) return null;
        const trimmed = grade.trim();
        if (!trimmed || trimmed === '--' || trimmed === 'Select') return null;
        if (Object.prototype.hasOwnProperty.call(gradePointsMap, trimmed)) {
            return trimmed as GradeKey;
        }
        return null;
    };

    const createAttempt = ({
        key,
        grade,
        creditsRegistered,
        creditsEarned,
        gradePointsValue,
        source,
    }: {
        key: string;
        grade: GradeKey | null;
        creditsRegistered: number | null | undefined;
        creditsEarned: number | null | undefined;
        gradePointsValue?: number | null;
        source: AttemptSource;
    }): CourseAttempt | null => {
        if (!grade) return null;

        const registered = typeof creditsRegistered === 'number' && !Number.isNaN(creditsRegistered) ? creditsRegistered : 0;
        const earned = typeof creditsEarned === 'number' && !Number.isNaN(creditsEarned) ? creditsEarned : 0;
        let effectiveCredits = registered > 0 ? registered : earned;
        let gradePoints = 0;
        let gpaCredits = 0;
        let earnedCredits = 0;
        let ratio: number | null = null;

        if (grade === 'AU') {
            return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source };
        }

        if (grade === 'P') {
            earnedCredits = effectiveCredits;
            return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source };
        }

        if (grade === 'F (w P/F)') {
            earnedCredits = effectiveCredits;
            return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source };
        }

        if (grade === 'TP (w credits)') {
            earnedCredits = Math.max(earned, Math.max(effectiveCredits, 2));
            return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source };
        }

        if (grade === 'TP (w/o credits)') {
            return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source };
        }

        effectiveCredits = effectiveCredits > 0 ? effectiveCredits : earned;
        if (effectiveCredits <= 0) {
            return null;
        }

        const mapped = gradePointsMap[grade as keyof typeof gradePointsMap];
        if (typeof mapped === 'number') {
            gpaCredits = effectiveCredits;
            gradePoints = mapped * gpaCredits;
        } else if (typeof gradePointsValue === 'number') {
            gpaCredits = effectiveCredits;
            gradePoints = gradePointsValue;
        }

        earnedCredits = Math.max(earned, effectiveCredits);
        ratio = gpaCredits > 0 ? gradePoints / gpaCredits : null;

        return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source };
    };

    const chooseBetterAttempt = (currentBest: CourseAttempt, candidate: CourseAttempt): CourseAttempt => {
        const bestRatio = currentBest.ratio;
        const candidateRatio = candidate.ratio;

        if (candidateRatio !== null && bestRatio !== null) {
            if (candidateRatio !== bestRatio) {
                return candidateRatio > bestRatio ? candidate : currentBest;
            }

            if (candidate.gradePoints !== currentBest.gradePoints) {
                return candidate.gradePoints > currentBest.gradePoints ? candidate : currentBest;
            }

            return candidate.gpaCredits < currentBest.gpaCredits ? candidate : currentBest;
        }

        if (candidateRatio !== null && bestRatio === null) {
            if (candidateRatio <= 0) {
                return currentBest;
            }
            return candidate;
        }

        if (candidateRatio === null && bestRatio !== null) {
            if (bestRatio <= 0) {
                return candidate;
            }
            return currentBest;
        }

        if (candidate.earnedCredits !== currentBest.earnedCredits) {
            return candidate.earnedCredits > currentBest.earnedCredits ? candidate : currentBest;
        }

        return currentBest;
    };

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

    const syncCgpaData = useCallback(async (
        nextData: ParsedCGPAData,
        previousData: ParsedCGPAData,
        successMessage?: string
    ): Promise<CGPAUpdateResult> => {
        try {
            const response = await saveCGPAData(nextData);
            if (!response.success) {
                throw new Error(response.error || "Failed to sync CGPA data");
            }

            if (successMessage) {
                toast.success(successMessage);
            }

            return { success: true };
        } catch (error) {
            console.error("Error syncing CGPA data:", error);
            toast.error("Changes saved locally, but couldn't sync to server.");
            return { success: false, error: (error as Error).message };
        }
    }, []);

    const addCourseToSemester = useCallback(async (
        semesterName: string,
        newCourse: ParsedCourse
    ): Promise<CGPAUpdateResult> => {
        if (!semesterName) {
            toast.error("Select a semester before adding a course.");
            return { success: false, error: "Missing semester" };
        }

        const nextData = cloneCgpaData(cgpaData);
        const targetSemester = nextData.semesters.find((semester) => semester.semester === semesterName);
        if (!targetSemester) {
            toast.error(`Semester "${semesterName}" was not found.`);
            return { success: false, error: "Semester not found" };
        }

        targetSemester.courses.push(newCourse);
        setCgpaData(nextData);

        return await syncCgpaData(nextData, cgpaData, "Course added to semester");
    }, [cgpaData, setCgpaData, syncCgpaData]);

    const removeCourseFromSemester = useCallback(async (
        semesterName: string,
        courseIndex: number
    ): Promise<CGPAUpdateResult> => {
        if (!semesterName) {
            toast.error("Unable to determine which semester this course belongs to.");
            return { success: false, error: "Missing semester" };
        }

        const nextData = cloneCgpaData(cgpaData);
        const targetSemester = nextData.semesters.find((semester) => semester.semester === semesterName);
        if (!targetSemester) {
            toast.error(`Semester "${semesterName}" was not found.`);
            return { success: false, error: "Semester not found" };
        }

        if (courseIndex < 0 || courseIndex >= targetSemester.courses.length) {
            toast.error("Course could not be located. Try refreshing the page.");
            return { success: false, error: "Invalid course index" };
        }

        targetSemester.courses.splice(courseIndex, 1);
        setCgpaData(nextData);

        const affectsCurrentSemester =
            currentUpcomingSemester &&
            currentUpcomingSemester.semester === semesterName &&
            selectedSemester === null;

        if (affectsCurrentSemester) {
            setCurrentSemesterGrades((prev) => {
                if (!Object.keys(prev).length) {
                    return prev;
                }
                const next: Record<number, string> = {};
                Object.entries(prev).forEach(([key, value]) => {
                    const idx = Number(key);
                    if (Number.isNaN(idx)) return;
                    if (idx < courseIndex) {
                        next[idx] = value;
                    } else if (idx > courseIndex) {
                        next[idx - 1] = value;
                    }
                });
                return next;
            });
        }

        return await syncCgpaData(nextData, cgpaData, "Course removed");
    }, [cgpaData, currentUpcomingSemester, currentSemesterGrades, selectedSemester, setCgpaData, setCurrentSemesterGrades, syncCgpaData]);

    const computeBestCourseSummary = (includeCurrent: boolean) => {
        const attempts = new Map<string, CourseAttempt[]>();

        const pushAttempt = (key: string, attempt: CourseAttempt | null) => {
            if (!attempt) return;
            if (!attempts.has(key)) {
                attempts.set(key, [attempt]);
            } else {
                attempts.get(key)!.push(attempt);
            }
        };

        rawPastSemesters.forEach((semester) => {
            semester.courses.forEach((course) => {
                const key = getCourseKey(course);
                if (!key) return;
                const normalizedGrade = normalizeGrade(course.grade);
                if (!normalizedGrade) return;
                const attempt = createAttempt({
                    key,
                    grade: normalizedGrade,
                    creditsRegistered: course.creditsRegistered,
                    creditsEarned: course.creditsEarned,
                    gradePointsValue: course.gradePoints,
                    source: 'past',
                });
                pushAttempt(key, attempt);
            });
        });

        if (includeCurrent && currentUpcomingSemester) {
            currentUpcomingSemester.courses.forEach((course, index) => {
                const key = getCourseKey(course);
                if (!key) return;
                const selectedGrade = normalizeGrade(currentSemesterGrades[index]);
                if (!selectedGrade) return;
                const attempt = createAttempt({
                    key,
                    grade: selectedGrade,
                    creditsRegistered: course.creditsRegistered,
                    creditsEarned: null,
                    source: 'current',
                });
                pushAttempt(key, attempt);
            });
        }

        let totalGradePoints = 0;
        let totalGpaCredits = 0;
        let totalEarnedCredits = 0;
        const retakeKeys = new Set<string>();

        attempts.forEach((courseAttempts, key) => {
            if (courseAttempts.length > 1) {
                retakeKeys.add(key);
            }

            const bestAttempt = courseAttempts.reduce<CourseAttempt | null>((best, candidate) => {
                if (!candidate) return best;
                if (!best) return candidate;
                return chooseBetterAttempt(best, candidate);
            }, null);

            if (!bestAttempt) return;

            totalGradePoints += bestAttempt.gradePoints;
            totalGpaCredits += bestAttempt.gpaCredits;
            totalEarnedCredits += bestAttempt.earnedCredits;
        });

        return {
            totalGradePoints,
            totalGpaCredits,
            totalEarnedCredits,
            retakeKeys,
        };
    };

    const baselineSummary = computeBestCourseSummary(false);

    const autoDetectedRetakeKeys = useMemo(() => {
        const seen = new Set<string>();
        const retakes = new Set<string>();

        rawPastSemesters.forEach((semester) => {
            semester.courses.forEach((course) => {
                const key = getCourseKey(course);
                if (key) {
                    seen.add(key);
                }
            });
        });

        if (currentUpcomingSemester) {
            currentUpcomingSemester.courses.forEach((course) => {
                const key = getCourseKey(course);
                if (key && seen.has(key)) {
                    retakes.add(key);
                }
            });
        }

        return retakes;
    }, [rawPastSemesters, currentUpcomingSemester]);

    const parseGradeData = (text: string): ParsedCGPAData => {
        const lines = text.split('\n').map((line) => line.trim());
        const data: ParsedCGPAData = {
            degreeCGPA: 0,
            majorCGPA: 0,
            totalCredits: 0,
            semesters: []
        };

        let currentSemester: ParsedSemester | null = null;
        let courseSection = false;

        for (const line of lines) {
            if (line.includes('Degree/Diploma CGPA')) {
                const parts = line.match(/Degree\/Diploma CGPA: (\d+\.\d+).*CGPA for Major: (\d+\.\d+).*Total counted credits: (\d+)/);
                if (parts) {
                    data.degreeCGPA = parseFloat(parts[1]);
                    data.majorCGPA = parseFloat(parts[2]);
                    data.totalCredits = parseInt(parts[3], 10);
                }
            } else if (line.startsWith('Monsoon') || line.startsWith('Spring') || line.startsWith('Summer')) {
                if (currentSemester) {
                    data.semesters.push(currentSemester);
                }
                currentSemester = {
                    semester: line,
                    courses: [],
                    gpa: 0,
                    semesterCreditsEarned: 0,
                    cgpa: 0
                };
                courseSection = true;
            } else if (line.includes('GPA') && line.includes('Semester Credits Earned') && line.includes('CGPA')) {
                const gpaMatch = line.match(/GPA:\s*(\d+\.\d+)/);
                const creditsMatch = line.match(/Semester Credits Earned:\s*(\d+)/);
                const cgpaMatch = line.match(/CGPA:\s*(\d+\.\d+)/);

                if (currentSemester) {
                    if (gpaMatch) currentSemester.gpa = parseFloat(gpaMatch[1]);
                    if (creditsMatch) currentSemester.semesterCreditsEarned = parseInt(creditsMatch[1], 10);
                    if (cgpaMatch) currentSemester.cgpa = parseFloat(cgpaMatch[1]);
                }
            } else if (courseSection && line.match(/^\d+/) && !line.includes('systems.support')) {
                const [_, code, title, creditsRegistered, grade, creditsEarned, gradePoints] = line.split(/\t+/);
                if (currentSemester) {
                    currentSemester.courses.push({
                        code,
                        title,
                        creditsRegistered: parseFloat(creditsRegistered) || null,
                        grade: grade !== '--' ? grade : null,
                        creditsEarned: parseFloat(creditsEarned) || null,
                        gradePoints: parseFloat(gradePoints) || null,
                    });
                }
            }
        }

        if (currentSemester) {
            data.semesters.push(currentSemester);
        }

        return data;
    };

    const handleCalculate = async () => {
        if (!gradeInput.trim()) {
            toast.error('Please paste your grade data first.');
            return;
        }

        const parsedData = parseGradeData(gradeInput);
        setCgpaData(parsedData);
        setIsFormView(false);

        // Post to Strapi - fail silently if it doesn't work
        try {
            const result = await saveCGPAData(parsedData);
            if (!result.success) {
                console.warn('Could not sync CGPA data to server:', result.error);
                // App continues to work locally even if sync fails
            }
        } catch (error) {
            console.warn('Could not sync CGPA data to server:', error);
            // App continues to work locally even if sync fails
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

        let totalGradePoints = 0;
        let totalCredits = 0;
        let creditsEarned = 0;
        let hasAllGrades = true;

        currentUpcomingSemester.courses.forEach((course, index) => {
            const selectedGrade = currentSemesterGrades[index] as GradeKey;
            if (course.code && (!selectedGrade || selectedGrade === 'Select')) {
                hasAllGrades = false;
                return;
            }

            if (!selectedGrade || selectedGrade === 'Select') {
                return;
            }

            const credits = course.creditsRegistered || 0;

            if (selectedGrade === 'AU') {
                return;
            }

            if (selectedGrade === 'F (w P/F)') {
                creditsEarned += credits;
                return;
            }

            if (selectedGrade === 'P') {
                creditsEarned += credits;
                return;
            }

            if (selectedGrade === 'TP (w credits)') {
                creditsEarned += 2;
                return;
            }

            if (selectedGrade === 'TP (w/o credits)') {
                return;
            }

            const gradePoints = gradePointsMap[selectedGrade as keyof typeof gradePointsMap] ?? 0;
            totalGradePoints += gradePoints * credits;
            totalCredits += credits;
            creditsEarned += credits;
        });

        if (!hasAllGrades) {
            alert('Please select grades for all courses before calculating.');
            return;
        }

        const currentSemesterGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
        const summary = computeBestCourseSummary(true);
        const newCGPA = summary.totalGpaCredits > 0 ? summary.totalGradePoints / summary.totalGpaCredits : 0;

        setCalculatedCGPA({
            semesterGPA: currentSemesterGPA.toFixed(2),
            newCGPA: newCGPA.toFixed(2),
            creditsEarned,
            totalGpaCredits: summary.totalGpaCredits,
            totalGradePoints: summary.totalGradePoints,
            totalEarnedCredits: summary.totalEarnedCredits,
        });
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
        pfCredits,
        setPfCredits,
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
        displaySemester,
        isCurrentSemester,

        // Functions
        getCourseKey,
        normalizeGrade,
        createAttempt,
        chooseBetterAttempt,
        computeBestCourseSummary,
        parseGradeData,
        handleCalculate,
        handleGradeChange,
        calculateNewCGPA,
        getCurrentCredits,
        getCurrentGradePoints,
        getCurrentCGPA,
        round2,
        fmt2,
        calculateRequiredAverage,
        calculateProjectedCGPA,
        calculateCreditsNeeded,
        handleCalculatorSave,
        resetActiveTab,
        addCourseToSemester,
        removeCourseFromSemester,
    };
};