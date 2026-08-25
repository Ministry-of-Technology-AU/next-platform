import { ArrowLeft, User, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { requireOrgSession } from '@/lib/forms/api-helpers';
import { listFormsByOrg, withCompletionRate } from '@/lib/forms/strapi-forms';
import { getRoleById, listPipelineByRole, listApplicantsByRole, isOrganisationAccount, getOrganisationEmails } from '@/lib/inductions/strapi-inductions';
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
    console.error('getRoleById failed:', err);
    return null;
  }
}

export default async function RolePage({ params }: PageProps) {
  const { cycleId, roleId } = await params;
  const org = await requireOrgSession();
  if (org instanceof NextResponse) {
    notFound();
  }

  const [role, pipeline, allOrgFormsRaw, applicants, orgEmails] = await Promise.all([
    getRole(roleId),
    listPipelineByRole(roleId),
    listFormsByOrg(org.organisationId),
    listApplicantsByRole(roleId),
    getOrganisationEmails(org.organisationId),
  ]);

  if (!role) notFound();

  const allOrgForms: RoleFormSummary[] = allOrgFormsRaw.map((f) => {
    const withRate = withCompletionRate(f.stats);
    return {
      id: f.uid,
      title: f.title,
      form_status: f.status,
      startDate: f.startDate,
      endDate: f.endDate,
      updatedAt: f.updatedAt,
      fieldsCount:
        f.schema?.pages?.reduce((acc, p) => acc + (p.blocks?.length || 0), 0) ?? 0,
      stats: {
        ...withRate,
        lastSubmissionAt: f.stats?.lastSubmissionAt ?? null,
      },
    };
  });

  // Filter forms: only display forms that belong/link to this role's pipeline
  const linkedFormIds = new Set(
    pipeline.flatMap((r) => r.formIds ?? (r.formId ? [r.formId] : [])).filter(Boolean),
  );
  const roleForms = allOrgForms.filter(
    (f) => linkedFormIds.has(f.id) || linkedFormIds.has(String(f.id)),
  );

  const isOrgAccount = await isOrganisationAccount(
    org.email,
    org.organisationId,
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2 rounded-xl">
          <Link href={`/organisations/inductions/${cycleId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cycle
          </Link>
        </Button>
      </div>
      <RoleClient
        cycleId={cycleId}
        roleId={roleId}
        role={role}
        isOrgAccount={isOrgAccount}
        initialPipeline={pipeline}
        initialForms={roleForms}
        allOrgForms={allOrgForms}
        initialApplicants={applicants}
        orgEmails={orgEmails}
      />
    </div>
  );
}
