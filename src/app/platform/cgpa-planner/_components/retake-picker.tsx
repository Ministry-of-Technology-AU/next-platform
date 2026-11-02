"use client";

import { useMemo } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { courseKey, courseRef } from "../utils";
import type { ParsedSemester } from "../types";
import { haptic } from "@/lib/haptics";

type Option = { ref: string; key: string; code: string | null; title: string; grade: string | null };
type Group = { term: string; options: Option[] };

/**
 * Lets a student say which earlier course a row retakes, for when codes changed between
 * terms and auto-detection missed it. Searchable; a bottom drawer on phones.
 */
export function RetakePicker({
  terms,
  forRef,
  onPick,
  onClose,
}: {
  terms: ParsedSemester[];
  /** The row being linked; null when closed. */
  forRef: string | null;
  onPick: (ref: string, key: string) => void;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const open = forRef !== null;

  const groups = useMemo<Group[]>(() => {
    // Only completed terms, as before: a retake points back at a graded attempt.
    return terms
      .filter((term) => term.status === "completed")
      .map((term) => ({
        term: term.semester,
        options: term.courses.flatMap((course, index): Option[] => {
          const ref = courseRef(term, index);
          const key = courseKey(course);
          const zeroCredit = (course.creditsRegistered ?? 0) === 0 && (course.creditsEarned ?? 0) === 0;
          if (!key || ref === forRef || zeroCredit) return [];
          return [{ ref, key, code: course.code, title: course.title ?? course.code ?? "Untitled course", grade: course.grade }];
        }),
      }))
      .filter((group) => group.options.length > 0)
      .reverse();
  }, [terms, forRef]);

  const forTitle = useMemo(() => {
    if (!forRef) return "";
    for (const term of terms) {
      const index = term.courses.findIndex((_, i) => courseRef(term, i) === forRef);
      if (index !== -1) return term.courses[index]?.title ?? "";
    }
    return "";
  }, [terms, forRef]);

  const title = "Which course does this retake?";
  const description = forTitle ? `Linking "${forTitle}". Only the better attempt will count.` : "Only the better attempt will count.";

  const list = (
    <Command className="min-w-0 rounded-none bg-transparent">
      <CommandInput placeholder="Search by code or title" />
      <CommandList className="max-h-[55vh]">
        <CommandEmpty>No course matches that search.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.term} heading={group.term}>
            {group.options.map((option) => (
              <CommandItem
                key={option.ref}
                value={`${option.code ?? ""} ${option.title} ${group.term}`}
                onSelect={() => {
                  if (!forRef) return;
                  void haptic.confirm();
                  onPick(forRef, option.key);
                  onClose();
                }}
                className="min-h-11 min-w-0 gap-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{option.title}</span>
                  <span className="block truncate text-xs font-medium text-blue-light">{option.code ?? "No code"}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-muted-foreground">{option.grade ?? "--"}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );

  const onOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-left text-lg">{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="min-w-0 px-2 pb-6">{list}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 pr-12 text-left">
          <DialogTitle className="text-left text-xl leading-tight">{title}</DialogTitle>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>
        <div className="min-w-0 border-t border-border">{list}</div>
      </DialogContent>
    </Dialog>
  );
}
