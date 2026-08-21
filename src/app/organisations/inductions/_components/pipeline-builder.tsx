import { useState } from 'react';
import { Plus, Workflow, FileText, Loader2, Mic, Clock, Calendar, Sparkles } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PipelineNode } from './pipeline-node';
import { InterviewSchedulerDialog } from './interview-scheduler-dialog';
import type { PipelineRound, PipelineRoundType, InterviewConfig } from '../types';
import type { RoleFormSummary } from './role-forms';

interface PipelineBuilderProps {
  rounds: PipelineRound[];
  forms?: RoleFormSummary[];
  roleName?: string;
  orgEmail?: string;
  onChange: (rounds: PipelineRound[]) => void;
}

const DEFAULT_ROUNDS: PipelineRound[] = [
  {
    id: 'round-application',
    type: 'form',
    label: 'Application Form',
    formId: null,
    deadline: null,
    description: 'Initial application form for candidates.',
    order: 0,
  },
];

export function PipelineBuilder({
  rounds: initialRounds,
  forms = [],
  roleName = 'Role',
  orgEmail,
  onChange,
}: PipelineBuilderProps) {
  const [rounds, setRounds] = useState<PipelineRound[]>(
    initialRounds.length > 0 ? initialRounds : DEFAULT_ROUNDS,
  );

  // Edit dialog state
  const [editingRound, setEditingRound] = useState<PipelineRound | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editType, setEditType] = useState<PipelineRoundType>('form');
  const [editFormId, setEditFormId] = useState<string>('none');
  const [editDeadline, setEditDeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInterviewConfig, setEditInterviewConfig] = useState<InterviewConfig | null>(null);

  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addAfterIndex, setAddAfterIndex] = useState<number>(-1);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<PipelineRoundType>('form');
  const [newFormId, setNewFormId] = useState<string>('none');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newInterviewConfig, setNewInterviewConfig] = useState<InterviewConfig | null>(null);

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

  // ---- Add ----
  const openAddDialog = (afterIndex: number) => {
    setAddAfterIndex(afterIndex);
    setNewLabel('');
    setNewType('interview'); // Subsequent rounds after round 0 are always interview rounds
    setNewFormId('none');
    setNewDeadline('');
    setNewDescription('');
    setNewInterviewConfig(null);
    setAddDialogOpen(true);
  };

  const confirmAdd = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;

    const newRound: PipelineRound = {
      id: crypto.randomUUID(),
      type: 'interview', // Single active form rule: all added rounds are interviews
      label: trimmed,
      formId: null,
      deadline: newDeadline || null,
      description: newDescription.trim() || null,
      order: addAfterIndex + 1,
      interviewConfig: newInterviewConfig,
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
    const isFirstRound = round.id === rounds[0]?.id;
    setEditType(isFirstRound ? 'form' : 'interview');
    setEditFormId(round.formId || 'none');
    setEditDeadline(round.deadline || '');
    setEditDescription(round.description || '');
    setEditInterviewConfig(round.interviewConfig || null);
  };

  const confirmEdit = async () => {
    if (!editingRound) return;
    const trimmed = editLabel.trim();
    if (!trimmed) return;

    const isFirstRound = editingRound.id === rounds[0]?.id;
    const finalType: PipelineRoundType = isFirstRound ? 'form' : 'interview';

    let selectedFormId = finalType === 'form' && editFormId !== 'none' ? editFormId : null;

    if (finalType === 'form' && editFormId === 'create-new') {
      try {
        setCreatingInlineForm(true);
        const res = await fetch('/api/organisations/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmed }),
        });
        const json = await res.json();
        if (json?.success) {
          selectedFormId = json.data.id;
          toast.success('Form created and linked');
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
            type: finalType,
            formId: finalType === 'form' ? selectedFormId : null,
            deadline: editDeadline || null,
            description: editDescription.trim() || null,
            interviewConfig: finalType === 'interview' ? editInterviewConfig || r.interviewConfig : null,
          }
        : r,
    );
    updateRounds(next);
    setEditingRound(null);
  };

  // ---- Delete ----
  const deleteRound = (roundId: string) => {
    if (rounds.length > 0 && rounds[0].id === roundId) {
      toast.error('The initial application form round is compulsory and cannot be removed.');
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold !text-left">Induction Pipeline</h3>
        </div>
        <p className="text-xs text-muted-foreground">Compulsory initial application form · Single active form per role</p>
      </div>

      {/* Horizontal Pipeline Scroll Container */}
      <div className="rounded-xl border border-border bg-card p-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center min-w-max py-2 px-1">
          {/* Start node */}
          <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-green/20 text-green-dark dark:text-green-light border-2 border-green/40 flex-shrink-0">
            <span className="text-xs font-bold">Start</span>
          </div>

          {rounds.map((round, index) => (
            <div key={round.id} className="flex items-center flex-shrink-0">
              {/* Connector line (Only show Plus button between rounds, never before Round 0) */}
              <div className="flex items-center mx-2 flex-shrink-0">
                <div className="w-4 h-0.5 bg-border" />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => openAddDialog(index - 1)}
                    className="w-6 h-6 rounded-full border-2 border-dashed border-border bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex-shrink-0"
                    aria-label="Add interview round here"
                    title="Insert interview round"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
                {index > 0 && <div className="w-4 h-0.5 bg-border" />}
              </div>

              {/* Node */}
              <PipelineNode
                round={round}
                index={index}
                formTitle={getFormTitle(round.formId)}
                onEdit={openEditDialog}
                onDelete={deleteRound}
                onConfigureSchedule={(r) => {
                  setInterviewSchedulerTarget(r);
                  setInterviewSchedulerOpen(true);
                }}
              />
            </div>
          ))}

          {/* Final connector + End node */}
          <div className="flex items-center mx-2 flex-shrink-0">
            <div className="w-4 h-0.5 bg-border" />
            <button
              type="button"
              onClick={() => openAddDialog(rounds.length - 1)}
              className="w-6 h-6 rounded-full border-2 border-dashed border-border bg-background flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex-shrink-0"
              aria-label="Add interview round at end"
              title="Add interview round"
            >
              <Plus className="h-3 w-3" />
            </button>
            <div className="w-4 h-0.5 bg-border" />
          </div>

          <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-primary/10 text-primary border-2 border-primary/30 flex-shrink-0">
            <span className="text-xs font-bold">End</span>
          </div>
        </div>
      </div>

      {/* ---- Add Round Dialog ---- */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Next Round</DialogTitle>
            <DialogDescription>
              Add an interview round to evaluate candidates advancing from the application form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Round name</Label>
              <Input
                value={newLabel}
                autoFocus
                placeholder="e.g. Technical Interview"
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void confirmAdd();
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Round Type</Label>
              <Select value="interview" disabled>
                <SelectTrigger className="opacity-90 cursor-not-allowed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">Interview (Slot Booking / Google Calendar)</SelectItem>
                  <SelectItem value="form" disabled>
                    Form (Only 1 active form permitted)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Round 1 is your single active application form. All subsequent rounds are interview stages.
              </p>
            </div>

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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit round</DialogTitle>
            <DialogDescription>
              {editingRound?.id === rounds[0]?.id
                ? 'Update details and form for the compulsory initial application round.'
                : 'Update schedule and details for this interview round.'}
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

            <div className="space-y-2">
              <Label>Round Type</Label>
              <Select value={editingRound?.id === rounds[0]?.id ? 'form' : 'interview'} disabled>
                <SelectTrigger className="opacity-90 cursor-not-allowed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">Form (Compulsory Initial Step)</SelectItem>
                  <SelectItem value="interview">Interview (Slot Booking / Google Calendar)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {editingRound?.id === rounds[0]?.id
                  ? 'The first round is always the single active application form for candidate submissions.'
                  : 'Subsequent evaluation rounds are interview stages.'}
              </p>
            </div>

            {editingRound?.id === rounds[0]?.id && (
              <div className="space-y-2">
                <Label>Linked Application Form (Single Active Form)</Label>
                <Select value={editFormId} onValueChange={setEditFormId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select or create form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No form linked</SelectItem>
                    <SelectItem value="create-new">+ Create new form with this name</SelectItem>
                    {forms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.title} ({f.form_status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingRound?.id !== rounds[0]?.id && (
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

