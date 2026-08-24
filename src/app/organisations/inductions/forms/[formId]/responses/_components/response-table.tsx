'use client';

import { format } from 'date-fns';
import { Eye, Mail, Calendar, ChevronRight } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { ResponseRow } from './response-detail';

export function ResponseTable({
  responses,
  onView,
}: {
  responses: ResponseRow[];
  onView: (row: ResponseRow) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border">
              <TableHead className="font-semibold text-foreground py-3.5 pl-6">Respondent</TableHead>
              <TableHead className="font-semibold text-foreground py-3.5">Status</TableHead>
              <TableHead className="font-semibold text-foreground py-3.5">Submission Date</TableHead>
              <TableHead className="font-semibold text-foreground py-3.5 text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((row) => {
              const ts = row.submittedAt ?? row.lastSavedAt;
              let when = '—';
              try {
                if (ts) when = format(new Date(ts), 'dd MMM yyyy, HH:mm');
              } catch {
                /* keep dash */
              }
              return (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View response from ${row.email}`}
                  className="cursor-pointer hover:bg-muted/40 transition-colors focus-visible:bg-muted/50 focus-visible:outline-none"
                  onClick={() => onView(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onView(row);
                    }
                  }}
                >
                  <TableCell className="font-medium text-foreground pl-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-sm">{row.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green/15 text-green-dark dark:text-green-light capitalize">
                      {row.state}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span>{when}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(row);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Answers
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-border">
        {responses.map((row) => {
          const ts = row.submittedAt ?? row.lastSavedAt;
          let when = '—';
          try {
            if (ts) when = format(new Date(ts), 'dd MMM yyyy, HH:mm');
          } catch {
            /* keep dash */
          }
          return (
            <div
              key={row.id}
              role="button"
              tabIndex={0}
              aria-label={`View response from ${row.email}`}
              onClick={() => onView(row)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onView(row);
                }
              }}
              className="p-4 flex items-center justify-between gap-3 hover:bg-muted/30 active:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground truncate">{row.email}</span>
                  <span className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-semibold bg-green/15 text-green-dark dark:text-green-light capitalize">
                    {row.state}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <span>{when}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

