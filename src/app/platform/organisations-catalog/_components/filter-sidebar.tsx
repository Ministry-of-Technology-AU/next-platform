'use client';

import * as React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterOptions, OrganizationType } from '../types';

interface FiltersSidebarProps {
  filters: Set<OrganizationType>;
  onFilterChange: (filters: Set<OrganizationType>) => void;
}

interface FilterCategory {
  label: string;
  color: string;
  types: OrganizationType[];
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
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(['Clubs', 'Societies', 'Departments'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleFilter = (type: OrganizationType) => {
    const newFilters = new Set(filters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    onFilterChange(newFilters);
  };

  const isCategoryChecked = (category: FilterCategory) => {
    return category.types.some((type) => filters.has(type));
  };

  const toggleCategoryFilters = (category: FilterCategory) => {
    const newFilters = new Set(filters);
    const isChecked = isCategoryChecked(category);

    category.types.forEach((type) => {
      if (isChecked) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
    });

    onFilterChange(newFilters);
  };

  const activeFilterCount = filters.size;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="relative h-12 gap-2 rounded-full border-neutral-300 px-6 hover:bg-neutral-100"
        >
          <Filter className="h-4 w-4 text-neutral-600" />
          <span className="text-sm font-medium text-neutral-700">
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
          <SheetTitle className="text-2xl font-bold text-neutral-900">
            Filters and Preferences
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                My club checklist!
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-red-900" />
                  <span className="text-sm text-neutral-600 line-through">
                    Techmin : 26/9
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full border-2 border-neutral-300" />
                  <span className="text-sm text-neutral-600">Jazbaa : 1/10</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-6 text-center">
                <div className="relative mx-auto h-32 w-32">
                  <svg className="h-full w-full -rotate-90 transform">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-neutral-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.75)}`}
                      className="text-red-900"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-900">75%</div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-neutral-700">
                  You have made 75% progress!
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Organization Types
              </h3>

              {filterCategories.map((category) => (
                <div
                  key={category.label}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                >
                  <button
                    onClick={() => toggleCategory(category.label)}
                    className="flex w-full items-center justify-between p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isCategoryChecked(category)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleCategoryFilters(category);
                        }}
                        className="h-4 w-4 rounded border-neutral-300 text-red-900 focus:ring-red-900"
                      />
                      <span className="text-sm font-medium text-neutral-900">
                        {category.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded ${category.color}`}
                      />
                      <ChevronDown
                        className={`h-4 w-4 text-neutral-400 transition-transform ${
                          expandedCategories.has(category.label)
                            ? 'rotate-180'
                            : ''
                        }`}
                      />
                    </div>
                  </button>

                  {expandedCategories.has(category.label) && (
                    <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                      <div className="space-y-2">
                        {category.types.map((type) => (
                          <label
                            key={type}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white"
                          >
                            <input
                              type="checkbox"
                              checked={filters.has(type)}
                              onChange={() => toggleFilter(type)}
                              className="h-4 w-4 rounded border-neutral-300 text-red-900 focus:ring-red-900"
                            />
                            <span className="text-sm text-neutral-700">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
