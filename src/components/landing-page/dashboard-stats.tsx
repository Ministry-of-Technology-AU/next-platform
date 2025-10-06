"use client";

import React from 'react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Activity,
  Clock,
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
    <div className="mb-12 sm:mb-16">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Activity className="size-5 sm:size-6 text-primary" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Insights</h2>
      </div>
      
      <BentoGrid className="max-w-6xl mx-auto px-4">
        {/* Active Users - Large card */}
        <BentoGridItem
          className="md:col-span-2 bg-neutral-900 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">{stats.activeUsers}</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
          }
          description="Students currently using the platform"
          header={
            <div className="flex items-center justify-between mb-4">
              <Users className="size-8 text-blue-400" />
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <TrendingUp className="size-4" />
                <span className="text-sm font-medium">{stats.weeklyGrowth}</span>
              </div>
            </div>
          }
        />

        {/* Events This Month */}
        <BentoGridItem
          className="bg-neutral-900 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">{stats.totalEvents}</div>
              <div className="text-base opacity-90">Events This Month</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-4">
              <Calendar className="size-6 text-green-400" />
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            </div>
          }
        />

        {/* Course Reviews */}
        <BentoGridItem
          className="bg-neutral-900 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">{stats.coursesReviewed}</div>
              <div className="text-base opacity-90">Course Reviews</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-4">
              <BookOpen className="size-6 text-orange-400" />
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-current text-yellow-400" />
                <span className="text-sm font-medium">{stats.avgRating}</span>
              </div>
            </div>
          }
        />

        {/* System Uptime - Wide card */}
        <BentoGridItem
          className="md:col-span-2 bg-neutral-900 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">{stats.uptime}</div>
              <div className="text-lg opacity-90">System Uptime</div>
            </div>
          }
          description="Reliable service you can count on"
          header={
            <div className="flex items-center justify-between mb-4">
              <Zap className="size-8 text-purple-400" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm opacity-90">All systems operational</span>
              </div>
            </div>
          }
        />
      </BentoGrid>
    </div>
  );
}