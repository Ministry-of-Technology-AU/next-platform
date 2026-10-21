"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
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
import { ScratchpadSheet } from "./_components/scratchpad"
import { ShortcutsDialog } from "./_components/shortcuts-dialog"
import { ActionBar, DegreePicker, SaveButton } from "./_components/toolbar"
import { TrajectoryRepositoryDialog } from "./_components/trajectory-repository-dialog"
import { CoursePlannerProvider, useCoursePlanner } from "./course-planner-context"
import { STORAGE_KEYS } from "./data"
import type { CoursePlannerState, PlannerDialog, TemplatesPayload } from "./types"
import { useTrajectorySync } from "./use-save"
import { isTypingTarget, pluralise, readStorage, writeStorage } from "./utils"

interface TrajectoryPlannerClientProps {
    /** The plan saved in the student's account, or null when there is none (or it didn't load). */
    initialData: CoursePlannerState | null
    /** Set when the account copy failed to load. Auto-save stays off so it can't overwrite it. */
    initialError: string | null
    templates: TemplatesPayload
}

export function TrajectoryPlannerClient({ initialData, initialError, templates }: TrajectoryPlannerClientProps) {
    return (
        <CoursePlannerProvider initialData={initialData}>
            <Planner initialData={initialData} initialError={initialError} templates={templates} />
        </CoursePlannerProvider>
    )
}

function Planner({ initialData, initialError, templates: { degreeTemplates, idealTrajectories } }: TrajectoryPlannerClientProps) {
    const { state, addCourse, addSemester, selectedDegreeId, setSelectedDegree } = useCoursePlanner()
    const sync = useTrajectorySync(initialData, initialError !== null)
    const { saveNow } = sync

    useEffect(() => {
        if (initialError) toast.error(initialError)
    }, [initialError])

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
        const id = crypto.randomUUID()
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
            else if (key === "s") void saveNow()
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
    }, [dialog, editingCourseId, newCourse, newSemester, saveNow, toggleBreakdown, breakdownOpen, template])

    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="gap-0 p-4 shadow-sm sm:p-5">
                <Collapsible open={breakdownOpen} onOpenChange={toggleBreakdown}>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <DegreePicker templates={degreeTemplates} value={selectedDegreeId ?? ""} onChange={setSelectedDegree} />
                        <SummaryStats breakdownOpen={breakdownOpen} />
                        <SaveButton status={sync.status} paused={initialError !== null} lastSavedAt={sync.lastSavedAt} onSave={() => void saveNow()} />
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
            <ScratchpadSheet {...dialogProps("scratchpad")} />
            <ShareTrajectoryDialog {...dialogProps("share")} semesters={state.semesters} />
            <TrajectoryRepositoryDialog
                {...dialogProps("repository")}
                onImportCourses={(courses) => {
                    courses.forEach((course) => addCourse(null, { ...course, id: crypto.randomUUID() }))
                    void haptic.confirm()
                    toast.success(`Added ${pluralise(courses.length, "course")} to Unplaced`)
                }}
            />
        </div>
    )
}
