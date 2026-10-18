"use client"

import { useRef, useState } from "react"
import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

export interface ActionItem {
    label: string
    icon?: LucideIcon
    description?: string
    destructive?: boolean
    disabled?: boolean
    onSelect: () => void
}

/** Items shown together. A `submenu` group is a side menu on desktop and a labelled section on phones. */
export interface ActionGroup {
    items: ActionItem[]
    submenu?: { label: string; icon: LucideIcon; empty: string }
}

/**
 * The ⋯ menu on cards and columns. A dropdown with a mouse; a bottom drawer on phones,
 * where a small anchored menu is hard to hit and easy to lose.
 */
export function ActionMenu({ label, groups, className }: { label: string; groups: ActionGroup[]; className?: string }) {
    const isMobile = useIsMobile()
    const [open, setOpen] = useState(false)
    // After an item runs, focus belongs to whatever it opened (a rename field, a dialog), not back on the trigger.
    const ranItem = useRef(false)
    const keepFocusAfterItem = (e: Event) => {
        if (ranItem.current) e.preventDefault()
        ranItem.current = false
    }
    const select = (item: ActionItem) => {
        ranItem.current = true
        item.onSelect()
    }

    const trigger = (
        <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className={cn(
                "size-8 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted",
                className,
            )}
            onClick={() => {
                void haptic.tap()
                if (isMobile) setOpen(true)
            }}
        >
            <MoreHorizontal />
        </Button>
    )

    if (isMobile) {
        const run = (item: ActionItem) => {
            setOpen(false)
            select(item)
        }
        return (
            <>
                {trigger}
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent onCloseAutoFocus={keepFocusAfterItem}>
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="!text-left !text-base">{label}</DrawerTitle>
                            <DrawerDescription className="sr-only">Choose an action</DrawerDescription>
                        </DrawerHeader>
                        <div className="max-h-[60dvh] overflow-y-auto px-2 pb-6">
                            {groups.map((group, groupIndex) => (
                                <div key={group.submenu?.label ?? groupIndex} className={cn(groupIndex > 0 && "mt-2 border-t border-border pt-2")}>
                                    {group.submenu && (
                                        <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {group.submenu.label}
                                        </p>
                                    )}
                                    {group.submenu && group.items.length === 0 && (
                                        <p className="px-3 py-2 text-sm text-muted-foreground">{group.submenu.empty}</p>
                                    )}
                                    {group.items.map((item, itemIndex) => (
                                        <button
                                            key={`${item.label}-${itemIndex}`}
                                            type="button"
                                            disabled={item.disabled}
                                            onClick={() => run(item)}
                                            className={cn(
                                                "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm active:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                                                item.destructive && "text-destructive",
                                            )}
                                        >
                                            {item.icon && <item.icon className="size-4 shrink-0" aria-hidden />}
                                            <span>
                                                {item.label}
                                                {item.description && <span className="block text-xs text-muted-foreground">{item.description}</span>}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </DrawerContent>
                </Drawer>
            </>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" onCloseAutoFocus={keepFocusAfterItem}>
                {groups.map((group, groupIndex) => (
                    <div key={group.submenu?.label ?? groupIndex}>
                        {groupIndex > 0 && <DropdownMenuSeparator />}
                        {group.submenu ? (
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2">
                                    <group.submenu.icon className="size-4 text-muted-foreground" /> {group.submenu.label}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
                                    {group.items.length === 0 && <DropdownMenuItem disabled>{group.submenu.empty}</DropdownMenuItem>}
                                    {group.items.map((item, itemIndex) => (
                                        <MenuItem key={`${item.label}-${itemIndex}`} item={item} onSelect={select} />
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        ) : (
                            group.items.map((item, itemIndex) => (
                                <MenuItem key={`${item.label}-${itemIndex}`} item={item} onSelect={select} />
                            ))
                        )}
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function MenuItem({ item, onSelect }: { item: ActionItem; onSelect: (item: ActionItem) => void }) {
    return (
        <DropdownMenuItem
            variant={item.destructive ? "destructive" : "default"}
            disabled={item.disabled}
            onSelect={() => onSelect(item)}
            className={cn(item.description && "items-start")}
        >
            {item.icon && <item.icon className={cn(item.description && "mt-0.5")} />}
            <span>
                {item.label}
                {item.description && <span className="block text-xs font-normal text-muted-foreground">{item.description}</span>}
            </span>
        </DropdownMenuItem>
    )
}
