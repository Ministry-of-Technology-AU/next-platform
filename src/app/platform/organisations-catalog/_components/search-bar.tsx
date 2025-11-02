'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search organizations...' }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleBlur = () => {
    if (!value) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          'flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'w-80' : 'w-12'
        )}
      >
        {!isExpanded ? (
          <Button
            variant="outline"
            size="icon"
            onClick={handleExpand}
            className="h-12 w-12 rounded-full border-neutral-300 hover:bg-neutral-100"
          >
            <Search className="h-5 w-5 text-neutral-600" />
          </Button>
        ) : (
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="h-12 rounded-full border-neutral-300 pl-12 pr-4 focus-visible:ring-neutral-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
