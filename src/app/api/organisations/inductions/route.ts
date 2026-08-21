import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { listCyclesByOrg, createCycle } from '@/lib/inductions/strapi-inductions';

export const dynamic = 'force-dynamic';

/** GET /api/organisations/inductions — list cycles for the org */
export async function GET() {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const cycles = await listCyclesByOrg(org.organisationId);
    return jsonOk(cycles);
  } catch (err) {
    console.error('GET /api/organisations/inductions failed:', err);
    return jsonError('Failed to list induction cycles', 500);
  }
}

/** POST /api/organisations/inductions — create a new induction cycle */
export async function POST(request: Request) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) return jsonError('Cycle name is required', 400);

    const created = await createCycle({
      organisationId: org.organisationId,
      name,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      description: body.description || null,
    });

    if (!created) return jsonError('Failed to create induction cycle', 500);
    return jsonOk(created, 201);
  } catch (err) {
    console.error('POST /api/organisations/inductions failed:', err);
    return jsonError('Failed to create induction cycle', 500);
  }
}
