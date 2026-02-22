"use client";
import GradePlanner from "./_components/grade-planner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, BookOpen, Upload, Target, TrendingUp, RotateCcw, ArrowUpCircle, X, EllipsisVertical } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from "@/components/ui/shadcn-io/tabs";
import { Input } from "@/components/ui/input";
import { useCalculations } from "./useCalculations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GradeKey, ParsedCGPAData } from "@/lib/cgpa-types";
import CGPAForm from "./_components/cgpa-form";
import CGPAOverview from "./_components/cgpa-overview";
import SemesterNavigation from "./_components/semester-navigation";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

export default function CGPAPlanner({ data }: { data?: ParsedCGPAData | null }) {
    const calculations = useCalculations(data || undefined);
    const {
        isFormView,
        setIsFormView,
        gradeInput,
        setGradeInput,
        selectedSemester,
        setSelectedSemester,
        currentSemesterGrades,
        calculatedCGPA,
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

        // Computed values
        upcomingSemesters,
        pastSemesters,
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
        rawPastSemesters,
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
    } = calculations;

    const [popoverOpenForCourse, setPopoverOpenForCourse] = useState<number | null>(null);
    const [retakeDialogOpenForCourse, setRetakeDialogOpenForCourse] = useState<number | null>(null);

    if (isFormView) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="space-y-6">
                    {/* Form Card */}
                    <CGPAForm
                        gradeInput={gradeInput}
                        setGradeInput={setGradeInput}
                        handleCalculate={handleCalculate}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="space-y-6">
                {/* CGPA Overview Card */}
                <CGPAOverview
                    calculatedCGPA={calculatedCGPA}
                    getCurrentCGPA={getCurrentCGPA}
                    getCurrentCredits={getCurrentCredits}
                />

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upcoming' | 'grade-planner' | 'calculator')} className="w-full">
                    {/* Added mb-4 to add space between the tabs list and content */}
                    <TabsList className="grid w-full grid-cols-3 mb-4 h-12 gap-1 rounded-lg border border-primary/30">
                        <TabsTrigger
                            className="px-4 py-2 text-sm font-medium transition-colors 
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary
                 hover:bg-primary/20"
                            value="upcoming"
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Upcoming Semester
                        </TabsTrigger>

                        <TabsTrigger
                            className="px-4 py-2 text-sm font-medium transition-colors 
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary
                 hover:bg-primary/20"
                            value="grade-planner"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Grade Planner
                        </TabsTrigger>

                        <TabsTrigger
                            className="px-4 py-2 text-sm font-medium transition-colors 
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary
                 hover:bg-primary/20"
                            value="calculator"
                        >
                            <Target className="h-4 w-4 mr-2" />
                            Raise GPA Calculator
                        </TabsTrigger>
                    </TabsList>

                    <TabsContents>
                        {/* Upcoming Semester Tab */}
                        <TabsContent value="upcoming" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Left Column - Main Table */}
                                <div className="lg:col-span-3">
                                    {displaySemester ? (
                                        <Card>
                                            <CardContent className="p-0">
                                                <div className="w-full overflow-x-auto">
                                                    <div className="min-w-[600px] md:min-w-[800px] border border-border rounded-lg overflow-hidden">
                                                        {/* Header */}
                                                        <div className="grid border-b border-border" style={{ gridTemplateColumns: isCurrentSemester ? '40px 100px 1fr 120px 100px' : '40px 100px 1fr 120px 100px 100px 100px' }}>
                                                            <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm flex items-center justify-center">
                                                                <EllipsisVertical className="h-4 w-4 opacity-50" />
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
                                                            <div className={`font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground text-xs md:text-sm ${!isCurrentSemester ? 'border-r border-border' : ''}`}>
                                                                Grade
                                                            </div>
                                                            {!isCurrentSemester && (
                                                                <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground border-r border-border text-xs md:text-sm">
                                                                    <span className="hidden sm:inline">Credits Earned</span>
                                                                    <span className="sm:hidden">Earned</span>
                                                                </div>
                                                            )}
                                                            {!isCurrentSemester && (
                                                                <div className="font-bold text-center p-2 md:p-4 bg-primary text-primary-foreground text-xs md:text-sm">
                                                                    <span className="hidden sm:inline">Grade Points</span>
                                                                    <span className="sm:hidden">Points</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Semester Title Row */}
                                                        <div className="grid border-b border-border" style={{ gridTemplateColumns: isCurrentSemester ? '40px 100px 1fr 120px 100px' : '40px 100px 1fr 120px 100px 100px 100px' }}>
                                                            <div className="col-span-full p-2 md:p-4 bg-blue-dark text-white font-semibold text-center text-xs md:text-sm">
                                                                {displaySemester.semester}
                                                            </div>
                                                        </div>

                                                        {/* Course Rows */}
                                                        {displaySemester.courses
                                                            .map((course, idx) => ({ ...course, __idx: idx }))
                                                            .filter(c => c && (c.code || c.title || c.creditsRegistered || c.grade))
                                                            .map((course, courseIndex) => {
                                                                const courseKey = getCourseKey(course);

                                                                let isRetakeRow = false;
                                                                if (isCurrentSemester && courseKey) {
                                                                    if (userDefinedRetakes[course.__idx]) {
                                                                        isRetakeRow = true;
                                                                    } else if (autoDetectedRetakeKeys.has(courseKey) && !ignoredRetakeKeys.includes(courseKey)) {
                                                                        isRetakeRow = true;
                                                                    }
                                                                }

                                                                const rawSIdx = !isCurrentSemester && typeof selectedSemester === 'number' ? (pastSemesters.length - 1 - selectedSemester) : null;
                                                                const pastIndexKey = !isCurrentSemester && rawSIdx !== null ? `${rawSIdx}-${course.__idx}` : null;
                                                                const isOverwritten = !isCurrentSemester && pastIndexKey && overwrittenPastIndices.has(pastIndexKey);
                                                                const isActiveRetake = !isCurrentSemester && pastIndexKey && activeRetakePastIndices.has(pastIndexKey);

                                                                const isLastRow = courseIndex === displaySemester.courses.filter(c => c && (c.code || c.title || c.creditsRegistered || c.grade)).length - 1;
                                                                return (
                                                                    <div key={course.__idx} className={`grid ${!isLastRow ? 'border-b border-border' : ''} hover:bg-blue-50/50 transition-colors`} style={{ gridTemplateColumns: isCurrentSemester ? '40px 100px 1fr 120px 100px' : '40px 100px 1fr 120px 100px 100px 100px' }}>
                                                                        <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm text-muted-foreground flex items-center justify-center">
                                                                            <Popover open={popoverOpenForCourse === course.__idx} onOpenChange={(open) => !open && setPopoverOpenForCourse(null)}>
                                                                                <PopoverTrigger asChild>
                                                                                    <button
                                                                                        className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setPopoverOpenForCourse(course.__idx);
                                                                                        }}
                                                                                    >
                                                                                        <EllipsisVertical className="h-4 w-4" />
                                                                                    </button>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className="w-48 p-1">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        className="w-full justify-start text-sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setPopoverOpenForCourse(null);
                                                                                            setRetakeDialogOpenForCourse(course.__idx);
                                                                                        }}
                                                                                    >
                                                                                        Mark course as retake
                                                                                    </Button>
                                                                                    {!isCurrentSemester && (isActiveRetake || isOverwritten) && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                if (pastIndexKey && !detachedPastIndices.includes(pastIndexKey)) {
                                                                                                    setDetachedPastIndices([...detachedPastIndices, pastIndexKey]);
                                                                                                }
                                                                                                if (pastIndexKey && userDefinedPastRetakes[pastIndexKey]) {
                                                                                                    const next = { ...userDefinedPastRetakes };
                                                                                                    delete next[pastIndexKey];
                                                                                                    setUserDefinedPastRetakes(next);
                                                                                                }
                                                                                                setPopoverOpenForCourse(null);
                                                                                            }}
                                                                                        >
                                                                                            Deselect as retake
                                                                                        </Button>
                                                                                    )}
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                        </div>
                                                                        <div className={`p-2 md:p-3 border-r border-border text-center text-xs md:text-sm font-medium text-blue-700 flex items-center justify-center ${isOverwritten ? 'opacity-40' : ''}`}>
                                                                            {course.code}
                                                                        </div>
                                                                        <div className="p-2 md:p-3 border-r border-border text-xs md:text-sm">
                                                                            {isCurrentSemester ? (
                                                                                <div className="flex items-center gap-2 h-full">
                                                                                    <span className="line-clamp-2 font-medium">{course.title}</span>
                                                                                    {isRetakeRow && (
                                                                                        <Badge variant="secondary" className="group flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
                                                                                            Retake
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    if (userDefinedRetakes[course.__idx]) {
                                                                                                        const newRetakes = { ...userDefinedRetakes };
                                                                                                        delete newRetakes[course.__idx];
                                                                                                        setUserDefinedRetakes(newRetakes);
                                                                                                    } else if (courseKey && autoDetectedRetakeKeys.has(courseKey)) {
                                                                                                        if (!ignoredRetakeKeys.includes(courseKey)) {
                                                                                                            setIgnoredRetakeKeys([...ignoredRetakeKeys, courseKey]);
                                                                                                        }
                                                                                                    }
                                                                                                }}
                                                                                                className="opacity-50 group-hover:opacity-100 transition-opacity ml-1 rounded-full hover:bg-amber-300 p-0.5"
                                                                                            >
                                                                                                <X className="h-3 w-3" />
                                                                                            </button>
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center gap-2 h-full">
                                                                                    <span className={`line-clamp-2 font-medium ${isOverwritten ? 'opacity-40 italic' : ''}`}>{course.title}</span>
                                                                                    {isActiveRetake && (
                                                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                                                                            Retake
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="p-2 md:p-3 border-r border-border text-center text-xs md:text-sm flex items-center justify-center">
                                                                            {isCurrentSemester && currentSemesterGrades[course.__idx] === 'TP (w credits)'
                                                                                ? 2
                                                                                : isCurrentSemester && currentSemesterGrades[course.__idx] === 'TP (w/o credits)'
                                                                                    ? 0
                                                                                    : course.creditsRegistered
                                                                            }
                                                                        </div>
                                                                        <div className={`p-2 md:p-3 text-center text-xs md:text-sm flex items-center justify-center ${!isCurrentSemester ? 'border-r border-border' : ''}`}>
                                                                            {isCurrentSemester ? (
                                                                                <Select
                                                                                    value={currentSemesterGrades[course.__idx] || "Select"}
                                                                                    onValueChange={(value) => handleGradeChange(course.__idx, value as GradeKey)}
                                                                                >
                                                                                    <SelectTrigger className="border-0 bg-transparent h-auto p-0 text-xs md:text-sm focus:ring-0 w-full max-w-[90px] mx-auto">
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
                                                                                <span className={isOverwritten ? 'opacity-40' : ''}>{course.grade || 'N/A'}</span>
                                                                            )}
                                                                        </div>
                                                                        {!isCurrentSemester && (
                                                                            <div className={`p-2 md:p-3 border-r border-border text-center text-xs md:text-sm flex items-center justify-center ${isOverwritten ? 'opacity-40' : ''}`}>
                                                                                {course.creditsEarned || 'N/A'}
                                                                            </div>
                                                                        )}
                                                                        {!isCurrentSemester && (
                                                                            <div className={`p-2 md:p-3 text-center text-xs md:text-sm flex items-center justify-center ${isOverwritten ? 'opacity-40' : ''}`}>
                                                                                {course.gradePoints || 'N/A'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>

                                                {/* Calculate button and results section */}
                                                {isCurrentSemester && (
                                                    <div className="p-4 pt-6 mt-0">
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                                                {/* Metrics container (auto width) */}
                                                                <div className="bg-slate-50/50 border border-primary/20 rounded-lg px-4 py-3 inline-flex items-center gap-6">
                                                                    <div>
                                                                        <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Sem GPA</div>
                                                                        <div className="text-xl font-bold text-primary tabular-nums">{calculatedCGPA ? calculatedCGPA.semesterGPA : '--'}</div>
                                                                    </div>
                                                                    <div className="w-px h-8 bg-primary/10"></div>
                                                                    <div>
                                                                        <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">New CGPA</div>
                                                                        <div className="text-xl font-bold text-primary tabular-nums">{calculatedCGPA ? calculatedCGPA.newCGPA : '--'}</div>
                                                                    </div>
                                                                    <div className="w-px h-8 bg-primary/10"></div>
                                                                    <div>
                                                                        <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Credits</div>
                                                                        <div className="text-xl font-bold text-primary tabular-nums">{calculatedCGPA ? calculatedCGPA.creditsEarned : '--'}</div>
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

                                {/* Right Column - Semester Navigation */}
                                <SemesterNavigation
                                    resetActiveTab={resetActiveTab}
                                    setIsFormView={setIsFormView}
                                    upcomingSemesters={upcomingSemesters}
                                    pastSemesters={pastSemesters}
                                    selectedSemester={selectedSemester}
                                    setSelectedSemester={setSelectedSemester}
                                />
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
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5" />
                                            Calculate Required GPA This Semester
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
                                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                            <span>Current CGPA: {getCurrentCGPA().toFixed(2)}</span>
                                            <span>Current Credits: {getCurrentCredits()}</span>
                                        </div>
                                        <div className="mt-auto rounded-lg border bg-green-50 p-4">
                                            <Label className="text-sm font-medium">Required GPA this semester:</Label>
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
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Calculate Future CGPA
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
                                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                            <span>Current CGPA: {getCurrentCGPA().toFixed(2)}</span>
                                            <span>Current Credits: {getCurrentCredits()}</span>
                                        </div>
                                        <div className="mt-auto rounded-lg border bg-blue-50 p-4">
                                            <Label className="text-sm font-medium">Your CGPA would be:</Label>
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
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowUpCircle className="h-5 w-5" />
                                            Credits Needed to Reach Target CGPA
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
                                            <Label htmlFor="maintainedAverageCGPA">Average you'll maintain</Label>
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
                                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                            <span>Current CGPA: {getCurrentCGPA().toFixed(2)}</span>
                                            <span>Current Credits: {getCurrentCredits()}</span>
                                        </div>
                                        <div className="mt-auto rounded-lg border bg-amber-50 p-4">
                                            <Label className="text-sm font-medium">Credits required:</Label>
                                            <div className="text-2xl font-bold text-amber-700 mt-1">
                                                {requiredCreditsToRaise
                                                    ? (/^\d+(?:\.\d+)?$/.test(requiredCreditsToRaise)
                                                        ? `~ ${requiredCreditsToRaise}`
                                                        : requiredCreditsToRaise)
                                                    : '--'}
                                            </div>
                                            {requiredCreditsToRaise && /^\d+(?:\.\d+)?$/.test(requiredCreditsToRaise) && (
                                                <p className="text-xs text-muted-foreground mt-1">
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
            </div>

            {/* Retake Dialog */}
            <Dialog open={retakeDialogOpenForCourse !== null} onOpenChange={(open) => {
                if (!open) setRetakeDialogOpenForCourse(null);
            }}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select Past Course</DialogTitle>
                        <DialogDescription>
                            Select the past course that this is a retake of.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                        {pastSemesters.map(sem => (
                            <div key={sem.semester} className="mb-4">
                                <h4 className="font-semibold text-sm text-slate-500 mb-2">{sem.semester}</h4>
                                <div className="space-y-1">
                                    {sem.courses.map(pastCourse => {
                                        const pKey = getCourseKey(pastCourse);
                                        if (!pKey) return null;
                                        return (
                                            <Button
                                                key={pKey}
                                                variant="outline"
                                                className="w-full justify-start text-left h-auto py-2"
                                                onClick={() => {
                                                    if (retakeDialogOpenForCourse !== null) {
                                                        if (isCurrentSemester) {
                                                            setUserDefinedRetakes({
                                                                ...userDefinedRetakes,
                                                                [retakeDialogOpenForCourse]: pKey
                                                            });
                                                        } else {
                                                            const actualSIdx = rawPastSemesters.findIndex((s: any) => s.semester === displaySemester?.semester);
                                                            if (actualSIdx !== -1) {
                                                                const pastIndexKey = `${actualSIdx}-${retakeDialogOpenForCourse}`;
                                                                setUserDefinedPastRetakes({
                                                                    ...userDefinedPastRetakes,
                                                                    [pastIndexKey]: pKey
                                                                });
                                                            }
                                                        }
                                                    }
                                                    setRetakeDialogOpenForCourse(null);
                                                }}
                                            >
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="font-medium text-sm">{pastCourse.code}</span>
                                                    <span className="text-xs text-muted-foreground whitespace-normal line-clamp-1">{pastCourse.title}</span>
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}