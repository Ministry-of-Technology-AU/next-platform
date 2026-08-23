import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import PageTitle from '@/components/page-title';
import { ResponsesClient } from './client';
import { BackButton } from './_components/back-button';
import type { ResponseRow } from './_components/response-detail';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ cycleId?: string; roleId?: string; email?: string }>;
};

async function fetchJson(url: string, cookieHeader: string) {
  const res = await fetch(url, { cache: 'no-store', headers: { Cookie: cookieHeader } });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.success ? json.data : null;
}

export default async function ResponsesPage({ params, searchParams }: PageProps) {
  const { formId } = await params;
  const { cycleId, roleId, email } = (await searchParams) || {};
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const form = await fetchJson(`${baseUrl}/api/organisations/forms/${formId}`, cookieHeader);
  if (!form) notFound();

  // Strictly fetch submitted responses only
  const responsesData = await fetchJson(
    `${baseUrl}/api/organisations/forms/${formId}/responses?state=submitted`,
    cookieHeader,
  );
  const initialResponses: ResponseRow[] = responsesData?.responses ?? [];

  let lastSubmissionText: string | null = null;
  if (form.stats?.lastSubmissionAt) {
    try {
      lastSubmissionText = format(new Date(form.stats.lastSubmissionAt), 'dd MMM yyyy, HH:mm');
    } catch {
      /* ignore invalid date */
    }
  }

  let fallbackUrl = '/organisations/inductions';
  let backLabel = 'Back';
  if (cycleId && roleId) {
    fallbackUrl = `/organisations/inductions/${cycleId}/${roleId}`;
    backLabel = 'Back to Role';
  } else if (cycleId) {
    fallbackUrl = `/organisations/inductions/${cycleId}`;
    backLabel = 'Back to Cycle';
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <BackButton fallbackUrl={fallbackUrl} label={backLabel} />
      </div>
      <PageTitle
        text={form.title || 'Form Responses'}
        icon={ClipboardList}
        subheading={
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="font-semibold text-foreground/80">Submitted Responses</span>
            <span>·</span>
            <span>{initialResponses.length} response{initialResponses.length === 1 ? '' : 's'}</span>
            {lastSubmissionText && (
              <>
                <span>·</span>
                <span>Last submission {lastSubmissionText}</span>
              </>
            )}
          </div>
        }
      />
      <ResponsesClient
        uid={formId}
        schema={form.schema}
        stats={form.stats}
        initialResponses={initialResponses}
        initialSearchEmail={email}
      />
    </div>
  );
}
