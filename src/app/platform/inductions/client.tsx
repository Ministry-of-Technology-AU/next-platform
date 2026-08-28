'use client';

import * as React from 'react';
import {
  FileUser,
  Search,
  Bookmark,
  Building2,
  ArrowRight,
  X,
  Clock,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PageTitle from '@/components/page-title';
import { TourStep } from '@/components/guided-tour';
import { TourManager } from './_components/tour-manager';
import { OrganizationType, Organization } from '../organisations-catalog/types';
import { PopulatedResponseRecord } from '@/lib/forms/strapi-forms';
import { ApplicationCard } from './_components/application-card';
import { NotificationsPopover } from './_components/notifications-popover';
import { InductionCatalogCard } from './_components/induction-catalog-card';
import { InductionSidebar } from './_components/induction-sidebar';

interface InductionClientProps {
  initialOrganizations: Organization[];
  initialApplications: PopulatedResponseRecord[];
  initialError: string | null;
  initialTrackedOrgIds: string[];
  initialChecklist: any[];
}

type ApplicationFilter = 'all' | 'action_needed' | 'in_review' | 'decided';

export function InductionClient({
  initialOrganizations,
  initialApplications,
  initialError,
  initialTrackedOrgIds,
  initialChecklist,
}: InductionClientProps) {
  const [activeTab, setActiveTab] = React.useState<'applications' | 'catalog'>('applications');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [onlyTracked, setOnlyTracked] = React.useState(false);
  const [filters, setFilters] = React.useState<Set<OrganizationType>>(new Set());
  const [appFilter, setAppFilter] = React.useState<ApplicationFilter>('all');

  const [organizations] = React.useState<Organization[]>(initialOrganizations);
  const [applications] = React.useState<PopulatedResponseRecord[]>(initialApplications);
  const [error] = React.useState<string | null>(initialError);


  // Tracking state
  const [trackedOrgIds, setTrackedOrgIds] = React.useState<Set<string>>(new Set(initialTrackedOrgIds));
  const [trackingLoading, setTrackingLoading] = React.useState<Set<string>>(new Set());

  const handleTrack = React.useCallback(async (orgId: string) => {
    setTrackedOrgIds((prev) => new Set([...prev, orgId]));
    setTrackingLoading((prev) => new Set([...prev, orgId]));
    try {
      const response = await fetch(`/api/platform/organisations-catalogue/track/${orgId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!data.success) {
        setTrackedOrgIds((prev) => {
          const next = new Set(prev);
          next.delete(orgId);
          return next;
        });
        toast.error('Failed to track organisation');
      } else {
        toast.success('Now tracking organisation inductions');
      }
    } catch {
      setTrackedOrgIds((prev) => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
      toast.error('Failed to track organisation');
    } finally {
      setTrackingLoading((prev) => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  }, []);

  const handleUntrack = React.useCallback(async (orgId: string) => {
    setTrackedOrgIds((prev) => {
      const next = new Set(prev);
      next.delete(orgId);
      return next;
    });
    setTrackingLoading((prev) => new Set([...prev, orgId]));
    try {
      const response = await fetch(`/api/platform/organisations-catalogue/track/${orgId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) {
        setTrackedOrgIds((prev) => new Set([...prev, orgId]));
        toast.error('Failed to untrack organisation');
      } else {
        toast.success('Untracked organisation');
      }
    } catch {
      setTrackedOrgIds((prev) => new Set([...prev, orgId]));
      toast.error('Failed to untrack organisation');
    } finally {
      setTrackingLoading((prev) => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  }, []);

  // Compute metrics
  const actionRequiredCount = React.useMemo(() => {
    return applications.filter((app) => {
      const isDraft = app.state === 'draft';
      const hasUnbookedInterview =
        app.applicationStatus === 'advanced' &&
        app.interviewDetails &&
        !app.interviewDetails.isBooked;
      return isDraft || hasUnbookedInterview;
    }).length;
  }, [applications]);

  // Filtered applications
  const filteredApplications = React.useMemo(() => {
    return applications.filter((app) => {
      if (appFilter === 'all') return true;
      if (appFilter === 'action_needed') {
        const isDraft = app.state === 'draft';
        const hasUnbookedInterview =
          app.applicationStatus === 'advanced' &&
          app.interviewDetails &&
          !app.interviewDetails.isBooked;
        return isDraft || hasUnbookedInterview;
      }
      if (appFilter === 'in_review') {
        return (
          app.state === 'submitted' &&
          (app.applicationStatus === 'pending' || !app.applicationStatus)
        );
      }
      if (appFilter === 'decided') {
        return (
          app.applicationStatus === 'approved' ||
          app.applicationStatus === 'rejected' ||
          app.applicationStatus === 'advanced'
        );
      }
      return true;
    });
  }, [applications, appFilter]);

  // Filtered and deadline-sorted catalog organizations (active cycles only)
  const filteredOrganizations = React.useMemo(() => {
    const now = Date.now();
    const filtered = organizations.filter((org: Organization) => {
      // Exclude ended cycles
      if (org.inductionEnd) {
        const endTime = new Date(org.inductionEnd).getTime();
        if (!isNaN(endTime) && endTime < now) return false;
      }

      const matchesSearch =
        searchQuery === '' ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.inductionDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.cycleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.cycleDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.openPositions?.some(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategoryPill =
        selectedType === 'all' || org.type.toLowerCase() === selectedType.toLowerCase();

      const matchesSheetFilter = filters.size === 0 || filters.has(org.type);

      const matchesTrackedOnly = !onlyTracked || trackedOrgIds.has(org.id);

      // NOTE: `orgs_catalogue_filter_preferences` is deliberately not applied
      // here. It is set by the checkbox list on the organisations catalogue and
      // has no equivalent UI on this page, so honouring it hid open drives with
      // no way for the reader to see why, or to turn it off.
      return matchesSearch && matchesCategoryPill && matchesSheetFilter && matchesTrackedOnly;
    });

    // Sort by deadline: closest upcoming deadline comes highest up
    return [...filtered].sort((a, b) => {
      const now = Date.now();
      const aTime = a.inductionEnd ? new Date(a.inductionEnd).getTime() : NaN;
      const bTime = b.inductionEnd ? new Date(b.inductionEnd).getTime() : NaN;

      const aValid = !isNaN(aTime);
      const bValid = !isNaN(bTime);
      const aUpcoming = aValid && aTime >= now;
      const bUpcoming = bValid && bTime >= now;

      // 1. Both have upcoming deadlines -> closest deadline first (ascending)
      if (aUpcoming && bUpcoming) {
        return aTime - bTime;
      }
      // 2. Upcoming deadline comes before non-upcoming or no deadline
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;

      // 3. If neither is upcoming, compare whether one has a deadline vs none
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;

      // 4. Alphabetical tie breaker
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedType, filters, onlyTracked, trackedOrgIds, organizations]);

  // One entry per open cycle — an org running two drives contributes two.
  const activeRecruitingCycles = React.useMemo(() => {
    const now = Date.now();
    return organizations.filter((org) => {
      if (!org.inductionsOpen) return false;
      if (org.inductionEnd) {
        const endTime = new Date(org.inductionEnd).getTime();
        if (!isNaN(endTime) && endTime < now) return false;
      }
      return true;
    });
  }, [organizations]);

  // ...and the headline stat counts the organisations behind those cycles.
  const activeRecruitingOrgCount = React.useMemo(
    () => new Set(activeRecruitingCycles.map((org) => org.id)).size,
    [activeRecruitingCycles],
  );

  const uniqueOrgTypes = React.useMemo(() => {
    return Array.from(new Set(activeRecruitingCycles.map((o) => o.type)));
  }, [activeRecruitingCycles]);

  const handleOpenApplicationsTab = React.useCallback(() => {
    setActiveTab('applications');
  }, []);

  const handleOpenCatalogTab = React.useCallback(() => {
    setActiveTab('catalog');
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <TourManager />

      {/* Header with Title and Notifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <TourStep
          id="inductions-header"
          order={1}
          position="bottom"
          title="Welcome to Inductions"
          content="Discover campus recruitments, explore active clubs and departments, and track every stage of your applications in one seamless dashboard."
        >
          <PageTitle
            icon={FileUser}
            text="Induction Platform"
            subheading="Explore campus recruitments, manage your drafts, and track application results in real time."
          />
        </TourStep>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* The tour is reachable from the global help button in the navbar. */}
          <TourStep
            id="inductions-notifications"
            order={2}
            position="bottom"
            title="Real-Time Updates"
            content="Click the bell to see updates about deadline extensions, review status changes, and interview announcements."
          >
            <NotificationsPopover applications={applications} organizations={organizations} />
          </TourStep>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <TourStep
        id="inductions-metrics"
        order={3}
        position="bottom"
        title="Recruitment Summary"
        content="Get an instant overview of your active applications, clubs currently recruiting, and items requiring your attention."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border/80 p-4.5 flex items-center justify-between shadow-2xs text-left" style={{ textAlign: 'left' }}>
            <div className="space-y-0.5 text-left" style={{ textAlign: 'left' }}>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider !text-left text-left">
                My Applications
              </span>
              <p className="text-2xl font-bold text-foreground !text-left text-left" style={{ textAlign: 'left' }}>{applications.length}</p>
              <p className="text-[11px] text-muted-foreground !text-left text-left">In active recruitment cycles</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileUser className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/80 p-4.5 flex items-center justify-between shadow-2xs text-left" style={{ textAlign: 'left' }}>
            <div className="space-y-0.5 text-left" style={{ textAlign: 'left' }}>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider !text-left text-left">
                Action Required
              </span>
              <p className="text-2xl font-bold text-foreground !text-left text-left" style={{ textAlign: 'left' }}>{actionRequiredCount}</p>
              <p className="text-[11px] text-muted-foreground !text-left text-left">
                {actionRequiredCount === 0 ? 'All caught up' : 'Drafts or interview bookings'}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${actionRequiredCount > 0
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-muted text-muted-foreground'
                }`}
            >
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/80 p-4.5 flex items-center justify-between shadow-2xs text-left" style={{ textAlign: 'left' }}>
            <div className="space-y-0.5 text-left" style={{ textAlign: 'left' }}>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider !text-left text-left">
                Recruiting Orgs
              </span>
              <p className="text-2xl font-bold text-foreground !text-left text-left" style={{ textAlign: 'left' }}>{activeRecruitingOrgCount}</p>
              <p className="text-[11px] text-muted-foreground !text-left text-left">Active inductions currently open</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </TourStep>

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'applications' | 'catalog')}
        className="w-full space-y-6"
      >
        <div className="border-b border-border/70 pb-px">
          <TabsList className="h-11 bg-muted/60 p-1 rounded-xl">
            <TourStep
              id="inductions-apps-tab"
              order={4}
              position="bottom"
              title="My Applications"
              content="View all your submissions and drafts in one place. Use the status filters to quickly find applications that need action or are in review."
              onOpen={handleOpenApplicationsTab}
            >
              <TabsTrigger
                value="applications"
                className="rounded-lg px-4 sm:px-6 text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2"
              >
                <span>My Applications</span>
                <Badge
                  variant="secondary"
                  className="text-[11px] h-5 px-1.5 font-bold bg-muted-foreground/15 text-foreground"
                >
                  {applications.length}
                </Badge>
              </TabsTrigger>
            </TourStep>

            <TourStep
              id="inductions-catalog-tab"
              order={6}
              position="bottom"
              title="Inductions Catalog"
              content="Explore all active recruitment drives across student governance, cultural societies, sports teams, and academic departments."
              onOpen={handleOpenCatalogTab}
            >
              <TabsTrigger
                value="catalog"
                className="rounded-lg px-4 sm:px-6 text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2"
              >
                <span>Inductions Catalog</span>
                <Badge
                  variant="secondary"
                  className="text-[11px] h-5 px-1.5 font-bold bg-muted-foreground/15 text-foreground"
                >
                  {activeRecruitingCycles.length} Open
                </Badge>
              </TabsTrigger>
            </TourStep>
          </TabsList>
        </div>

        {/* Tab 1: My Ongoing Applications */}
        <TabsContent value="applications" className="mt-0 outline-none space-y-4">
          <TourStep
            id="inductions-stage-tracking"
            order={5}
            position="top"
            title="Stage Tracking and Actions"
            content="Follow your progress across review rounds. Look for action buttons on your cards to resume drafts, book interview slots, or view timeline history."
            onOpen={handleOpenApplicationsTab}
          >
            {applications.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <Button
                  variant={appFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAppFilter('all')}
                  className="h-8 rounded-lg text-xs font-medium px-3 shrink-0 shadow-2xs"
                >
                  All Applications ({applications.length})
                </Button>
                <Button
                  variant={appFilter === 'action_needed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAppFilter('action_needed')}
                  className="h-8 rounded-lg text-xs font-medium px-3 shrink-0 shadow-2xs gap-1.5"
                >
                  <span>Action Needed</span>
                  {actionRequiredCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </Button>
                <Button
                  variant={appFilter === 'in_review' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAppFilter('in_review')}
                  className="h-8 rounded-lg text-xs font-medium px-3 shrink-0 shadow-2xs"
                >
                  In Review
                </Button>
                <Button
                  variant={appFilter === 'decided' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAppFilter('decided')}
                  className="h-8 rounded-lg text-xs font-medium px-3 shrink-0 shadow-2xs"
                >
                  Decisions & Feedback
                </Button>
              </div>
            )}

            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-dashed border-border/80 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Inbox className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-foreground">No applications started yet</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Browse open induction cycles from student clubs, societies, and departments across campus.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab('catalog')}
                  className="gap-2 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
                >
                  Explore Active Inductions
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-2xl border border-border/80 space-y-2">
                <p className="text-sm font-semibold text-foreground">No applications match this filter</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAppFilter('all')}
                  className="text-xs text-primary"
                >
                  Show all applications
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
            )}
          </TourStep>
        </TabsContent>

        {/* Tab 2: Active Inductions Catalog */}
        <TabsContent value="catalog" className="mt-0 outline-none space-y-6">
          {/* Search, Pills, and Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input and Category Pills */}
            <TourStep
              id="inductions-search-filters"
              order={7}
              position="bottom"
              title="Search and Category Filters"
              content="Find positions by role or organization name, or filter by category like cultural, sports, academic, and governance."
              onOpen={handleOpenCatalogTab}
              className="flex-1 flex flex-col md:flex-row md:items-center gap-3"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search organizations or positions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9 pr-8 rounded-xl border-border/80 text-xs bg-card"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                  className="h-9 px-3 rounded-xl text-xs font-semibold shadow-2xs"
                >
                  All
                </Button>
                {uniqueOrgTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="h-9 px-3 rounded-xl text-xs font-semibold capitalize shadow-2xs"
                  >
                    {type}
                  </Button>
                ))}
                <Button
                  variant={onlyTracked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOnlyTracked((prev) => !prev)}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs ${onlyTracked ? 'bg-primary text-primary-foreground' : ''
                    }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${onlyTracked ? 'fill-current' : ''}`} />
                  Tracked ({trackedOrgIds.size})
                </Button>
              </div>
            </TourStep>

            {/* Sidebar filter trigger */}
            <TourStep
              id="inductions-sidebar-filters"
              order={8}
              position="left"
              title="Advanced Filters and Preferences"
              content="Open the filter panel to filter by specific organization categories and manage your tracked induction cycles."
              onOpen={handleOpenCatalogTab}
            >
              <InductionSidebar
                filters={filters}
                onFilterChange={setFilters}
                organizations={organizations}
                trackedOrgIds={trackedOrgIds}
                onUntrack={handleUntrack}
              />
            </TourStep>
          </div>

          {/* Catalog Grid with Tracking Step */}
          <TourStep
            id="inductions-tracking-feature"
            order={9}
            position="top"
            title="Track Clubs and Deadlines"
            content="Click the bookmark icon on any club card to track its cycle. Tracked clubs appear in your quick filter and remind you before deadlines close."
            onOpen={handleOpenCatalogTab}
          >
            {filteredOrganizations.length === 0 ? (
              <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border/80 space-y-3">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {error ? 'Error loading inductions' : 'No matching organizations found'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {error ? error : 'Try clearing your search query or adjusting your filters.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setOnlyTracked(false);
                    setFilters(new Set());
                  }}
                  className="text-xs font-semibold rounded-xl"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrganizations.map((org: Organization) => (
                  <InductionCatalogCard
                    key={org.cycleId ? `${org.id}:${org.cycleId}` : org.id}
                    organization={org}
                    isTracking={trackedOrgIds.has(org.id)}
                    trackLoading={trackingLoading.has(org.id)}
                    onTrack={handleTrack}
                    onUntrack={handleUntrack}
                  />
                ))}
              </div>
            )}
          </TourStep>
        </TabsContent>
      </Tabs>
    </div>
  );
}
