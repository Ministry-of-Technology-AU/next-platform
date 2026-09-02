"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  Target,
  BarChart3,
  CheckCircle2,
  Circle,
  Mail,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  FileText,
  Eye,
  Layers,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
  AdminOrganizationDetail,
} from "@/lib/admin/strapi-admin";
import { CIRCLE_LABELS } from "@/app/organisations/inductions/types";

interface DashboardProps {
  organisation: AdminOrganizationDetail;
}

export default function DashboardClient({ organisation }: DashboardProps) {
  // Default to active cycle if available, otherwise first cycle or "all"
  const defaultCycleId = useMemo(() => {
    const active = organisation.cycles.find((c) => c.status === "active");
    if (active) return active.id;
    if (organisation.cycles.length > 0) return organisation.cycles[0].id;
    return "all";
  }, [organisation.cycles]);

  const [selectedCycleId, setSelectedCycleId] = useState<string>(defaultCycleId);

  // Compute data for currently selected cycle or aggregate
  const currentCycleData = useMemo(() => {
    if (selectedCycleId === "all") {
      const allRoles = organisation.cycles.flatMap((c) => c.roles);
      return {
        id: "all",
        name: "All Cycles (Cumulative)",
        status: organisation.inductionsOpen ? "active" : "completed",
        startDate: null,
        endDate: organisation.inductionEnd,
        description: organisation.description,
        stats: {
          totalOpens: organisation.aggregateStats.totalOpens,
          totalFills: organisation.aggregateStats.totalApplications,
          totalDrafts: organisation.aggregateStats.totalDrafts,
          rolesCount: organisation.aggregateStats.totalRoles,
          applicantsCount: organisation.aggregateStats.totalApplications,
          completionRate: organisation.aggregateStats.completionRate,
        },
        roles: allRoles,
        timeline: organisation.cycles[0]?.timeline || [
          { step: "Applications Open", date: "Announced", status: "completed" as const },
          { step: "Applications Close", date: organisation.inductionEnd || "TBD", status: "current" as const },
        ],
      };
    }

    const found = organisation.cycles.find((c) => c.id === selectedCycleId);
    if (found) return found;

    // Fallback if cycle not found
    return {
      id: "none",
      name: "No Cycle Selected",
      status: "draft" as const,
      startDate: null,
      endDate: null,
      description: null,
      stats: {
        totalOpens: 0,
        totalFills: 0,
        totalDrafts: 0,
        rolesCount: 0,
        applicantsCount: 0,
        completionRate: 0,
      },
      roles: [],
      timeline: [],
    };
  }, [selectedCycleId, organisation]);

  // Chart data: Role Breakdown
  const chartData = useMemo(() => {
    if (!currentCycleData.roles || currentCycleData.roles.length === 0) {
      return [];
    }
    return currentCycleData.roles.map((r) => ({
      name: r.name.length > 18 ? `${r.name.slice(0, 16)}...` : r.name,
      fullName: r.name,
      applications: r.stats.fills || 0,
      views: r.stats.opens || 0,
      drafts: r.stats.drafts || 0,
      department: r.department || "General",
      tier: r.tier,
    }));
  }, [currentCycleData.roles]);

  const totalApplications = currentCycleData.stats.totalFills || currentCycleData.stats.applicantsCount || 0;
  const totalOpens = currentCycleData.stats.totalOpens || 0;
  const totalDrafts = currentCycleData.stats.totalDrafts || 0;
  const conversionRate = totalOpens > 0 ? Math.round((totalApplications / totalOpens) * 1000) / 10 : 0;
  const draftRate = totalOpens > 0 ? Math.round((totalDrafts / totalOpens) * 1000) / 10 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Accessible Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-dark">
        <Link
          href="/admin/organisations"
          className="inline-flex items-center gap-1 hover:text-primary dark:hover:text-primary-bright font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Organisations
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-primary dark:text-primary-bright truncate" aria-current="page">
          {organisation.name}
        </span>
      </nav>

      {/* 2. Top Overview & Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <section
          aria-label="Organisation Profile"
          className="lg:col-span-2 bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-xs"
        >
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 border border-border shadow-xs">
            <AvatarImage src={organisation.logoUrl || ""} alt={`${organisation.name} logo`} className="object-cover" />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
              {organisation.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-bright truncate">
                {organisation.name}
              </h2>
              <Badge variant="outline" className="capitalize text-xs font-medium">
                {organisation.type}
              </Badge>
              {organisation.inductionsOpen ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  Actively Recruiting
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  Recruitment Closed
                </span>
              )}
            </div>

            <div
              className="text-sm text-neutral-dark mb-4 line-clamp-3 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: organisation.description }}
            />

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {organisation.email && (
                <a
                  href={`mailto:${organisation.email}`}
                  aria-label={`Send email to ${organisation.email}`}
                  className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-light/50 dark:bg-gray-dark/50 hover:bg-primary/10 hover:text-primary text-neutral-primary transition-colors border border-border font-medium focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Mail className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  {organisation.email}
                </a>
              )}
              <Link
                href={`/platform/organisations-catalog`}
                className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-light/50 dark:bg-gray-dark/50 hover:bg-primary/10 hover:text-primary text-neutral-primary transition-colors border border-border font-medium focus-visible:ring-2 focus-visible:ring-primary"
              >
                View in Catalog
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Summary Box */}
        <section
          aria-label="Quick metrics"
          className="flex flex-col gap-3 justify-between"
        >
          {/* Team Size Card */}
          <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Users className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">Total Team Roster</p>
              <h3 className="text-2xl font-bold text-primary dark:text-primary-bright">{organisation.teamSize}</h3>
              <p className="text-xs text-neutral-dark">
                {organisation.leadershipTier1.length} Tier 1 · {organisation.leadershipTier2.length} Tier 2 · {organisation.membersCount} Members
              </p>
            </div>
          </div>

          {/* Induction Status Quick Box */}
          <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4 shadow-xs">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${organisation.inductionsOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800'}`}>
              <Target className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">Induction Status</p>
              <h3 className="text-lg font-bold text-primary dark:text-primary-bright">
                {organisation.inductionsOpen ? 'Active Cycle Running' : 'Closed'}
              </h3>
              {organisation.inductionEnd && (
                <p className="text-xs text-neutral-dark">
                  Target Deadline: {new Date(organisation.inductionEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 3. Cycle Selector Bar */}
      <section
        aria-label="Cycle selection"
        className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-bold text-primary dark:text-primary-bright leading-none">
              Induction Cycle Analytics
            </h3>
            <p className="text-xs text-neutral-dark mt-0.5">
              Select an induction cycle to view live form submission stats and funnel data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="cycle-selector-select" className="text-xs font-medium text-neutral-dark whitespace-nowrap sr-only sm:not-sr-only">
            Active Cycle:
          </label>
          <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
            <SelectTrigger
              id="cycle-selector-select"
              aria-label="Select induction cycle to view statistics"
              className="w-full sm:w-[260px] h-9 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {organisation.cycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id} className="text-xs">
                  {cycle.name} {cycle.status === 'active' ? '(Live Active)' : `(${cycle.status})`}
                </SelectItem>
              ))}
              <SelectItem value="all" className="text-xs font-semibold">
                All Cycles (Cumulative Overview)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* 4. Live Cycle Stats Cards */}
      <section
        aria-label="Cycle live statistics"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {/* Total Applications (Fills) */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Applications (Fills)
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <FileText className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-bright">
              {totalApplications}
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">Total completed submissions</p>
          </div>
        </div>

        {/* Total Form Visits (Opens) */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Form Visits (Opens)
            </span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <Eye className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-bright">
              {totalOpens}
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">Unique candidate views</p>
          </div>
        </div>

        {/* Conversion / Completion Rate */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {conversionRate}%
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">Fills / Visits ratio</p>
          </div>
        </div>

        {/* Open Roles */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wider">
              Positions / Roles
            </span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              <Briefcase className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-bright">
              {currentCycleData.roles.length}
            </span>
            <p className="text-xs text-neutral-dark mt-0.5">Roles configured in pipeline</p>
          </div>
        </div>
      </section>

      {/* 5. Charts & Funnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Volume Bar Chart */}
        <section
          aria-label="Application Volume by Role"
          className="lg:col-span-2 bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 shadow-xs flex flex-col"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-primary" aria-hidden="true" />
              <div>
                <h3 className="text-base font-bold text-primary dark:text-primary-bright leading-none">
                  Application Volume by Position
                </h3>
                <p className="text-xs text-neutral-dark mt-0.5">
                  Comparison of form opens vs completed submissions per role.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              Total Fills: {totalApplications}
            </Badge>
          </div>

          {chartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-neutral-dark"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-neutral-dark"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(135, 40, 27, 0.05)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-dark border border-border p-3 rounded-lg shadow-md text-xs">
                            <p className="font-bold text-primary dark:text-primary-bright mb-1">{data.fullName}</p>
                            <p className="text-neutral-dark">Department: {data.department}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                              Applications (Fills): {data.applications}
                            </p>
                            <p className="text-blue-600 dark:text-blue-400">Views (Opens): {data.views}</p>
                            <p className="text-amber-600 dark:text-amber-400">Drafts: {data.drafts}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                  />
                  <Bar dataKey="applications" name="Applications (Fills)" fill="#87281b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="views" name="Views (Opens)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Accessible Hidden Summary Table for Screen Readers */}
              <table className="sr-only">
                <caption>Role application breakdown</caption>
                <thead>
                  <tr>
                    <th scope="col">Role</th>
                    <th scope="col">Applications</th>
                    <th scope="col">Views</th>
                    <th scope="col">Drafts</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d, i) => (
                    <tr key={i}>
                      <td>{d.fullName}</td>
                      <td>{d.applications}</td>
                      <td>{d.views}</td>
                      <td>{d.drafts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-neutral-light/20 rounded-lg border border-dashed border-border">
              <Info className="w-8 h-8 text-neutral-400 mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-neutral-primary">No role breakdown available for this cycle.</p>
              <p className="text-xs text-neutral-dark mt-1">Roles will appear here once candidates view or submit forms.</p>
            </div>
          )}
        </section>

        {/* Application Funnel Card */}
        <section
          aria-label="Application Conversion Funnel"
          className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
              <h3 className="text-base font-bold text-primary dark:text-primary-bright">
                Application Funnel
              </h3>
            </div>
            <p className="text-xs text-neutral-dark mb-6">
              Conversion drop-off from initial discovery to final form submission.
            </p>

            <div className="flex flex-col gap-4">
              {/* Step 1: Total Visits */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary dark:text-primary-bright flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" /> 1. Form Views
                  </span>
                  <span className="font-bold">{totalOpens}</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-500 h-2.5 rounded-full w-full" />
                </div>
              </div>

              {/* Step 2: Drafts Started */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary dark:text-primary-bright flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" /> 2. Drafts Started
                  </span>
                  <span className="font-bold">
                    {totalDrafts} <span className="text-neutral-dark font-normal">({draftRate}%)</span>
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(draftRate, totalDrafts > 0 ? 5 : 0))}%` }}
                  />
                </div>
              </div>

              {/* Step 3: Completed Submissions */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary dark:text-primary-bright flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" /> 3. Submitted (Fills)
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {totalApplications} <span className="text-neutral-dark font-normal">({conversionRate}%)</span>
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(conversionRate, totalApplications > 0 ? 5 : 0))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-neutral-dark">
            <span>Overall Conversion:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{conversionRate}%</strong>
          </div>
        </section>
      </div>

      {/* 6. Roles Table & Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles & Positions Breakdown Table */}
        <section
          aria-label="Positions and Roles Breakdown"
          className="lg:col-span-2 bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 shadow-xs flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" aria-hidden="true" />
              <h3 className="text-base font-bold text-primary dark:text-primary-bright">
                Roles & Position Stats
              </h3>
            </div>
            <span className="text-xs text-neutral-dark">
              {currentCycleData.roles.length} {currentCycleData.roles.length === 1 ? 'position' : 'positions'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left" aria-label="Roles list and performance">
              <thead className="bg-neutral-light/50 dark:bg-gray-dark border-b border-border text-neutral-primary uppercase font-semibold">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5">Position Name</th>
                  <th scope="col" className="px-3.5 py-2.5">Tier</th>
                  <th scope="col" className="px-3.5 py-2.5">Department</th>
                  <th scope="col" className="px-3.5 py-2.5 text-center">Views</th>
                  <th scope="col" className="px-3.5 py-2.5 text-center">Fills</th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentCycleData.roles.length > 0 ? (
                  currentCycleData.roles.map((role) => {
                    const opens = role.stats.opens || 0;
                    const fills = role.stats.fills || 0;
                    const comp = opens > 0 ? Math.round((fills / opens) * 1000) / 10 : 0;
                    return (
                      <tr key={role.id} className="hover:bg-neutral-light/30 dark:hover:bg-gray-dark/30 transition-colors">
                        <td className="px-3.5 py-3 font-semibold text-primary dark:text-primary-bright">
                          {role.name}
                        </td>
                        <td className="px-3.5 py-3">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.2 capitalize">
                            {CIRCLE_LABELS[role.tier] || role.tier}
                          </Badge>
                        </td>
                        <td className="px-3.5 py-3 text-neutral-dark">
                          {role.department || "General"}
                        </td>
                        <td className="px-3.5 py-3 text-center text-neutral-dark">
                          {opens}
                        </td>
                        <td className="px-3.5 py-3 text-center font-bold text-primary dark:text-primary-bright">
                          {fills}
                        </td>
                        <td className="px-3.5 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {comp}%
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-dark">
                      No roles configured for this cycle.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Induction Timeline / Pipeline Stepper */}
        <section
          aria-label="Induction Timeline"
          className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 shadow-xs flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="text-base font-bold text-primary dark:text-primary-bright">
              Induction Timeline
            </h3>
          </div>

          <div className="flex flex-col gap-0 relative mt-2 flex-1">
            <div className="absolute left-2.5 top-2 bottom-4 w-px bg-border" aria-hidden="true" />
            {currentCycleData.timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4 relative pb-5 last:pb-0">
                <div className="relative z-10 bg-white dark:bg-gray-dark/15 rounded-full mt-0.5">
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-white dark:bg-gray-dark/15 rounded-full" aria-label="Completed step" />
                  ) : item.status === 'current' ? (
                    <Circle className="w-5 h-5 text-primary fill-primary/20 bg-white dark:bg-gray-dark/15 rounded-full" aria-label="Current active step" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 bg-white dark:bg-gray-dark/15 rounded-full" aria-label="Upcoming step" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-semibold ${item.status === 'current' ? 'text-primary dark:text-primary-bright font-bold' : 'text-neutral-primary'}`}>
                    {item.step}
                  </h4>
                  <p className="text-[11px] text-neutral-dark mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 7. Leadership Team */}
      <section
        aria-label="Leadership Roster"
        className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 shadow-xs"
      >
        <h3 className="text-base font-bold text-primary dark:text-primary-bright mb-4">
          Leadership & Organisation Leads
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tier 1 Leaders */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-dark uppercase tracking-wider mb-3">
              Tier 1 Leaders (Circle 1)
            </h4>
            {organisation.leadershipTier1.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {organisation.leadershipTier1.map((leader, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-neutral-light/40 dark:bg-gray-dark/30 border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {leader.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary dark:text-primary-bright truncate">
                        {leader.username}
                      </p>
                      <a
                        href={`mailto:${leader.email}`}
                        className="text-[11px] text-neutral-dark hover:text-primary dark:hover:text-primary-bright truncate block focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                      >
                        {leader.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-dark italic">No Tier 1 leaders listed.</p>
            )}
          </div>

          {/* Tier 2 Leaders */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-dark uppercase tracking-wider mb-3">
              Tier 2 Leaders (Circle 2)
            </h4>
            {organisation.leadershipTier2.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {organisation.leadershipTier2.map((leader, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-neutral-light/40 dark:bg-gray-dark/30 border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary/30 text-secondary-extradark dark:text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                      {leader.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary dark:text-primary-bright truncate">
                        {leader.username}
                      </p>
                      <a
                        href={`mailto:${leader.email}`}
                        className="text-[11px] text-neutral-dark hover:text-primary dark:hover:text-primary-bright truncate block focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                      >
                        {leader.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-dark italic">No Tier 2 leaders listed.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
