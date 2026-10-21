"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { haptic } from "@/lib/haptics"
import { useCoursePlanner } from "../course-planner-context"
import { COURSE_TYPE_OPTIONS, CREDIT_OPTIONS, DEPARTMENT_CODES } from "../data"
import type { Course } from "../types"
import { findCourse } from "../utils"

const NO_DEPT = "none"
const UNTITLED = "Untitled course"

/** Edits a course's name, credits, department and type. Changes apply as you make them. */
export function CourseEditDialog({ courseId, onClose }: { courseId: string | null; onClose: () => void }) {
    const { state } = useCoursePlanner()
    const course = courseId ? findCourse(state, courseId)?.course ?? null : null

    return (
        <Dialog open={course !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit course</DialogTitle>
                    <DialogDescription>Changes save to your plan as you make them.</DialogDescription>
                </DialogHeader>

                {course && <CourseForm key={course.id} course={course} onDone={onClose} />}
            </DialogContent>
        </Dialog>
    )
}

function CourseForm({ course, onDone }: { course: Course; onDone: () => void }) {
    const { updateCourse } = useCoursePlanner()

    // The name is typed into local state and committed on blur, Enter or close. Committing on
    // every keystroke re-rendered the whole board and made typing lag.
    const [name, setName] = useState(course.name)
    const committed = useRef(course.name)
    const draft = useRef(name)
    draft.current = name

    const commitName = () => {
        const next = draft.current.trim() || UNTITLED
        if (next === committed.current) return
        committed.current = next
        updateCourse(course.id, { name: next })
    }
    const commitRef = useRef(commitName)
    commitRef.current = commitName

    // Closing with Escape or the overlay unmounts the form without a blur.
    useEffect(() => () => commitRef.current(), [])

    return (
        <form
            className="grid gap-4"
            onSubmit={(e) => {
                e.preventDefault()
                commitName()
                void haptic.confirm()
                onDone()
            }}
        >
            <div className="grid gap-1.5">
                <Label htmlFor="course-name">Name</Label>
                <Input
                    id="course-name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={commitName}
                    placeholder="Introduction to Computer Science"
                    className="h-11 sm:h-9"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 xs:grid-cols-3">
                <div className="grid gap-1.5">
                    <Label htmlFor="course-credits">Credits</Label>
                    <Select
                        value={String(course.credits)}
                        onValueChange={(value) => {
                            const credits = CREDIT_OPTIONS.find((option) => String(option) === value)
                            if (credits !== undefined) updateCourse(course.id, { credits })
                        }}
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
                        onValueChange={(value) => {
                            if (value === NO_DEPT) updateCourse(course.id, { deptCode: "" })
                            const deptCode = DEPARTMENT_CODES.find((code) => code === value)
                            if (deptCode) updateCourse(course.id, { deptCode })
                        }}
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
                        onValueChange={(value) => {
                            const type = COURSE_TYPE_OPTIONS.find((option) => option.value === value)?.value
                            if (type) updateCourse(course.id, { type })
                        }}
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
    )
}
