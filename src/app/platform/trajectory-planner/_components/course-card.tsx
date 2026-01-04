"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Course, Credits, CourseType, DepartmentCode, Grade } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCoursePlanner } from "../course-planner-context"
import { cn } from "@/lib/utils"
import { GripVertical, Trash2, Pencil, Undo2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { gradeOptions } from "../templates"

interface CourseCardProps {
    course: Course
    isDragging?: boolean
}

export function CourseCard({ course, isDragging }: CourseCardProps) {
    const { updateCourse, removeCourse, updateCourseGrade, moveCourse, state } = useCoursePlanner()
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: course.id })

    const [isEditMode, setIsEditMode] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    const isInSemester = course.isInSemester || false
    const showEditable = !isInSemester || isEditMode

    // Handle click outside to exit edit mode
    useEffect(() => {
        if (!isEditMode) return

        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsEditMode(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isEditMode])

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCourse(course.id, { name: e.target.value })
    }

    const handleCreditsChange = (value: string) => {
        updateCourse(course.id, { credits: Number.parseInt(value) as Credits })
    }

    const handleDeptChange = (value: string) => {
        updateCourse(course.id, { deptCode: value as DepartmentCode })
    }

    const handleTypeChange = (value: string) => {
        updateCourse(course.id, { type: value as CourseType })
    }

    const handleGradeChange = (value: string) => {
        const grade = value === "none" ? null : (value as Grade)
        updateCourseGrade(course.id, grade)
    }

    const getBadgeColor = (type: CourseType) => {
        switch (type) {
            case "Major":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            case "Minor":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            case "FC":
                return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            case "CC":
                return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300"
            case "Open":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div ref={(node) => { setNodeRef(node); (cardRef as any).current = node; }} style={style} className={cn("group relative", isDragging && "opacity-50")}>
            <Card className="hover:shadow-md transition-shadow border-muted bg-card">
                <CardContent className="p-3 space-y-3">
                    <div className="flex items-start gap-2">
                        <button
                            {...attributes}
                            {...listeners}
                            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <GripVertical size={18} />
                        </button>
                        <div className="flex-1 space-y-1">
                            {showEditable ? (
                                <Input
                                    value={course.name}
                                    onChange={handleNameChange}
                                    placeholder="Course Name"
                                    className="h-7 text-sm font-semibold border-none focus-visible:ring-1 focus-visible:ring-primary p-0 bg-transparent shadow-none"
                                />
                            ) : (
                                <h4 className="text-sm font-semibold leading-tight">{course.name}</h4>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getBadgeColor(course.type))}>
                                    {course.type}
                                </Badge>
                                {course.deptCode && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-800">
                                        {course.deptCode}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary">
                                    {course.credits} Credits
                                </Badge>
                                {/* Grade badge for courses in semester */}
                                {isInSemester && course.grade && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] px-1.5 py-0 font-bold",
                                            course.grade === 'A' || course.grade === 'A-'
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-500/50"
                                                : course.grade.startsWith('B')
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-500/50"
                                                    : course.grade.startsWith('C')
                                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-500/50"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-500/50"
                                        )}
                                    >
                                        {course.grade}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {isInSemester && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-6 w-6 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10",
                                        isEditMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    title={isEditMode ? "Save changes" : "Edit course"}
                                >
                                    {isEditMode ? <Check size={14} /> : <Pencil size={14} />}
                                </Button>
                            )}
                            {isInSemester ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        // Find which semester this course is in
                                        const fromSemester = state.semesters.find(s => s.courses.some(c => c.id === course.id))
                                        if (fromSemester) {
                                            moveCourse(course.id, fromSemester.id, null)
                                        }
                                    }}
                                    title="Move back to tray"
                                >
                                    <Undo2 size={14} />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeCourse(course.id)}
                                    title="Delete course"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Grade selector for courses in semester */}
                    {isInSemester && !isEditMode && (
                        <div className="pt-1 border-t border-border/50">
                            <Select value={course.grade || "none"} onValueChange={handleGradeChange}>
                                <SelectTrigger className="h-7 text-xs bg-muted/30 border-none shadow-none">
                                    <SelectValue placeholder="Select Grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showEditable && (
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50">
                            <Select value={course.credits.toString()} onValueChange={handleCreditsChange}>
                                <SelectTrigger className="h-6 text-[10px] px-1 bg-muted/30 border-none shadow-none">
                                    <SelectValue placeholder="Cred" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2 Credits</SelectItem>
                                    <SelectItem value="4">4 Credits</SelectItem>
                                    <SelectItem value="8">8 Credits</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={course.deptCode || "None"} onValueChange={handleDeptChange}>
                                <SelectTrigger className="h-6 text-[10px] px-1 bg-muted/30 border-none shadow-none">
                                    <SelectValue placeholder="Dept" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="CS">CS</SelectItem>
                                    <SelectItem value="ENT">ENT</SelectItem>
                                    <SelectItem value="ECO">ECO</SelectItem>
                                    <SelectItem value="MATH">MATH</SelectItem>
                                    <SelectItem value="PHY">PHY</SelectItem>
                                    <SelectItem value="HUM">HUM</SelectItem>
                                    <SelectItem value="CW">CW</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={course.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="h-6 text-[10px] px-1 bg-muted/30 border-none shadow-none">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FC">FC</SelectItem>
                                    <SelectItem value="CC">CC</SelectItem>
                                    <SelectItem value="Major">Major</SelectItem>
                                    <SelectItem value="Minor">Minor</SelectItem>
                                    <SelectItem value="Open">Open</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
