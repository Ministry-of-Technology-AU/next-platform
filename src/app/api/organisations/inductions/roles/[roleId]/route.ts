import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { getRoleById, updateRole, deleteRole } from '@/lib/inductions/strapi-inductions';
import { strapiGet } from '@/lib/apis/strapi';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ roleId: string }> };

/** GET /api/organisations/inductions/roles/:roleId */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { roleId } = await context.params;
    const role = await getRoleById(roleId);
    if (!role) return jsonError('Role not found', 404);

    return jsonOk(role);
  } catch (err) {
    console.error('GET /api/organisations/inductions/roles/:roleId failed:', err);
    return jsonError('Failed to fetch role', 500);
  }
}

/** PUT /api/organisations/inductions/roles/:roleId */
export async function PUT(req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { roleId } = await context.params;
    const body = await req.json().catch(() => ({}));

    // If accessEmails is modified, ensure only the organization's account can update it
    if (body.accessEmails !== undefined) {
      const { isOrganisationAccount } = await import('@/lib/inductions/strapi-inductions');
      const isOrgAccount = await isOrganisationAccount(org.email, org.organisationId);

      if (!isOrgAccount) {
        return jsonError('Only the organization account can edit access permissions', 403);
      }
    }

    const updated = await updateRole(roleId, body);
    if (!updated) return jsonError('Failed to update role', 500);

    return jsonOk(updated);
  } catch (err) {
    console.error('PUT /api/organisations/inductions/roles/:roleId failed:', err);
    return jsonError('Failed to update role', 500);
  }
}

/** DELETE /api/organisations/inductions/roles/:roleId */
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { roleId } = await context.params;
    await deleteRole(roleId);

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/organisations/inductions/roles/:roleId failed:', err);
    return jsonError('Failed to delete role', 500);
  }
}
