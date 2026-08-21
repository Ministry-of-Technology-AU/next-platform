import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { getCycleById, updateCycle, deleteCycle } from '@/lib/inductions/strapi-inductions';

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

    const updated = await updateCycle(cycleId, body);
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
