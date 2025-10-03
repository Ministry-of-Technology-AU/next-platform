"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Copy, Download, Trash2, Save } from "lucide-react";
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
import { toast } from "sonner";
import type { TimetableDraft } from "../types";

interface DraftTabsProps {
  drafts: TimetableDraft[];
  activeDraftId: string;
  onCreateDraft: (name: string) => void;
  onDuplicateDraft: (draftId: string, newName: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onSwitchDraft: (draftId: string) => void;
  onDownloadTimetable: (draftId: string) => void;
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
  children,
}: DraftTabsProps) {
  const [newDraftName, setNewDraftName] = useState("");
  const [duplicateName, setDuplicateName] = useState("");
  const [saveName, setSaveName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateSourceId, setDuplicateSourceId] = useState("");

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
    if (!saveName.trim()) {
      toast.error("Please enter a draft name");
      return;
    }

    const activeDraft = drafts.find(d => d.id === activeDraftId);
    if (!activeDraft || activeDraft.courses.length === 0) {
      toast.error("No courses to save in the current draft");
      return;
    }

    setIsSaving(true);
    try {
      // Update the active draft's name and updatedAt before saving
      const updatedDrafts = drafts.map((d) =>
        d.id === activeDraft.id
          ? { ...activeDraft, name: saveName.trim(), updatedAt: new Date().toISOString() }
          : d
      );
      const response = await fetch(`/api/platform/semester-planner/drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ drafts: updatedDrafts }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Draft "${saveName.trim()}" saved successfully!`);
        setSaveName("");
        setIsSaveOpen(false);
      } else {
        toast.error(result.error || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
        {/* Tabs scroller */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="w-full rounded-md border whitespace-nowrap">
            <div className="flex w-max gap-1 p-2">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  onClick={() => onSwitchDraft(draft.id)}
                  className={`h-fit relative group px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeDraftId === draft.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {draft.name}
                  {drafts.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-background/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDraft(draft.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="absolute" />
          </ScrollArea>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-shrink-0 items-center">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Draft</span>
                <span className="sm:hidden">New</span>
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

          <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                <Copy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Duplicate</span>
                <span className="sm:hidden">Copy</span>
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

          <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Save Draft</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Draft to Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Save this draft to your profile so you can access it later.
                </p>
                <Input
                  placeholder="Enter draft name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isSaving && handleSaveDraft()}
                  disabled={isSaving}
                />
                <Button 
                  onClick={handleSaveDraft} 
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownloadTimetable(activeDraftId)}
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">DL</span>
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}
