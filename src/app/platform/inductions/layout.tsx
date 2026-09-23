import React from 'react';
import { NewToolBanner } from '@/components/new-tool-banner';
import InitiativeCredits from '@/components/initiative-credits';
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
      <InitiativeCredits partners={['Jazbaa', 'MAA', 'Office of Student Affairs']} />
    </>
  );
}

