import { ReactNode } from 'react';
import DeveloperCredits from '@/components/developer-credits';

export default function APLLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <main className="flex-1 w-full max-w-7xl mx-auto relative">
        {children}
        <DeveloperCredits
          developers={[
            {
              name: 'Nitin S',
              role: 'Project Lead',
              profileUrl: 'https://github.com/28nitin07',
            },
          ]}
        />
      </main>
    </div>
  );
}
