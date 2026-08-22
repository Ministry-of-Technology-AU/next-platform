import { useState } from 'react';
import { Plus, Workflow, FileText, Loader2, Mic, Clock, Sparkles, Trophy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PipelineNode } from './pipeline-node';
import { InterviewSchedulerDialog } from './interview-scheduler-dialog';
import type { PipelineRound, PipelineRoundType, InterviewConfig, ResultsConfig } from '../types';
import type { RoleFormSummary } from './role-forms';

interface PipelineBuilderProps {
  rounds: PipelineRound[];
  forms?: RoleFormSummary[];
  roleName?: string;
  orgEmail?: string;
  onChange: (rounds: PipelineRound[]) => void;
  onFormCreated?: (newForm: RoleFormSummary) => void;
}

const DEFAULT_ROUNDS: PipelineRound[] = [
  {
    id: 'round-application',
    type: 'form',
    label: 'Application Form',
    formId: null,
    formIds: [],
    deadline: null,
    description: 'Initial application form for candidates.',
    order: 0,
  },
];

const DEFAULT_RESULTS_TEMPLATE = `<p>Dear Applicant,</p><p>Thank you for participating in our induction process. We are pleased to share your results.</p><p>Best regards,<br/>The Inductions Team</p>`;

export function PipelineBuilder({
  rounds: initialRounds,
  forms = [],
  roleName = 'Role',
  orgEmail,
  onChange,
  onFormCreated,
}: PipelineBuilderProps) {
  const [rounds, setRounds] = useState<PipelineRound[]>(
    initialRounds.length > 0 ? initialRounds : DEFAULT_ROUNDS,
  );

  // Edit dialog state
  const [editingRound, setEditingRound] = useState<PipelineRound | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState<PipelineRoundType>('form');
  const [editFormIds, setEditFormIds] = useState<string[]>([]);
  const [editDeadline, setEditDeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInterviewConfig, setEditInterviewConfig] = useState<InterviewConfig | null>(null);
  const [editResultsConfig, setEditResultsConfig] = useState<ResultsConfig>({
    emailTemplate: DEFAULT_RESULTS_TEMPLATE,
    sendEmail: true,
  });

  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addAfterIndex, setAddAfterIndex] = useState<number>(-1);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<PipelineRoundType>('form');
  const [newFormIds, setNewFormIds] = useState<string[]>([]);
  const [newDeadline, setNewDeadline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newInterviewConfig, setNewInterviewConfig] = useState<InterviewConfig | null>(null);
  const [newResultsConfig, setNewResultsConfig] = useState<ResultsConfig>({
    emailTemplate: DEFAULT_RESULTS_TEMPLATE,
    sendEmail: true,
  });

  // Quick form creation state
  const [creatingInlineForm, setCreatingInlineForm] = useState(false);

  // Interview Scheduler standalone dialog state
  const [interviewSchedulerOpen, setInterviewSchedulerOpen] = useState(false);
  const [interviewSchedulerTarget, setInterviewSchedulerTarget] = useState<PipelineRound | null>(null);

  const updateRounds = (next: PipelineRound[]) => {
    const reordered = next.map((r, i) => ({ ...r, order: i }));
    setRounds(reordered);
    onChange(reordered);
  };

  // Helper to map formId to title
  const getFormTitle = (formId: string | null) => {
    if (!formId) return null;
    const match = forms.find((f) => f.id === formId);
    return match ? match.title : null;
  };

  const getFormTitles = (formIds: string[]): string[] => {
    return formIds
      .map((id) => forms.find((f) => f.id === id)?.title)
      .filter((t): t is string => !!t);
  };

  // ---- Add ----
  const openAddDialog = (afterIndex: number) => {
    setAddAfterIndex(afterIndex);
    setNewLabel('');
    setNewType('form');
    setNewFormIds([]);
    setNewDeadline('');
    setNewDescription('');
    setNewInterviewConfig(null);
    setNewResultsConfig({ emailTemplate: DEFAULT_RESULTS_TEMPLATE, sendEmail: true });
    setAddDialogOpen(true);
  };

  const confirmAdd = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;

    let finalFormIds = newType === 'form' ? newFormIds.filter((id) => id !== 'none') : [];

    // If "create-new" is selected, create a new form in Strapi
    if (newType === 'form' && newFormIds.includes('create-new')) {
      try {
        setCreatingInlineForm(true);
        const res = await fetch('/api/organisations/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmed }),
        });
        const json = await res.json();
        if (json?.success && json?.data?.id) {
          const createdId = json.data.id;
          finalFormIds = finalFormIds.filter((id) => id !== 'create-new');
          finalFormIds.unshift(createdId);
          const newFormObj: RoleFormSummary = {
            id: createdId,
            title: json.data.title || trimmed,
            form_status: json.data.form_status || 'draft',
            startDate: json.data.start_date || null,
            endDate: json.data.end_date || null,
            updatedAt: json.data.updatedAt || new Date().toISOString(),
            fieldsCount: 0,
            stats: json.data.stats || { submissionCount: 0, completionRate: 0, views: 0 },
          };
          onFormCreated?.(newFormObj);
          toast.success(`Form "${trimmed}" created and linked`);
        }
      } catch (err: any) {
        toast.error('Could not auto-create form');
      } finally {
        setCreatingInlineForm(false);
      }
    }

    const newRound: PipelineRound = {
      id: crypto.randomUUID(),
      type: newType,
      label: trimmed,
      formId: finalFormIds[0] ?? null,
      formIds: newType === 'form' ? finalFormIds : [],
      deadline: newDeadline || null,
      description: newDescription.trim() || null,
      order: addAfterIndex + 1,
      interviewConfig: newType === 'interview' ? newInterviewConfig : null,
      resultsConfig: newType === 'results' ? newResultsConfig : null,
    };
    const next = [...rounds];
    next.splice(addAfterIndex + 1, 0, newRound);
    updateRounds(next);
    setAddDialogOpen(false);
  };

  // ---- Edit ----
  const openEditDialog = (round: PipelineRound) => {
    setEditingRound(round);
    setEditLabel(round.label);
    setEditType(round.type);
    setEditFormIds(round.formIds ?? (round.formId ? [round.formId] : []));
    setEditDeadline(round.deadline || '');
    setEditDescription(round.description || '');
    setEditInterviewConfig(round.interviewConfig || null);
    setEditResultsConfig(
      round.resultsConfig || { emailTemplate: DEFAULT_RESULTS_TEMPLATE, sendEmail: true },
    );
  };

  const confirmEdit = async () => {
    if (!editingRound) return;
    const trimmed = editLabel.trim();
    if (!trimmed) return;

    let selectedFormIds = editType === 'form' ? editFormIds.filter((id) => id !== 'none') : [];

    // Handle inline form creation if 'create-new' is selected
    if (editType === 'form' && editFormIds.includes('create-new')) {
      try {
        setCreatingInlineForm(true);
        const res = await fetch('/api/organisations/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmed }),
        });
        const json = await res.json();
        if (json?.success && json?.data?.id) {
          const createdId = json.data.id;
          selectedFormIds = selectedFormIds.filter((id) => id !== 'create-new');
          selectedFormIds.unshift(createdId);
          const newFormObj: RoleFormSummary = {
            id: createdId,
            title: json.data.title || trimmed,
            form_status: json.data.form_status || 'draft',
            startDate: json.data.start_date || null,
            endDate: json.data.end_date || null,
            updatedAt: json.data.updatedAt || new Date().toISOString(),
            fieldsCount: 0,
            stats: json.data.stats || { submissionCount: 0, completionRate: 0, views: 0 },
          };
          onFormCreated?.(newFormObj);
          toast.success(`Form "${trimmed}" created and linked`);
        }
      } catch {
        toast.error('Could not auto-create form');
      } finally {
        setCreatingInlineForm(false);
      }
    }

    const next = rounds.map((r) =>
      r.id === editingRound.id
        ? {
            ...r,
            label: trimmed,
            type: editType,
            formId: selectedFormIds[0] ?? null,
            formIds: editType === 'form' ? selectedFormIds : [],
            deadline: editDeadline || null,
            description: editDescription.trim() || null,
            interviewConfig: editType === 'interview' ? editInterviewConfig || r.interviewConfig : null,
            resultsConfig: editType === 'results' ? editResultsConfig : null,
          }
        : r,
    );
    updateRounds(next);
    setEditingRound(null);
  };

  // ---- Delete ----
  const deleteRound = (roundId: string) => {
    const next = rounds.filter((r) => r.id !== roundId);
    updateRounds(next);
  };

  // Handle schedule save from InterviewSchedulerDialog
  const handleSaveInterviewSchedule = (
    config: InterviewConfig,
    label?: string,
    description?: string,
  ) => {
    if (!interviewSchedulerTarget) return;

    const next = rounds.map((r) =>
      r.id === interviewSchedulerTarget.id
        ? {
            ...r,
            label: label || r.label,
            description: description !== undefined ? description : r.description,
            interviewConfig: config,
          }
        : r,
    );
    updateRounds(next);
    setInterviewSchedulerTarget(null);
  };

  // Toggle form in a multi-select set
  const toggleFormId = (
    currentIds: string[],
    formId: string,
    setter: (ids: string[]) => void,
  ) => {
    if (currentIds.includes(formId)) {
      setter(currentIds.filter((id) => id !== formId));
    } else {
      setter([...currentIds, formId]);
    }
  };

  // ---- Shared form picker for Add / Edit dialogs ----
  const renderFormPicker = (
    selectedIds: string[],
    setter: (ids: string[]) => void,
    roundTitle: string,
  ) => {
    const isCreateNewChecked = selectedIds.includes('create-new');
    const selectedExistingCount = selectedIds.filter((id) => id !== 'create-new').length;
    const totalSelectedCount = selectedExistingCount + (isCreateNewChecked ? 1 : 0);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label>Linked Forms</Label>
          {totalSelectedCount > 0 && (
            <span className="text-[11px] font-medium text-primary">
              {totalSelectedCount} selected
            </span>
          )}
        </div>

        {/* Scrollable list with persistent visible scrollbar */}
        <div className="rounded-xl border border-border bg-muted/20 p-2.5 max-h-[220px] overflow-y-scroll custom-scrollbar [scrollbar-gutter:stable] space-y-1.5">
          {/* 1. Create a new form option (First option) */}
          <label
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors border ${
              isCreateNewChecked
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'hover:bg-muted/40 border-dashed border-border bg-background/60'
            }`}
          >
            <Checkbox
              checked={isCreateNewChecked}
              onCheckedChange={() => toggleFormId(selectedIds, 'create-new', setter)}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate !text-left flex items-center gap-1.5 text-foreground">
                <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                + Create new form with this round&apos;s title
              </p>
              <p className="text-[11px] text-muted-foreground !text-left">
                {roundTitle.trim()
                  ? `Will create and link "${roundTitle.trim()}"`
                  : 'Automatically creates a new draft form and links it'}
              </p>
            </div>
          </label>

          {/* 2. Existing forms */}
          {forms.map((f) => {
            const isChecked = selectedIds.includes(f.id);
            return (
              <label
                key={f.id}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors border ${
                  isChecked
                    ? 'bg-primary/5 border-primary/30'
                    : 'hover:bg-muted/40 border-border/40 bg-background/40'
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleFormId(selectedIds, f.id, setter)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate !text-left text-foreground">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground !text-left">
                    Status: {f.form_status} · {f.stats?.submissionCount ?? 0} responses
                  </p>
                </div>
              </label>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Select one or more existing forms, or check the option above to create a new form automatically.
        </p>
      </div>
    );
  };

  // ---- Shared results config editor ----
  const renderResultsEditor = (
    config: ResultsConfig,
    setter: (config: ResultsConfig) => void,
  ) => (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Results Email Template</Label>
        <RichTextEditor
          value={config.emailTemplate}
          onChange={(val) => setter({ ...config, emailTemplate: val })}
          placeholder="Write the results email template that will be sent to applicants..."
          className="min-h-[140px]"
        />
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <Checkbox
          id="results-send-email"
          checked={config.sendEmail}
          onCheckedChange={(checked) => setter({ ...config, sendEmail: !!checked })}
        />
        <div>
          <Label htmlFor="results-send-email" className="cursor-pointer text-sm font-medium">
            Send email to applicants by default
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {config.sendEmail
              ? 'Applicants will receive the results email when triggered'
              : 'Email will not be sent unless toggled on per-applicant'}
          </p>
        </div>
        <Mail className="ml-auto h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );

  // ---- Type selector (shared) ----
  const renderTypeSelector = (
    currentType: PipelineRoundType,
    setter: (type: PipelineRoundType) => void,
  ) => (
    <div className="space-y-2">
      <Label>Round Type</Label>
      <Select value={currentType} onValueChange={(v) => setter(v as PipelineRoundType)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="form">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Form
            </span>
          </SelectItem>
          <SelectItem value="interview">
            <span className="flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5" /> Interview
            </span>
          </SelectItem>
          <SelectItem value="results">
            <span className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" /> Results
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div id="induction-pipeline-section" className="space-y-3 scroll-mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold !text-left">Induction Pipeline</h3>
        </div>
        <p className="text-xs text-muted-foreground">Drag rounds to reorder · Add any stage type</p>
      </div>

      {/* Horizontal Pipeline Scroll Container */}
      <div className="rounded-xl border border-border bg-card p-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center min-w-max py-2 px-1">
          {rounds.length === 0 ? (
            /* Empty state */
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">No rounds configured.</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openAddDialog(-1)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add First Round
              </Button>
            </div>
          ) : (
            <>
              {rounds.map((round, index) => (
                <div key={round.id} className="flex items-center flex-shrink-0">
                  {/* Connector line with Plus insert button */}
                  {index > 0 && (
                    <div className="flex items-center mx-2 flex-shrink-0">
                      <div className="w-4 h-0.5 bg-border" />
                      <button
                        type="button"
                        onClick={() => openAddDialog(index - 1)}
                        className="w-6 h-6 rounded-full border-2 border-dashed border-border bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex-shrink-0"
                        aria-label="Add round here"
                        title="Insert round"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <div className="w-4 h-0.5 bg-border" />
                    </div>
                  )}

                  {/* Node */}
                  <PipelineNode
                    round={round}
                    index={index}
                    formTitle={getFormTitle(round.formIds?.[0] ?? round.formId ?? null)}
                    formTitles={getFormTitles(round.formIds ?? [])}
                    onEdit={openEditDialog}
                    onDelete={deleteRound}
                    onConfigureSchedule={(r) => {
                      setInterviewSchedulerTarget(r);
                      setInterviewSchedulerOpen(true);
                    }}
                  />
                </div>
              ))}

              {/* Final add button */}
              <div className="flex items-center mx-2 flex-shrink-0">
                <div className="w-4 h-0.5 bg-border" />
                <button
                  type="button"
                  onClick={() => openAddDialog(rounds.length - 1)}
                  className="w-6 h-6 rounded-full border-2 border-dashed border-border bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex-shrink-0"
                  aria-label="Add round at end"
                  title="Add round"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- Add Round Dialog ---- */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Round</DialogTitle>
            <DialogDescription>
              Add a new stage to the induction pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Round name</Label>
              <Input
                value={newLabel}
                autoFocus
                placeholder={
                  newType === 'form' ? 'e.g. Application Form' :
                  newType === 'interview' ? 'e.g. Technical Interview' :
                  'e.g. Final Results'
                }
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void confirmAdd();
                }}
              />
            </div>

            {renderTypeSelector(newType, setNewType)}

            {/* Type-specific config */}
            {newType === 'form' && renderFormPicker(newFormIds, setNewFormIds, newLabel)}

            {newType === 'interview' && (
              <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-secondary-extradark dark:text-secondary font-semibold text-xs">
                  <Clock className="h-4 w-4" />
                  When2Meet Interview Scheduling
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Configure your panel's available time grid and Google Calendar invite settings.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 text-xs bg-background hover:bg-muted"
                  onClick={() => {
                    setInterviewSchedulerTarget({
                      id: 'new-interview-temp',
                      type: 'interview',
                      label: newLabel || 'Interview Round',
                      formId: null,
                      formIds: [],
                      deadline: newDeadline || null,
                      description: newDescription || null,
                      order: 0,
                      interviewConfig: newInterviewConfig,
                    });
                    setInterviewSchedulerOpen(true);
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  {newInterviewConfig?.selectedSlots?.length
                    ? `Configure Schedule (${newInterviewConfig.selectedSlots.length} slots selected)`
                    : 'Open When2Meet Time Grid'}
                </Button>
              </div>
            )}

            {newType === 'results' && renderResultsEditor(newResultsConfig, setNewResultsConfig)}

            <div className="space-y-2">
              <Label>Deadline (optional)</Label>
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newDescription}
                placeholder="Brief description or instructions for candidates in this round"
                rows={2}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={creatingInlineForm}>
              Cancel
            </Button>
            <Button onClick={() => void confirmAdd()} disabled={!newLabel.trim() || creatingInlineForm} className="gap-1.5">
              {creatingInlineForm && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Round
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Edit Round Dialog ---- */}
      <Dialog open={!!editingRound} onOpenChange={(open) => !open && setEditingRound(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit round</DialogTitle>
            <DialogDescription>
              Update this pipeline round's configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Round name</Label>
              <Input
                value={editLabel}
                autoFocus
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void confirmEdit();
                }}
              />
            </div>

            {renderTypeSelector(editType, setEditType)}

            {/* Type-specific config */}
            {editType === 'form' && renderFormPicker(editFormIds, setEditFormIds, editLabel)}

            {editType === 'interview' && (
              <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-secondary-extradark dark:text-secondary font-semibold text-xs">
                    <Clock className="h-4 w-4" />
                    When2Meet Grid Schedule
                  </div>
                  {editingRound?.interviewConfig?.selectedSlots && (
                    <Badge variant="outline" className="text-[10px] border-secondary/40 text-secondary font-bold">
                      {editingRound.interviewConfig.selectedSlots.length} slots active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open the When2Meet grid editor to adjust available times, meeting link, and panelist invitees.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 text-xs bg-background hover:bg-muted"
                  onClick={() => {
                    if (editingRound) {
                      setInterviewSchedulerTarget(editingRound);
                      setInterviewSchedulerOpen(true);
                    }
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  Edit Interview Grid &amp; Settings
                </Button>
              </div>
            )}

            {editType === 'results' && renderResultsEditor(editResultsConfig, setEditResultsConfig)}

            <div className="space-y-2">
              <Label>Deadline (optional)</Label>
              <Input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={editDescription}
                rows={2}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRound(null)} disabled={creatingInlineForm}>
              Cancel
            </Button>
            <Button onClick={() => void confirmEdit()} disabled={!editLabel.trim() || creatingInlineForm} className="gap-1.5">
              {creatingInlineForm && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Standalone Interview Scheduler Modal */}
      <InterviewSchedulerDialog
        open={interviewSchedulerOpen}
        onOpenChange={(open) => {
          setInterviewSchedulerOpen(open);
          if (!open) setInterviewSchedulerTarget(null);
        }}
        round={interviewSchedulerTarget}
        defaultRoleName={roleName}
        defaultOrgEmail={orgEmail}
        onSave={(config, label, desc) => {
          if (interviewSchedulerTarget?.id === 'new-interview-temp') {
            setNewInterviewConfig(config);
            if (label) setNewLabel(label);
            if (desc !== undefined) setNewDescription(desc);
            setInterviewSchedulerTarget(null);
          } else {
            handleSaveInterviewSchedule(config, label, desc);
          }
        }}
      />
    </div>
  );
}
