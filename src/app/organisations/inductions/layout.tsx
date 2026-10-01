import React from 'react';
import { NewToolBanner } from '@/components/new-tool-banner';

export default function OrganisationInductionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NewToolBanner className="mt-[-24px] mb-4" />
      {children}
    </>
  );
}
