import { ReactNode } from 'react';
import styles from './apl.module.css';

export default function APLLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.aplRoot} min-h-screen bg-background flex flex-col w-full`}>
      <main className="flex-1 w-full max-w-7xl mx-auto relative">
        {children}
      </main>
    </div>
  );
}

