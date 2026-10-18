"use client"

import { Plus } from "lucide-react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { useCoursePlanner } from "../course-planner-context"
import type { IdealTrajectory, IdealTrajectorySemester } from "../templates"
import type { Course, DegreeTemplate } from "../types"
import { pluralise } from "../utils"

type CourseDraft = Omit<Course, "id">

const TERMS = [
    { label: "Monsoon", parity: 1, tone: "bg-secondary/25" },
    { label: "Spring", parity: 0, tone: "bg-blue/10" },
] as const

/** The recommended course order for a degree. Courses go to Unplaced, one at a time or a semester at once. */
export function IdealTrajectoryDialog({
    open,
    onOpenChange,
    template,
    trajectory,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    template: DegreeTemplate | undefined
    trajectory: IdealTrajectory | undefined
}) {
    const { addCourse } = useCoursePlanner()

    const add = (courses: CourseDraft[]) => {
        courses.forEach((course) => addCourse(null, { ...course, id: uuidv4() }))
        void haptic.confirm()
        toast.success(courses.length === 1 ? `Added ${courses[0]?.name ?? "course"} to Unplaced` : `Added ${pluralise(courses.length, "course")} to Unplaced`)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85dvh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ideal trajectory{template ? `: ${template.name}` : ""}</DialogTitle>
                    <DialogDescription>
                        {trajectory
                            ? "The recommended order of courses. Press Add to put a course in Unplaced, or Add all for a whole semester."
                            : "There is no semester-by-semester plan for this degree yet. These are the courses it requires."}
                    </DialogDescription>
                </DialogHeader>

                {trajectory ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {TERMS.map((term) => (
                            <div key={term.label} className="space-y-3">
                                <h3 className={cn("rounded-md px-3 py-2 !text-left !text-sm !font-semibold", term.tone)}>{term.label} semesters</h3>
                                {trajectory.semesters
                                    .filter((s) => s.semester % 2 === term.parity)
                                    .map((semester) => (
                                        <SemesterBlock key={semester.semester} semester={semester} onAdd={add} />
                                    ))}
                            </div>
                        ))}
                    </div>
                ) : template ? (
                    <CourseList title="Required courses" courses={template.defaultCourses} onAdd={add} />
                ) : null}

                {trajectory?.notes && <p className="text-sm text-muted-foreground">{trajectory.notes}</p>}
                <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                    The official policy document has the final word on requirements.
                </p>
            </DialogContent>
        </Dialog>
    )
}

function SemesterBlock({ semester, onAdd }: { semester: IdealTrajectorySemester; onAdd: (courses: CourseDraft[]) => void }) {
    if (semester.courses.length === 0) {
        return (
            <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-sm font-medium">{semester.name}</p>
                <p className="text-sm text-muted-foreground">Electives, open credits or foundation courses</p>
            </div>
        )
    }
    return <CourseList title={semester.name} courses={semester.courses} onAdd={onAdd} />
}

function CourseList({ title, courses, onAdd }: { title: string; courses: CourseDraft[]; onAdd: (courses: CourseDraft[]) => void }) {
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between gap-2 bg-muted/60 px-3 py-1.5">
                <span className="text-sm font-medium">{title}</span>
                <Button variant="ghost" size="sm" className="h-8 cursor-pointer gap-1 hover:bg-background" onClick={() => onAdd(courses)}>
                    <Plus /> Add all
                </Button>
            </div>
            <ul className="divide-y divide-border">
                {courses.map((course, index) => (
                    <li key={`${course.name}-${index}`} className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm">
                        <span>
                            {course.name}
                            <span className="ml-1 text-xs text-muted-foreground">{course.credits} cr</span>
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Add ${course.name}`}
                            className="h-8 cursor-pointer gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:text-primary-extralight"
                            onClick={() => onAdd([course])}
                        >
                            <Plus /> Add
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
