import { useState } from 'react';
import {
  Plus,
  Workflow,
  FileText,
  Loader2,
  Mic,
  Clock,
  Sparkles,
  Trophy,
  Mail,
  FilePlus2,
  Link2,
  Lock,
} from 'lucide-react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { PipelineNode } from './pipeline-node';
import { InterviewSchedulerDialog } from './interview-scheduler-dialog';
import type { PipelineRound, PipelineRoundType, InterviewConfig, ResultsConfig } from '../types';
import type { RoleFormSummary } from './role-forms';
import type { ApplicantRow } from './role-applicants';

interface PipelineBuilderProps {
  rounds: PipelineRound[];
  forms?: RoleFormSummary[];
  applicants?: ApplicantRow[];
  roleName?: string;
  /** Organisation contact addresses, pre-filled as default interview invitees. */
  orgEmails?: string[];
  onChange: (rounds: PipelineRound[]) => void;
  onFormCreated?: (newForm: RoleFormSummary) => void;
}

type FormMode = 'create' | 'link';

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
  applicants = [],
  roleName = 'Role',
  orgEmails = [],
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
  const [editFormMode, setEditFormMode] = useState<FormMode>('create');
  const [editFormId, setEditFormId] = useState<string | null>(null);
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
  const [newFormMode, setNewFormMode] = useState<FormMode>('create');
  const [newFormId, setNewFormId] = useState<string | null>(null);
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

  // Active round detection (locked if applicants are in/past this round, or linked form has submissions, or interviews booked)
  const isRoundActive = (round: PipelineRound, index: number): boolean => {
    const hasApplicantsInRound = (applicants || []).some(
      (a) => a.currentRound === index || a.currentRound > index,
    );
    const formId = round.formIds?.[0] ?? round.formId;
    const linkedForm = forms.find((f) => f.id === formId);
    const hasFormSubmissions = (linkedForm?.stats?.submissionCount ?? 0) > 0;
    const hasBookings = (round.interviewConfig?.bookings?.length ?? 0) > 0;

    return hasApplicantsInRound || hasFormSubmissions || hasBookings;
  };

  // Helper to map formId to title
  const getFormTitle = (formId: string | null) => {
    if (!formId) return null;
    const match = forms.find((f) => f.id === formId);
    return match ? match.title : null;
  };

  // ---- Add ----
  const openAddDialog = (afterIndex: number) => {
    setAddAfterIndex(afterIndex);
    setNewLabel('');
    setNewType('form');
    setNewFormMode('create');
    setNewFormId(null);
    setNewDeadline('');
    setNewDescription('');
    setNewInterviewConfig(null);
    setNewResultsConfig({ emailTemplate: DEFAULT_RESULTS_TEMPLATE, sendEmail: true });
    setAddDialogOpen(true);
  };

  const confirmAdd = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;

    let finalFormId: string | null = null;

    if (newType === 'form') {
      if (newFormMode === 'create') {
        try {
          setCreatingInlineForm(true);
          const res = await fetch('/api/organisations/forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: trimmed }),
          });
          const json = await res.json();
          if (json?.success && json?.data?.id) {
            finalFormId = json.data.id;
            const newFormObj: RoleFormSummary = {
              id: json.data.id,
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
          } else {
            throw new Error(json?.error || 'Failed to create form');
          }
        } catch (err: any) {
          toast.error(err.message || 'Could not auto-create form');
        } finally {
          setCreatingInlineForm(false);
        }
      } else {
        finalFormId = newFormId && newFormId !== 'none' ? newFormId : null;
      }
    }

    const newRound: PipelineRound = {
      id: crypto.randomUUID(),
      type: newType,
      label: trimmed,
      formId: finalFormId,
      formIds: newType === 'form' && finalFormId ? [finalFormId] : [],
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
    const existingForm = round.formIds?.[0] ?? round.formId ?? null;
    setEditFormId(existingForm);
    setEditFormMode(existingForm ? 'link' : 'create');
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

    const roundIndex = editingRound.order ?? rounds.findIndex((r) => r.id === editingRound.id);
    const isLocked = isRoundActive(editingRound, roundIndex);

    let selectedFormId: string | null = editingRound.formIds?.[0] ?? editingRound.formId ?? null;

    if (!isLocked && editType === 'form') {
      if (editFormMode === 'create') {
        try {
          setCreatingInlineForm(true);
          const res = await fetch('/api/organisations/forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: trimmed }),
          });
          const json = await res.json();
          if (json?.success && json?.data?.id) {
            selectedFormId = json.data.id;
            const newFormObj: RoleFormSummary = {
              id: json.data.id,
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
      } else {
        selectedFormId = editFormId && editFormId !== 'none' ? editFormId : null;
      }
    }

    const next = rounds.map((r) =>
      r.id === editingRound.id
        ? {
            ...r,
            label: trimmed,
            type: isLocked ? r.type : editType,
            formId: (isLocked ? r.type : editType) === 'form' ? selectedFormId : null,
            formIds: (isLocked ? r.type : editType) === 'form' && selectedFormId ? [selectedFormId] : [],
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
    const roundIdx = rounds.findIndex((r) => r.id === roundId);
    if (roundIdx !== -1 && isRoundActive(rounds[roundIdx], roundIdx)) {
      toast.error('Cannot delete an active round with applicants or submissions');
      return;
    }
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

  // ---- Segregated Form Picker (Create new vs Link existing — Single Selection) ----
  const renderFormPicker = (
    formMode: FormMode,
    setFormMode: (mode: FormMode) => void,
    selectedId: string | null,
    setSelectedId: (id: string | null) => void,
    roundTitle: string,
    disabled = false,
  ) => {
    return (
      <div className="space-y-3 pt-0.5">
        <Label className="text-xs font-semibold text-foreground">Form Setup</Label>

        {/* 2 Segregated Options: Create New vs Link Existing */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/70">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setFormMode('create')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              formMode === 'create'
                ? 'bg-background text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FilePlus2 className={`h-3.5 w-3.5 ${formMode === 'create' ? 'text-primary' : 'text-muted-foreground'}`} />
            Create new form
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setFormMode('link')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              formMode === 'link'
                ? 'bg-background text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Link2 className={`h-3.5 w-3.5 ${formMode === 'link' ? 'text-primary' : 'text-muted-foreground'}`} />
            Link existing form
            {selectedId && formMode === 'link' && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px] font-bold">
                1
              </Badge>
            )}
          </button>
        </div>

        {/* Option 1: Create New Form — Minimal & Zero Clutter */}
        {formMode === 'create' ? (
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <FilePlus2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-semibold text-foreground truncate !text-left">
                {roundTitle.trim() ? `"${roundTitle.trim()}" will be created` : 'New form will be created'}
              </p>
              <p className="text-[11px] text-muted-foreground !text-left leading-relaxed">
                A draft application form will automatically be created and linked when you save this round.
              </p>
            </div>
          </div>
        ) : (
          /* Option 2: Link Existing Form — Single Select list */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Select a form to link:</span>
              {selectedId && (
                <span className="text-[11px] font-semibold text-primary">
                  1 form selected
                </span>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-2 max-h-[190px] overflow-y-scroll custom-scrollbar [scrollbar-gutter:stable] space-y-1.5">
              {forms.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <p>No existing forms found in this organisation.</p>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setFormMode('create')}
                    className="text-primary hover:underline text-[11px] font-medium mt-1 inline-block"
                  >
                    Switch to Create new form
                  </button>
                </div>
              ) : (
                forms.map((f) => {
                  const isSelected = selectedId === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        if (!disabled) {
                          setSelectedId(isSelected ? null : f.id);
                        }
                      }}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors border ${
                        isSelected
                          ? 'bg-primary/10 border-primary/40 text-foreground font-medium shadow-sm'
                          : 'hover:bg-muted/40 border-border/40 bg-background/50 text-muted-foreground'
                      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate !text-left text-foreground">{f.title}</p>
                        <p className="text-[10px] text-muted-foreground !text-left">
                          Status: {f.form_status} · {f.stats?.submissionCount ?? 0} responses
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---- Shared results config editor ----
  const renderResultsEditor = (
    config: ResultsConfig,
    setter: (config: ResultsConfig) => void,
  ) => (
    <div className="space-y-3 pt-0.5">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Results Email Template</Label>
        <RichTextEditor
          value={config.emailTemplate}
          onChange={(val) => setter({ ...config, emailTemplate: val })}
          placeholder="Write the results email template that will be sent to applicants..."
          className="min-h-[130px]"
        />
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border p-3 bg-muted/20">
        <Checkbox
          id="results-send-email"
          checked={config.sendEmail}
          onCheckedChange={(checked) => setter({ ...config, sendEmail: !!checked })}
        />
        <div>
          <Label htmlFor="results-send-email" className="cursor-pointer text-xs font-medium">
            Send email to applicants by default
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
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
    disabled = false,
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">Round Type</Label>
      <Select
        value={currentType}
        onValueChange={(v) => setter(v as PipelineRoundType)}
        disabled={disabled}
      >
        <SelectTrigger className="text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="form">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" /> Form
            </span>
          </SelectItem>
          <SelectItem value="interview">
            <span className="flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-secondary-dark dark:text-secondary" /> Interview
            </span>
          </SelectItem>
          <SelectItem value="results">
            <span className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-green-dark dark:text-green-light" /> Results
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const isEditingRoundLocked = editingRound
    ? isRoundActive(editingRound, editingRound.order ?? rounds.findIndex((r) => r.id === editingRound.id))
    : false;

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
                    isLocked={isRoundActive(round, index)}
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
              Add a new stage to your induction pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Round name</Label>
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
                className="text-sm"
              />
            </div>

            {renderTypeSelector(newType, setNewType)}

            {/* Type-specific config */}
            {newType === 'form' && renderFormPicker(newFormMode, setNewFormMode, newFormId, setNewFormId, newLabel)}

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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Deadline (optional)</Label>
              <DatePicker
                value={newDeadline}
                onChange={(_, str) => setNewDeadline(str)}
                placeholder="Select round deadline"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Description (optional)</Label>
              <Textarea
                value={newDescription}
                placeholder="Brief description or instructions for candidates in this round"
                rows={2}
                onChange={(e) => setNewDescription(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={creatingInlineForm}>
              Cancel
            </Button>
            <Button onClick={() => void confirmAdd()} disabled={!newLabel.trim() || creatingInlineForm} className="gap-1.5 font-medium">
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
          <div className="space-y-4 py-1">
            {/* Locked Active Stage Alert */}
            {isEditingRoundLocked && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Active Stage Locked</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    This round is currently active with applicants or responses. The round type and form link cannot be modified.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Round name</Label>
              <Input
                value={editLabel}
                autoFocus
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void confirmEdit();
                }}
                className="text-sm"
              />
            </div>

            {renderTypeSelector(editType, setEditType, isEditingRoundLocked)}

            {/* Type-specific config */}
            {editType === 'form' && renderFormPicker(editFormMode, setEditFormMode, editFormId, setEditFormId, editLabel, isEditingRoundLocked)}

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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Deadline (optional)</Label>
              <DatePicker
                value={editDeadline}
                onChange={(_, str) => setEditDeadline(str)}
                placeholder="Select round deadline"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Description (optional)</Label>
              <Textarea
                value={editDescription}
                rows={2}
                onChange={(e) => setEditDescription(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingRound(null)} disabled={creatingInlineForm}>
              Cancel
            </Button>
            <Button onClick={() => void confirmEdit()} disabled={!editLabel.trim() || creatingInlineForm} className="gap-1.5 font-medium">
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
        defaultOrgEmails={orgEmails}
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
