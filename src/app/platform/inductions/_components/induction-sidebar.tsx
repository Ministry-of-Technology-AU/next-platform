'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Settings2, Bookmark, X, Check, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OrganizationType, Organization } from '../../organisations-catalog/types';

interface InductionSidebarProps {
  filters: Set<OrganizationType>;
  onFilterChange: (filters: Set<OrganizationType>) => void;
  organizations: Organization[];
  trackedOrgIds: Set<string>;
  onUntrack: (id: string) => void;
  isIconOnly?: boolean;
}

export function InductionSidebar({
  filters,
  onFilterChange,
  organizations,
  trackedOrgIds,
  onUntrack,
  isIconOnly = false,
}: InductionSidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // `organizations` arrives as one entry per open cycle, so an org running two
  // drives appears twice. Everything in this panel is about organisations, not
  // cycles — collapse the duplicates before counting or listing them.
  const uniqueOrganizations = React.useMemo(() => {
    const byId = new Map<string, Organization>();
    for (const org of organizations) {
      if (!byId.has(org.id)) byId.set(org.id, org);
    }
    return Array.from(byId.values());
  }, [organizations]);

  // Group organizations by type with counts
  const typeCounts = React.useMemo(() => {
    const counts = new Map<OrganizationType, number>();
    for (const org of uniqueOrganizations) {
      counts.set(org.type, (counts.get(org.type) || 0) + 1);
    }
    return counts;
  }, [uniqueOrganizations]);

  const types = React.useMemo(() => Array.from(typeCounts.keys()), [typeCounts]);

  const toggleFilter = (type: OrganizationType) => {
    const next = new Set(filters);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    onFilterChange(next);
  };

  const clearFilters = () => {
    onFilterChange(new Set());
  };

  const trackedOrgsList = uniqueOrganizations.filter((org) => trackedOrgIds.has(org.id));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          data-tour="tour-sidebar-filters"
          className={`h-10 rounded-xl border-border/80 hover:bg-muted transition-all text-xs font-semibold ${
            isIconOnly ? 'w-10 p-0' : 'px-3.5 gap-2'
          } ${filters.size > 0 ? 'border-primary/40 text-primary bg-primary/5' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {!isIconOnly && <span>Filters</span>}
          {filters.size > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
            >
              {filters.size}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l border-border bg-card">
        <SheetHeader className="px-6 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-10 flex flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base font-bold">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters & Tracked Inductions
          </SheetTitle>
          {filters.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Organization Type Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Organization Type
                </h4>
                {filters.size > 0 && (
                  <span className="text-xs text-primary font-medium">{filters.size} selected</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {types.map((type) => {
                  const count = typeCounts.get(type) || 0;
                  const isChecked = filters.has(type);
                  return (
                    <div
                      key={type}
                      onClick={() => toggleFilter(type)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-primary/10 border-primary/40 text-foreground'
                          : 'bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`filter-${type}`}
                          checked={isChecked}
                          onCheckedChange={() => toggleFilter(type)}
                          className="pointer-events-none"
                        />
                        <Label
                          htmlFor={`filter-${type}`}
                          className="text-xs font-semibold capitalize cursor-pointer pointer-events-none"
                        >
                          {type}
                        </Label>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-background/80 text-muted-foreground border border-border/50"
                      >
                        {count} {count === 1 ? 'org' : 'orgs'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Tracked Inductions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-primary" />
                  Tracked Organizations
                </h4>
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  {trackedOrgIds.size}
                </Badge>
              </div>

              {trackedOrgsList.length === 0 ? (
                <div className="text-center p-6 bg-muted/20 rounded-xl border border-dashed border-border/80 space-y-1">
                  <Bookmark className="w-5 h-5 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No tracked organizations yet</p>
                  <p className="text-[11px] text-muted-foreground">
                    Click the bookmark icon on any organization card to track its recruitment cycle.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trackedOrgsList.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/60 rounded-xl border border-border/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 text-left">
                        <div className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            (org.name?.charAt(0) || '?').toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-semibold text-foreground truncate text-left">{org.name}</p>
                          <p className="text-[11px] text-muted-foreground capitalize text-left">{org.type}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0"
                        onClick={() => onUntrack(org.id)}
                      >
                        Untrack
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

