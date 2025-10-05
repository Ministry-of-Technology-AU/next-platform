"use client";

import React from 'react';
import {
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  Activity,
  Star,
  Zap
} from 'lucide-react';

const stats = {
  activeUsers: "2,847",
  totalEvents: "156",
  coursesReviewed: "423",
  avgRating: "4.6",
  weeklyGrowth: "+12%",
  uptime: "99.9%"
};

export default function DashboardStats() {
  return (
    <div className="mb-8 sm:mb-12 w-full overflow-hidden">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Activity className="size-5 sm:size-6 text-primary flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Insights</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        {/* Active Users */}
        <div className="bg-primary dark:bg-gradient-to-br dark:from-primary/70 dark:to-primary/60 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg hover:shadow-xl transition-shadow w-full overflow-hidden">
          <Users className="size-5 sm:size-6 mx-auto mb-2 opacity-80" />
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 truncate">{stats.activeUsers}</div>
          <div className="text-xs opacity-90 truncate">Active Users</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs bg-white/20 rounded-full px-2 py-1 w-fit mx-auto">
            <TrendingUp className="size-3 flex-shrink-0" />
            <span className="whitespace-nowrap">{stats.weeklyGrowth}</span>
          </div>
        </div>

        {/* Events This Month */}
        <div className="bg-primary-light dark:bg-gradient-to-br dark:from-primary/60 dark:to-primary/50 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg hover:shadow-xl transition-shadow w-full overflow-hidden">
          <Calendar className="size-5 sm:size-6 mx-auto mb-2 opacity-80" />
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 truncate">{stats.totalEvents}</div>
          <div className="text-xs opacity-90 truncate">Events This Month</div>
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse mx-auto mt-2" />
        </div>

        {/* Course Reviews */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 dark:bg-gradient-to-br dark:from-primary/60 dark:to-primary/50 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg hover:shadow-xl transition-shadow w-full overflow-hidden">
          <BookOpen className="size-5 sm:size-6 mx-auto mb-2 opacity-80" />
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 truncate">{stats.coursesReviewed}</div>
          <div className="text-xs opacity-90 truncate">Course Reviews</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs">
            <Star className="size-3 fill-current flex-shrink-0" />
            <span className="whitespace-nowrap">{stats.avgRating}</span>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:bg-gradient-to-br dark:from-primary/50 dark:to-primary/40 text-white rounded-xl p-3 sm:p-4 text-center shadow-lg hover:shadow-xl transition-shadow w-full overflow-hidden">
          <Zap className="size-5 sm:size-6 mx-auto mb-2 opacity-80" />
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 truncate">{stats.uptime}</div>
          <div className="text-xs opacity-90 truncate">System Uptime</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs opacity-90">
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse flex-shrink-0" />
            <span className="whitespace-nowrap">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}