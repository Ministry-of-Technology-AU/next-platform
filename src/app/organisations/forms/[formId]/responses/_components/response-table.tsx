'use client';

import { format } from 'date-fns';
import { Eye } from 'lucide-react';
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
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Respondent</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="text-right">View</TableHead>
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
                className="cursor-pointer"
                onClick={() => onView(row)}
              >
                <TableCell className="font-medium">{row.email}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      row.state === 'submitted'
                        ? 'bg-green/15 text-green-dark dark:text-green-light'
                        : 'bg-secondary/40 text-secondary-extradark dark:text-secondary'
                    }`}
                  >
                    {row.state}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{when}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`View response from ${row.email}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(row);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
