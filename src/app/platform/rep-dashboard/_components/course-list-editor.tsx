"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, GripVertical } from "lucide-react"

interface CourseItem {
    name: string
    credits: number
    deptCode: string
    type: string
    isInSemester?: boolean
}

interface CourseListEditorProps {
    courses: CourseItem[]
    onChange: (courses: CourseItem[]) => void
    deptCode: string
}

const CREDIT_OPTIONS = [2, 4, 8, 12]
const TYPE_OPTIONS = ["Major", "Minor", "FC", "CC", "CT", "Open"]

export function CourseListEditor({ courses, onChange, deptCode }: CourseListEditorProps) {
    const addCourse = () => {
        onChange([
            ...courses,
            { name: "New Course", credits: 4, deptCode: deptCode, type: "Major", isInSemester: false }
        ])
    }

    const updateCourse = (index: number, updates: Partial<CourseItem>) => {
        const updated = [...courses]
        updated[index] = { ...updated[index], ...updates }
        onChange(updated)
    }

    const removeCourse = (index: number) => {
        onChange(courses.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{courses.length} course(s)</span>
                <Button variant="outline" size="sm" onClick={addCourse}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Course
                </Button>
            </div>

            {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-md bg-muted/30">
                    No courses added yet
                </p>
            ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                    {courses.map((course, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted/30 rounded-md group"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground/50" />

                            <Input
                                value={course.name}
                                onChange={(e) => updateCourse(index, { name: e.target.value })}
                                className="h-8 flex-1"
                                placeholder="Course name"
                            />

                            <Select
                                value={course.credits.toString()}
                                onValueChange={(v) => updateCourse(index, { credits: parseInt(v) })}
                            >
                                <SelectTrigger className="h-8 w-16">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CREDIT_OPTIONS.map((c) => (
                                        <SelectItem key={c} value={c.toString()}>
                                            {c}cr
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={course.type}
                                onValueChange={(v) => updateCourse(index, { type: v })}
                            >
                                <SelectTrigger className="h-8 w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPE_OPTIONS.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                value={course.deptCode}
                                onChange={(e) => updateCourse(index, { deptCode: e.target.value.toUpperCase() })}
                                className="h-8 w-16 text-center"
                                placeholder="Dept"
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeCourse(index)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
