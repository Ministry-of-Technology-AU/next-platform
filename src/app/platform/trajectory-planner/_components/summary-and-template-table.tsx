"use client"

import { useState, useEffect } from "react"
import { useCoursePlanner } from "../course-planner-context"
import { degreeTemplates, idealTrajectories } from "../templates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, GraduationCap, Upload, Map, Plus, FileText, Contact, Mail, Save } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Course } from "../types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Disclosure,
    DisclosureContent,
    DisclosureTrigger,
} from "@/components/ui/disclosure"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TourStep } from "@/components/guided-tour"

export function SummaryAndTemplateTable() {
    const {
        addCourse,
        getCreditsByType,
        getCGPA,
        state,
        getSemesterGPA,
        selectedDegreeId,
        setSelectedDegree,
        loadPreviousSemesters,
    } = useCoursePlanner()

    // const [selectedTemplate, setSelectedTemplate] = useState<string>(selectedDegreeId || "")
    const [selectedTemplate, setSelectedTemplate] = useState<string>("")
    const [showLoadDialog, setShowLoadDialog] = useState(false)
    const [showTrajectoryDialog, setShowTrajectoryDialog] = useState(false)
    const [showContactDialog, setShowContactDialog] = useState(false)
    const [cgpaInput, setCgpaInput] = useState("")
    const [loadResult, setLoadResult] = useState<{ success: boolean; message: string } | null>(null)
    const [isSummaryOpen, setIsSummaryOpen] = useState(true)

    // Sync selectedTemplate with saved degree
    // useEffect(() => {
    //     if (selectedDegreeId && selectedDegreeId !== selectedTemplate) {
    //         setSelectedTemplate(selectedDegreeId)
    //     }
    // }, [selectedDegreeId])

    // Persist degree selection when changed
    const handleTemplateChange = (value: string) => {
        setSelectedTemplate(value)
        setSelectedDegree(value)
    }

    const currentTemplate = degreeTemplates.find((t) => t.id === selectedTemplate)
    const currentTrajectory = idealTrajectories.find((t) => t.templateId === selectedTemplate)
    const currentCredits = getCreditsByType()
    const cgpa = getCGPA()

    // Get semester GPAs for display
    const semesterGPAs = state.semesters
        .map((sem) => ({
            name: sem.name,
            gpa: getSemesterGPA(sem.id),
        }))
        .filter((s) => s.gpa !== null)

    const handleLoadPreviousSemesters = () => {
        if (!cgpaInput.trim()) {
            setLoadResult({ success: false, message: "Please paste your AMS data first" })
            return
        }

        const result = loadPreviousSemesters(cgpaInput)
        setLoadResult(result)

        if (result.success) {
            setTimeout(() => {
                setShowLoadDialog(false)
                setCgpaInput("")
                setLoadResult(null)
            }, 1500)
        }
    }

    const addCourseToTray = (course: Omit<Course, 'id'>) => {
        const newCourse: Course = {
            ...course,
            id: uuidv4(),
        }
        addCourse(null, newCourse)
    }

    const addSemesterCoursesToTray = (courses: Omit<Course, 'id'>[]) => {
        courses.forEach((course) => {
            const newCourse: Course = {
                ...course,
                id: uuidv4(),
            }
            addCourse(null, newCourse)
        })
    }

    return (
        <>
            {/* Academic Summary - Collapsible */}
            <TourStep
                id="academic-summary"
                title="Academic Summary"
                content="Stay on top of your degree! Monitor your completed vs. required credits and your projected CGPA in real-time."
                order={1}
            >
                <Card className="border-border bg-card">
                    <Disclosure open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
                        <CardHeader className="pb-6">
                            <DisclosureTrigger className="w-full">
                                <div className="flex items-center justify-between w-full cursor-pointer">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <GraduationCap size={20} />
                                        Academic Summary
                                    </CardTitle>
                                    {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </DisclosureTrigger>
                        </CardHeader>
                        <DisclosureContent>
                            <CardContent className="pt-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Completed</TableHead>
                                            <TableHead className="text-right">Required</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Major</TableCell>
                                            <TableCell className="text-right">{currentCredits.major}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {currentTemplate?.requiredCredits.major ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Minor</TableCell>
                                            <TableCell className="text-right">{currentCredits.minor}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {currentTemplate?.requiredCredits.minor ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>FC</TableCell>
                                            <TableCell className="text-right">{currentCredits.fc}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {currentTemplate?.requiredCredits.fc ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>CC</TableCell>
                                            <TableCell className="text-right">{currentCredits.cc}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {currentTemplate?.requiredCredits.cc ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Open</TableCell>
                                            <TableCell className="text-right">{currentCredits.openCredits}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {currentTemplate?.requiredCredits.openCredits ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="font-semibold">
                                            <TableCell>Total Credits</TableCell>
                                            <TableCell className="text-right">{currentCredits.total}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {currentTemplate?.requiredCredits.total ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                        {cgpa !== null && (
                                            <TableRow className="font-semibold border-t-2">
                                                <TableCell>CGPA</TableCell>
                                                <TableCell className="text-right">{cgpa.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">4.00</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Semester GPAs */}
                                {semesterGPAs.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm text-muted-foreground mb-2">Semester GPAs</p>
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            {semesterGPAs.map((sem) => (
                                                <span key={sem.name}>
                                                    {sem.name}: <span className="font-semibold">{sem.gpa?.toFixed(2)}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {cgpa === null && (
                                    <p className="text-sm text-muted-foreground text-center mt-4">
                                        Add grades to courses in semesters to see GPA calculations
                                    </p>
                                )}
                            </CardContent>
                        </DisclosureContent>
                    </Disclosure>
                </Card>
            </TourStep>

            {/* Degree Selection & Actions - Below Summary */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
                <TourStep
                    id="degree-selection"
                    title="Degree Selection"
                    content="Select your major/minor template to see specific graduation requirements tailored to your batch."
                    order={2}
                >
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select degree template..." />
                        </SelectTrigger>
                        <SelectContent>
                            {degreeTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TourStep>

                <TourStep
                    id="load-existing"
                    title="Load Existing"
                    content="Sync with your past! Import your historical grades directly from AMS to accurately start your trajectory."
                    order={3}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setShowLoadDialog(true)}
                    >
                        <Upload size={14} />
                        Load Existing
                    </Button>
                </TourStep>

                <TourStep
                    id="ideal-trajectory"
                    title="Ideal Trajectory"
                    content="Lost? View the official recommended course sequence for your degree and add courses to your plan with one click."
                    order={4}
                >
                    <Button
                        onClick={() => setShowTrajectoryDialog(true)}
                        disabled={!selectedTemplate}
                        size="sm"
                        className="gap-1"
                    >
                        <Map size={14} />
                        Ideal Trajectory
                    </Button>
                </TourStep>

                {(currentTrajectory?.policyDocPath || currentTemplate?.policyDocPath) && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => window.open(currentTrajectory?.policyDocPath || currentTemplate?.policyDocPath, '_blank')}
                    >
                        <FileText size={14} />
                        View Policy
                    </Button>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setShowContactDialog(true)}
                >
                    <Contact size={14} />
                    Contact Reps
                </Button>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="inline-block cursor-not-allowed">
                            <Button disabled variant="outline" size="sm" className="gap-1 opacity-60 pointer-events-none">
                                <Save size={14} />
                                Save Template
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Coming Soon!</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Load Previous Semesters Dialog */}
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Load Previous Semesters</DialogTitle>
                        <DialogDescription>
                            Paste your grade data from the AMS. This will import your completed semesters
                            with courses and grades, please make sure to edit and mark Minor/Open credit courses.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Paste your AMS data here (copy from AMS grade report)..."
                            value={cgpaInput}
                            onChange={(e) => setCgpaInput(e.target.value)}
                            className="min-h-[200px] font-mono text-xs"
                        />
                        {loadResult && (
                            <p className={`text-sm ${loadResult.success ? "text-green-600" : "text-red-600"}`}>
                                {loadResult.message}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowLoadDialog(false)
                                setCgpaInput("")
                                setLoadResult(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleLoadPreviousSemesters}>
                            <Upload size={14} className="mr-2" />
                            Load Semesters
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ideal Trajectory Dialog */}
            <Dialog open={showTrajectoryDialog} onOpenChange={setShowTrajectoryDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ideal Trajectory - {currentTemplate?.name}</DialogTitle>
                        <DialogDescription>
                            {currentTrajectory
                                ? "View the recommended course sequence. Click +Add to add courses to your available tray."
                                : "View required courses for this degree. Click +Add to add courses to your available tray."}
                        </DialogDescription>
                    </DialogHeader>

                    {currentTrajectory ? (
                        <div className="space-y-4">
                            {/* Two-column layout like the screenshot */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Monsoon Semesters (odd) */}
                                <div className="space-y-3">
                                    <div className="font-semibold text-sm bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded">
                                        Monsoon Semester
                                    </div>
                                    {currentTrajectory.semesters
                                        .filter((s) => s.semester % 2 === 1)
                                        .map((sem) => (
                                            <div key={sem.semester} className="border rounded-lg overflow-hidden">
                                                <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 px-3 py-2">
                                                    <span className="font-medium text-sm">{sem.name}</span>
                                                    {sem.courses.length > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-xs gap-1"
                                                            onClick={() => addSemesterCoursesToTray(sem.courses)}
                                                        >
                                                            <Plus size={12} />
                                                            Add All
                                                        </Button>
                                                    )}
                                                </div>
                                                {sem.courses.length > 0 ? (
                                                    <div className="divide-y">
                                                        {sem.courses.map((course, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                                                            >
                                                                <span>
                                                                    {course.name}
                                                                    {course.credits !== 4 && (
                                                                        <span className="text-muted-foreground ml-1">
                                                                            ({course.credits} credits)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 text-xs gap-1 text-primary hover:text-primary"
                                                                    onClick={() => addCourseToTray(course)}
                                                                >
                                                                    <Plus size={12} />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground italic">
                                                        Electives / Open credits / Foundational Courses
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                {/* Spring Semesters (even) */}
                                <div className="space-y-3">
                                    <div className="font-semibold text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded">
                                        Spring Semester
                                    </div>
                                    {currentTrajectory.semesters
                                        .filter((s) => s.semester % 2 === 0)
                                        .map((sem) => (
                                            <div key={sem.semester} className="border rounded-lg overflow-hidden">
                                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
                                                    <span className="font-medium text-sm">{sem.name}</span>
                                                    {sem.courses.length > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-xs gap-1"
                                                            onClick={() => addSemesterCoursesToTray(sem.courses)}
                                                        >
                                                            <Plus size={12} />
                                                            Add All
                                                        </Button>
                                                    )}
                                                </div>
                                                {sem.courses.length > 0 ? (
                                                    <div className="divide-y">
                                                        {sem.courses.map((course, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                                                            >
                                                                <span>
                                                                    {course.name}
                                                                    {course.credits !== 4 && (
                                                                        <span className="text-muted-foreground ml-1">
                                                                            ({course.credits} credits)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 text-xs gap-1 text-primary hover:text-primary"
                                                                    onClick={() => addCourseToTray(course)}
                                                                >
                                                                    <Plus size={12} />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground italic">
                                                        Electives / Open credits
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {currentTrajectory.notes && (
                                <p className="text-sm text-muted-foreground mt-4 italic">
                                    {currentTrajectory.notes}
                                </p>
                            )}

                            {/* Policy doc reminder */}
                            <p className="text-xs text-muted-foreground border-t pt-3">
                                💡 Please refer to the official policy document for the most accurate and up-to-date requirements.
                            </p>
                        </div>
                    ) : currentTemplate ? (
                        /* Show course list when no trajectory exists */
                        <div className="space-y-4">
                            <div className="border rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
                                    <span className="font-medium text-sm">Required Courses</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs gap-1"
                                        onClick={() => {
                                            currentTemplate.defaultCourses.forEach(course => addCourseToTray(course))
                                        }}
                                    >
                                        <Plus size={12} />
                                        Add All
                                    </Button>
                                </div>
                                <div className="divide-y">
                                    {currentTemplate.defaultCourses.map((course, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                                        >
                                            <span>
                                                {course.name}
                                                <span className="text-muted-foreground ml-1">
                                                    ({course.credits} credits)
                                                </span>
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs gap-1 text-primary hover:text-primary"
                                                onClick={() => addCourseToTray(course)}
                                            >
                                                <Plus size={12} />
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground italic">
                                ⚠️ An ideal semester-by-semester trajectory is not yet available for this degree.
                                Above are the required courses you'll need to complete.
                            </p>

                            <p className="text-xs text-muted-foreground border-t pt-3">
                                💡 Please refer to the official policy document for the most accurate and up-to-date requirements.
                            </p>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Contact Reps Dialog */}
            <CommandDialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <CommandInput placeholder="Search representatives..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Department Representatives">
                        {[
                            { dept: "Computer Science", email: "cs.rep@ashoka.edu.in" },
                            { dept: "Physics", email: "physics.rep@ashoka.edu.in" },
                            { dept: "Mathematics", email: "math.rep@ashoka.edu.in" },
                            { dept: "Biology", email: "biology.rep@ashoka.edu.in" },
                            { dept: "Economics", email: "econ.rep@ashoka.edu.in" },
                            { dept: "English", email: "english.rep@ashoka.edu.in" },
                            { dept: "History", email: "history.rep@ashoka.edu.in" },
                            { dept: "Psychology", email: "psychology.rep@ashoka.edu.in" },
                            { dept: "Sociology/Anthropology", email: "socanth.rep@ashoka.edu.in" },
                            { dept: "Political Science", email: "polsci.rep@ashoka.edu.in" },
                            { dept: "Chemistry", email: "chemistry.rep@ashoka.edu.in" },
                            { dept: "Philosophy", email: "philosophy.rep@ashoka.edu.in" },
                        ].map((rep) => (
                            <CommandItem
                                key={rep.dept}
                                className="flex items-center justify-between cursor-default"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="font-medium truncate">{rep.dept} Representative</span>
                                    <span
                                        className="text-xs text-muted-foreground hover:underline cursor-pointer truncate hidden sm:inline-block"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigator.clipboard.writeText(rep.email)
                                        }}
                                        title="Click to copy email"
                                    >
                                        {rep.email}
                                    </span>
                                </div>
                                <Button
                                    variant="animatedGhost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary/80 hover:underline dark:text-secondary shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        window.open(
                                            `https://mail.google.com/mail/?view=cm&fs=1&to=${rep.email}`,
                                            "_blank",
                                        )
                                    }}
                                >
                                    <Mail size={16} />
                                </Button>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
