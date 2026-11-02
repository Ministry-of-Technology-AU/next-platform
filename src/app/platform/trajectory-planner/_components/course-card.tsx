"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowRightLeft, GripVertical, Pencil, Trash2, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import { toGradeKey } from "@/app/platform/cgpa-planner/utils"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { useCoursePlanner } from "../course-planner-context"
import { COURSE_TYPE_LABEL, GRADE_OPTIONS } from "../data"
import type { Course, CourseLocation } from "../types"
import { COURSE_TYPE_STYLES, gradeLabel, gradeStyle } from "../utils"
import { ActionMenu } from "./action-menu"

interface CourseCardProps {
    course: Course
    location: CourseLocation
    onEdit: (courseId: string) => void
}

/** A course on the board. The whole card drags; the menu is the keyboard and touch route. */
export function CourseCard({ course, location, onEdit }: CourseCardProps) {
    const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: course.id })

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn("touch-manipulation", isDragging && "opacity-40")}
        >
            <CourseCardView course={course} location={location} onEdit={onEdit} />
        </div>
    )
}

/** The card itself, without drag wiring. The drag overlay renders this with `overlay`. */
export function CourseCardView({
    course,
    location,
    onEdit,
    overlay = false,
}: CourseCardProps & { overlay?: boolean }) {
    const inSemester = location !== null

    return (
        <article
            aria-label={course.name}
            className={cn(
                "group flex gap-1.5 rounded-lg border border-border bg-card py-2.5 pl-2 pr-2.5 shadow-xs transition-[box-shadow,border-color] select-none md:pl-1.5",
                "cursor-grab hover:border-primary/30 hover:shadow-md active:cursor-grabbing",
                overlay && "rotate-1 cursor-grabbing border-primary/40 shadow-lg",
            )}
        >
            <GripVertical
                className="mt-0.5 hidden size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground md:block"
                aria-hidden
            />

            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-1">
                    <h4 className="line-clamp-2 min-w-0 flex-1 !text-left !text-sm !font-semibold leading-snug">{course.name}</h4>
                    {!overlay && <CourseMenu course={course} location={location} onEdit={onEdit} />}
                </div>

                <div className="mt-1.5 flex min-h-6 items-center gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", COURSE_TYPE_STYLES[course.type])}>
                            {COURSE_TYPE_LABEL[course.type]}
                        </span>
                        <span className="truncate">
                            {course.deptCode && <>{course.deptCode} · </>}
                            <span className="tabular-nums">{course.credits} cr</span>
                        </span>
                    </div>
                    {inSemester && !overlay && <GradePicker course={course} />}
                    {inSemester && overlay && course.grade && (
                        <span className={cn("rounded-full border px-2 text-xs font-bold", gradeStyle(course.grade))}>{gradeLabel(course.grade)}</span>
                    )}
                </div>
            </div>
        </article>
    )
}

/** Keeps a press on a control inside the card (or in a menu it portals) from starting a drag. */
function stopDrag(e: React.SyntheticEvent) {
    e.stopPropagation()
}
const dragGuard = { onPointerDown: stopDrag, onMouseDown: stopDrag, onTouchStart: stopDrag }

function GradePicker({ course }: { course: Course }) {
    const { updateCourseGrade } = useCoursePlanner()

    return (
        <div {...dragGuard} className="shrink-0">
            <Select
                value={course.grade ?? "none"}
                onValueChange={(value) => {
                    void haptic.select()
                    updateCourseGrade(course.id, toGradeKey(value))
                }}
            >
                <SelectTrigger
                    aria-label={`Grade for ${course.name}`}
                    className={cn(
                        "h-6 min-w-14 cursor-pointer gap-1 rounded-full px-2 py-0 text-xs shadow-none hover:bg-muted [&_svg]:size-3",
                        course.grade && "font-bold",
                        gradeStyle(course.grade ?? undefined),
                    )}
                >
                    {gradeLabel(course.grade) ?? "Grade"}
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">No grade</SelectItem>
                    {GRADE_OPTIONS.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                            {grade}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

function CourseMenu({ course, location, onEdit }: CourseCardProps) {
    const { state, moveCourse, removeCourse, addCourse } = useCoursePlanner()
    const isMobile = useIsMobile()
    // Phones have no Unplaced tray, so a course sent there would vanish from view.
    const canUnplace = location !== null && !isMobile

    const moveTo = (to: CourseLocation) => {
        void haptic.press()
        moveCourse(course.id, location, to)
    }

    const remove = () => {
        void haptic.warn()
        removeCourse(course.id)
        toast(`Deleted ${course.name}`, {
            action: { label: "Undo", onClick: () => addCourse(location, course) },
        })
    }

    return (
        <div {...dragGuard} className="-mr-1 -mt-1 shrink-0">
            <ActionMenu
                label={`Actions for ${course.name}`}
                groups={[
                    {
                        items: [
                            { label: "Edit details", icon: Pencil, onSelect: () => onEdit(course.id) },
                            ...(canUnplace ? [{ label: "Back to unplaced", icon: Undo2, onSelect: () => moveTo(null) }] : []),
                        ],
                    },
                    {
                        submenu: { label: "Move to", icon: ArrowRightLeft, empty: "Add a semester first" },
                        items: state.semesters
                            .filter((s) => s.id !== location)
                            .map((s) => ({ label: s.name, onSelect: () => moveTo(s.id) })),
                    },
                    { items: [{ label: "Delete course", icon: Trash2, destructive: true, onSelect: remove }] },
                ]}
            />
        </div>
    )
}
