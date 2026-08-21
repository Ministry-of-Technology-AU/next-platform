import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Settings2, Bookmark } from 'lucide-react';
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

  // Group organizations by type for the filter
  const types = Array.from(new Set(organizations.map(o => o.type)));

  const toggleFilter = (type: OrganizationType) => {
    const next = new Set(filters);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    onFilterChange(next);
  };

  const trackedOrgsList = organizations.filter(org => trackedOrgIds.has(org.id));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className={`h-12 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all ${
            isIconOnly ? 'w-12 p-0' : 'px-6 gap-2'
          }`}
        >
          <SlidersHorizontal className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          {!isIconOnly && <span className="text-sm font-medium">Filters & Preferences</span>}
          {filters.size > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
              {filters.size}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l-0 sm:border-l border-neutral-200 dark:border-neutral-800">
        <SheetHeader className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl z-10">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Filters & Preferences
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Type Filters */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Organization Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {types.map((type) => (
                  <div key={type} className="flex items-center space-x-2 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 transition-colors hover:border-neutral-200 dark:hover:border-neutral-700">
                    <Checkbox 
                      id={`filter-${type}`}
                      checked={filters.has(type)}
                      onCheckedChange={() => toggleFilter(type)}
                    />
                    <Label 
                      htmlFor={`filter-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer flex-1"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-neutral-100 dark:bg-neutral-800" />

            {/* Tracked Inductions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-neutral-500" />
                  Tracked Inductions
                </h4>
                <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800">
                  {trackedOrgIds.size}
                </Badge>
              </div>

              {trackedOrgsList.length === 0 ? (
                <div className="text-center p-6 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  <p className="text-sm text-neutral-500">You aren't tracking any inductions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trackedOrgsList.map(org => (
                    <div key={org.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <div>
                        <p className="text-sm font-medium">{org.name}</p>
                        <p className="text-xs text-neutral-500 capitalize">{org.type}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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
