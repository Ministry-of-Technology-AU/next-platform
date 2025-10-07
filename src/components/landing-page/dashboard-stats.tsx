"use client";

import React from 'react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Activity,
  Car
} from 'lucide-react';

const stats = {
  activeUsers: "4,442",
  totalEvents: "154",
  coursesReviewed: "1,093",
  avgRating: "4.6",
  weeklyGrowth: "+12%",
  uptime: "1793"
};

export default function DashboardStats() {
  return (
    <div className="mb-8 sm:mb-12 md:mb-16">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
        <Activity className="size-4 sm:size-5 md:size-6 text-primary" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Insights</h2>
      </div>
      
      <BentoGrid className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Active Users - Large card */}
        <BentoGridItem
          className="md:col-span-2 border-0 bg-gradient-to-r from-[#60150a] via-[#87281b] to-[#9b4e43]"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{stats.activeUsers}</div>
              <div className="text-sm sm:text-base md:text-lg opacity-90">Active Users</div>
            </div>
          }
          description="Students currently using the platform"
          header={
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Users className="size-6 sm:size-7 md:size-8 text-blue-400" />
              <div className="flex items-center gap-1 sm:gap-2 bg-white/20 rounded-full px-2 sm:px-3 py-1">
                <TrendingUp className="size-3 sm:size-4" />
                <span className="text-xs sm:text-sm font-medium">{stats.weeklyGrowth}</span>
              </div>
            </div>
          }
        >
        </BentoGridItem>

        {/* Events This Month */}
        <BentoGridItem
          className="bg-gradient-to-r from-[#60150a] via-[#87281b] to-[#9b4e43] text-white border-0"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{stats.totalEvents}</div>
              <div className="text-sm sm:text-base opacity-90">Pools Requested</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <Calendar className="size-5 sm:size-6 text-green-400" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400 animate-pulse" />
            </div>
          }
        />

        {/* Course Reviews */}
        <BentoGridItem
          className="bg-gradient-to-r from-[#60150a] via-[#87281b] to-[#9b4e43] text-white border-0"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{stats.coursesReviewed}</div>
              <div className="text-sm sm:text-base opacity-90">Course Reviews</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <BookOpen className="size-5 sm:size-6 text-orange-400" />
            </div>
          }
        />

        {/* System Uptime - Wide card */}
        <BentoGridItem
          className="md:col-span-2 bg-gradient-to-r from-[#60150a] via-[#87281b] to-[#9b4e43] text-white border-0"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{stats.uptime}</div>
              <div className="text-sm sm:text-base md:text-lg opacity-90">Cabs Requested</div>
            </div>
          }
          header={
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Car className="size-6 sm:size-7 md:size-8 text-purple-400" />
            </div>
          }
        />
      </BentoGrid>
    </div>
  );
}