import { FileUser, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { NextResponse } from 'next/server';
import PageTitle from '@/components/page-title';
import { auth } from '@/auth';
import { requireInductionOrg } from '@/lib/inductions/access';
import { listCyclesByOrg, listRolesSharedWith } from '@/lib/inductions/strapi-inductions';
import { InductionsClient } from './client';
import type { InductionCycleSummary } from './types';

export const dynamic = 'force-dynamic';

/**
 * Cycles belong to the organisation account alone. Anyone else who reaches this
 * page — circle-1/circle-2 leads included — sees only the individual roles the
 * organisation has shared with their email, and nothing about the cycle around
 * them.
 */
async function SharedRolesView({ email }: { email: string }) {
  const roles = await listRolesSharedWith(email);

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold text-foreground">Roles shared with you</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Induction cycles are managed by the organisation&rsquo;s own account. You can work on
              the individual roles it has given you access to.
            </p>
          </div>
        </div>

        {roles.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
            No roles have been shared with <span className="font-medium text-foreground">{email}</span> yet.
            Ask your organisation to add you under &ldquo;People with Access&rdquo; on the role.
          </p>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {roles.map((role) => (
              <li key={role.roleId}>
                <Link
                  href={`/organisations/inductions/${role.cycleId ?? 'role'}/${role.roleId}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-3 transition-colors hover:bg-muted/70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {role.roleName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                      <Layers className="h-3 w-3 flex-shrink-0" />
                      {[role.organisationName, role.cycleName].filter(Boolean).join(' · ') ||
                        'Induction role'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { syncOrganisationInductionCalendarEvent } from '@/lib/inductions/calendar-sync';

async function getCycles(organisationId: number): Promise<InductionCycleSummary[]> {
  try {
    // Automatically ensure the Google Calendar event is synced/created
    syncOrganisationInductionCalendarEvent(organisationId).catch((e) =>
      console.error('Background calendar sync error:', e)
    );
    return await listCyclesByOrg(organisationId);
  } catch (err) {
    console.error('Error fetching induction cycles:', err);
    return [];
  }
}

export default async function InductionsPage() {
  const org = await requireInductionOrg();
  const session = await auth();
  const email = session?.user?.email ?? '';

  const isOrgAccount = !(org instanceof NextResponse);
  const cycles = isOrgAccount ? await getCycles(org.organisationId) : [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageTitle
        text="Inductions"
        icon={FileUser}
        subheading="Manage your inductions end to end. Multiple cycles, roles and forms. Inductions, completely your way!"
      />
      {isOrgAccount ? (
        <InductionsClient initialCycles={cycles} />
      ) : (
        <SharedRolesView email={email} />
      )}
    </div>
  );
}
