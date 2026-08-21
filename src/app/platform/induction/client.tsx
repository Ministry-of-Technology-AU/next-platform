'use client';

import * as React from 'react';
import { Heart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from '../organisations-catalog/_components/search-bar';
import { OrganizationType, Organization } from '../organisations-catalog/types';
import { PopulatedResponseRecord } from '@/lib/forms/strapi-forms';
import { ApplicationCard } from './_components/application-card';
import { NotificationsPopover } from './_components/notifications-popover';
import { InductionCatalogCard } from './_components/induction-catalog-card';
import { InductionSidebar } from './_components/induction-sidebar';

interface UserPreferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}

interface InductionClientProps {
  initialOrganizations: Organization[];
  initialApplications: PopulatedResponseRecord[];
  initialError: string | null;
  initialTrackedOrgIds: string[];
  initialChecklist: any[];
  initialPreferences: UserPreferences | null;
}

export function InductionClient({ 
  initialOrganizations, 
  initialApplications,
  initialError,
  initialTrackedOrgIds,
  initialChecklist,
  initialPreferences 
}: InductionClientProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Set<OrganizationType>>(new Set());
  const [organizations] = React.useState<Organization[]>(initialOrganizations);
  const [applications] = React.useState<PopulatedResponseRecord[]>(initialApplications);
  const [error] = React.useState<string | null>(initialError);
  const [userPreferences, setUserPreferences] = React.useState<UserPreferences | null>(initialPreferences);

  // Tracking state
  const [trackedOrgIds, setTrackedOrgIds] = React.useState<Set<string>>(new Set(initialTrackedOrgIds));
  const [trackingLoading, setTrackingLoading] = React.useState<Set<string>>(new Set());

  const handleTrack = React.useCallback(async (orgId: string) => {
    setTrackedOrgIds(prev => new Set([...prev, orgId]));
    setTrackingLoading(prev => new Set([...prev, orgId]));
    try {
      const response = await fetch(`/api/platform/organisations-catalogue/track/${orgId}`, { method: 'POST' });
      const data = await response.json();
      if (!data.success) {
        setTrackedOrgIds(prev => { const next = new Set(prev); next.delete(orgId); return next; });
        toast.error('Failed to track organisation');
      } else {
        toast.success('Now tracking inductions!');
      }
    } catch {
      setTrackedOrgIds(prev => { const next = new Set(prev); next.delete(orgId); return next; });
      toast.error('Failed to track organisation');
    } finally {
      setTrackingLoading(prev => { const next = new Set(prev); next.delete(orgId); return next; });
    }
  }, []);

  const handleUntrack = React.useCallback(async (orgId: string) => {
    setTrackedOrgIds(prev => { const next = new Set(prev); next.delete(orgId); return next; });
    setTrackingLoading(prev => new Set([...prev, orgId]));
    try {
      const response = await fetch(`/api/platform/organisations-catalogue/track/${orgId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!data.success) {
        setTrackedOrgIds(prev => new Set([...prev, orgId]));
        toast.error('Failed to untrack organisation');
      } else {
        toast.success('Stopped tracking inductions');
      }
    } catch {
      setTrackedOrgIds(prev => new Set([...prev, orgId]));
      toast.error('Failed to untrack organisation');
    } finally {
      setTrackingLoading(prev => { const next = new Set(prev); next.delete(orgId); return next; });
    }
  }, []);

  const filteredOrganizations = React.useMemo(() => {
    return organizations.filter((org: Organization) => {
      const matchesSearch =
        searchQuery === '' ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filters.size === 0 || filters.has(org.type);
      const matchesPreferences =
        !userPreferences ||
        userPreferences.selectedOrganizations.length === 0 ||
        userPreferences.selectedOrganizations.includes(org.id);
      return matchesSearch && matchesFilter && matchesPreferences;
    });
  }, [searchQuery, filters, userPreferences, organizations]);

  return (
    <div className="min-h-screen">
      <div className="mx-6 max-w-8xl px-6 py-4">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Portal Dashboard</h2>
            <NotificationsPopover applications={applications} />
          </div>

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="mb-6 h-12 w-full justify-start bg-neutral-100/50 dark:bg-neutral-800/50 p-1 rounded-xl">
              <TabsTrigger 
                value="applications" 
                className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-900 dark:data-[state=active]:text-primary-bright transition-all"
              >
                My Ongoing Applications
              </TabsTrigger>
              <TabsTrigger 
                value="catalog"
                className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-900 dark:data-[state=active]:text-primary-bright transition-all"
              >
                Active Inductions Catalog
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="mt-0 outline-none">
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                  <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No applications yet</p>
                  <p className="mt-2 text-sm text-neutral-500">Discover and apply to organizations in the catalog.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="catalog" className="mt-0 outline-none">
              <div className="mb-8 flex flex-wrap items-center gap-2 sm:gap-3">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search active inductions..."
                />
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:block">
                    <InductionSidebar
                      filters={filters}
                      onFilterChange={setFilters}
                      organizations={organizations}
                      trackedOrgIds={trackedOrgIds}
                      onUntrack={handleUntrack}
                    />
                  </div>
                  <div className="sm:hidden">
                    <InductionSidebar
                      filters={filters}
                      onFilterChange={setFilters}
                      organizations={organizations}
                      trackedOrgIds={trackedOrgIds}
                      onUntrack={handleUntrack}
                      isIconOnly
                    />
                  </div>
                </div>
              </div>

              {filteredOrganizations.length === 0 ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                      {error ? 'Error loading inductions' : 'No active inductions found'}
                    </p>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {error ? error : 'Try adjusting your search or filters'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
                  {filteredOrganizations.map((org: Organization) => (
                    <div key={org.id} className="mb-6 break-inside-avoid">
                      <InductionCatalogCard
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
