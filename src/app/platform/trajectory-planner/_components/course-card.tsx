"use client"

import type React from "react"
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Course, Credits, CourseType, DepartmentCode } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCoursePlanner } from "../course-planner-context"
import { cn } from "@/lib/utils"
import { GripVertical, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
    course: Course
    isDragging?: boolean
}

export function CourseCard({ course, isDragging }: CourseCardProps) {
    const { updateCourse, removeCourse } = useCoursePlanner()
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: course.id })

    const [isEditMode, setIsEditMode] = useState(false)

    const isInSemester = course.isInSemester || false
    const showEditable = !isInSemester || isEditMode

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
            case "Open Credits":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div ref={setNodeRef} style={style} className={cn("group relative", isDragging && "opacity-50")}>
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
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {course.deptCode}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary">
                                    {course.credits} Credits
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {isInSemester && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    onClick={() => setIsEditMode(!isEditMode)}
                                >
                                    <Pencil size={14} />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeCourse(course.id)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>

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
                                    <SelectItem value="Open Credits">Open</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
