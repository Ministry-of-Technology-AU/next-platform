"use client";
import { useState } from "react";
import GradePlanner from "./_components/grade-planner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, BookOpen, Upload, Target, TrendingUp, ArrowUpCircle, PlusCircle, Trash2, AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from "@/components/ui/shadcn-io/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCalculations } from "./useCalculations";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GradeKey } from "./types";
import CGPAForm from "./_components/cgpa-form";
import CGPAOverview from "./_components/cgpa-overview";
import SemesterNavigation from "./_components/semester-navigation";
import { toast } from "sonner";

export default function CGPAPlanner({ data }: { data: any }) {
    const calculations = useCalculations(data);
    const {
        isFormView,
        setIsFormView,
        gradeInput,
        setGradeInput,
        selectedSemester,
        setSelectedSemester,
        currentSemesterGrades,
        calculatedCGPA,
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
        projectedCGPA,
        requiredCreditsToRaise,
        activeTab,
        setActiveTab,

        // Constants and options
        gradeOptions,
        gradePointsMap,

        // Computed values
        upcomingSemesters,
        pastSemesters,
        autoDetectedRetakeKeys,
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
        addCourseToSemester,
        removeCourseFromSemester,
    } = calculations;

    const createCourseFormState = () => ({
        code: "",
        title: "",
        creditsRegistered: "",
        creditsEarned: "",
        grade: "Select" as GradeKey,
    });

    const [courseForm, setCourseForm] = useState(createCourseFormState);
    const [courseFormError, setCourseFormError] = useState<string | null>(null);
    const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
    const [isSavingCourse, setIsSavingCourse] = useState(false);
    const [pendingDeletionKey, setPendingDeletionKey] = useState<string | null>(null);

    const activeSemesterName = displaySemester?.semester ?? "";

    const resetCourseForm = () => {
        setCourseForm(createCourseFormState());
        setCourseFormError(null);
    };

    const handleCourseDialogChange = (open: boolean) => {
        setIsAddCourseDialogOpen(open);
        if (!open) {
            resetCourseForm();
            setIsSavingCourse(false);
        }
    };

    const parseNumericInput = (value: string) => {
        if (!value.trim()) return null;
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const handleAddCourseSubmit = async () => {
        if (!displaySemester) {
            toast.error("Select a semester before adding courses.");
            return;
        }

        const code = courseForm.code.trim();
        const title = courseForm.title.trim();
        if (!code || !title) {
            setCourseFormError("Course code and title are required.");
            return;
        }

        const creditsRegistered = parseNumericInput(courseForm.creditsRegistered);
        if (creditsRegistered === null || creditsRegistered <= 0) {
            setCourseFormError("Enter a valid number of registered credits.");
            return;
        }

        const creditsEarnedInput = parseNumericInput(courseForm.creditsEarned);
        if (creditsEarnedInput !== null && creditsEarnedInput < 0) {
            setCourseFormError("Credits earned cannot be negative.");
            return;
        }

        const normalizedGrade = courseForm.grade === "Select" ? null : courseForm.grade;
        const computeCreditsEarned = () => {
            if (!normalizedGrade) {
                return creditsEarnedInput;
            }

            if (normalizedGrade === 'TP (w credits)') {
                const base = creditsEarnedInput ?? creditsRegistered;
                return base ? Math.max(base, 2) : 2;
            }

            if (normalizedGrade === 'TP (w/o credits)' || normalizedGrade === 'AU') {
                return 0;
            }

            if (normalizedGrade === 'P' || normalizedGrade === 'F (w P/F)') {
                return creditsEarnedInput ?? creditsRegistered;
            }

            return creditsEarnedInput ?? creditsRegistered;
        };

        const creditsEarned = computeCreditsEarned();
        const gradePointValue = normalizedGrade
            ? gradePointsMap[normalizedGrade as keyof typeof gradePointsMap]
            : undefined;
        const gradePoints =
            normalizedGrade && typeof gradePointValue === "number"
                ? Number((gradePointValue * creditsRegistered).toFixed(2))
                : null;

        const newCourse = {
            code,
            title,
            creditsRegistered,
            grade: normalizedGrade,
            creditsEarned: creditsEarned ?? null,
            gradePoints,
        };

        try {
            setIsSavingCourse(true);
            setCourseFormError(null);
            const result = await addCourseToSemester(displaySemester.semester, newCourse);
            if (!result.success) {
                setCourseFormError(result.error || "Unable to add course.");
                return;
            }
            handleCourseDialogChange(false);
        } finally {
            setIsSavingCourse(false);
        }
    };

    const handleRemoveCourseRow = async (semesterName: string, courseIndex: number) => {
        if (!semesterName) {
            toast.error("Unable to identify the semester for this course.");
            return;
        }

        const key = `${semesterName}-${courseIndex}`;
        setPendingDeletionKey(key);
        try {
            const result = await removeCourseFromSemester(semesterName, courseIndex);
            if (!result.success) {
                toast.error(result.error || "Unable to remove course.");
            }
        } finally {
            setPendingDeletionKey(null);
        }
    };

    const columnTemplate = isCurrentSemester
        ? "40px 100px 1fr 120px 100px 90px"
        : "40px 100px 1fr 120px 100px 100px 100px 90px";

    const visibleCourses = displaySemester
        ? displaySemester.courses
              .map((course, idx) => ({ ...course, __idx: idx }))
              .filter((c) => c && (c.code || c.title || c.creditsRegistered || c.grade))
        : [];
    // If data exists, skip the form and show results
    if (!isFormView && data && data.semesters && data.semesters.length > 0) {
        // ...existing code for results view...
        // (leave the rest of the file unchanged)
    }
    // Otherwise, show the form
    if (isFormView) {
        return (
            <div className="max-w-8xl mx-auto p-2 xs:p-3 sm:p-4">
                <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    {/* Form Card */}
                    <CGPAForm 
                        gradeInput={gradeInput}
                        setGradeInput={setGradeInput}
                        pfCredits={pfCredits}
                        setPfCredits={setPfCredits}
                        handleCalculate={handleCalculate}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-2 xs:p-3 sm:p-4 pb-4 xs:pb-6 sm:pb-8">
            <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                {/* CGPA Overview Card */}
                <CGPAOverview
                    calculatedCGPA={calculatedCGPA}
                    getCurrentCGPA={getCurrentCGPA}
                    getCurrentCredits={getCurrentCredits}
                />

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upcoming' | 'grade-planner' | 'calculator')} className="w-full">
                    {/* Added mb-4 to add space between the tabs list and content */}
                    <TabsList className="grid w-full grid-cols-3 mb-4 h-auto sm:h-12 gap-0.5 xs:gap-1 rounded-lg border border-primary/30 p-1">
                        <TabsTrigger
                            className="px-1.5 xs:px-2 sm:px-3 md:px-4 py-2 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-medium transition-colors
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary/70 dark:data-[state=inactive]:text-gray-300
                 hover:bg-primary/20 flex flex-col xs:flex-row items-center justify-center gap-0.5 xs:gap-1 sm:gap-2 min-h-[44px]"
                            value="upcoming"
                        >
                            <BookOpen className="h-3 w-3 xs:h-4 xs:w-4 shrink-0" />
                            <span className="leading-tight text-center">Upcoming Semester</span>
                        </TabsTrigger>

                        <TabsTrigger
                            className="px-1.5 xs:px-2 sm:px-3 md:px-4 py-2 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-medium transition-colors
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary/70 dark:data-[state=inactive]:text-gray-300
                 hover:bg-primary/20 flex flex-col xs:flex-row items-center justify-center gap-0.5 xs:gap-1 sm:gap-2 min-h-[44px]"
                            value="grade-planner"
                        >
                            <Upload className="h-3 w-3 xs:h-4 xs:w-4 shrink-0" />
                            <span className="leading-tight text-center">Grade Planner</span>
                        </TabsTrigger>

                        <TabsTrigger
                            className="px-1.5 xs:px-2 sm:px-3 md:px-4 py-2 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-medium transition-colors
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary/70 dark:data-[state=inactive]:text-gray-300
                 hover:bg-primary/20 flex flex-col xs:flex-row items-center justify-center gap-0.5 xs:gap-1 sm:gap-2 min-h-[44px]"
                            value="calculator"
                        >
                            <Target className="h-3 w-3 xs:h-4 xs:w-4 shrink-0" />
                            <span className="leading-tight text-center">Raise GPA Calculator</span>
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === 'upcoming' && (
                        <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            <AlertDescription>
                                For retaken courses and transfer students, please make sure that old attempts for retaken courses are removed. Ensuring that unnecessary course data is not saved is essential for the most accurate CGPA calculation.
                            </AlertDescription>
                        </Alert>
                    )}

                    <TabsContents>
                    {/* Upcoming Semester Tab */}
                    <TabsContent value="upcoming" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Left Column - Semester Navigation */}
                            <div className="lg:order-1">
                            <SemesterNavigation
                                resetActiveTab={resetActiveTab}
                                setIsFormView={setIsFormView}
                                pfCredits={pfCredits}
                                setPfCredits={setPfCredits}
                                upcomingSemesters={upcomingSemesters}
                                pastSemesters={pastSemesters}
                                selectedSemester={selectedSemester}
                                setSelectedSemester={setSelectedSemester}
                            />
                            </div>

                            {/* Right Column - Main Table */}
                            <div className="lg:col-span-3 lg:order-2">
                                {displaySemester ? (
                                    <Card>
                                        <CardContent className="p-0">
                                            <div className="border border-border rounded-lg overflow-hidden">
                                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-muted/20 border-b border-border">
                                                    <p className="text-sm font-semibold text-foreground">Course entries</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => {
                                                            setCourseFormError(null);
                                                            setIsAddCourseDialogOpen(true);
                                                        }}
                                                    >
                                                        <PlusCircle className="h-4 w-4" />
                                                        Add Course
                                                    </Button>
                                                </div>
                                                <div className="w-full overflow-x-auto">
                                                    <div className="min-w-[640px] md:min-w-[820px]">
                                                        {/* Header */}
                                                        <div className="grid border-b border-border" style={{ gridTemplateColumns: columnTemplate }}>
                                                            <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                #
                                                            </div>
                                                            <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                Code
                                                            </div>
                                                            <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                Title
                                                            </div>
                                                            <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                <span className="hidden sm:inline">Credits Registered</span>
                                                                <span className="sm:hidden">Credits</span>
                                                            </div>
                                                            <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                Grade
                                                            </div>
                                                            {!isCurrentSemester && (
                                                                <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                    <span className="hidden sm:inline">Credits Earned</span>
                                                                    <span className="sm:hidden">Earned</span>
                                                                </div>
                                                            )}
                                                            {!isCurrentSemester && (
                                                                <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                    <span className="hidden sm:inline">Grade Points</span>
                                                                    <span className="sm:hidden">Points</span>
                                                                </div>
                                                            )}
                                                            <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground text-xs md:text-sm">
                                                                Actions
                                                            </div>
                                                        </div>

                                                        {/* Semester Title Row */}
                                                        <div className="grid border-b border-border" style={{ gridTemplateColumns: columnTemplate }}>
                                                            <div className="col-span-full p-2 md:p-4 bg-blue-dark text-white font-semibold text-center text-xs md:text-sm">
                                                                {displaySemester.semester}
                                                            </div>
                                                        </div>

                                                        {/* Course Rows */}
                                                        {visibleCourses.map((course, courseIndex) => {
                                                            const courseKey = getCourseKey(course);
                                                            const isRetakeRow = isCurrentSemester && courseKey ? autoDetectedRetakeKeys.has(courseKey) : false;
                                                            const isLastRow = courseIndex === visibleCourses.length - 1;
                                                            const rowKey = `${displaySemester.semester}-${course.__idx}`;
                                                            const isDeleting = pendingDeletionKey === rowKey;
                                                            return (
                                                                    <div
                                                                        key={course.__idx}
                                                                        className={`grid ${!isLastRow ? 'border-b border-border' : ''} hover:bg-blue-50/50 transition-colors`}
                                                                        style={{ gridTemplateColumns: columnTemplate }}
                                                                    >
                                                                        <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm text-muted-foreground">
                                                                            {courseIndex + 1}
                                                                        </div>
                                                                        <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm font-medium text-blue-700">
                                                                            {course.code}
                                                                        </div>
                                                                        <div className="p-2 md:p-3 border-r border-border text-xs md:text-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="line-clamp-2 font-medium">{course.title}</span>
                                                                                {isRetakeRow && (
                                                                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 whitespace-nowrap">
                                                                                        Retake
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm">
                                                                            {isCurrentSemester && currentSemesterGrades[course.__idx] === 'TP (w credits)'
                                                                                ? 2
                                                                                : isCurrentSemester && currentSemesterGrades[course.__idx] === 'TP (w/o credits)'
                                                                                ? 0
                                                                                : course.creditsRegistered}
                                                                        </div>
                                                                        <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm">
                                                                            {isCurrentSemester ? (
                                                                                <Select
                                                                                    value={currentSemesterGrades[course.__idx] || "Select"}
                                                                                    onValueChange={(value) => handleGradeChange(course.__idx, value as GradeKey)}
                                                                                >
                                                                                    <SelectTrigger className="border-0 bg-transparent h-auto p-0 text-xs md:text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full max-w-[90px] mx-auto">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {gradeOptions.map((grade) => (
                                                                                            <SelectItem key={grade.value} value={grade.value}>
                                                                                                {grade.label}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            ) : (
                                                                                course.grade || 'N/A'
                                                                            )}
                                                                        </div>
                                                                        {!isCurrentSemester && (
                                                                            <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm">
                                                                                {course.creditsEarned || 'N/A'}
                                                                            </div>
                                                                        )}
                                                                        {!isCurrentSemester && (
                                                                            <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm">
                                                                                {course.gradePoints || 'N/A'}
                                                                            </div>
                                                                        )}
                                                                        <div className="p-2 md:p-3 flex items-start justify-center">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-destructive hover:text-destructive h-8 w-8 p-0 -mt-1"
                                                                                aria-label="Delete course"
                                                                                onClick={() => handleRemoveCourseRow(displaySemester.semester, course.__idx)}
                                                                                disabled={isDeleting}
                                                                            >
                                                                                <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-spin' : ''}`} />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Calculate button and results section */}
                                            {isCurrentSemester && (
                                                <div className="p-4 pt-6 mt-0">
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                                                {/* Metrics container (auto width) */}
                                                                <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-primary/20 rounded-lg px-4 py-3 inline-flex items-center gap-6">
                                                                    <div>
                                                                        <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Sem GPA</div>
                                                                        <div className="text-xl font-bold text-primary dark:text-slate-200 tabular-nums">{calculatedCGPA ? calculatedCGPA.semesterGPA : '--'}</div>
                                                                    </div>
                                                                    <div className="w-px h-8 bg-primary/10 dark:bg-slate-600"></div>
                                                                    <div>
                                                                        <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">New CGPA</div>
                                                                        <div className="text-xl font-bold text-primary dark:text-slate-200 tabular-nums">{calculatedCGPA ? calculatedCGPA.newCGPA : '--'}</div>
                                                                    </div>
                                                                    <div className="w-px h-8 bg-primary/10 dark:bg-slate-600"></div>
                                                                    <div>
                                                                        <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Credits</div>
                                                                        <div className="text-xl font-bold text-primary dark:text-slate-200 tabular-nums">{calculatedCGPA ? calculatedCGPA.creditsEarned : '--'}</div>
                                                                    </div>
                                                                </div>
                                                                {/* Button aligned far right with padding from card border */}
                                                                <div className="flex-1 flex justify-end pr-2">
                                                                    <Button
                                                                        onClick={calculateNewCGPA}
                                                                        className="bg-primary text-white hover:bg-primary/90"
                                                                    >
                                                                        <Calculator className="h-4 w-4 mr-2" />
                                                                        Calculate GPA
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Alert>
                                        <AlertDescription>
                                            No semester data found.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </TabsContent>


                    {/* Grade Planner Tab */}
                    <TabsContent value="grade-planner" className="space-y-6">
                        <GradePlanner />
                    </TabsContent>

                    {/* GPA Calculator Tab */}
                    <TabsContent value="calculator" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                            {/* Feature 1: Calculate Required Semester Average */}
                            <Card className="flex flex-col h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-start gap-2 text-left min-h-[56px] text-gray-900 dark:text-gray-100">
                                        <Target className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        <span className="text-left">Calculate Required GPA This Semester</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 flex-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="creditsThisSemester">Credits this semester</Label>
                                        <Input
                                            id="creditsThisSemester"
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={creditsThisSemester}
                                            onChange={(e) => setCreditsThisSemester(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            placeholder="e.g., 16"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="targetCGPA">Target CGPA</Label>
                                        <Input
                                            id="targetCGPA"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={targetCGPA}
                                            onChange={(e) => setTargetCGPA(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            placeholder="e.g., 3.5"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-start">
                                        <span>Current CGPA: {getCurrentCGPA().toFixed(2)}</span>
                                        <span>Current Credits: {getCurrentCredits()}</span>
                                    </div>
                                    <div className="mt-auto rounded-lg border bg-green-50 p-4">
                                        <Label className="text-sm font-medium text-gray-900">Required GPA this semester:</Label>
                                        <div className="text-2xl font-bold text-green-700 mt-1">
                                            {requiredSemesterAverage
                                                ? (/^\d+(?:\.\d+)?$/.test(requiredSemesterAverage)
                                                    ? `~ ${requiredSemesterAverage}`
                                                    : requiredSemesterAverage)
                                                : '--'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Feature 2: Calculate Future CGPA */}
                            <Card className="flex flex-col h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-start gap-2 text-left min-h-[56px] text-gray-900 dark:text-gray-100">
                                        <TrendingUp className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        <span className="text-left">Calculate Future CGPA</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 flex-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="plannedAverage">Planned average for next credits</Label>
                                        <Input
                                            id="plannedAverage"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={plannedAverage}
                                            onChange={(e) => setPlannedAverage(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            placeholder="e.g., 3.7"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="plannedCredits">Number of credits</Label>
                                        <Input
                                            id="plannedCredits"
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={plannedCredits}
                                            onChange={(e) => setPlannedCredits(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            placeholder="e.g., 16"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-start">
                                        <span>Current CGPA: {getCurrentCGPA().toFixed(2)}</span>
                                        <span>Current Credits: {getCurrentCredits()}</span>
                                    </div>
                                    <div className="mt-auto rounded-lg border bg-blue-50 p-4">
                                        <Label className="text-sm font-medium text-gray-900">Your CGPA would be:</Label>
                                        <div className="text-2xl font-bold text-blue-700 mt-1">
                                            {projectedCGPA
                                                ? (/^\d+(?:\.\d+)?$/.test(projectedCGPA)
                                                    ? `~ ${projectedCGPA}`
                                                    : projectedCGPA)
                                                : '--'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Feature 3: Credits Needed to Reach Target CGPA */}
                            <Card className="flex flex-col h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-start gap-2 text-left min-h-[56px] text-gray-900 dark:text-gray-100">
                                        <ArrowUpCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        <span className="text-left">Credits Needed to Reach Target CGPA</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 flex-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="raiseTargetCGPA">Target CGPA</Label>
                                        <Input
                                            id="raiseTargetCGPA"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={raiseTargetCGPA}
                                            onChange={(e) => setRaiseTargetCGPA(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            placeholder="e.g., 3.7"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maintainedAverageCGPA">Average you&apos;ll maintain</Label>
                                        <Input
                                            id="maintainedAverageCGPA"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={maintainedAverageCGPA}
                                            onChange={(e) => setMaintainedAverageCGPA(e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                            placeholder="e.g., 3.8"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-start">
                                        <span>Current CGPA: {getCurrentCGPA().toFixed(2)}</span>
                                        <span>Current Credits: {getCurrentCredits()}</span>
                                    </div>
                                    <div className="mt-auto rounded-lg border bg-amber-50 p-4">
                                        <Label className="text-sm font-medium text-gray-900">Credits required:</Label>
                                        <div className="text-2xl font-bold text-amber-700 mt-1">
                                            {requiredCreditsToRaise
                                                ? (/^\d+(?:\.\d+)?$/.test(requiredCreditsToRaise)
                                                    ? `~ ${requiredCreditsToRaise}`
                                                    : requiredCreditsToRaise)
                                                : '--'}
                                        </div>
                                        {requiredCreditsToRaise && /^\d+(?:\.\d+)?$/.test(requiredCreditsToRaise) && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                Round up to {Math.ceil(parseFloat(requiredCreditsToRaise))} credits
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    </TabsContents>
                </Tabs>

                <Dialog open={isAddCourseDialogOpen} onOpenChange={handleCourseDialogChange}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Add course
                            </DialogTitle>
                            <DialogDescription>
                                Add a new course to your semester.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseCode">Course code</Label>
                                <Input
                                    id="courseCode"
                                    value={courseForm.code}
                                    onChange={(e) => setCourseForm((prev) => ({ ...prev, code: e.target.value }))}
                                    placeholder="e.g., MAT202"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseTitle">Course title</Label>
                                <Input
                                    id="courseTitle"
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Probability & Statistics"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseCredits">Credits registered</Label>
                                <Input
                                    id="courseCredits"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={courseForm.creditsRegistered}
                                    onChange={(e) => setCourseForm((prev) => ({ ...prev, creditsRegistered: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="e.g., 4"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseCreditsEarned">Credits earned (optional)</Label>
                                <Input
                                    id="courseCreditsEarned"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={courseForm.creditsEarned}
                                    onChange={(e) => setCourseForm((prev) => ({ ...prev, creditsEarned: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="Defaults to registered credits"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Grade (optional)</Label>
                                <Select
                                    value={courseForm.grade}
                                    onValueChange={(value) => setCourseForm((prev) => ({ ...prev, grade: value as GradeKey }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeOptions.map((grade) => (
                                            <SelectItem key={grade.value} value={grade.value}>
                                                {grade.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {courseFormError && (
                                <p className="text-sm text-destructive">{courseFormError}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => handleCourseDialogChange(false)}
                                disabled={isSavingCourse}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAddCourseSubmit} disabled={isSavingCourse}>
                                {isSavingCourse ? 'Saving…' : 'Save course'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};