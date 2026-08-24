import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { getCycleById, updateCycle, deleteCycle, deactivateOtherCycles } from '@/lib/inductions/strapi-inductions';
import { getDerivedCycleStatus } from '@/app/organisations/inductions/types';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ cycleId: string }> };

/** GET /api/organisations/inductions/:cycleId */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { cycleId } = await context.params;
    const cycle = await getCycleById(cycleId);
    if (!cycle) return jsonError('Cycle not found', 404);

    return jsonOk(cycle);
  } catch (err) {
    console.error('GET /api/organisations/inductions/:cycleId failed:', err);
    return jsonError('Failed to fetch cycle', 500);
  }
}

/** PUT /api/organisations/inductions/:cycleId */
export async function PUT(req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { cycleId } = await context.params;
    const body = await req.json().catch(() => ({}));

    // Derive the effective status that will be written
    const derivedStatus = getDerivedCycleStatus(
      body.status ?? 'draft',
      body.startDate ?? null,
      body.endDate ?? null,
    );

    // Enforce one-active-cycle rule: deactivate sibling active cycles before saving
    if (derivedStatus === 'active') {
      await deactivateOtherCycles(org.organisationId, cycleId);
    }

    const existingCycle = await getCycleById(cycleId);

    let deadlineExtension = body.deadlineExtension;
    if (!deadlineExtension && existingCycle?.endDate && body.endDate) {
      const oldTime = new Date(existingCycle.endDate).getTime();
      const newTime = new Date(body.endDate).getTime();
      if (!isNaN(oldTime) && !isNaN(newTime) && newTime > oldTime) {
        deadlineExtension = {
          extendedAt: new Date().toISOString(),
          previousDeadline: existingCycle.endDate,
          newDeadline: body.endDate,
          reason: body.deadlineExtensionReason || null,
        };
      }
    }

    const updatedStats = {
      ...(existingCycle?.stats || {}),
      ...(body.stats || {}),
      ...(deadlineExtension ? { deadlineExtension } : {}),
    };

    const updated = await updateCycle(cycleId, {
      ...body,
      stats: updatedStats,
    });
    if (!updated) return jsonError('Failed to update cycle', 500);

    return jsonOk(updated);
  } catch (err) {
    console.error('PUT /api/organisations/inductions/:cycleId failed:', err);
    return jsonError('Failed to update cycle', 500);
  }
}

/** DELETE /api/organisations/inductions/:cycleId */
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { cycleId } = await context.params;
    await deleteCycle(cycleId);

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/organisations/inductions/:cycleId failed:', err);
    return jsonError('Failed to delete cycle', 500);
  }
}
