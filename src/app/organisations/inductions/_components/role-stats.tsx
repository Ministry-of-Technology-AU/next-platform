'use client';

import { Eye, Send, Target, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RoleStats } from '../types';

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
    <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accentMap[accent] || accentMap.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <h4 className="text-xl font-bold text-foreground">{value}</h4>
      </div>
    </div>
  );
}

export function RoleStatsBar({ stats }: { stats: RoleStats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Send} label="Applicants / Fills" value={stats.fills} accent="green" />
        <StatCard icon={Eye} label="Opens" value={stats.opens} accent="blue" />
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary dark:text-primary-bright">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Top Source</p>
            <Badge variant="outline" className="mt-1 text-xs text-muted-foreground font-normal">
              Coming Soon
            </Badge>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Top UTM</p>
            <Badge variant="outline" className="mt-1 text-xs text-muted-foreground font-normal">
              Coming Soon
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
