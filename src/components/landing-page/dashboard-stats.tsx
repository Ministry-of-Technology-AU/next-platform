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
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Activity className="size-5 sm:size-6 text-primary" />
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Insights</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Users */}
        <div className="bg-primary dark:bg-gradient-to-br dark:from-primary/70 dark:to-primary/60 text-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
          <Users className="size-6 mx-auto mb-2 opacity-80" />
          <div className="text-3xl sm:text-4xl font-bold mb-1">{stats.activeUsers}</div>
          <div className="text-xs opacity-90">Active Users</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs bg-white/20 rounded-full px-2 py-1 w-fit mx-auto">
            <TrendingUp className="size-3" />
            <span>{stats.weeklyGrowth}</span>
          </div>
        </div>

        {/* Events This Month */}
        <div className="bg-primary-light dark:bg-gradient-to-br dark:from-primary/60 dark:to-primary/50 text-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
          <Calendar className="size-6 mx-auto mb-2 opacity-80" />
          <div className="text-3xl sm:text-4xl font-bold mb-1">{stats.totalEvents}</div>
          <div className="text-xs opacity-90">Events This Month</div>
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse mx-auto mt-2" />
        </div>

        {/* Course Reviews */}
        <div className="bg-primary-extralight dark:bg-gradient-to-br dark:from-primary/60 dark:to-primary/50 text-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
          <BookOpen className="size-6 mx-auto mb-2 opacity-80" />
          <div className="text-3xl sm:text-4xl font-bold mb-1">{stats.coursesReviewed}</div>
          <div className="text-xs opacity-90">Course Reviews</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs">
            <Star className="size-3 fill-current" />
            <span>{stats.avgRating}</span>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-secondary dark:bg-gradient-to-br dark:from-primary/50 dark:to-primary/40 text-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
          <Zap className="size-6 mx-auto mb-2 opacity-80" />
          <div className="text-3xl sm:text-4xl font-bold mb-1">{stats.uptime}</div>
          <div className="text-xs opacity-90">System Uptime</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs opacity-90">
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span>Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}