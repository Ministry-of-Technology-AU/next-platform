import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { BuilderClient } from './client';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ formId: string }> };

async function fetchForm(formId: string, cookieHeader: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/organisations/forms/${formId}`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.success ? json.data : null;
}

export default async function BuilderPage({ params }: PageProps) {
  const { formId } = await params;
  const cookieStore = await cookies();
  const form = await fetchForm(formId, cookieStore.toString());
  if (!form) notFound();

  return (
    <BuilderClient
      uid={formId}
      initial={{
        title: form.title,
        status: form.form_status,
        startDate: form.start_date ?? null,
        endDate: form.end_date ?? null,
        schema: form.schema,
        updatedAt: form.updatedAt ?? null,
      }}
    />
  );
}
