'use client';

import * as React from 'react';
import { Book } from 'lucide-react';
import { SearchBar } from './_components/search-bar';
import { FiltersSidebar } from './_components/filter-sidebar';
import { OrganizationCard } from './_components/organisation-card';
import { Organization, OrganizationType } from './types';
import { dummyOrganizations } from './data';

export function CataloguePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Set<OrganizationType>>(new Set());

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

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-900">
              <Book className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Organisations Catalogue
            </h1>
          </div>
          <p className="text-neutral-600">
            Find and connect with all {dummyOrganizations.length} student
            organizations through our catalogue—featuring clubs, societies, fests,
            collectives, ISOs, leagues, and more!
          </p>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search organizations..."
          />
          <FiltersSidebar filters={filters} onFilterChange={setFilters} />
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
  );
}
