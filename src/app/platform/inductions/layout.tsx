import React from 'react';
import { NewToolBanner } from '@/components/new-tool-banner';
import { CollaborationBanner } from '@/components/collaboration-banner';
import DeveloperCredits from '@/components/developer-credits';

export default function PlatformInductionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NewToolBanner className="mt-[-24px] mb-4" />
      {children}
      <CollaborationBanner
        variant="credits"
        partners={[{ name: 'Jazbaa' }, { name: 'MAA' }, { name: 'Office of Student Affairs' }]}
      />
    </>
  );
}

