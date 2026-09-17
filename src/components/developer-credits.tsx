import React from "react";
import { cn } from "@/lib/utils";

export interface Developer {
  readonly name: string;
  readonly role?: string;
  readonly profileUrl?: string;
}

export interface DeveloperCreditsProps extends React.HTMLAttributes<HTMLElement> {
  readonly developers?: readonly Developer[];
  readonly label?: string;
  readonly className?: string;
}

export type DeveloperProps = DeveloperCreditsProps;

export default function DeveloperCredits({
  developers,
  label = "Feature developed by",
  className = "",
  ...props
}: DeveloperCreditsProps) {
  if (!developers || developers.length === 0) {
    return null;
  }

  return (
    <footer
      className={cn(
        "text-center text-xs sm:text-sm text-muted-foreground border-t pt-6 sm:pt-8 mt-6 sm:mt-8",
        className
      )}
      {...props}
    >
      <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <span>{label}</span>
        {developers.map((dev, index) => {
          const isLast = index === developers.length - 1;
          const content = (
            <>
              <span className="font-bold">{dev.name}</span>
              {dev.role ? ` - ${dev.role}` : ""}
            </>
          );

          return (
            <span
              key={`${dev.name}-${index}`}
              className="inline-flex items-center break-words"
            >
              {dev.profileUrl ? (
                <a
                  href={dev.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary dark:text-secondary-dark hover:underline font-medium transition-colors"
                >
                  {content}
                </a>
              ) : (
                <span className="text-primary dark:text-secondary-dark font-medium">
                  {content}
                </span>
              )}
              {!isLast && <span className="text-muted-foreground">,</span>}
            </span>
          );
        })}
      </p>
    </footer>
  );
}