"use client"

import { useState, useEffect } from "react"
import { useCoursePlanner } from "../course-planner-context"
import { degreeTemplates } from "../templates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileDown, GraduationCap, Upload } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

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

    const [selectedTemplate, setSelectedTemplate] = useState<string>(selectedDegreeId || "")
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [showLoadDialog, setShowLoadDialog] = useState(false)
    const [cgpaInput, setCgpaInput] = useState("")
    const [loadResult, setLoadResult] = useState<{ success: boolean; message: string } | null>(null)

    // Sync selectedTemplate with saved degree
    useEffect(() => {
        if (selectedDegreeId && selectedDegreeId !== selectedTemplate) {
            setSelectedTemplate(selectedDegreeId)
        }
    }, [selectedDegreeId])

    // Persist degree selection when changed
    const handleTemplateChange = (value: string) => {
        setSelectedTemplate(value)
        setSelectedDegree(value)
    }

    const currentTemplate = degreeTemplates.find((t) => t.id === selectedTemplate)
    const currentCredits = getCreditsByType()
    const cgpa = getCGPA()

    // Get semester GPAs for display
    const semesterGPAs = state.semesters
        .map((sem, index) => ({
            name: sem.name,
            gpa: getSemesterGPA(sem.id),
        }))
        .filter((s) => s.gpa !== null)

    const handleApplyTemplate = () => {
        if (!currentTemplate) return
        setShowConfirmDialog(true)
    }

    const confirmApplyTemplate = () => {
        if (!currentTemplate) return

        // Add all courses from the template to available courses
        currentTemplate.defaultCourses.forEach((course) => {
            const newCourse: Course = {
                ...course,
                id: uuidv4(),
            }
            addCourse(null, newCourse)
        })

        setShowConfirmDialog(false)
    }

    const handleLoadPreviousSemesters = () => {
        if (!cgpaInput.trim()) {
            setLoadResult({ success: false, message: "Please paste your CGPA planner data first" })
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

    return (
        <>
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap size={20} />
                            Academic Summary
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => setShowLoadDialog(true)}
                            >
                                <Upload size={14} />
                                Load Existing
                            </Button>
                            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {degreeTemplates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name} ({template.batch})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleApplyTemplate}
                                disabled={!selectedTemplate}
                                size="sm"
                                className="gap-1"
                            >
                                <FileDown size={14} />
                                Load
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
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
            </Card>

            {/* Load Template Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Load {currentTemplate?.name} Template?</DialogTitle>
                        <DialogDescription>
                            This will add {currentTemplate?.defaultCourses.length} courses to your available courses tray.
                            You can then drag them to your desired semesters.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmApplyTemplate}>
                            Load Courses
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Load Previous Semesters Dialog */}
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Load Previous Semesters</DialogTitle>
                        <DialogDescription>
                            Paste your grade data from the CGPA Planner. This will import your completed semesters
                            with courses and grades, and remove already-taken FC/CC courses from the tray.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Paste your CGPA planner data here (copy from AMS grade report)..."
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
                        <Button variant="outline" onClick={() => {
                            setShowLoadDialog(false)
                            setCgpaInput("")
                            setLoadResult(null)
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleLoadPreviousSemesters}>
                            <Upload size={14} className="mr-2" />
                            Load Semesters
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
