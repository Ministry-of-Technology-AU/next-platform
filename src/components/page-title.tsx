import React from "react";
import { WritingText } from "./ui/shadcn-io/writing-text";
import { ExpandableText } from "./expandable-text";
import { cn } from "@/lib/utils";

export interface PageTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly text: string;
  readonly subheading?: string | React.ReactNode;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly actions?: React.ReactNode;
  readonly badge?: React.ReactNode;
  readonly animate?: boolean;
  readonly as?: "h1" | "h2" | "h3" | "div";
  readonly className?: string;
}

function PageTitle({
  text,
  className = "",
  subheading,
  icon: Icon,
  actions,
  badge,
  animate = true,
  as: HeadingTag = "h1",
  ...props
}: PageTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div className="flex-shrink-0 mt-0.5 sm:mt-1" aria-hidden="true">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary dark:text-primary-bright" />
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <HeadingTag className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
              {animate ? (
                <WritingText
                  text={text}
                  spacing={6}
                  transition={{
                    type: "spring",
                    bounce: 0,
                    duration: 0.8,
                    delay: 0.15,
                  }}
                />
              ) : (
                text
              )}
            </HeadingTag>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {subheading && (
            <div className="mt-1 sm:mt-1.5 min-w-0">
              {typeof subheading === "string" ? (
                <ExpandableText text={subheading} />
              ) : (
                subheading
              )}
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:self-start flex-shrink-0 pt-1 sm:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageTitle;