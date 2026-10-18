"use client"

import type { ReactNode } from "react"
import { BookOpen, Contact, FileText, Keyboard, Map, Save, Share2, Upload, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { TourStep } from "@/components/guided-tour"
import { Button } from "@/components/ui/button"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
} from "@/components/ui/shadcn-io/combobox"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { MIN_SEMESTERS_TO_SHARE } from "../data"
import type { DegreeTemplate, PlannerDialog } from "../types"
import { KeyHint } from "./key-hint"

export function DegreePicker({
    templates,
    value,
    onChange,
}: {
    templates: DegreeTemplate[]
    value: string
    onChange: (id: string) => void
}) {
    return (
        <TourStep
            id="trajectory-degree"
            title="Pick your degree template"
            content="Choose your major and batch. The ideal trajectory and policy document come from this choice."
            order={10}
            position="bottom"
            className="w-full sm:w-72"
        >
            <Combobox
                data={templates.map((t) => ({ label: t.name, value: t.id }))}
                value={value}
                onValueChange={(id) => {
                    void haptic.select()
                    onChange(id)
                }}
                type="degree template"
            >
                <ComboboxTrigger className="h-10 w-full cursor-pointer border-border" />
                <ComboboxContent>
                    <ComboboxInput />
                    <ComboboxList>
                        <ComboboxEmpty />
                        <ComboboxGroup>
                            {templates.map((template) => (
                                <ComboboxItem key={template.id} value={template.id}>
                                    {template.name}
                                </ComboboxItem>
                            ))}
                        </ComboboxGroup>
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </TourStep>
    )
}

export function SaveButton({ isSaving, onSave }: { isSaving: boolean; onSave: () => void }) {
    return (
        <TourStep
            id="trajectory-save"
            title="Save your plan"
            content="Your plan stays on this device as you work. Press Save to keep it in your account so it opens on any device."
            order={40}
            position="bottom"
            className="ml-auto"
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={onSave} disabled={isSaving} aria-busy={isSaving} className="h-10 min-w-24 cursor-pointer gap-1.5">
                        {isSaving ? <Spinner className="size-4" /> : <Save />}
                        {isSaving ? "Saving" : "Save"}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2">
                    Save to your account <KeyHint>S</KeyHint>
                </TooltipContent>
            </Tooltip>
        </TourStep>
    )
}

// Icon-only squares on phones (the label stays for screen readers), icon and label from `sm` up.
const BAR_BUTTON =
    "size-11 shrink-0 cursor-pointer gap-1.5 border-border bg-background px-0 shadow-xs hover:border-primary/30 hover:bg-muted active:scale-[0.97] dark:border-input sm:h-9 sm:w-auto sm:px-3"

interface BarButtonProps {
    icon: LucideIcon
    label: string
    tip: ReactNode
    onClick: () => void
    /** Shown as a toast instead of running, so the reason reaches touch users too. */
    blockedReason?: string
}

function BarButton({ icon: Icon, label, tip, onClick, blockedReason }: BarButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    aria-disabled={blockedReason !== undefined}
                    onClick={() => {
                        if (blockedReason) {
                            void haptic.error()
                            toast(blockedReason)
                            return
                        }
                        void haptic.tap()
                        onClick()
                    }}
                    className={cn(BAR_BUTTON, blockedReason && "cursor-not-allowed opacity-50 hover:border-border hover:bg-background active:scale-100")}
                >
                    <Icon className="text-primary dark:text-white" aria-hidden />
                    <span className="sr-only sm:not-sr-only">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2">{blockedReason ?? tip}</TooltipContent>
        </Tooltip>
    )
}

interface ActionBarProps {
    template: DegreeTemplate | undefined
    semesterCount: number
    onOpen: (dialog: PlannerDialog) => void
}

/** Every secondary action, in plain sight but quieter than Save. Scrolls sideways on phones. */
export function ActionBar({ template, semesterCount, onOpen }: ActionBarProps) {
    const canShare = semesterCount >= MIN_SEMESTERS_TO_SHARE

    return (
        <div className="relative -mx-4 flex items-center justify-between gap-1.5 overflow-x-auto sm:gap-2 px-4 py-0.5 sm:-mx-5 sm:justify-start sm:px-5">
            <TourStep
                id="trajectory-import"
                title="Bring in courses"
                content="Add courses from your degree's ideal trajectory, fill past semesters from your AMS grade report, or browse trajectories other students shared."
                order={30}
                position="bottom"
                className="flex shrink-0 items-center gap-1.5 sm:gap-2"
            >
                <BarButton
                    icon={Map}
                    label="Ideal trajectory"
                    tip={<>The recommended course order for your degree <KeyHint>I</KeyHint></>}
                    onClick={() => onOpen("ideal")}
                    blockedReason={template ? undefined : "Pick your degree template first to see its ideal trajectory."}
                />
                <BarButton
                    icon={Upload}
                    label="Import from AMS"
                    tip="Replaces your semesters with the grades in your AMS report"
                    onClick={() => onOpen("ams")}
                />
                <BarButton
                    icon={BookOpen}
                    label="Browse trajectories"
                    tip="See plans other students shared and copy their courses"
                    onClick={() => onOpen("repository")}
                />
            </TourStep>

            <Separator orientation="vertical" className="mx-0.5 !h-5 shrink-0 sm:mx-1" />

            <TourStep
                id="trajectory-share"
                title="Share and get help"
                content="Share your trajectory once it has six semesters, email your department reps, or open the policy document. Press ? to see the keyboard shortcuts."
                order={80}
                position="bottom"
                className="flex shrink-0 items-center gap-1.5 sm:gap-2"
            >
                <BarButton
                    icon={Share2}
                    label="Share trajectory"
                    tip="Publish your plan for other students to browse"
                    onClick={() => onOpen("share")}
                    blockedReason={
                        canShare ? undefined : `Sharing needs at least ${MIN_SEMESTERS_TO_SHARE} semesters. You have ${semesterCount}.`
                    }
                />
                <BarButton
                    icon={Contact}
                    label="Contact reps"
                    tip="Email addresses for each department's student reps"
                    onClick={() => onOpen("reps")}
                />
                {template?.policyDocPath && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" asChild className={BAR_BUTTON}>
                                <a href={template.policyDocPath} target="_blank" rel="noopener noreferrer" onClick={() => void haptic.tap()}>
                                    <FileText className="text-primary dark:text-white" aria-hidden />
                                    <span className="sr-only sm:not-sr-only">Policy document</span>
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Opens your degree&apos;s policy document in a new tab</TooltipContent>
                    </Tooltip>
                )}
            </TourStep>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Keyboard shortcuts"
                        className="ml-auto hidden size-9 shrink-0 cursor-pointer text-muted-foreground sm:inline-flex hover:bg-muted hover:text-foreground"
                        onClick={() => {
                            void haptic.tap()
                            onOpen("shortcuts")
                        }}
                    >
                        <Keyboard />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2">
                    Keyboard shortcuts <KeyHint>?</KeyHint>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}
