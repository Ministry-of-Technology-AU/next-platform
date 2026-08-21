import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { getCycleById, listRolesByCycle } from '@/lib/inductions/strapi-inductions';
import { CycleClient } from './client';
import type { InductionCycleSummary, InductionRole } from '../types';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ cycleId: string }> };

async function getCycle(cycleId: string): Promise<InductionCycleSummary | null> {
  try {
    return await getCycleById(cycleId);
  } catch (err) {
    console.error('Error fetching cycle:', err);
    return null;
  }
}

async function getRoles(cycleId: string): Promise<InductionRole[]> {
  try {
    return await listRolesByCycle(cycleId);
  } catch (err) {
    console.error('Error fetching roles:', err);
    return [];
  }
}

export default async function CyclePage({ params }: PageProps) {
  const { cycleId } = await params;
  const cycle = await getCycle(cycleId);

  if (!cycle) {
    notFound();
  }

  const roles = await getRoles(cycleId);

  const startFormatted = cycle.startDate
    ? new Date(cycle.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    : 'TBD';
  const endFormatted = cycle.endDate
    ? new Date(cycle.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBD';

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2">
          <Link href="/organisations/inductions">
            <ArrowLeft className="h-4 w-4" />
            Back to Cycles
          </Link>
        </Button>
      </div>
      <PageTitle
        text={cycle.name}
        subheading={`${cycle.status === 'active' ? '🟢 Active' : cycle.status === 'completed' ? '✅ Completed' : '📝 Draft'} · ${startFormatted} — ${endFormatted}`}
      />
      <CycleClient cycleId={cycleId} cycle={cycle} initialRoles={roles} />
    </div>
  );
}
