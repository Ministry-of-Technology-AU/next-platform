'use client';

import * as React from 'react';
import { Book, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from './_components/search-bar';
import { FiltersSidebar } from './_components/filter-sidebar';
import { OrganizationCard } from './_components/organisation-card';
import { OrganizationType } from './types';
import { dummyOrganizations } from './data';
import { CategoryColorsProvider } from './_components/category-colors-context';

export function CataloguePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Set<OrganizationType>>(new Set());
  const [showOnlyPreferences, setShowOnlyPreferences] = React.useState(false);

  // Mock user preferences - in a real app, this would come from user data
  const userPreferences = React.useMemo(() => new Set([
    'Tech Enthusiasts Club',
    'Debate Society', 
    'Dance Collective',
    'Photography Club'
  ]), []);

  const filteredOrganizations = React.useMemo(() => {
    return dummyOrganizations.filter((org) => {
      const matchesSearch =
        searchQuery === '' ||
        org.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.categories.some((cat) =>
          cat.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFilter =
        filters.size === 0 || filters.has(org.type);

      const matchesPreferences = 
        !showOnlyPreferences || userPreferences.has(org.title);

      return matchesSearch && matchesFilter && matchesPreferences;
    });
  }, [searchQuery, filters, showOnlyPreferences, userPreferences]);

  return (
    <CategoryColorsProvider>
      <div className="min-h-screen">
        <div className="mx-6 max-w-8xl px-6 py-4">

          <div className="mb-8 flex items-center gap-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search organizations..."
            />
            <div className="flex items-center gap-3">
              <FiltersSidebar filters={filters} onFilterChange={setFilters} />
              <Button
                variant={showOnlyPreferences ? "default" : "outline"}
                onClick={() => setShowOnlyPreferences(!showOnlyPreferences)}
                className={`h-12 gap-2 rounded-full px-6 transition-all ${
                  showOnlyPreferences 
                    ? 'bg-primary hover:bg-primary-dark text-white' 
                    : 'border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <Heart className={`h-4 w-4 ${showOnlyPreferences ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {showOnlyPreferences ? 'Showing Preferences' : 'Only Show Preferences'}
                </span>
              </Button>
            </div>
          </div>

          {filteredOrganizations.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-neutral-900">
                  No organizations found
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Try adjusting your search or filters
                </p>
              </div>
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
              {filteredOrganizations.map((org) => (
                <div key={org.id} className="mb-6 break-inside-avoid">
                  <OrganizationCard organization={org} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CategoryColorsProvider>
  );
}
