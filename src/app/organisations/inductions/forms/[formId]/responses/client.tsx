'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Download,
  Eye,
  FileText,
  Send,
  BarChart3,
  Inbox,
  Search,
  RotateCw,
  SearchX,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PaginationControls } from '@/components/ui/pagination';
import { ResponseTable } from './_components/response-table';
import { ResponseDetail, type ResponseRow } from './_components/response-detail';
import type { FormSchema } from '@/lib/forms/schema';
import type { FormStatsView } from '../../types';

interface ResponsesClientProps {
  uid: string;
  schema: FormSchema;
  stats: FormStatsView;
  initialResponses: ResponseRow[];
  initialSearchEmail?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'primary',
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  accent?: string;
}) {
  const accentMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary dark:text-primary-bright',
    green: 'bg-green/10 text-green-dark dark:text-green-light',
    blue: 'bg-blue/10 text-blue-dark dark:text-blue-light',
    secondary: 'bg-secondary/10 text-secondary-dark dark:text-secondary-light',
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          accentMap[accent] || accentMap.primary
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs font-medium text-muted-foreground text-left truncate">{label}</p>
        <h4 className="text-xl font-bold text-foreground truncate !text-left">{value}</h4>
      </div>
    </div>
  );
}

export function ResponsesClient({
  uid,
  schema,
  stats,
  initialResponses,
  initialSearchEmail,
}: ResponsesClientProps) {
  const [responses, setResponses] = useState<ResponseRow[]>(initialResponses);
  const [searchQuery, setSearchQuery] = useState(initialSearchEmail || '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ResponseRow | null>(() => {
    if (initialSearchEmail) {
      const match = initialResponses.find(
        (r) => r.email.toLowerCase() === initialSearchEmail.toLowerCase().trim(),
      );
      return match || null;
    }
    return null;
  });

  const refreshResponses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/forms/${uid}/responses?state=submitted&pageSize=all`, {
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success) {
        setResponses(json.data.responses as ResponseRow[]);
        toast.success('Responses updated');
      } else {
        toast.error(json?.error ?? 'Could not refresh responses');
      }
    } catch {
      toast.error('Could not refresh responses');
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 on search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredResponses = useMemo(() => {
    if (!searchQuery.trim()) return responses;
    const query = searchQuery.trim().toLowerCase();
    return responses.filter((r) => r.email.toLowerCase().includes(query));
  }, [responses, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / pageSize));
  const paginatedResponses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredResponses.slice(start, start + pageSize);
  }, [filteredResponses, page, pageSize]);

  const completion = Math.round((stats.completionRate || 0) * 100);

  return (
    <div className="mt-6 space-y-8">
      {/* 1. Coherent Stats Grid (Identical to RoleStatsBar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Send}
          label="Submissions"
          value={stats.submissionCount || responses.length}
          accent="green"
        />
        <StatCard
          icon={Eye}
          label="Unique Visits"
          value={stats.uniqueVisits || 0}
          accent="blue"
        />
        <StatCard
          icon={FileText}
          label="In-Progress Drafts"
          value={stats.draftCount || 0}
          accent="secondary"
        />
        <StatCard
          icon={BarChart3}
          label="Completion Rate"
          value={`${completion}%`}
          accent="primary"
        />
      </div>

      {/* 2. Action Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Real-time search filter */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by respondent email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs sm:text-sm rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Primary Export CSV & Refresh */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshResponses}
            disabled={loading}
            className="h-9 px-3 text-xs gap-1.5 rounded-xl border-border"
            title="Refresh responses"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            asChild
            variant="default"
            size="sm"
            className="h-9 px-4 text-xs font-semibold gap-2 rounded-xl shadow-sm"
          >
            <a href={`/api/organisations/forms/${uid}/responses?format=csv`} download>
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      {/* 3. Responses Table / Empty State */}
      {responses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 px-4 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="font-semibold text-foreground text-base">No submitted responses yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Submitted responses will appear here as soon as candidates complete and submit the form.
          </p>
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-14 px-4 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" />
          </div>
          <p className="font-semibold text-foreground text-sm">No matching responses</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No submissions matched &ldquo;{searchQuery}&rdquo;.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="mt-3 h-8 text-xs font-medium text-primary hover:underline"
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <ResponseTable responses={paginatedResponses} onView={setSelected} />
          {filteredResponses.length > pageSize && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredResponses.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="responses"
            />
          )}
        </div>
      )}

      {/* 4. Responsive Response Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto px-6 py-6">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-bold">Candidate Response</SheetTitle>
          </SheetHeader>
          {selected && <ResponseDetail schema={schema} response={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

