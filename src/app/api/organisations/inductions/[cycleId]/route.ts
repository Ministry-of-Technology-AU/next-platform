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

    const cleanStartDate = body.startDate !== undefined
      ? (body.startDate ? (body.startDate.includes('T') ? body.startDate.split('T')[0] : body.startDate) : null)
      : undefined;
    const cleanEndDate = body.endDate !== undefined
      ? (body.endDate ? (body.endDate.includes('T') ? body.endDate.split('T')[0] : body.endDate) : null)
      : undefined;

    let deadlineExtension = body.deadlineExtension;
    if (!deadlineExtension && existingCycle?.endDate && cleanEndDate) {
      const oldTime = new Date(existingCycle.endDate).getTime();
      const newTime = new Date(cleanEndDate).getTime();
      if (!isNaN(oldTime) && !isNaN(newTime) && newTime > oldTime) {
        deadlineExtension = {
          extendedAt: new Date().toISOString(),
          previousDeadline: existingCycle.endDate,
          newDeadline: cleanEndDate,
          reason: body.deadlineExtensionReason || null,
        };
      }
    }

    const updatedStats = {
      ...(existingCycle?.stats || {}),
      ...(body.stats || {}),
      ...(deadlineExtension ? { deadlineExtension } : {}),
    };

    if (cleanEndDate && updatedStats.deadlineExtension) {
      updatedStats.deadlineExtension.newDeadline = cleanEndDate;
    }

    const updated = await updateCycle(cycleId, {
      name: body.name,
      description: body.description,
      status: body.status,
      startDate: cleanStartDate,
      endDate: cleanEndDate,
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
