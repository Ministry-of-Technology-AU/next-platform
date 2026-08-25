import React from 'react';
import { NewToolBanner } from '@/components/new-tool-banner';
import { DismissNewToolAlert } from '@/components/dismiss-new-tool-alert';

export default function OrganisationInductionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DismissNewToolAlert storageKey="INDUCTIONS_ORGS_ALERT_SEEN_V1" />
      <NewToolBanner className="mt-[-24px] mb-4" />
      {children}
    </>
  );
}
