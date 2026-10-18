"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { haptic } from "@/lib/haptics"
import { useCoursePlanner } from "../course-planner-context"
import { COURSE_TYPE_OPTIONS, CREDIT_OPTIONS, DEPARTMENT_CODES } from "../data"
import type { CourseType, Credits, DepartmentCode } from "../types"
import { findCourse } from "../utils"

const NO_DEPT = "none"

/** Edits a course's name, credits, department and type. Changes apply as you make them. */
export function CourseEditDialog({ courseId, onClose }: { courseId: string | null; onClose: () => void }) {
    const { state, updateCourse } = useCoursePlanner()
    const course = courseId ? findCourse(state, courseId)?.course ?? null : null

    const close = () => {
        if (course && !course.name.trim()) updateCourse(course.id, { name: "Untitled course" })
        onClose()
    }

    return (
        <Dialog open={course !== null} onOpenChange={(open) => !open && close()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit course</DialogTitle>
                    <DialogDescription>Changes save to your plan as you make them.</DialogDescription>
                </DialogHeader>

                {course && (
                    <form
                        className="grid gap-4"
                        onSubmit={(e) => {
                            e.preventDefault()
                            void haptic.confirm()
                            close()
                        }}
                    >
                        <div className="grid gap-1.5">
                            <Label htmlFor="course-name">Name</Label>
                            <Input
                                id="course-name"
                                autoFocus
                                value={course.name}
                                onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                                placeholder="Introduction to Computer Science"
                                className="h-11 sm:h-9"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 xs:grid-cols-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="course-credits">Credits</Label>
                                <Select
                                    value={String(course.credits)}
                                    onValueChange={(value) => updateCourse(course.id, { credits: Number(value) as Credits })}
                                >
                                    <SelectTrigger id="course-credits" className="h-11 w-full cursor-pointer sm:h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CREDIT_OPTIONS.map((credits) => (
                                            <SelectItem key={credits} value={String(credits)}>
                                                {credits} credits
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="course-dept">Department</Label>
                                <Select
                                    value={course.deptCode || NO_DEPT}
                                    onValueChange={(value) =>
                                        updateCourse(course.id, { deptCode: value === NO_DEPT ? "" : (value as DepartmentCode) })
                                    }
                                >
                                    <SelectTrigger id="course-dept" className="h-11 w-full cursor-pointer sm:h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NO_DEPT}>None</SelectItem>
                                        {DEPARTMENT_CODES.map((code) => (
                                            <SelectItem key={code} value={code}>
                                                {code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="course-type">Counts as</Label>
                                <Select
                                    value={course.type}
                                    onValueChange={(value) => updateCourse(course.id, { type: value as CourseType })}
                                >
                                    <SelectTrigger id="course-type" className="h-11 w-full cursor-pointer sm:h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURSE_TYPE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="h-11 cursor-pointer sm:h-9">
                                Done
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
