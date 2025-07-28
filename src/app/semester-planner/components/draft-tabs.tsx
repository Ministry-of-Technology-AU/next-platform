"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Copy, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <ScrollArea className="w-full">
            <div className="flex gap-1 pb-2">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  onClick={() => onSwitchDraft(draft.id)}
                  className={`relative group px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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
          </ScrollArea>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
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

          <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Copy className="h-4 w-4 mr-2" />
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
            onClick={() => onDownloadTimetable(activeDraftId)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}
