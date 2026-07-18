'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
  initialTrackedOrgIds: string[];
  initialChecklist: any[];
  initialPreferences: UserPreferences | null;
}

interface UserPreferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}

export function CataloguePage({ 
  initialOrganizations, 
  initialError,
  initialTrackedOrgIds,
  initialChecklist,
  initialPreferences 
}: CataloguePageProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Set<OrganizationType>>(new Set());
  const [showOnlyPreferences, setShowOnlyPreferences] = React.useState(false);
  const [organizations] = React.useState<Organization[]>(initialOrganizations);
  const [error] = React.useState<string | null>(initialError);
  const [userPreferences, setUserPreferences] = React.useState<UserPreferences | null>(initialPreferences);
  const [preferencesLoading, setPreferencesLoading] = React.useState(false);

  // Tracking state
  const [trackedOrgIds, setTrackedOrgIds] = React.useState<Set<string>>(new Set(initialTrackedOrgIds));
  const [trackingLoading, setTrackingLoading] = React.useState<Set<string>>(new Set());

  // Checklist state
  const [checklistItems, setChecklistItems] = React.useState<any[]>(initialChecklist);
  const [checklistLoading, setChecklistLoading] = React.useState(false);

  // Fetch checklist items from Strapi user (used for refreshing after track/untrack)
  const fetchChecklist = React.useCallback(async () => {
    try {
      setChecklistLoading(true);
      const response = await fetch('/api/platform/organisations-catalogue/checklist', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data?.success && Array.isArray(data.checklist)) {
        const items = data.checklist.map((item: any) => ({
          id: item.name.toLowerCase().replace(/\s+/g, '-'),
          label: item.name,
          deadline: item.deadline,
          completed: item.isDone,
        }));
        setChecklistItems(items);
      } else {
        setChecklistItems([]);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
      setChecklistItems([]);
    } finally {
      setChecklistLoading(false);
    }
  }, []);

  // Handle track/untrack with optimistic updates
  const handleTrack = React.useCallback(async (orgId: string) => {
    // Optimistic update
    setTrackedOrgIds(prev => new Set([...prev, orgId]));
    setTrackingLoading(prev => new Set([...prev, orgId]));

    try {
      const response = await fetch(`/api/platform/organisations-catalogue/track/${orgId}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!data.success) {
        // Revert on failure
        setTrackedOrgIds(prev => {
          const next = new Set(prev);
          next.delete(orgId);
          return next;
        });
        toast.error('Failed to track organisation');
      } else {
        toast.success('Now tracking inductions!');
        fetchChecklist();
      }
    } catch {
      // Revert on error
      setTrackedOrgIds(prev => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
      toast.error('Failed to track organisation');
    } finally {
      setTrackingLoading(prev => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  }, []);

  const handleUntrack = React.useCallback(async (orgId: string) => {
    // Optimistic update
    setTrackedOrgIds(prev => {
      const next = new Set(prev);
      next.delete(orgId);
      return next;
    });
    setTrackingLoading(prev => new Set([...prev, orgId]));

    try {
      const response = await fetch(`/api/platform/organisations-catalogue/track/${orgId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!data.success) {
        // Revert on failure
        setTrackedOrgIds(prev => new Set([...prev, orgId]));
        toast.error('Failed to untrack organisation');
      } else {
        toast.success('Stopped tracking inductions');
        fetchChecklist();
      }
    } catch {
      // Revert on error
      setTrackedOrgIds(prev => new Set([...prev, orgId]));
      toast.error('Failed to untrack organisation');
    } finally {
      setTrackingLoading(prev => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  }, []);

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
                    checklistItems={checklistItems}
                    checklistLoading={checklistLoading}
                    setChecklistItems={setChecklistItems}
                    organizations={organizations}
                    initialPreferences={initialPreferences || undefined}
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
                        checklistItems={checklistItems}
                        checklistLoading={checklistLoading}
                        setChecklistItems={setChecklistItems}
                        organizations={organizations}
                        initialPreferences={initialPreferences || undefined}
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
                      className={`h-12 rounded-full transition-all sm:gap-2 sm:px-6 ${showOnlyPreferences
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
                  <OrganizationCard
                    organization={org}
                    isTracking={trackedOrgIds.has(org.id)}
                    trackLoading={trackingLoading.has(org.id)}
                    onTrack={handleTrack}
                    onUntrack={handleUntrack}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CategoryColorsProvider>
  );
}
