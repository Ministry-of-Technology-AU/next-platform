"use client"

import { useEffect, useRef, useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { AlertCircle, ChevronsLeftRight, ChevronsRightLeft, Pencil, Trash2 } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { useCoursePlanner } from "../course-planner-context"
import { MIN_SEMESTER_CREDITS } from "../data"
import type { Semester } from "../types"
import { formatGPA, pluralise } from "../utils"
import { ActionMenu } from "./action-menu"
import { CourseCard } from "./course-card"

interface SemesterColumnProps {
    semester: Semester
    isFirst: boolean
    onCollapse: () => void
    onEditCourse: (courseId: string) => void
}

export function SemesterColumn({ semester, isFirst, onCollapse, onEditCourse }: SemesterColumnProps) {
    const { summary, deleteSemester } = useCoursePlanner()
    const { setNodeRef, isOver } = useDroppable({ id: semester.id })
    const [renaming, setRenaming] = useState(false)

    const credits = summary.semesters[semester.id]?.credits ?? 0
    const gpa = summary.semesters[semester.id]?.gpa ?? null
    const underLoad = credits < MIN_SEMESTER_CREDITS && semester.courses.length > 0

    const column = (
        <section
            ref={setNodeRef}
            aria-label={semester.name}
            className={cn(
                "flex h-full flex-col rounded-xl border bg-muted/30 transition-colors",
                isOver ? "border-primary/50 bg-primary/5" : "border-border",
            )}
        >
            <header className="flex items-start gap-2 border-b border-border p-3">
                <div className="min-w-0 flex-1">
                    {renaming ? (
                        <RenameInput semester={semester} onDone={() => setRenaming(false)} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setRenaming(true)}
                            className="group/name relative -mx-1 flex max-w-full cursor-text items-center gap-1.5 rounded px-1 text-left hover:bg-muted"
                        >
                            <h3 className="truncate !text-left !text-sm !font-bold">{semester.name}</h3>
                            <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/name:opacity-100 group-focus-visible/name:opacity-100" aria-hidden />
                            <span className="sr-only">Rename</span>
                        </button>
                    )}
                    <p className="mt-1 flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                        <span className={cn("inline-flex items-center gap-1", underLoad && "font-medium text-destructive")}>
                            {underLoad && <AlertCircle className="size-3.5" aria-hidden />}
                            {pluralise(credits, "credit")}
                            {underLoad && <span>(min {MIN_SEMESTER_CREDITS})</span>}
                        </span>
                        {gpa !== null && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary dark:text-primary-extralight">
                                GPA {formatGPA(gpa)}
                            </span>
                        )}
                    </p>
                </div>

                <ActionMenu
                    label={`Actions for ${semester.name}`}
                    className="-mr-1.5"
                    groups={[
                        {
                            items: [
                                { label: "Rename", icon: Pencil, onSelect: () => setRenaming(true) },
                                { label: "Collapse", icon: ChevronsRightLeft, onSelect: onCollapse },
                            ],
                        },
                        {
                            items: [
                                {
                                    label: "Delete semester",
                                    description: "Its courses go back to unplaced",
                                    icon: Trash2,
                                    destructive: true,
                                    onSelect: () => {
                                        void haptic.warn()
                                        deleteSemester(semester.id)
                                    },
                                },
                            ],
                        },
                    ]}
                />
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto p-2">
                <SortableContext items={semester.courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {semester.courses.map((course) => (
                        <CourseCard key={course.id} course={course} location={semester.id} onEdit={onEditCourse} />
                    ))}
                </SortableContext>
                {semester.courses.length === 0 && (
                    <p className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-border px-4 text-center text-xs text-muted-foreground">
                        Drag courses here
                    </p>
                )}
            </div>
        </section>
    )

    if (!isFirst) return column

    return (
        <TourStep
            id="trajectory-semester"
            title="Your semesters"
            content="Drag courses into a semester, or use a course's menu to move it. Each semester shows its credits and, once you add grades, its GPA."
            order={60}
            position="right"
            className="h-full"
        >
            {column}
        </TourStep>
    )
}

function RenameInput({ semester, onDone }: { semester: Semester; onDone: () => void }) {
    const { updateSemester } = useCoursePlanner()
    const [name, setName] = useState(semester.name)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.select()
    }, [])

    const save = () => {
        const trimmed = name.trim()
        if (trimmed && trimmed !== semester.name) updateSemester(semester.id, { name: trimmed })
        onDone()
    }

    return (
        <Input
            ref={inputRef}
            autoFocus
            aria-label="Semester name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
                if (e.key === "Enter") save()
                if (e.key === "Escape") onDone()
            }}
            className="h-7 px-1.5 text-sm font-bold"
        />
    )
}

/** A collapsed semester: a narrow rail that still shows its name and credits. Press to expand. */
export function CollapsedSemester({ semester, onExpand }: { semester: Semester; onExpand: () => void }) {
    const credits = useCoursePlanner().summary.semesters[semester.id]?.credits ?? 0

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={() => {
                        void haptic.tap()
                        onExpand()
                    }}
                    aria-label={`Expand ${semester.name}`}
                    className="flex h-full w-11 shrink-0 cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                >
                    <ChevronsLeftRight className="size-4" aria-hidden />
                    <span className="text-xs font-semibold [writing-mode:vertical-rl]">{semester.name}</span>
                    <span className="text-[11px] tabular-nums">{credits} cr</span>
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Expand {semester.name}</TooltipContent>
        </Tooltip>
    )
}
