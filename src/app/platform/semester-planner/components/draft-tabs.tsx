"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { Plus, Copy, Download, Trash2, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TimetableDraft } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DraftTabsProps {
  drafts: TimetableDraft[];
  activeDraftId: string;
  onCreateDraft: (name: string) => void;
  onDuplicateDraft: (draftId: string, newName: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onSwitchDraft: (draftId: string) => void;
  onDownloadTimetable: (draftId: string) => void;
  onRenameDraft: (draftId: string, newName: string) => void;
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
  children,
}: DraftTabsProps) {
  const [newDraftName, setNewDraftName] = useState("");
  const [duplicateName, setDuplicateName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateSourceId, setDuplicateSourceId] = useState("");
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const MAX_INLINE_DRAFTS = 4;

  const { inlineDrafts, overflowDrafts } = useMemo(() => {
    if (drafts.length <= MAX_INLINE_DRAFTS) {
      return {
        inlineDrafts: drafts,
        overflowDrafts: [] as TimetableDraft[],
      };
    }

    const activeDraft = drafts.find((d) => d.id === activeDraftId);
    const initialInline = drafts.slice(0, MAX_INLINE_DRAFTS);
    if (activeDraft && !initialInline.some((d) => d.id === activeDraft.id)) {
      const adjusted = [...initialInline.slice(0, MAX_INLINE_DRAFTS - 1), activeDraft];
      const inlineIds = new Set(adjusted.map((d) => d.id));
      return {
        inlineDrafts: adjusted,
        overflowDrafts: drafts.filter((d) => !inlineIds.has(d.id)),
      };
    }

    const inlineIds = new Set(initialInline.map((d) => d.id));
    return {
      inlineDrafts: initialInline,
      overflowDrafts: drafts.filter((d) => !inlineIds.has(d.id)),
    };
  }, [drafts, activeDraftId]);

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

  const handleSaveDraft = async () => {
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
  };

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
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-3xl border border-border/50 bg-background/80 p-4 shadow-sm supports-[backdrop-filter]:backdrop-blur-xl dark:bg-background/40 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 lg:max-w-[60%]">
            {inlineDrafts.map((draft) => {
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
                    if (!isEditing && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onSwitchDraft(draft.id);
                    }
                    if (e.key === "F2" && !isEditing) {
                      startEditing(draft.id, draft.name);
                    }
                  }}
                  onDoubleClick={() => startEditing(draft.id, draft.name)}
                  className={`group relative inline-flex cursor-pointer select-none rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
                      : "border-border/50 bg-muted/60 text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      className="w-28 border-b border-border bg-transparent text-sm focus:outline-none focus:ring-0"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={commitEditing}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          commitEditing();
                        } else if (e.key === "Escape") {
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
                      className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/20 p-0 opacity-0 transition-all group-hover:opacity-100 hover:bg-background/40"
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

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="inline-flex rounded-full border-dashed border-border/60 bg-background/70 px-4 py-2 text-sm font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Draft
                </Button>
              </DialogTrigger>
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

            {overflowDrafts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="inline-flex rounded-full border-border/60 bg-background/70 px-4 py-2 text-sm"
                  >
                    More drafts
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuLabel>Switch draft</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {overflowDrafts.map((draft) => (
                    <DropdownMenuItem
                      key={draft.id}
                      onSelect={(event) => {
                        event.preventDefault();
                        onSwitchDraft(draft.id);
                      }}
                    >
                      <span>{draft.name}</span>
                      {draft.id === activeDraftId && (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-border/50 bg-background/70"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
              </DialogTrigger>
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
                    onClick={() => {
                      setDuplicateSourceId(activeDraftId);
                      handleDuplicateDraft();
                    }}
                    className="w-full"
                  >
                    Duplicate Current Draft
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-border/50 bg-background/70"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownloadTimetable(activeDraftId)}
              className="rounded-full border-border/50 bg-background/70"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}
