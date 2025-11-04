'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SearchBar } from './_components/search-bar';
import { FiltersSidebar } from './_components/filter-sidebar';
import { OrganizationCard } from './_components/organisation-card';
import { OrganizationType, Organization } from './types';
import { CategoryColorsProvider } from './_components/category-colors-context';

interface CataloguePageProps {
  initialOrganizations: Organization[];
  initialError: string | null;
}

interface UserPreferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}

export function CataloguePage({ initialOrganizations, initialError }: CataloguePageProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Set<OrganizationType>>(new Set());
  const [showOnlyPreferences, setShowOnlyPreferences] = React.useState(false);
  const [organizations] = React.useState<Organization[]>(initialOrganizations);
  const [error] = React.useState<string | null>(initialError);
  const [userPreferences, setUserPreferences] = React.useState<UserPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = React.useState(false);

  // Handle preferences change from FiltersSidebar
  const handlePreferencesChange = React.useCallback((preferences: UserPreferences) => {
    setUserPreferences(preferences);
  }, []);

  const filteredOrganizations = React.useMemo(() => {
    return organizations.filter((org: Organization) => {
      const matchesSearch =
        searchQuery === '' ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filters.size === 0 || filters.has(org.type);

      const matchesPreferences = 
        !showOnlyPreferences || 
        !userPreferences || 
        userPreferences.selectedOrganizations.length === 0 ||
        userPreferences.selectedOrganizations.includes(org.id);

      return matchesSearch && matchesFilter && matchesPreferences;
    });
  }, [searchQuery, filters, showOnlyPreferences, userPreferences, organizations]);

  return (
    <CategoryColorsProvider>
      <div className="min-h-screen">
        <div className="mx-6 max-w-8xl px-6 py-4">

          <div className="mb-8 flex flex-wrap items-center gap-2 sm:gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search organizations..."
            />
            <div className="flex items-center gap-2 sm:gap-3">
              <TooltipProvider>
                <div className="hidden sm:block">
                  <FiltersSidebar 
                    filters={filters} 
                    onFilterChange={setFilters}
                    onPreferencesChange={handlePreferencesChange}
                  />
                </div>
                <div className="sm:hidden">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FiltersSidebar 
                        filters={filters} 
                        onFilterChange={setFilters}
                        onPreferencesChange={handlePreferencesChange}
                        isIconOnly
                      />
                    </TooltipTrigger>
                    <TooltipContent>Filters & Preferences</TooltipContent>
                  </Tooltip>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showOnlyPreferences ? "default" : "outline"}
                      onClick={() => setShowOnlyPreferences(!showOnlyPreferences)}
                      disabled={preferencesLoading || !userPreferences}
                      className={`h-12 rounded-full transition-all sm:gap-2 sm:px-6 ${
                        showOnlyPreferences 
                          ? 'bg-primary hover:bg-primary-dark text-white' 
                          : 'border-neutral-300 hover:bg-neutral-100'
                      } ${
                        // Icon-only on mobile, with text on larger screens
                        'sm:px-6 sm:gap-2 w-12 sm:w-auto p-0 sm:p-0'
                      }`}
                    >
                      <Heart className={`h-5 w-5 flex-shrink-0 ${showOnlyPreferences ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline text-sm font-medium">
                        {preferencesLoading 
                          ? 'Loading...' 
                          : showOnlyPreferences 
                            ? 'Showing Preferences' 
                            : 'Only Show Preferences'}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {preferencesLoading 
                      ? 'Loading...' 
                      : showOnlyPreferences 
                        ? 'Showing Preferences' 
                        : 'Only Show Preferences'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {filteredOrganizations.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-neutral-900">
                  {error ? 'Error loading organizations' : 'No organizations found'}
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  {error ? error : 'Try adjusting your search or filters'}
                </p>
              </div>
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
              {filteredOrganizations.map((org: Organization) => (
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
