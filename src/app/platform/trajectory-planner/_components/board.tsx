"use client"

import { useEffect, useRef, useState } from "react"
import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    rectIntersection,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { useCoursePlanner } from "../course-planner-context"
import type { Course, CourseLocation } from "../types"
import { findCourse, resolveDropLocation } from "../utils"
import { CourseCardView } from "./course-card"
import { CourseTray } from "./course-tray"
import { KeyHint } from "./key-hint"
import { CollapsedSemester, SemesterColumn } from "./semester-column"

/** Column width on phones: most of the screen, with the next column peeking in. */
const MOBILE_COLUMN = "w-[min(85vw,20rem)]"

interface BoardProps {
    onNewCourse: () => void
    onEditCourse: (courseId: string) => void
    onAddSemester: () => void
}

/** The kanban: unplaced courses on the left, one column per semester, scrolling sideways. */
export function Board({ onNewCourse, onEditCourse, onAddSemester }: BoardProps) {
    const { state, moveCourse } = useCoursePlanner()
    const isMobile = useIsMobile()
    const [active, setActive] = useState<{ course: Course; location: CourseLocation } | null>(null)
    const [collapsedIds, setCollapsedIds] = useState<string[]>([])
    const scrollerRef = useRef<HTMLDivElement>(null)

    // Mouse drags after a small move so clicks still work; touch drags after a press-and-hold so the board still scrolls.
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    )

    // Bring a newly added (empty) semester into view. Loading a saved plan or an AMS import
    // also changes the count, but those add several semesters at once, with courses in them.
    const semesterCount = state.semesters.length
    const lastSemesterEmpty = state.semesters[semesterCount - 1]?.courses.length === 0
    const previousCount = useRef(semesterCount)
    useEffect(() => {
        if (semesterCount === previousCount.current + 1 && lastSemesterEmpty) {
            const scroller = scrollerRef.current
            scroller?.scrollTo({ left: scroller.scrollWidth, behavior: "smooth" })
        }
        previousCount.current = semesterCount
    }, [semesterCount, lastSemesterEmpty])

    const toggleCollapsed = (id: string) => {
        setCollapsedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
    }

    const handleDragStart = ({ active: dragged }: DragStartEvent) => {
        const hit = findCourse(state, String(dragged.id))
        if (!hit) return
        setActive(hit)
        void haptic.tap()
    }

    const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
        setActive(null)
        if (!over) return

        const courseId = String(dragged.id)
        const overId = String(over.id)
        const from = findCourse(state, courseId)
        const to = resolveDropLocation(state, overId)
        if (!from || to === undefined) return

        // Dropped on a course in a semester: land at its position. Otherwise: end of the list.
        const destination = to === null ? null : state.semesters.find((s) => s.id === to)
        const overIndex = destination ? destination.courses.findIndex((c) => c.id === overId) : -1
        const index = overIndex === -1 ? undefined : overIndex

        if (from.location === to && (index === undefined || overId === courseId)) return

        moveCourse(courseId, from.location, to, index)
        void haptic.press()
    }

    const tray = <CourseTray onNewCourse={onNewCourse} onEditCourse={onEditCourse} />

    return (
        <DndContext
            id="trajectory-planner-dnd"
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActive(null)}
        >
            <div className="flex h-[calc(100dvh-5rem)] min-h-[28rem] gap-4 md:h-[calc(100dvh-7rem)]">
                {!isMobile && <div className="w-64 shrink-0">{tray}</div>}

                <div
                    ref={scrollerRef}
                    role="region"
                    aria-label="Semesters"
                    tabIndex={0}
                    className={cn(
                        // `relative` keeps absolutely positioned bits (sr-only labels, hidden selects) clipped
                        // by this scroller; without it they widen the whole page on phones.
                        "relative flex min-w-0 flex-1 gap-3 overflow-x-auto overscroll-x-contain pb-3 md:gap-4",
                        // Snap between columns on phones, but not mid-drag, where it fights auto-scroll.
                        isMobile && !active && "snap-x snap-mandatory",
                    )}
                >
                    {isMobile && <div className={cn(MOBILE_COLUMN, "shrink-0 snap-start")}>{tray}</div>}

                    {state.semesters.map((semester, index) =>
                        collapsedIds.includes(semester.id) ? (
                            <CollapsedSemester key={semester.id} semester={semester} onExpand={() => toggleCollapsed(semester.id)} />
                        ) : (
                            <div key={semester.id} className={cn("shrink-0 snap-start", isMobile ? MOBILE_COLUMN : "w-72")}>
                                <SemesterColumn
                                    semester={semester}
                                    isFirst={index === 0}
                                    onCollapse={() => toggleCollapsed(semester.id)}
                                    onEditCourse={onEditCourse}
                                />
                            </div>
                        ),
                    )}

                    <TourStep
                        id="trajectory-add-semester"
                        title="Add a semester"
                        content="Add as many semesters as your degree needs, including summer terms. Rename one by pressing its name."
                        order={70}
                        position="left"
                        className="h-full shrink-0 snap-start"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={onAddSemester}
                                    className="flex h-full w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-current">
                                        <Plus className="size-5" aria-hidden />
                                    </span>
                                    Add semester
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="flex items-center gap-2">
                                Add a semester at the end <KeyHint>A</KeyHint>
                            </TooltipContent>
                        </Tooltip>
                    </TourStep>
                </div>
            </div>

            <DragOverlay>
                {active && <CourseCardView course={active.course} location={active.location} onEdit={onEditCourse} overlay />}
            </DragOverlay>
        </DndContext>
    )
}
