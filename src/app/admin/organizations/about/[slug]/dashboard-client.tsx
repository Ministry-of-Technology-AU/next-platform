"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Users, 
  CalendarDays, 
  Target,
  BarChart3,
  CheckCircle2,
  Circle,
  Mail
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
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

type DashboardProps = {
  organization: {
    id: string;
    name: string;
    type: string;
    description: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    inductionsOpen: boolean;
    inductionEnd: string;
    teamSize: number;
    leadershipTier1: any[];
    leadershipTier2: any[];
    email: string | null;
    applicationVolume: any[];
    inductionTimeline: any[];
  }
};

export default function DashboardClient({ organization }: DashboardProps) {
  const [timeframe, setTimeframe] = useState("monsoon_2026");

  const totalApplications = organization.applicationVolume.reduce((acc, curr) => acc + (curr.volume || 0), 0);

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <Avatar className="w-24 h-24 rounded-2xl shadow-inner shrink-0">
            <AvatarImage src={organization.logoUrl || ""} alt={organization.name} className="object-cover" />
            <AvatarFallback className="rounded-2xl bg-neutral-light/50 text-neutral-primary">
              <Users className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-primary dark:text-primary-bright">
                {organization.name}
              </h2>
              <Badge variant="outline" className="capitalize w-fit mx-auto sm:mx-0">
                {organization.type}
              </Badge>
            </div>
            <div 
              className="text-sm text-neutral-dark mb-4 line-clamp-2 prose prose-sm dark:prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: organization.description }} 
            />
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {organization.email && (
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${organization.email}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-light/50 dark:bg-gray-dark/50 hover:bg-primary/10 hover:text-primary text-neutral-primary transition-colors border border-border font-medium"
                >
                  <Mail className="w-3.5 h-3.5" /> {organization.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4 justify-between h-full">
          <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-primary">Total Team Size</p>
              <h3 className="text-2xl font-bold text-primary dark:text-primary-bright">{organization.teamSize}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${organization.inductionsOpen ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-primary">Induction Status</p>
              <h3 className="text-lg font-bold text-primary dark:text-primary-bright">
                {organization.inductionsOpen ? 'Active' : 'Closed'}
              </h3>
              {organization.inductionsOpen && (
                <p className="text-xs text-neutral-dark">Ends: {organization.inductionEnd}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Volume Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-primary dark:text-primary-bright leading-none">Application Volume</h3>
                <Badge className="ml-5 bg-primary/10 text-primary border border-primary/20 dark:bg-secondary-dark/20 dark:text-secondary-light dark:border-secondary-dark/30 px-2.5 py-0.5 rounded text-xs font-semibold">
                  Total: {totalApplications}
                </Badge>
              </div>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monsoon_2026">Monsoon 2026</SelectItem>
                <SelectItem value="spring_2026">Spring 2026</SelectItem>
                <SelectItem value="monsoon_2025">Monsoon 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={organization.applicationVolume}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                />
                <Legend iconType="circle" />
                <Bar 
                  dataKey="volume" 
                  name="Applications" 
                  fill="#87281b" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Induction Timeline */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary dark:text-primary-bright">Induction Timeline</h3>
          </div>
          
          <div className="flex flex-col gap-0 relative">
            <div className="absolute left-2.5 top-2 bottom-4 w-px bg-border"></div>
            {organization.inductionTimeline.map((item, idx) => (
              <div key={idx} className="flex gap-4 relative pb-6 last:pb-0">
                <div className="relative z-10 bg-white dark:bg-gray-dark/15 rounded-full mt-1">
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 bg-white dark:bg-gray-dark/15 rounded-full" />
                  ) : item.status === 'current' ? (
                    <Circle className="w-5 h-5 text-primary fill-primary/20 bg-white dark:bg-gray-dark/15 rounded-full" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-light-hover dark:text-gray-500 bg-white dark:bg-gray-dark/15 rounded-full" />
                  )}
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${item.status === 'current' ? 'text-primary dark:text-primary-bright' : 'text-neutral-primary'}`}>
                    {item.step}
                  </h4>
                  <p className="text-xs text-neutral-dark mt-1">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-primary dark:text-primary-bright mb-6">Leadership Team</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-neutral-primary mb-4 uppercase tracking-wider">Tier 1 Leaders</h4>
            {organization.leadershipTier1.length > 0 ? (
              <div className="flex flex-col gap-3">
                {organization.leadershipTier1.map((leader: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-light/50 dark:bg-gray-dark/30 border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      {leader.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary dark:text-primary-bright">{leader.username || 'Unknown User'}</p>
                      <p className="text-xs text-neutral-dark">{leader.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-dark italic">No Tier 1 leaders listed.</p>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-neutral-primary mb-4 uppercase tracking-wider">Tier 2 Leaders</h4>
            {organization.leadershipTier2.length > 0 ? (
              <div className="flex flex-col gap-3">
                {organization.leadershipTier2.map((leader: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-light/50 dark:bg-gray-dark/30 border border-border">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                      {leader.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary dark:text-primary-bright">{leader.username || 'Unknown User'}</p>
                      <p className="text-xs text-neutral-dark">{leader.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-dark italic">No Tier 2 leaders listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
