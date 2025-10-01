"use client";
import GradePlanner from "./_components/grade-planner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, BookOpen, Upload, Target, TrendingUp, RotateCcw, ArrowUpCircle } from "lucide-react";
import { PFCreditsComponent } from "./_components/pf-credits";
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from "@/components/ui/shadcn-io/tabs";
import { Input } from "@/components/ui/input";
import { useCalculations } from "./useCalculations";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GradeKey } from "./types";
import CGPAForm from "./_components/cgpa-form";
import CGPAOverview from "./_components/cgpa-overview";
import SemesterNavigation from "./_components/semester-navigation";

export default function CGPAPlanner(){
    const calculations = useCalculations();
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
    } = calculations;
    if (isFormView) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="space-y-6">
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
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary/70 dark:data-[state=inactive]:text-gray-300
                 hover:bg-primary/20"
                            value="upcoming"
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Upcoming Semester
                        </TabsTrigger>

                        <TabsTrigger
                            className="px-4 py-2 text-sm font-medium transition-colors
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary/70 dark:data-[state=inactive]:text-gray-300
                 hover:bg-primary/20"
                            value="grade-planner"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Grade Planner
                        </TabsTrigger>

                        <TabsTrigger
                            className="px-4 py-2 text-sm font-medium transition-colors
                 data-[state=active]:bg-primary data-[state=active]:text-white
                 data-[state=inactive]:bg-primary/10 data-[state=inactive]:text-primary/70 dark:data-[state=inactive]:text-gray-300
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
                                        <CardContent className="p-6 overflow-x-auto">
                                            <div className="min-w-[800px]">
                                                <table className="w-full border-collapse border border-gray-300">
                                                    <thead>
                                                        <tr className="bg-primary text-white">
                                                            <th className="border border-gray-300 p-2">#</th>
                                                            <th className="border border-gray-300 p-2">Code</th>
                                                            <th className="border border-gray-300 p-2">Title</th>
                                                            <th className="border border-gray-300 p-2">Credits Registered</th>
                                                            <th className="border border-gray-300 p-2">Grade</th>
                                                            {!isCurrentSemester && <th className="border border-gray-300 p-2">Credits Earned</th>}
                                                            {!isCurrentSemester && <th className="border border-gray-300 p-2">Grade Points</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-[var(--color-blue-dark)] text-white">
                                                            <td colSpan={isCurrentSemester ? 5 : 7} className="border border-gray-300 p-2 font-bold">
                                                                {displaySemester.semester}
                                                            </td>
                                                        </tr>

                                                        {/* Filter out empty/null courses but keep original index mapping */}
                                                        {displaySemester.courses
                                                            .map((course, idx) => ({ ...course, __idx: idx }))
                                                            .filter(c => c && (c.code || c.title || c.creditsRegistered || c.grade))
                                                            .map((course, courseIndex) => {
                                                                const courseKey = getCourseKey(course);
                                                                const isRetakeRow = isCurrentSemester && courseKey ? autoDetectedRetakeKeys.has(courseKey) : false;
                                                                return (
                                                                <tr key={course.__idx}>
                                                                    <td className="border border-gray-300 p-2">{courseIndex + 1}</td>
                                                                    <td className="border border-gray-300 p-2">{course.code}</td>
                                                                    <td className="border border-gray-300 p-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span>{course.title}</span>
                                                                            {isRetakeRow && (
                                                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                                                    Retake
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="border border-gray-300 p-2">
                                                                        {isCurrentSemester && currentSemesterGrades[course.__idx] === 'TP (w credits)' 
                                                                            ? 2
                                                                            : isCurrentSemester && currentSemesterGrades[course.__idx] === 'TP (w/o credits)'
                                                                            ? 0
                                                                            : course.creditsRegistered
                                                                        }
                                                                    </td>
                                                                    <td className="border border-gray-300 p-2">
                                                                        {isCurrentSemester ? (
                                                                            <Select
                                                                                value={currentSemesterGrades[course.__idx] || "Select"}
                                                                                onValueChange={(value) => handleGradeChange(course.__idx, value as GradeKey)}
                                                                            >
                                                                                <SelectTrigger className="border-none w-28">
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
                                                                    </td>
                                                                    {!isCurrentSemester && (
                                                                        <td className="border border-gray-300 p-2">
                                                                            {course.creditsEarned || 'N/A'}
                                                                        </td>
                                                                    )}
                                                                    {!isCurrentSemester && (
                                                                        <td className="border border-gray-300 p-2">
                                                                            {course.gradePoints || 'N/A'}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );})}

                                                    </tbody>
                                                </table>

                                                {/* Calculate button and results section */}
                                                {isCurrentSemester && (
                                                    <div className="mt-6">
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

                                            </div>
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
            </div>
        </div>
    );
};