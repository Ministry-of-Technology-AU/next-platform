import { cookies } from 'next/headers';
import { Newspaper } from 'lucide-react';
import PageTitle from '@/components/page-title';
import { FormsClient } from './client';
import type { FormSummary } from './types';

export const dynamic = 'force-dynamic';

async function getForms(cookieHeader: string): Promise<FormSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/organisations/forms`, {
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    return json?.success ? (json.data as FormSummary[]) : [];
  } catch {
    return [];
  }
}

export default async function FormsPage() {
  const cookieStore = await cookies();
  const forms = await getForms(cookieStore.toString());

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageTitle
        text="Inductions"
        icon={Newspaper}
        subheading="Build customisable, block-by-block induction forms — questions, logic, pages, theming — and share a single link."
      />
      <FormsClient initialForms={forms} />
    </div>
  );
}
