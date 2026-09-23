import { NextResponse } from 'next/server';
import { jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { requireRoleAccess } from '@/lib/inductions/access';
import { listPipelineByRole, syncPipeline } from '@/lib/inductions/strapi-inductions';
import type { PipelineRound } from '@/app/organisations/inductions/types';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ roleId: string }> };

/** GET /api/organisations/inductions/roles/:roleId/pipeline */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { roleId } = await context.params;

    const actor = await requireRoleAccess(roleId);
    if (actor instanceof NextResponse) return actor;

    const pipeline = await listPipelineByRole(roleId);

    return jsonOk(pipeline);
  } catch (err) {
    console.error('GET /api/organisations/inductions/roles/:roleId/pipeline failed:', err);
    return jsonError('Failed to fetch pipeline', 500);
  }
}

/** PUT /api/organisations/inductions/roles/:roleId/pipeline */
export async function PUT(req: Request, context: RouteContext) {
  try {
    const { roleId } = await context.params;

    const actor = await requireRoleAccess(roleId);
    if (actor instanceof NextResponse) return actor;

    const body = await req.json().catch(() => ({}));
    const rounds = Array.isArray(body?.rounds) ? (body.rounds as PipelineRound[]) : [];

    const updated = await syncPipeline(roleId, rounds);
    return jsonOk(updated);
  } catch (err) {
    console.error('PUT /api/organisations/inductions/roles/:roleId/pipeline failed:', err);
    return jsonError('Failed to sync pipeline', 500);
  }
}
