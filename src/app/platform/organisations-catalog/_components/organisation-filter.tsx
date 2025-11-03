'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { OrganizationType } from '../types';

interface FilterCategory {
  label: string;
  color: string;
  types: OrganizationType[];
}

interface OrganizationFiltersProps {
  filters: Set<OrganizationType>;
  onFilterChange: (filters: Set<OrganizationType>) => void;
  categories: FilterCategory[];
}

export function OrganizationFilters({ filters, onFilterChange, categories }: OrganizationFiltersProps) {
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        Organization Types
      </h3>

      {categories.map((category) => (
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
  );
}

export type { FilterCategory };