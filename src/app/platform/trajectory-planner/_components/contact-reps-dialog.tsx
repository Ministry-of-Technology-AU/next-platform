"use client"

import { Copy, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { haptic } from "@/lib/haptics"
import { DEPARTMENT_REPS } from "../data"

function copyEmail(email: string) {
    void navigator.clipboard
        .writeText(email)
        .then(() => {
            void haptic.confirm()
            toast.success(`Copied ${email}`)
        })
        .catch(() => {
            void haptic.error()
            toast.error("Couldn't copy. Select the address and copy it yourself.")
        })
}

/** Department representatives, searchable. Enter copies the selected rep's email. */
export function ContactRepsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} title="Contact department reps" description="Search for a department">
            <CommandInput placeholder="Search departments" />
            <CommandList>
                <CommandEmpty>No department matches that.</CommandEmpty>
                <CommandGroup heading="Department representatives">
                    {DEPARTMENT_REPS.map((rep) => (
                        <CommandItem key={rep.dept} value={rep.dept} onSelect={() => copyEmail(rep.email)} className="gap-2">
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">{rep.dept}</span>
                                <span className="block truncate text-xs text-muted-foreground">{rep.email}</span>
                            </span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Copy ${rep.email}`}
                                        className="size-9 cursor-pointer hover:bg-background"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            copyEmail(rep.email)
                                        }}
                                    >
                                        <Copy />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy email address</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild className="size-9 cursor-pointer text-primary hover:bg-background dark:text-primary-extralight">
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(rep.email)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Email ${rep.dept} reps in Gmail`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                void haptic.tap()
                                            }}
                                        >
                                            <Mail />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Write an email in Gmail</TooltipContent>
                            </Tooltip>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
