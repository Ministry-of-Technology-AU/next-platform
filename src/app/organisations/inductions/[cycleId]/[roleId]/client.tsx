'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { RoleStatsBar } from '../../_components/role-stats';
import { PipelineBuilder } from '../../_components/pipeline-builder';
import { RoleForms, type RoleFormSummary } from '../../_components/role-forms';
import { RoleApplicants, type ApplicantRow } from '../../_components/role-applicants';
import type { InductionRole, PipelineRound } from '../../types';

interface RoleClientProps {
  cycleId: string;
  roleId: string;
  role: InductionRole;
  initialPipeline: PipelineRound[];
  initialForms: RoleFormSummary[];
  allOrgForms: RoleFormSummary[];
  initialApplicants: ApplicantRow[];
}

export function RoleClient({
  cycleId,
  roleId,
  role,
  initialPipeline,
  initialForms,
  allOrgForms,
  initialApplicants,
}: RoleClientProps) {
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

      // Re-sync displayed forms based on updated pipeline rounds
      const linkedFormIds = new Set(rounds.map((r) => r.formId).filter(Boolean));
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
    const updatedPipeline = pipeline.map((r) =>
      r.formId && !updatedIds.has(r.formId) ? { ...r, formId: null } : r,
    );
    if (JSON.stringify(updatedPipeline) !== JSON.stringify(pipeline)) {
      void handlePipelineChange(updatedPipeline);
    }
  };

  // Derive round labels from pipeline for filter tabs in the applicants table
  const roundLabels = pipeline.map((r) => r.label);

  return (
    <div className="mt-6 space-y-8">
      {/* Role Stats */}
      <RoleStatsBar stats={role.stats} />

      {/* Description */}
      {role.description && (
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground !text-left">{role.description}</p>
        </div>
      )}

      <Separator />

      {/* 1. Show Applicants */}
      <RoleApplicants
        roleId={roleId}
        applicants={initialApplicants}
        roundLabels={roundLabels}
        pipeline={pipeline}
      />

      <Separator />

      {/* 2. Show Induction Forms */}
      <RoleForms
        forms={forms}
        cycleId={cycleId}
        roleId={roleId}
        onFormsChange={handleFormsChange}
      />

      <Separator />

      {/* 3. Show Pipeline */}
      <PipelineBuilder
        rounds={pipeline}
        forms={availableForms}
        roleName={role.name}
        onChange={handlePipelineChange}
      />
    </div>
  );
}
