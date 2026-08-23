'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { RoleStatsBar } from '../../_components/role-stats';
import { RoleAccessBar } from '../../_components/role-access-bar';
import { PipelineBuilder } from '../../_components/pipeline-builder';
import { RoleForms, type RoleFormSummary } from '../../_components/role-forms';
import { RoleApplicants, type ApplicantRow } from '../../_components/role-applicants';
import type { InductionRole, PipelineRound } from '../../types';

interface RoleClientProps {
  cycleId: string;
  roleId: string;
  role: InductionRole;
  isOrgAccount?: boolean;
  initialPipeline: PipelineRound[];
  initialForms: RoleFormSummary[];
  allOrgForms: RoleFormSummary[];
  initialApplicants: ApplicantRow[];
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
}: RoleClientProps) {
  const [role, setRole] = useState<InductionRole>(initialRole);
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
        onChange={handlePipelineChange}
        onFormCreated={handleFormCreated}
      />
    </div>
  );
}
