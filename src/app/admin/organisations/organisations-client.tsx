"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Building2,
  Radio,
  Briefcase,
  FileText,
  TrendingUp,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminOrganizationListItem,
  AdminPlatformSummary,
} from "@/lib/admin/strapi-admin";

interface OrganisationsClientProps {
  organisations: AdminOrganizationListItem[];
  summaryMetrics: AdminPlatformSummary;
}

export default function OrganisationsClient({
  organisations,
  summaryMetrics,
}: OrganisationsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Extract unique organisation types for the filter dropdown
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    organisations.forEach((org) => {
      if (org.type) types.add(org.type.toLowerCase());
    });
    return Array.from(types).sort();
  }, [organisations]);

  // Client-side filtering
  const filteredOrganisations = useMemo(() => {
    return organisations.filter((org) => {
      // Search term matching name or email
      const matchesSearch =
        searchTerm === "" ||
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Induction status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && org.activeInductions) ||
        (statusFilter === "inactive" && !org.activeInductions);

      // Type filter
      const matchesType =
        typeFilter === "all" || org.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [organisations, searchTerm, statusFilter, typeFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrganisations.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredOrganisations.length);
  const paginatedOrganisations = filteredOrganisations.slice(startIndex, startIndex + entriesPerPage);

  const handleSearchChange = (value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setCurrentPage(1);
    setStatusFilter(value);
  };

  const handleTypeFilterChange = (value: string) => {
    setCurrentPage(1);
    setTypeFilter(value);
  };

  const handleEntriesPerPageChange = (value: string) => {
    setCurrentPage(1);
    setEntriesPerPage(Number(value));
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Live Platform Summary Metric Cards */}
      <section
        aria-label="Platform induction summary statistics"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        {/* Total Organisations */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Total Orgs
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-bright">
              {summaryMetrics.totalOrganizations}
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">Registered campus entities</p>
          </div>
        </div>

        {/* Active Inductions */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Live Recruiting
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Radio className="w-4 h-4 animate-pulse" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {summaryMetrics.activeInductionOrgs}
              </span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-neutral-dark mt-0.5">Active induction cycles</p>
          </div>
        </div>

        {/* Total Open Roles */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Open Positions
            </span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <Briefcase className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-bright">
              {summaryMetrics.totalOpenRoles}
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">Roles open across campus</p>
          </div>
        </div>

        {/* Total Applications Received */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Total Fills
            </span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              <FileText className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-bright">
              {summaryMetrics.totalApplications}
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">Submitted applications</p>
          </div>
        </div>

        {/* Platform Completion Rate */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Conversion Rate
            </span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-bright">
              {summaryMetrics.overallCompletionRate}%
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">
              {summaryMetrics.totalOpens.toLocaleString()} form visits
            </p>
          </div>
        </div>
      </section>

      {/* 2. Accessible Search & Filtering Controls */}
      <section
        aria-label="Filter organisations"
        className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-4 shadow-xs"
      >
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <label htmlFor="admin-org-search" className="sr-only">
              Search organisations by name or email
            </label>
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-primary pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="admin-org-search"
              placeholder="Search by organisation name or email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-8 h-10 w-full focus-visible:ring-2 focus-visible:ring-primary"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search input"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded-full"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="status-filter-select" className="sr-only">
                Filter by recruitment status
              </label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger
                  id="status-filter-select"
                  aria-label="Filter by recruitment status"
                  className="w-[160px] h-10 text-xs focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Filter className="w-3.5 h-3.5 mr-1.5 text-neutral-primary" aria-hidden="true" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Actively Recruiting</SelectItem>
                  <SelectItem value="inactive">Closed / Not Recruiting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            {uniqueTypes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <label htmlFor="type-filter-select" className="sr-only">
                  Filter by organisation type
                </label>
                <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                  <SelectTrigger
                    id="type-filter-select"
                    aria-label="Filter by organisation type"
                    className="w-[140px] h-10 text-xs capitalize focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Entries per page */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="entries-per-page-select" className="sr-only">
                Items per page
              </label>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={handleEntriesPerPageChange}
              >
                <SelectTrigger
                  id="entries-per-page-select"
                  aria-label="Items per page"
                  className="w-[90px] h-10 text-xs focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="h-10 text-xs text-neutral-dark hover:text-primary"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Live Filter Count Announcement */}
        <div
          aria-live="polite"
          className="text-xs text-neutral-dark flex items-center justify-between pt-1 border-t border-border/50"
        >
          <span>
            Showing <strong className="text-primary dark:text-primary-bright">{paginatedOrganisations.length}</strong> of{" "}
            <strong className="text-primary dark:text-primary-bright">{filteredOrganisations.length}</strong> organisations
            {hasActiveFilters && ` (filtered from ${organisations.length} total)`}
          </span>
          {hasActiveFilters && (
            <span className="text-xs text-neutral-primary">Active filters applied</span>
          )}
        </div>
      </section>

      {/* 3. Accessible Organisations Table */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm text-left border-collapse"
            aria-label="Student organisations induction directory"
          >
            <caption className="sr-only">
              List of student organisations, recruitment status, open positions, application counts, and team sizes.
            </caption>
            <thead className="bg-neutral-light/50 dark:bg-gray-dark border-b border-border text-neutral-primary uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3.5">Organisation</th>
                <th scope="col" className="px-4 py-3.5">Type</th>
                <th scope="col" className="px-4 py-3.5">Induction Status</th>
                <th scope="col" className="px-4 py-3.5 text-center">Open Roles</th>
                <th scope="col" className="px-4 py-3.5 text-center">Applications</th>
                <th scope="col" className="px-4 py-3.5 text-center">Team Size</th>
                <th scope="col" className="px-4 py-3.5">Last Inducted</th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedOrganisations.length > 0 ? (
                paginatedOrganisations.map((org) => {
                  const orgUrl = `/admin/organisations/about/${org.slug}`;
                  return (
                    <tr
                      key={org.id}
                      onClick={() => router.push(orgUrl)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(orgUrl);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`View analytics dashboard for ${org.name}`}
                      className="hover:bg-neutral-light/40 dark:hover:bg-gray-dark/40 transition-colors cursor-pointer group focus-visible:outline-hidden focus-visible:bg-neutral-light/60 dark:focus-visible:bg-gray-dark/60"
                    >
                      {/* Organisation Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 rounded-lg shrink-0 border border-border">
                            <AvatarImage src={org.logoUrl || ""} alt={`${org.name} logo`} />
                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                              {org.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-primary dark:text-primary-bright group-hover:underline flex items-center gap-1.5 truncate">
                              {org.name}
                            </div>
                            <div className="text-xs text-neutral-dark truncate max-w-[200px]">
                              {org.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className="capitalize text-[11px] font-normal px-2 py-0.5"
                        >
                          {org.type}
                        </Badge>
                      </td>

                      {/* Active Inductions Badge */}
                      <td className="px-4 py-3.5">
                        {org.activeInductions ? (
                          <div className="inline-flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                              Active
                            </span>
                            {org.activeCycle?.endDate && (
                              <span className="text-[10px] text-neutral-dark pl-1">
                                Ends {new Date(org.activeCycle.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Closed
                          </span>
                        )}
                      </td>

                      {/* Open Roles Count */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-semibold ${org.openRolesCount > 0 ? 'text-primary dark:text-primary-bright' : 'text-neutral-400'}`}>
                          {org.openRolesCount}
                        </span>
                      </td>

                      {/* Total Applications (Fills) */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-semibold ${org.totalApplications > 0 ? 'text-primary dark:text-primary-bright' : 'text-neutral-400'}`}>
                            {org.totalApplications}
                          </span>
                          {org.totalOpens > 0 && (
                            <span className="text-[10px] text-neutral-dark">
                              {org.completionRate}% rate
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Size */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-neutral-dark font-medium">
                          {org.teamSize}
                        </span>
                      </td>

                      {/* Last Inducted */}
                      <td className="px-4 py-3.5 text-xs text-neutral-dark whitespace-nowrap">
                        {org.lastInducted}
                      </td>

                      {/* Action Link Button */}
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={orgUrl}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Open ${org.name} dashboard`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary dark:text-primary-bright hover:underline p-1.5 rounded-md hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Dashboard
                          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-neutral-primary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-8 h-8 text-neutral-300 dark:text-neutral-600" aria-hidden="true" />
                      <p className="font-medium text-sm">No organisations match your filters.</p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetAllFilters}
                          className="mt-2 text-xs"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Accessible Pagination Navigation */}
      {filteredOrganisations.length > 0 && (
        <nav
          aria-label="Pagination Navigation"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2"
        >
          <div className="text-xs text-neutral-dark text-center sm:text-left">
            Showing <span className="font-semibold text-neutral-primary">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-neutral-primary">{endIndex}</span> of{" "}
            <span className="font-semibold text-neutral-primary">{filteredOrganisations.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
              className="text-xs h-8 px-3"
            >
              Previous
            </Button>
            <span className="text-xs font-medium px-2" aria-current="page">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
              className="text-xs h-8 px-3"
            >
              Next
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
