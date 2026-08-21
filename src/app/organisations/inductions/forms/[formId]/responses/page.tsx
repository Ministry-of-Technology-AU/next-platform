import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { ResponsesClient } from './client';
import type { ResponseRow } from './_components/response-detail';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ formId: string }> };

async function fetchJson(url: string, cookieHeader: string) {
  const res = await fetch(url, { cache: 'no-store', headers: { Cookie: cookieHeader } });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.success ? json.data : null;
}

export default async function ResponsesPage({ params }: PageProps) {
  const { formId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const form = await fetchJson(`${baseUrl}/api/organisations/forms/${formId}`, cookieHeader);
  if (!form) notFound();

  const responsesData = await fetchJson(
    `${baseUrl}/api/organisations/forms/${formId}/responses?state=submitted`,
    cookieHeader,
  );
  const initialResponses: ResponseRow[] = responsesData?.responses ?? [];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2">
          <Link href="/organisations/inductions">
            <ArrowLeft className="h-4 w-4" />
            Back to Inductions
          </Link>
        </Button>
      </div>
      <PageTitle
        text={form.title}
        icon={ClipboardList}
        subheading="Responses, drafts, and completion stats for this form."
      />
      <ResponsesClient
        uid={formId}
        schema={form.schema}
        stats={form.stats}
        initialResponses={initialResponses}
      />
    </div>
  );
}
