'use client';

import type { Ref } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/shadcn-io/tabs';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { TABS } from '../data';
import type { AssetTab } from '../types';
import { ALL_TYPES, typeLabel } from '../utils';

interface ToolbarProps {
  tab: AssetTab;
  onTabChange: (tab: AssetTab) => void;
  tabCounts: Record<AssetTab, number>;
  types: string[];
  type: string;
  onTypeChange: (type: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchRef: Ref<HTMLInputElement>;
}

export function Toolbar({
  tab,
  onTabChange,
  tabCounts,
  types,
  type,
  onTypeChange,
  query,
  onQueryChange,
  searchRef,
}: ToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs<AssetTab>
          value={tab}
          onValueChange={(value) => {
            void haptic.select();
            onTabChange(value);
          }}
        >
          <TabsList className="grid h-11 w-full grid-cols-4 md:h-10 md:w-[28rem]">
            {TABS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5">
                {label}
                <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">{tabCounts[value]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                e.preventDefault();
                onQueryChange('');
              }
            }}
            placeholder="Search items"
            aria-label="Search items"
            className="h-11 pl-9 pr-10 md:h-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                void haptic.tap();
                onQueryChange('');
              }}
              aria-label="Clear search"
              className="absolute right-0 top-0 flex size-11 items-center justify-center text-muted-foreground hover:text-foreground md:size-10"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground md:block"
            >
              /
            </kbd>
          )}
        </div>
      </div>

      {types.length > 1 && (
        <div
          role="group"
          aria-label="Filter by type"
          className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[ALL_TYPES, ...types].map((value) => {
            const active = value === type;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  void haptic.select();
                  onTypeChange(value);
                }}
                className={cn(
                  'h-10 shrink-0 rounded-full border px-4 text-sm transition-colors sm:h-9',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {value === ALL_TYPES ? 'All types' : typeLabel(value)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
