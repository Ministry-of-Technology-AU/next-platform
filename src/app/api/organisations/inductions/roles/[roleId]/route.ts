import { NextResponse } from 'next/server';
import { jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { requireOrgAccount, requireRoleAccess } from '@/lib/inductions/access';
import { getRoleById, updateRole, deleteRole } from '@/lib/inductions/strapi-inductions';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ roleId: string }> };

/** GET /api/organisations/inductions/roles/:roleId */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { roleId } = await context.params;

    const actor = await requireRoleAccess(roleId);
    if (actor instanceof NextResponse) return actor;

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
    const { roleId } = await context.params;

    const actor = await requireRoleAccess(roleId);
    if (actor instanceof NextResponse) return actor;

    const body = await req.json().catch(() => ({}));

    // Delegates work inside the role; who else gets in is the org's call alone,
    // otherwise a delegate could grant access to anyone including themselves.
    if (body.accessEmails !== undefined) {
      const denied = requireOrgAccount(actor, 'edit access permissions');
      if (denied) return denied;
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
    const { roleId } = await context.params;

    const actor = await requireRoleAccess(roleId);
    if (actor instanceof NextResponse) return actor;

    const denied = requireOrgAccount(actor, 'delete a role');
    if (denied) return denied;

    await deleteRole(roleId);

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/organisations/inductions/roles/:roleId failed:', err);
    return jsonError('Failed to delete role', 500);
  }
}
