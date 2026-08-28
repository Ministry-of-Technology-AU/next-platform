import { NextResponse } from 'next/server';
import { jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { requireCycleAccess } from '@/lib/inductions/access';
import { getCycleById, updateCycle, deleteCycle } from '@/lib/inductions/strapi-inductions';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ cycleId: string }> };

/** GET /api/organisations/inductions/:cycleId */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { cycleId } = await context.params;

    const org = await requireCycleAccess(cycleId);
    if (org instanceof NextResponse) return org;

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
    const { cycleId } = await context.params;

    const org = await requireCycleAccess(cycleId);
    if (org instanceof NextResponse) return org;

    const body = await req.json().catch(() => ({}));

    // An org may run several cycles at once, so activating one leaves its
    // siblings alone — each cycle's own dates decide whether it is live.
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
    const { cycleId } = await context.params;

    const org = await requireCycleAccess(cycleId);
    if (org instanceof NextResponse) return org;

    await deleteCycle(cycleId);

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/organisations/inductions/:cycleId failed:', err);
    return jsonError('Failed to delete cycle', 500);
  }
}
