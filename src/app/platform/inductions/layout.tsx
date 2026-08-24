import React from 'react';
import { NewToolBanner } from '@/components/new-tool-banner';
import { DismissNewToolAlert } from '@/components/dismiss-new-tool-alert';
import InitiativeCredits from '@/components/initiative-credits';
import DeveloperCredits from '@/components/developer-credits';

export default function PlatformInductionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DismissNewToolAlert storageKey="INDUCTIONS_PLATFORM_ALERT_SEEN_V1" />
      <NewToolBanner className="mt-[-24px] mb-4" />
      {children}
      <InitiativeCredits partners={['Jazbaa', 'MAA', 'Office of Student Affairs']} />
    </>
  );
}

