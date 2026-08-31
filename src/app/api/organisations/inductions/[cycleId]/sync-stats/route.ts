import { NextResponse } from 'next/server';
import { requireInductionOrg } from '@/lib/inductions/access';
import { getCycleById, listRolesByCycle, updateRole, updateCycle } from '@/lib/inductions/strapi-inductions';
import { strapiGet } from '@/lib/apis/strapi';
import { PLACEHOLDER_ROLE_STATS } from '@/app/organisations/inductions/types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  try {
    const org = await requireInductionOrg();
    if (org instanceof NextResponse) return org;

    const { cycleId } = await params;
    const cycle = await getCycleById(cycleId);
    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }

    // Recalculate stats for each role and the cycle itself.
    const roles = await listRolesByCycle(cycleId);
    let totalOpens = 0;
    let totalFills = 0;
    let totalDrafts = 0;

    for (const role of roles) {
      let roleStats = { ...PLACEHOLDER_ROLE_STATS };
      
      // Fetch pipeline rounds for the role to find the linked form
      const roleRes = await strapiGet(`/induction-roles/${role.id}`, {
        populate: {
          pipeline_rounds: {
            populate: {
              form: true,
            },
          },
        },
      });
      
      const rAttrs = roleRes?.data?.attributes ?? roleRes?.data;
      const rounds = Array.isArray(rAttrs?.pipeline_rounds?.data)
        ? rAttrs.pipeline_rounds.data
        : Array.isArray(rAttrs?.pipeline_rounds)
          ? rAttrs.pipeline_rounds
          : [];
      
      const sortedRounds = [...rounds].sort((x: any, y: any) => {
        const xA = x?.attributes ?? x;
        const yA = y?.attributes ?? y;
        return (xA.order ?? 0) - (yA.order ?? 0);
      });
      
      const firstRound = sortedRounds[0];
      if (firstRound) {
        const rndAttrs = firstRound?.attributes ?? firstRound;
        const formEntry = rndAttrs?.form?.data ?? rndAttrs?.form;
        const formAttrs = formEntry?.attributes ?? formEntry;
        if (formAttrs?.stats) {
          const fs = formAttrs.stats;
          const opens = fs.uniqueVisits ?? 0;
          const fills = fs.submissionCount ?? 0;
          const drafts = fs.draftCount ?? 0;
          roleStats = {
            opens,
            fills,
            drafts,
            completionRate: opens > 0 ? fills / opens : 0,
            topUtm: null,
          };
        }
      }

      await updateRole(role.id, { stats: roleStats });

      totalOpens += roleStats.opens;
      totalFills += roleStats.fills;
      totalDrafts += roleStats.drafts;
    }

    const newCycleStats = {
      ...cycle.stats,
      rolesCount: roles.length,
      totalOpens,
      totalFills,
      totalDrafts,
      applicantsCount: totalFills,
      completionRate: totalOpens > 0 ? totalFills / totalOpens : 0,
    };

    await updateCycle(cycleId, { stats: newCycleStats });

    return NextResponse.json({ success: true, stats: newCycleStats });
  } catch (error: any) {
    console.error('Error syncing cycle stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
