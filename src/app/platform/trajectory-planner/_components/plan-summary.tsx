"use client"

import { ChevronDown } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import { Button } from "@/components/ui/button"
import { CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { useCoursePlanner } from "../course-planner-context"
import { CREDIT_CATEGORIES } from "../data"
import { formatGPA } from "../utils"
import { KeyHint } from "./key-hint"

function Stat({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
    return (
        <div className="flex items-baseline gap-2">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
            <dd
                className={cn(
                    "font-heading text-2xl font-bold tabular-nums leading-none",
                    emphasis && "text-primary dark:text-primary-extralight",
                )}
            >
                {value}
            </dd>
        </div>
    )
}

/** The always-visible line: CGPA, credits so far, and the breakdown toggle. */
export function SummaryStats({ breakdownOpen }: { breakdownOpen: boolean }) {
    const { getCGPA, getCreditsByType } = useCoursePlanner()
    const cgpa = getCGPA()
    const credits = getCreditsByType()

    return (
        <TourStep
            id="trajectory-summary"
            title="Your progress"
            content="Your CGPA and the credits in your semesters. Open Breakdown to see credits by type and each semester's GPA."
            order={20}
            position="bottom"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6"
        >
            <dl className="flex items-center gap-x-4 sm:gap-x-6">
                <Stat label="CGPA" value={cgpa === null ? "--" : formatGPA(cgpa)} emphasis />
                <Stat label="Credits" value={String(credits.total)} />
            </dl>

            <Tooltip>
                <TooltipTrigger asChild>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-9 cursor-pointer gap-1 px-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:ml-0"
                            onClick={() => void haptic.tap()}
                        >
                            Breakdown
                            <ChevronDown className={cn("transition-transform duration-200", breakdownOpen && "rotate-180")} />
                        </Button>
                    </CollapsibleTrigger>
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2">
                    {breakdownOpen ? "Hide" : "Show"} credits by type and semester GPAs <KeyHint>B</KeyHint>
                </TooltipContent>
            </Tooltip>
        </TourStep>
    )
}

/** Credits by course type and each semester's GPA. Lives inside the collapsible. */
export function SummaryBreakdown() {
    const { state, getCreditsByType, getSemesterGPA } = useCoursePlanner()
    const credits = getCreditsByType()
    const semesterGPAs = state.semesters
        .map((semester) => ({ id: semester.id, name: semester.name, gpa: getSemesterGPA(semester.id) }))
        .filter((s): s is { id: string; name: string; gpa: number } => s.gpa !== null)

    return (
        <div className="grid gap-5 border-t border-border pt-4 lg:grid-cols-[auto_1fr] lg:gap-10">
            <div>
                <p className="text-xs text-muted-foreground">Credits by type</p>
                <dl className="mt-1.5 grid grid-cols-3 gap-x-6 gap-y-2 sm:grid-cols-6">
                    {CREDIT_CATEGORIES.map(({ key, label }) => (
                        <div key={key}>
                            <dt className="text-xs text-muted-foreground">{label}</dt>
                            <dd className="text-sm font-bold tabular-nums">{credits[key]}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div>
                <p className="text-xs text-muted-foreground">Semester GPAs</p>
                {semesterGPAs.length > 0 ? (
                    <ul className="mt-1.5 flex flex-wrap gap-2">
                        {semesterGPAs.map((s) => (
                            <li key={s.id} className="rounded-md bg-muted px-2 py-1 text-xs">
                                {s.name} <span className="font-bold tabular-nums">{formatGPA(s.gpa)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-1.5 text-sm text-muted-foreground">Add grades to courses in your semesters to see GPAs here.</p>
                )}
            </div>

            <p className="text-xs text-muted-foreground lg:col-span-2">
                Credits count every course placed in a semester, graded or still planned. A course graded F earns none.
            </p>
        </div>
    )
}
