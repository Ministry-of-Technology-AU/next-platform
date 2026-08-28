'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { User, Settings, ClipboardList } from 'lucide-react';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RoleStatsBar } from '../../_components/role-stats';
import { RoleAccessBar } from '../../_components/role-access-bar';
import { PipelineBuilder } from '../../_components/pipeline-builder';
import { RoleForms, type RoleFormSummary } from '../../_components/role-forms';
import { RoleApplicants, type ApplicantRow } from '../../_components/role-applicants';
import { RoleFormDialog } from '../../_components/new-role-dialog';
import type { InductionRole, PipelineRound } from '../../types';
import { TIER_LABELS } from '../../types';

interface RoleClientProps {
  cycleId: string;
  roleId: string;
  role: InductionRole;
  isOrgAccount?: boolean;
  initialPipeline: PipelineRound[];
  initialForms: RoleFormSummary[];
  allOrgForms: RoleFormSummary[];
  initialApplicants: ApplicantRow[];
  /** Organisation contact addresses, pre-filled as interview invitees. */
  orgEmails?: string[];
}

export function RoleClient({
  cycleId,
  roleId,
  role: initialRole,
  isOrgAccount = false,
  initialPipeline,
  initialForms,
  allOrgForms,
  initialApplicants,
  orgEmails = [],
}: RoleClientProps) {
  const [role, setRole] = useState<InductionRole>(initialRole);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineRound[]>(initialPipeline);
  const [forms, setForms] = useState<RoleFormSummary[]>(initialForms);
  const [availableForms, setAvailableForms] = useState<RoleFormSummary[]>(allOrgForms);

  const handlePipelineChange = async (rounds: PipelineRound[]) => {
    setPipeline(rounds);
    try {
      const res = await fetch(`/api/organisations/inductions/roles/${roleId}/pipeline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update pipeline');
      }

      if (Array.isArray(json.data) && json.data.length > 0) {
        setPipeline(json.data);
      }

      // Re-sync displayed forms based on updated pipeline rounds
      const updatedRounds = Array.isArray(json.data) && json.data.length > 0 ? json.data : rounds;
      const linkedFormIds = new Set(updatedRounds.flatMap((r: any) => r.formIds ?? (r.formId ? [r.formId] : [])).filter(Boolean));
      const updatedForms = availableForms.filter((f) => linkedFormIds.has(f.id));
      setForms(updatedForms);
      toast.success('Pipeline updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save pipeline changes');
    }
  };

  const handleFormsChange = (updatedForms: RoleFormSummary[]) => {
    setForms(updatedForms);
    const updatedIds = new Set(updatedForms.map((f) => f.id));
    // If a form was deleted, unlink it from pipeline rounds
    const updatedPipeline = pipeline.map((r) => {
      const cleanedFormIds = (r.formIds ?? []).filter((id) => updatedIds.has(id));
      const changed = cleanedFormIds.length !== (r.formIds ?? []).length;
      return changed ? { ...r, formIds: cleanedFormIds, formId: cleanedFormIds[0] ?? null } : r;
    });
    if (JSON.stringify(updatedPipeline) !== JSON.stringify(pipeline)) {
      void handlePipelineChange(updatedPipeline);
    }
  };

  const handleFormCreated = (newForm: RoleFormSummary) => {
    setAvailableForms((prev) => [newForm, ...prev.filter((f) => f.id !== newForm.id)]);
  };

  // Derive round labels from pipeline for filter tabs in the applicants table
  const roundLabels = pipeline.map((r) => r.label);
  const primaryFormId =
    forms[0]?.id ??
    role.primaryFormId ??
    pipeline.flatMap((r) => r.formIds ?? (r.formId ? [r.formId] : [])).find(Boolean) ??
    null;

  return (
    <div className="mt-6 space-y-8">
      {/* Header with Title, Circle/Department/Description Subheading, and Actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageTitle
          icon={User}
          text={role.name}
          subheading={
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <span className="font-semibold text-foreground/80">{TIER_LABELS[role.tier] || 'Circle 3 (General)'}</span>
              {role.department && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{role.department}</span>
                </>
              )}
              {role.description && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-muted-foreground/80 line-clamp-1 max-w-xl">{role.description}</span>
                </>
              )}
              {role.accessEmails && role.accessEmails.length > 0 && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-foreground/75 font-medium">{role.accessEmails.length} with access</span>
                </>
              )}
            </div>
          }
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setSettingsOpen(true)}
            className="h-9 w-9 mt-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
            aria-label="Role settings"
            title="Role settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {forms[0] && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 mt-1 font-medium rounded-xl">
              <Link href={`/organisations/inductions/forms/${forms[0].id}/responses?cycleId=${cycleId}&roleId=${roleId}`}>
                <ClipboardList className="h-4 w-4" />
                View Form Responses
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Role Settings Dialog */}
      <RoleFormDialog
        role={role}
        cycleId={cycleId}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onUpdated={(updated) => {
          setRole(updated);
          setSettingsOpen(false);
        }}
      />

      {/* Role Stats */}
      <RoleStatsBar stats={role.stats} />

      {/* Conditionally rendered Access Permissions bar - only for organisation accounts */}
      {isOrgAccount && (
        <RoleAccessBar role={role} onUpdated={setRole} />
      )}

      <Separator />

      {/* 1. Show Applicants */}
      <RoleApplicants
        roleId={roleId}
        cycleId={cycleId}
        applicants={initialApplicants}
        roundLabels={roundLabels}
        pipeline={pipeline}
        primaryFormId={primaryFormId}
      />

      <Separator />

      {/* 2. Show Induction Forms */}
      <RoleForms
        forms={forms}
        cycleId={cycleId}
        roleId={roleId}
        pipeline={pipeline}
        onFormsChange={handleFormsChange}
        onFormCreated={handleFormCreated}
      />

      <Separator />

      {/* 3. Show Pipeline */}
      <PipelineBuilder
        rounds={pipeline}
        forms={availableForms}
        applicants={initialApplicants}
        roleName={role.name}
        orgEmails={orgEmails}
        onChange={handlePipelineChange}
        onFormCreated={handleFormCreated}
      />
    </div>
  );
}
