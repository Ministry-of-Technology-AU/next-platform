import React from 'react';
import { cn } from '@/lib/utils';

export interface InitiativePartner {
  name: string;
  role?: string;
  url?: string;
}

export interface InitiativeCreditsProps {
  title?: string;
  partners?: (string | InitiativePartner)[];
  className?: string;
  hideBorder?: boolean;
}

export default function InitiativeCredits({
  title = 'A collaborative initiative with',
  partners = ['Techmin', 'Jazbaa', 'MAA', 'Office of Student Affairs'],
  className,
  hideBorder = false,
}: InitiativeCreditsProps) {
  return (
    <div
      className={cn(
        'text-center text-sm text-muted-foreground',
        !hideBorder && 'border-t pt-8 mt-8',
        className
      )}
    >
      <p className="flex items-center justify-center flex-wrap gap-1">
        <span>{title}</span>
        {partners.map((partner, index) => {
          const name = typeof partner === 'string' ? partner : partner.name;
          const url = typeof partner === 'string' ? undefined : partner.url;
          const isLast = index === partners.length - 1;
          const isSecondLast = index === partners.length - 2;

          return (
            <React.Fragment key={name}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary dark:text-secondary-dark hover:underline"
                >
                  {name}
                </a>
              ) : (
                <span className="font-bold text-primary dark:text-secondary-dark">
                  {name}
                </span>
              )}
              {isSecondLast ? ' and ' : !isLast ? ', ' : ''}
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
}
