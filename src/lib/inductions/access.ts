import 'server-only';

/**
 * Authorisation for the induction workspace.
 *
 * Two — and only two — kinds of caller can reach an org's induction data:
 *
 *  - the **organisation account** itself (the platform account linked as the
 *    organisation's `profile`). It owns everything: cycles, roles, applicants.
 *  - a **delegate**: an individual whose email the organisation added to a
 *    specific role's access list. Their reach stops at that one role.
 *
 * Circle-1 / circle-2 leads get nothing by virtue of being leads. They sit in
 * the org's `circle*_humans` relations, which is enough for `requireOrgSession`
 * to hand them an `organisationId` — so every guard here re-checks the caller
 * against the organisation's `profile` rather than trusting that id.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { jsonError } from '@/lib/forms/api-helpers';
import {
  getCycleOwnerOrgId,
  getOrganisationIdForAccount,
  getRoleOwnership,
  isOrganisationAccount,
  type RoleOwnership,
} from './strapi-inductions';

/** A caller that cleared one of the guards below. */
export interface InductionActor {
  email: string;
  organisationId: number;
  /** True for the organisation account, false for a role delegate. */
  isOrgAccount: boolean;
}

export interface RoleActor extends InductionActor {
  role: RoleOwnership;
}

async function sessionEmail(): Promise<string | NextResponse> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return jsonError('User not authenticated', 401);
  return email.trim().toLowerCase();
}

/**
 * The organisation account, with no particular cycle or role in mind — for
 * listing and creating cycles. Delegates never pass this.
 */
export async function requireInductionOrg(): Promise<InductionActor | NextResponse> {
  const email = await sessionEmail();
  if (email instanceof NextResponse) return email;

  // Resolve the org from the `profile` link rather than from circle membership,
  // so a lead who also happens to run a different org cannot land on its cycles.
  let organisationId = await getOrganisationIdForAccount(email);

  if (!organisationId) {
    // Admin and platform-governance accounts have no `profile` link of their
    // own; fall back to the general lookup and let isOrganisationAccount judge.
    const { getUserIdByEmail, getOrganisationIdByUserId } = await import('@/lib/userid');
    const userId = await getUserIdByEmail(email);
    if (!userId) return jsonError('User not found in system', 404);
    organisationId = await getOrganisationIdByUserId(userId);
  }

  if (!organisationId) return jsonError('You are not part of an organisation', 403);

  if (!(await isOrganisationAccount(email, organisationId))) {
    return jsonError('Only the organisation account can manage inductions', 403);
  }

  return { email, organisationId, isOrgAccount: true };
}

/**
 * Access to one cycle. Cycles are organisation-only by design: a delegate is
 * invited to a role, which never implies sight of the rest of the cycle.
 */
export async function requireCycleAccess(
  cycleId: string | number,
): Promise<InductionActor | NextResponse> {
  const email = await sessionEmail();
  if (email instanceof NextResponse) return email;

  const organisationId = await getCycleOwnerOrgId(cycleId);
  if (!organisationId) return jsonError('Cycle not found', 404);

  if (!(await isOrganisationAccount(email, organisationId))) {
    return jsonError('Only the organisation account can manage this cycle', 403);
  }

  return { email, organisationId, isOrgAccount: true };
}

/**
 * Access to one role: the owning organisation account, or an email that
 * organisation put on this role's access list.
 *
 * Delegates are ordinary student accounts, so this deliberately does not go
 * through `requireOrgSession` — the role's own access list is the credential.
 */
export async function requireRoleAccess(
  roleId: string | number,
): Promise<RoleActor | NextResponse> {
  const email = await sessionEmail();
  if (email instanceof NextResponse) return email;

  const role = await getRoleOwnership(roleId);
  if (!role) return jsonError('Role not found', 404);
  // A role with no owning organisation is orphaned data — nobody may act on it.
  if (!role.organisationId) return jsonError('Role not found', 404);

  if (await isOrganisationAccount(email, role.organisationId)) {
    return { email, organisationId: role.organisationId, isOrgAccount: true, role };
  }

  if (role.accessEmails.includes(email)) {
    return { email, organisationId: role.organisationId, isOrgAccount: false, role };
  }

  return jsonError('You do not have access to this role', 403);
}

/**
 * Narrows a role guard to organisation-only actions — editing the access list
 * itself, deleting the role, and anything else a delegate must not do.
 */
export function requireOrgAccount(actor: InductionActor, action: string): NextResponse | null {
  if (actor.isOrgAccount) return null;
  return jsonError(`Only the organisation account can ${action}`, 403);
}
