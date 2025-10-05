"use client";

import { useState } from "react";
import { Button } from "./ui/button";

interface ExpandableTextProps {
  text: string;
  className?: string;
  truncateLength?: number;
}

export function ExpandableText({ 
  text, 
  className = "", 
  truncateLength = 100 
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if text is long enough to need truncation
  const needsTruncation = text.length > truncateLength;
  const shouldShowTruncated = needsTruncation && !isExpanded;
  
  return (
    <div className={`text-muted-foreground text-sm sm:text-base ${className}`}>
      {/* On small screens: show truncation, on large screens: always show full text */}
      <div className="block sm:hidden">
        {shouldShowTruncated ? (
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="line-clamp-1">
              {text.slice(0, truncateLength)}...
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-auto p-0 text-xs text-primary hover:text-primary/80 underline"
            >
              read more
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <p>{text}</p>
            {needsTruncation && isExpanded && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-auto p-0 text-xs text-primary hover:text-primary/80 underline"
              >
                show less
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* On large screens: always show full text */}
      <div className="hidden sm:block">
        <p>{text}</p>
      </div>
    </div>
  );
}