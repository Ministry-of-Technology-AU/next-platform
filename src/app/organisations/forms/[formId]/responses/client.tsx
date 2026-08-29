'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Eye, FileText, Send, BarChart3, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ResponseTable } from './_components/response-table';
import { ResponseDetail, type ResponseRow } from './_components/response-detail';
import type { FormSchema } from '@/lib/forms/schema';
import type { FormStatsView } from '../../types';

type Filter = 'submitted' | 'draft' | 'all';

interface ResponsesClientProps {
  uid: string;
  schema: FormSchema;
  stats: FormStatsView;
  initialResponses: ResponseRow[];
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function ResponsesClient({ uid, schema, stats, initialResponses }: ResponsesClientProps) {
  const [filter, setFilter] = useState<Filter>('submitted');
  const [responses, setResponses] = useState<ResponseRow[]>(initialResponses);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ResponseRow | null>(null);

  const load = async (next: Filter) => {
    setFilter(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/forms/${uid}/responses?state=${next}`, {
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success) setResponses(json.data.responses as ResponseRow[]);
      else toast.error(json?.error ?? 'Could not load responses');
    } catch {
      toast.error('Could not load responses');
    } finally {
      setLoading(false);
    }
  };

  const completion = Math.round((stats.completionRate || 0) * 100);

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Eye} label="Unique visits" value={stats.uniqueVisits} />
        <StatCard icon={FileText} label="Drafts" value={stats.draftCount} />
        <StatCard icon={Send} label="Submissions" value={stats.submissionCount} />
        <StatCard icon={BarChart3} label="Completion" value={`${completion}%`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => void load(v as Filter)}>
          <TabsList>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={`/api/organisations/forms/${uid}/responses?format=csv`} download>
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {responses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="font-medium">{loading ? 'Loading…' : 'No responses here yet'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === 'submitted'
              ? 'Submitted responses will appear here.'
              : filter === 'draft'
                ? 'In-progress drafts will appear here.'
                : 'Visits, drafts, and submissions will appear here.'}
          </p>
        </div>
      ) : (
        <ResponseTable responses={responses} onView={setSelected} />
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Response</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">
            {selected && <ResponseDetail schema={schema} response={selected} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
