import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { listRolesByCycle, createRole } from '@/lib/inductions/strapi-inductions';
import type { RoleTier } from '@/app/organisations/inductions/types';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ cycleId: string }> };

/** GET /api/organisations/inductions/:cycleId/roles */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { cycleId } = await context.params;
    const roles = await listRolesByCycle(cycleId);

    return jsonOk(roles);
  } catch (err) {
    console.error('GET /api/organisations/inductions/:cycleId/roles failed:', err);
    return jsonError('Failed to list roles', 500);
  }
}

/** POST /api/organisations/inductions/:cycleId/roles */
export async function POST(req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { cycleId } = await context.params;
    const body = await req.json().catch(() => ({}));

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) return jsonError('Role name is required', 400);

    const created = await createRole({
      cycleId,
      name,
      tier: (body.tier as RoleTier) || 'tier-1',
      department: body.department || null,
      description: body.description || null,
      accessEmails: Array.isArray(body.accessEmails) ? body.accessEmails : [],
    });

    if (!created) return jsonError('Failed to create role', 500);
    return jsonOk(created, 201);
  } catch (err) {
    console.error('POST /api/organisations/inductions/:cycleId/roles failed:', err);
    return jsonError('Failed to create role', 500);
  }
}
