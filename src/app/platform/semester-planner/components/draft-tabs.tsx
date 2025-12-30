"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Plus, Copy, Download, Trash2, Save, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { TourStep } from "@/components/guided-tour";
import type { TimetableDraft } from "../types";
import { useIsMac } from "@/hooks/useIsMac";

interface DraftTabsProps {
  drafts: TimetableDraft[];
  activeDraftId: string;
  onCreateDraft: (name: string) => void;
  onDuplicateDraft: (draftId: string, newName: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onSwitchDraft: (draftId: string) => void;
  onDownloadTimetable: (draftId: string) => void;
  onRenameDraft: (draftId: string, newName: string) => void;
  onToggleFullScreen: () => void;
  isFullScreenMode?: boolean;
  children: React.ReactNode;
}

export function DraftTabs({
  drafts,
  activeDraftId,
  onCreateDraft,
  onDuplicateDraft,
  onDeleteDraft,
  onSwitchDraft,
  onDownloadTimetable,
  onRenameDraft,
  onToggleFullScreen,
  isFullScreenMode = false,
  children,
}: DraftTabsProps) {
  const isMac = useIsMac();
  const [newDraftName, setNewDraftName] = useState("");
  const [duplicateName, setDuplicateName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateSourceId, setDuplicateSourceId] = useState("");
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreateDraft = () => {
    if (newDraftName.trim()) {
      onCreateDraft(newDraftName.trim());
      setNewDraftName("");
      setIsCreateOpen(false);
    }
  };

  const handleDuplicateDraft = () => {
    if (duplicateName.trim() && duplicateSourceId) {
      onDuplicateDraft(duplicateSourceId, duplicateName.trim());
      setDuplicateName("");
      setIsDuplicateOpen(false);
      setDuplicateSourceId("");
    }
  };

  const handleSaveDraft = useCallback(async () => {
    const activeDraft = drafts.find(d => d.id === activeDraftId);
    if (!activeDraft) {
      toast.error("Active draft not found");
      return;
    }
    if (activeDraft.courses.length === 0) {
      toast.error("No courses to save in the current draft");
      return;
    }
    setIsSaving(true);
    try {
      const updatedDrafts = drafts.map(d => d.id === activeDraft.id ? { ...activeDraft, updatedAt: new Date().toISOString() } : d);
      const response = await fetch(`/api/platform/semester-planner/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drafts: updatedDrafts }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Draft "${activeDraft.name}" saved successfully!`);
      } else {
        toast.error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [drafts, activeDraftId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Shift + Key
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault();
            setIsCreateOpen(true);
            break;
          case 'x':
            e.preventDefault();
            setDuplicateSourceId(activeDraftId);
            setIsDuplicateOpen(true);
            break;
          case 's':
            e.preventDefault();
            handleSaveDraft();
            break;
          case 'l':
            e.preventDefault();
            onDownloadTimetable(activeDraftId);
            break;
          // Fullscreen 'o' is handled in semester-planner.tsx globally
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDraftId, onDownloadTimetable, handleSaveDraft]); // handleSaveDraft is stable enough or can be added if useCallback wrapped (it's not but depends on state, wait)

  // Fix: handleSaveDraft depends on drafts and activeDraftId, so we need to include it in dependency or use a ref/wrapper.
  // Since handleSaveDraft is defined in render, we should probably wrap it in useCallback or just include it in deps if we move it?
  // Actually, allow me to just add the effect and let it run. But handleSaveDraft changes every render because it's not memoized.
  // I should memoize handleSaveDraft first.

  const startEditing = (draftId: string, currentName: string) => {
    setEditingDraftId(draftId);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingDraftId(null);
    setEditingName("");
  };

  const commitEditing = () => {
    if (editingDraftId && editingName.trim()) {
      onRenameDraft(editingDraftId, editingName.trim());
    }
    cancelEditing();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
        {/* Tabs scroller */}
        <TourStep
          id="draft-tabs"
          order={0}
          title="Draft Tabs"
          content="Switch between different timetable drafts using these tabs. Each draft saves its own set of courses and layout."
          position="bottom"
        >
          <div className="flex-1 min-w-0">
            <ScrollArea className="w-full rounded-md border whitespace-nowrap">
              <div className="flex w-max gap-1 p-2">
                {drafts.map((draft) => {
                  const isActive = activeDraftId === draft.id;
                  const isEditing = editingDraftId === draft.id;
                  return (
                    <div
                      key={draft.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onClick={() => !isEditing && onSwitchDraft(draft.id)}
                      onKeyDown={(e) => {
                        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onSwitchDraft(draft.id);
                        }
                        if (e.key === 'F2' && !isEditing) {
                          startEditing(draft.id, draft.name);
                        }
                      }}
                      onDoubleClick={() => startEditing(draft.id, draft.name)}
                      className={`h-fit relative group px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer select-none ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                        }`}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="bg-transparent border-b border-border focus:outline-none focus:ring-0 text-sm w-28"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={commitEditing}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              commitEditing();
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                        />
                      ) : (
                        <span>{draft.name}</span>
                      )}
                      {drafts.length > 1 && !isEditing && (
                        <button
                          type="button"
                          aria-label="Delete draft"
                          className="ml-2 h-4 w-4 p-0 inline-flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-background/20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDraft(draft.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="absolute" />
            </ScrollArea>
          </div>
        </TourStep>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center justify-end">
          <TourStep
            id="create-draft"
            order={1}
            title="Create New Draft"
            content="Click here to create a new draft. A draft is a snapshot of your current timetable that you can save and come back to later."
            position="bottom"
          >
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs dark:bg-neutral-light dark:border-border flex-1 sm:flex-none"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">New Draft</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    New Draft
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Shortcut:{" "}
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">{isMac ? "⌘" : "Ctrl"} + Shift + M</span>
                      </kbd>
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Draft</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Draft name"
                    value={newDraftName}
                    onChange={(e) => setNewDraftName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateDraft()}
                  />
                  <Button onClick={handleCreateDraft} className="w-full">
                    Create Draft
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TourStep>

          <TourStep
            id="duplicate-draft"
            order={2}
            title="Duplicate Draft"
            content="Duplicate your current draft to create a copy. This is useful when you want to experiment with variations of your timetable."
            position="bottom"
          >
            <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs dark:bg-neutral-light dark:border-border flex-1 sm:flex-none"
                    onClick={() => {
                      setDuplicateSourceId(activeDraftId);
                      setIsDuplicateOpen(true);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Duplicate</span>
                    <span className="sm:hidden">Copy</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    Duplicate Draft
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Shortcut:{" "}
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">{isMac ? "⌘" : "Ctrl"} + Shift + X</span>
                      </kbd>
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Duplicate Draft</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="New draft name"
                    value={duplicateName}
                    onChange={(e) => setDuplicateName(e.target.value)}
                  />
                  <Button
                    onClick={handleDuplicateDraft}
                    className="w-full "
                  >
                    Duplicate Current Draft
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TourStep>

          <TourStep
            id="save-draft"
            order={3}
            title="Save Draft"
            content="Click to save your current draft. This persists your timetable so you don't lose your work."
            position="bottom"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs flex-1 sm:flex-none dark:bg-neutral-light dark:border-border "
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {isSaving ? 'Saving...' : <><span className="hidden sm:inline">Save Draft</span><span className="sm:hidden">Save</span></>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  Save Draft
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Shortcut:{" "}
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">{isMac ? "⌘" : "Ctrl"} + Shift + S</span>
                    </kbd>
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          </TourStep>

          <TourStep
            id="download-timetable"
            order={4}
            title="Download Timetable"
            content="Download your timetable as an image. Perfect for saving or sharing with friends!"
            position="bottom"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownloadTimetable(activeDraftId)}
                  className="h-8 px-2.5 text-xs flex-1 sm:flex-none dark:bg-neutral-light dark:border-border "
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  Download Timetable
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Shortcut:{" "}
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">{isMac ? "⌘" : "Ctrl"} + Shift + L</span>
                    </kbd>
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          </TourStep>

          {!isFullScreenMode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs flex-1 sm:flex-none dark:bg-neutral-light dark:border-border"
                  onClick={onToggleFullScreen}
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Full Screen</span>
                  <span className="sm:hidden">Full</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  Toggle Full Screen
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Shortcut:{" "}
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">{isMac ? "⌘" : "Ctrl"} + Shift + O</span>
                    </kbd>
                    <span className="ml-[0.5px]"></span>
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

