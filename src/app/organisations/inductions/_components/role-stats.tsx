import { Eye, Send, FileText, Share2 } from 'lucide-react';
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
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accentMap[accent] || accentMap.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs font-medium text-muted-foreground text-left truncate">{label}</p>
        <h4 className="text-xl font-bold text-foreground truncate !text-left">{value}</h4>
      </div>
    </div>
  );
}

export function RoleStatsBar({
  stats,
}: {
  stats: RoleStats & { drafts?: number };
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Applicants / Fills */}
        <StatCard icon={Send} label="Applicants / Fills" value={stats.fills} accent="green" />

        {/* 2. Opens */}
        <StatCard icon={Eye} label="Opens" value={stats.opens} accent="blue" />

        {/* 3. Drafts */}
        <StatCard icon={FileText} label="Drafts" value={stats.drafts || 0} accent="secondary" />

        {/* 4. Top source */}
        <StatCard icon={Share2} label="Top source" value={stats.topUtm || 'Coming soon'} accent="primary" />
      </div>
    </div>
  );
}

