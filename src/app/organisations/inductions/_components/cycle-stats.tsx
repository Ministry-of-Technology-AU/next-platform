'use client';

import { BarChart3, Users, Activity, Compass, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CycleStats } from '../types';

function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'primary',
}: {
  icon: typeof BarChart3;
  label: string;
  value: string | number;
  accent?: 'primary' | 'green' | 'blue' | 'secondary';
}) {
  const accentMap = {
    primary: 'bg-primary/10 text-primary dark:text-primary-bright',
    green: 'bg-green/10 text-green-dark dark:text-green-light',
    blue: 'bg-blue/10 text-blue-dark dark:text-blue-light',
    secondary: 'bg-secondary/10 text-secondary-dark dark:text-secondary-light',
  };

  return (
    <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${accentMap[accent]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
      </div>
    </div>
  );
}

export function CycleStatsBar({ stats }: { stats: CycleStats & { activeCyclesCount?: number } }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Activity} label="Active Cycles" value={stats.activeCyclesCount ?? 0} accent="primary" />
      <StatCard icon={Users} label="Total Applicants" value={stats.applicantsCount || stats.totalFills || 0} accent="blue" />
      <StatCard icon={BarChart3} label="Total Roles" value={stats.rolesCount || 0} accent="secondary" />
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green/10 text-green-dark dark:text-green-light">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Top Source</p>
          <Badge variant="outline" className="mt-1 text-xs text-muted-foreground font-normal">
            Coming Soon
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function SingleCycleStatsBar({
  stats,
  rolesCount,
}: {
  stats?: Partial<CycleStats>;
  rolesCount?: number;
}) {
  const currentRoles = rolesCount ?? stats?.rolesCount ?? 0;
  const currentApplicants = stats?.applicantsCount || stats?.totalFills || 0;
  const currentOpens = stats?.totalOpens || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={BarChart3} label="Total Roles" value={currentRoles} accent="primary" />
      <StatCard icon={Users} label="Total Applicants" value={currentApplicants} accent="blue" />
      <StatCard icon={Eye} label="Total Opens" value={currentOpens} accent="secondary" />
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green/10 text-green-dark dark:text-green-light">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Top Source</p>
          <Badge variant="outline" className="mt-1 text-xs text-muted-foreground font-normal">
            Coming Soon
          </Badge>
        </div>
      </div>
    </div>
  );
}

