import { ArrowLeft, User, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { requireOrgSession } from '@/lib/forms/api-helpers';
import { listFormsByOrg, withCompletionRate } from '@/lib/forms/strapi-forms';
import { getRoleById, listPipelineByRole, listApplicantsByRole, isOrganisationAccount } from '@/lib/inductions/strapi-inductions';
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

  const [role, pipeline, allOrgFormsRaw, applicants] = await Promise.all([
    getRole(roleId),
    listPipelineByRole(roleId),
    listFormsByOrg(org.organisationId),
    listApplicantsByRole(roleId),
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
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2">
          <Link href={`/organisations/inductions/${cycleId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Cycle
          </Link>
        </Button>
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageTitle
          icon={User}
          text={role.name}
          subheading={
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <span className="font-semibold text-foreground/80">{TIER_LABELS[role.tier] || 'Other'}</span>
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
        {roleForms[0] && (
          <Button asChild size="sm" variant="outline" className="gap-1.5 mt-1 font-medium">
            <Link href={`/organisations/inductions/forms/${roleForms[0].id}/responses?cycleId=${cycleId}&roleId=${roleId}`}>
              <ClipboardList className="h-4 w-4" />
              View Form Responses
            </Link>
          </Button>
        )}
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
      />
    </div>
  );
}
