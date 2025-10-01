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
          className="md:col-span-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">{stats.activeUsers}</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
          }
          description={<span className="text-white/90">Students currently using the platform</span>}
          header={
            <div className="flex items-center justify-between mb-4">
              <Users className="size-8 text-white/80" />
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <TrendingUp className="size-4" />
                <span className="text-sm font-medium">{stats.weeklyGrowth}</span>
              </div>
            </div>
          }
        />

        {/* Events This Month */}
        <BentoGridItem
          className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">{stats.totalEvents}</div>
              <div className="text-base opacity-90">Events This Month</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-4">
              <Calendar className="size-6 text-white/80" />
              <div className="w-3 h-3 rounded-full bg-green-300 animate-pulse" />
            </div>
          }
        />

        {/* Course Reviews */}
        <BentoGridItem
          className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-3xl font-bold mb-2">{stats.coursesReviewed}</div>
              <div className="text-base opacity-90">Course Reviews</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-4">
              <BookOpen className="size-6 text-white/80" />
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-current" />
                <span className="text-sm font-medium">{stats.avgRating}</span>
              </div>
            </div>
          }
        />

        {/* System Uptime - Wide card */}
        <BentoGridItem
          className="md:col-span-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
          title={
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">{stats.uptime}</div>
              <div className="text-lg opacity-90">System Uptime</div>
            </div>
          }
          description={<span className="text-white/90">Reliable service you can count on</span>}
          header={
            <div className="flex items-center justify-between mb-4">
              <Zap className="size-8 text-white/80" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-sm opacity-90">All systems operational</span>
              </div>
            </div>
          }
        />
      </BentoGrid>

      {/* Additional metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-8 min-w-0">
        <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6 text-center">
            <Clock className="size-6 sm:size-8 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">24/7</div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Support Available</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6 text-center">
            <TrendingUp className="size-6 sm:size-8 text-green-600 mx-auto mb-3 sm:mb-4" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">95%</div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">User Satisfaction</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6 text-center">
            <Star className="size-6 sm:size-8 text-yellow-600 mx-auto mb-3 sm:mb-4 fill-current" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">50+</div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tools & Features</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}