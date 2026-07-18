import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getFormByUidCached, isFormActive } from '@/lib/forms/strapi-forms';
import { buildFontHref } from '@/lib/forms/theme';
import { FillerClient } from './client';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ formId: string }> };

/**
 * Filler entry point. Server-fetches the cached form and 404s identically for
 * missing / draft / expired forms (spec §14.10, §7.4). Google Fonts for the
 * theme are loaded as <link> tags here (runtime-dynamic families can't use
 * next/font — spec §5.2). No PageTitle — the form's themed header is the page
 * identity.
 */
export default async function FormFillerPage({ params }: PageProps) {
  const { formId } = await params;
  const session = await auth();
  const userEmail = session?.user?.email ?? '';

  const form = await getFormByUidCached(formId);
  if (!form || !isFormActive(form)) notFound();

  const fontHref = buildFontHref(form.schema.theme);

  return (
    <>
      {fontHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontHref} />
        </>
      )}
      <FillerClient
        uid={formId}
        title={form.title}
        schema={form.schema}
        userEmail={userEmail}
      />
    </>
  );
}
