import { ArrowLeft, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import PageTitle from '@/components/page-title';
import { requireCycleAccess } from '@/lib/inductions/access';
import { Button } from '@/components/ui/button';
import { getCycleById, listRolesByCycle } from '@/lib/inductions/strapi-inductions';
import { CycleClient } from './client';
import type { InductionCycleSummary, InductionRole } from '../types';
import { CYCLE_STATUS_STYLE, formatCycleDateRange, getDerivedCycleStatus } from '../types';

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

  // Cycles are the organisation account's own workspace. Role delegates and
  // circle leads have no business here, and are not told the cycle exists.
  const org = await requireCycleAccess(cycleId);
  if (org instanceof NextResponse) {
    notFound();
  }

  const cycle = await getCycle(cycleId);

  if (!cycle) {
    notFound();
  }

  const roles = await getRoles(cycleId);
  const status = getDerivedCycleStatus(cycle.status, cycle.startDate, cycle.endDate);

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
        icon={CalendarDays}
        text={cycle.name}
        subheading={
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="whitespace-nowrap font-medium text-foreground/80">
              {formatCycleDateRange(cycle.startDate, cycle.endDate)}
            </span>
            <span>·</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CYCLE_STATUS_STYLE[status]}`}
            >
              {status}
            </span>
          </div>
        }
      />
      <CycleClient cycleId={cycleId} cycle={cycle} initialRoles={roles} />
    </div>
  );
}
