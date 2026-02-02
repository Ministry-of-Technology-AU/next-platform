"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { CourseListEditor } from "./course-list-editor"

interface SemesterInTrajectory {
    semester: number
    name: string
    courses: any[]
}

interface TrajectoryEditorProps {
    semesters: SemesterInTrajectory[]
    onChange: (semesters: SemesterInTrajectory[]) => void
    notes?: string
    onNotesChange: (notes: string) => void
    policyDocPath?: string
    onPolicyDocChange: (path: string) => void
    deptCode: string
}

export function TrajectoryEditor({
    semesters,
    onChange,
    notes,
    onNotesChange,
    policyDocPath,
    onPolicyDocChange,
    deptCode
}: TrajectoryEditorProps) {
    const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set())

    const toggleSemester = (semNum: number) => {
        const newSet = new Set(expandedSemesters)
        if (newSet.has(semNum)) {
            newSet.delete(semNum)
        } else {
            newSet.add(semNum)
        }
        setExpandedSemesters(newSet)
    }

    const addSemester = () => {
        const nextNum = semesters.length + 1
        onChange([
            ...semesters,
            { semester: nextNum, name: `Semester ${nextNum}`, courses: [] }
        ])
        setExpandedSemesters(new Set([...expandedSemesters, nextNum]))
    }

    const updateSemester = (index: number, updates: Partial<SemesterInTrajectory>) => {
        const updated = [...semesters]
        updated[index] = { ...updated[index], ...updates }
        onChange(updated)
    }

    const removeSemester = (index: number) => {
        onChange(semesters.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Notes</Label>
                    <Input
                        value={notes || ""}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="e.g., ** Incorporate either BIO-1200 or PHY-1220..."
                    />
                </div>
                <div>
                    <Label>Policy Document Path</Label>
                    <Input
                        value={policyDocPath || ""}
                        onChange={(e) => onPolicyDocChange(e.target.value)}
                        placeholder="/policy_docs/Major_Curriculum.pdf"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{semesters.length} Semester(s)</span>
                <Button variant="outline" size="sm" onClick={addSemester}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Semester
                </Button>
            </div>

            <div className="space-y-2">
                {semesters.map((sem, index) => (
                    <Collapsible
                        key={sem.semester}
                        open={expandedSemesters.has(sem.semester)}
                        onOpenChange={() => toggleSemester(sem.semester)}
                    >
                        <Card className="border-muted">
                            <CardHeader className="py-2 px-3">
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            {expandedSemesters.has(sem.semester) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                            <CardTitle className="text-sm font-medium">
                                                {sem.name} ({sem.courses.length} courses)
                                            </CardTitle>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeSemester(index)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="pt-0 pb-3 px-3 space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label className="text-xs">Semester Name</Label>
                                            <Input
                                                value={sem.name}
                                                onChange={(e) => updateSemester(index, { name: e.target.value })}
                                                className="h-8"
                                            />
                                        </div>
                                        <div className="w-20">
                                            <Label className="text-xs">Number</Label>
                                            <Input
                                                type="number"
                                                value={sem.semester}
                                                onChange={(e) => updateSemester(index, { semester: parseInt(e.target.value) || 1 })}
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                    <CourseListEditor
                                        courses={sem.courses}
                                        onChange={(courses) => updateSemester(index, { courses })}
                                        deptCode={deptCode}
                                    />
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                ))}
            </div>
        </div>
    )
}
