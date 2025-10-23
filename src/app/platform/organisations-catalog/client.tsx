'use client';

import * as React from 'react';
import { Book } from 'lucide-react';
import { SearchBar } from './_components/search-bar';
import { FiltersSidebar } from './_components/filter-sidebar';
import { OrganizationCard } from './_components/organisation-card';
import { Organization, OrganizationType } from './types';

export function CataloguePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Set<OrganizationType>>(new Set());
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch organizations from API
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/platform/organisations-catalogue');
        const result = await response.json();
        
        if (result.success) {
          setOrganizations(result.data.organisations);
        } else {
          setError(result.error || 'Failed to fetch organizations');
        }
      } catch (err) {
        setError('Network error while fetching organizations');
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = React.useMemo(() => {
    return organizations.filter((org) => {
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
  }, [searchQuery, filters, organizations]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Book className="h-12 w-12 text-neutral-400 mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-medium text-neutral-900">Loading organizations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-medium text-red-600">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Find and connect with all {organizations.length} student
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredOrganizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
