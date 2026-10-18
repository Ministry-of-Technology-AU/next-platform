"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { haptic } from "@/lib/haptics"
import { AmsImportDialog } from "./_components/ams-import-dialog"
import { Board } from "./_components/board"
import { ContactRepsDialog } from "./_components/contact-reps-dialog"
import { CourseEditDialog } from "./_components/course-edit-dialog"
import { IdealTrajectoryDialog } from "./_components/ideal-trajectory-dialog"
import { SummaryBreakdown, SummaryStats } from "./_components/plan-summary"
import { ShareTrajectoryDialog } from "./_components/share-trajectory-dialog"
import { ShortcutsDialog } from "./_components/shortcuts-dialog"
import { ActionBar, DegreePicker, SaveButton } from "./_components/toolbar"
import { TrajectoryRepositoryDialog } from "./_components/trajectory-repository-dialog"
import { CoursePlannerProvider, useCoursePlanner } from "./course-planner-context"
import { STORAGE_KEYS } from "./data"
import type { CoursePlannerState, PlannerDialog } from "./types"
import { useSaveTrajectory } from "./use-save"
import { useDegreeTemplates } from "./use-templates"
import { isTypingTarget, pluralise, readStorage, writeStorage } from "./utils"

export function TrajectoryPlannerClient({ initialData }: { initialData: CoursePlannerState | null }) {
    return (
        <CoursePlannerProvider initialData={initialData}>
            <Planner />
        </CoursePlannerProvider>
    )
}

function Planner() {
    const { state, addCourse, addSemester, selectedDegreeId, setSelectedDegree } = useCoursePlanner()
    const { degreeTemplates, idealTrajectories } = useDegreeTemplates()
    const { isSaving, save } = useSaveTrajectory()

    const [dialog, setDialog] = useState<PlannerDialog | null>(null)
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
    const [breakdownOpen, setBreakdownOpen] = useState(false)

    useEffect(() => {
        setBreakdownOpen(readStorage<boolean>(STORAGE_KEYS.breakdownOpen) ?? false)
    }, [])

    const toggleBreakdown = useCallback((open: boolean) => {
        setBreakdownOpen(open)
        writeStorage(STORAGE_KEYS.breakdownOpen, open)
    }, [])

    const template = degreeTemplates.find((t) => t.id === selectedDegreeId)
    const trajectory = idealTrajectories.find((t) => t.templateId === selectedDegreeId)

    const newCourse = useCallback(() => {
        const id = uuidv4()
        addCourse(null, { id, name: "New course", credits: 4, deptCode: "", type: "Major" })
        setEditingCourseId(id)
        void haptic.press()
    }, [addCourse])

    const newSemester = useCallback(() => {
        addSemester()
        void haptic.press()
    }, [addSemester])

    const openDialog = (next: PlannerDialog | null) => setDialog(next)
    const dialogProps = (name: PlannerDialog) => ({
        open: dialog === name,
        onOpenChange: (open: boolean) => openDialog(open ? name : null),
    })

    // Bare-key shortcuts. They stay out of the way while typing, in a dialog or in an open menu.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
            if (dialog !== null || editingCourseId !== null) return
            if (e.target instanceof Element && e.target.closest('[role="menu"], [role="listbox"], [role="dialog"]')) return

            const key = e.key.toLowerCase()
            if (key === "n") newCourse()
            else if (key === "a") newSemester()
            else if (key === "s") void save()
            else if (key === "b") toggleBreakdown(!breakdownOpen)
            else if (key === "?") setDialog("shortcuts")
            else if (key === "i") {
                if (template) setDialog("ideal")
                else toast("Pick your degree template first to see its ideal trajectory.")
            } else return
            e.preventDefault()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [dialog, editingCourseId, newCourse, newSemester, save, toggleBreakdown, breakdownOpen, template])

    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="gap-0 p-4 shadow-sm sm:p-5">
                <Collapsible open={breakdownOpen} onOpenChange={toggleBreakdown}>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <DegreePicker templates={degreeTemplates} value={selectedDegreeId ?? ""} onChange={setSelectedDegree} />
                        <SummaryStats breakdownOpen={breakdownOpen} />
                        <SaveButton isSaving={isSaving} onSave={() => void save()} />
                    </div>
                    <CollapsibleContent className="pt-4">
                        <SummaryBreakdown />
                    </CollapsibleContent>
                </Collapsible>
                <div className="mt-4 border-t border-border pt-3">
                    <ActionBar template={template} semesterCount={state.semesters.length} onOpen={openDialog} />
                </div>
            </Card>

            <Board onNewCourse={newCourse} onEditCourse={setEditingCourseId} onAddSemester={newSemester} />

            <CourseEditDialog courseId={editingCourseId} onClose={() => setEditingCourseId(null)} />
            <IdealTrajectoryDialog {...dialogProps("ideal")} template={template} trajectory={trajectory} />
            <AmsImportDialog {...dialogProps("ams")} />
            <ContactRepsDialog {...dialogProps("reps")} />
            <ShortcutsDialog {...dialogProps("shortcuts")} />
            <ShareTrajectoryDialog {...dialogProps("share")} semesters={state.semesters} />
            <TrajectoryRepositoryDialog
                {...dialogProps("repository")}
                onImportCourses={(courses) => {
                    courses.forEach((course) => addCourse(null, { ...course, id: uuidv4() }))
                    void haptic.confirm()
                    toast.success(`Added ${pluralise(courses.length, "course")} to Unplaced`)
                }}
            />
        </div>
    )
}
