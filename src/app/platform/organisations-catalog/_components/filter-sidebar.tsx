'use client';

import * as React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChecklistProgress, ChecklistItem } from './checklist-progress';
import { OrganizationFilters, FilterCategory } from './organisation-filter';
import { OrganizationType } from '../types';

interface FiltersSidebarProps {
  filters: Set<OrganizationType>;
  onFilterChange: (filters: Set<OrganizationType>) => void;
}

const filterCategories: FilterCategory[] = [
  {
    label: 'Clubs',
    color: 'bg-red-300',
    types: ['Club'],
  },
  {
    label: 'Societies',
    color: 'bg-red-900',
    types: ['Society'],
  },
  {
    label: 'Departments',
    color: 'bg-amber-200',
    types: ['Department', 'Ministry'],
  },
];

export function FiltersSidebar({ filters, onFilterChange }: FiltersSidebarProps) {
  const [checklistItems, setChecklistItems] = React.useState<ChecklistItem[]>([
    {
      id: 'techmin',
      label: 'Techmin',
      deadline: '26/9',
      completed: true,
    },
    {
      id: 'jazbaa',
      label: 'Jazbaa',
      deadline: '1/10',
      completed: false,
    },
    {
      id: 'dance-society',
      label: 'Dance Society',
      deadline: '5/10',
      completed: false,
    },
    {
      id: 'debate-club',
      label: 'Debate Club',
      deadline: '8/10',
      completed: false,
    },
  ]);

  const toggleChecklistItem = (itemId: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const activeFilterCount = filters.size;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="relative h-12 gap-2 rounded-full border-neutral-300 px-6 hover:bg-neutral-100"
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">
            Filters & Preferences
          </span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-900 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            Filters and Preferences
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6">
            <ChecklistProgress 
              items={checklistItems}
              onToggleItem={toggleChecklistItem}
            />
            
            <OrganizationFilters 
              filters={filters}
              onFilterChange={onFilterChange}
              categories={filterCategories}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
