import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { requireOrgSession } from '@/lib/forms/api-helpers';
import { listFormsByOrg, withCompletionRate } from '@/lib/forms/strapi-forms';
import { getRoleById, listPipelineByRole, listApplicantsByRole } from '@/lib/inductions/strapi-inductions';
import { RoleClient } from './client';
import type { InductionRole, PipelineRound } from '../../types';
import { TIER_LABELS } from '../../types';
import type { RoleFormSummary } from '../../_components/role-forms';
import type { ApplicantRow } from '../../_components/role-applicants';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ cycleId: string; roleId: string }> };

async function getRole(roleId: string): Promise<InductionRole | null> {
  try {
    return await getRoleById(roleId);
  } catch (err) {
    console.error('Error fetching role:', err);
    return null;
  }
}

async function getPipeline(roleId: string): Promise<PipelineRound[]> {
  try {
    return await listPipelineByRole(roleId);
  } catch (err) {
    console.error('Error fetching pipeline:', err);
    return [];
  }
}

async function getAllOrgForms(): Promise<RoleFormSummary[]> {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return [];
    const forms = await listFormsByOrg(org.organisationId);
    return forms.map((f) => ({
      id: f.uid,
      title: f.title,
      form_status: f.status,
      stats: withCompletionRate(f.stats),
    }));
  } catch (err) {
    console.error('Error fetching forms for role:', err);
    return [];
  }
}

async function getApplicants(roleId: string): Promise<ApplicantRow[]> {
  try {
    return await listApplicantsByRole(roleId);
  } catch (err) {
    console.error('Error fetching applicants:', err);
    return [];
  }
}

export default async function RolePage({ params }: PageProps) {
  const { cycleId, roleId } = await params;
  const role = await getRole(roleId);

  if (!role) {
    notFound();
  }

  const pipeline = await getPipeline(roleId);
  const allOrgForms = await getAllOrgForms();
  const applicants = await getApplicants(roleId);

  // Filter forms: only display forms that belong/link to this role's pipeline
  const linkedFormIds = new Set(pipeline.map((r) => r.formId).filter(Boolean));
  const roleForms = allOrgForms.filter(
    (f) => linkedFormIds.has(f.id) || linkedFormIds.has(String(f.id)),
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2">
          <Link href={`/organisations/inductions/${cycleId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cycle
          </Link>
        </Button>
      </div>
      <PageTitle
        text={role.name}
        subheading={`${TIER_LABELS[role.tier]}${role.department ? ` · ${role.department}` : ''}`}
      />
      <RoleClient
        cycleId={cycleId}
        roleId={roleId}
        role={role}
        initialPipeline={pipeline}
        initialForms={roleForms}
        allOrgForms={allOrgForms}
        initialApplicants={applicants}
      />
    </div>
  );
}
