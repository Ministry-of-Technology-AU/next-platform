import { UserCheck } from 'lucide-react';
import { NextResponse } from 'next/server';
import PageTitle from '@/components/page-title';
import { requireOrgSession } from '@/lib/forms/api-helpers';
import { listCyclesByOrg } from '@/lib/inductions/strapi-inductions';
import { InductionsClient } from './client';
import type { InductionCycleSummary } from './types';

export const dynamic = 'force-dynamic';

async function getCycles(): Promise<InductionCycleSummary[]> {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return [];
    return await listCyclesByOrg(org.organisationId);
  } catch (err) {
    console.error('Error fetching induction cycles:', err);
    return [];
  }
}

export default async function InductionsPage() {
  const cycles = await getCycles();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageTitle
        text="Induction Cycles"
        icon={UserCheck}
        subheading="Manage your organisation's induction cycles — create rounds, assign roles, build forms, and track applicants."
      />
      <InductionsClient initialCycles={cycles} />
    </div>
  );
}