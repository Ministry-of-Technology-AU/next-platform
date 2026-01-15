"use client";

import React, { useEffect, useState } from 'react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import {
  Users,
  BookOpen,
  Activity,
  Car,
  Handshake,
  Loader2
} from 'lucide-react';
import { FlickeringGrid } from '../ui/shadcn-io/flickering-grid';

const defaultStats = {
  users: "4,442",
  subscriptionPools: "154",
  courseReviews: "1,093",
  cabPools: "1793"
};

export default function DashboardStats() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/platform/landing-page/metrics", { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setStats({
          users: data.users?.toString() || defaultStats.users,
          subscriptionPools: data.subscriptionPools?.toString() || defaultStats.subscriptionPools,
          courseReviews: data.courseReviews?.toString() || defaultStats.courseReviews,
          cabPools: data.cabPools?.toString() || defaultStats.cabPools,
        });
      } catch (err) {
        console.error("Error fetching metrics:", err);
        // Keep default stats on error
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="mb-8 sm:mb-12 md:mb-16">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
          <Activity className="size-4 sm:size-5 md:size-6 text-primary" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Insights</h2>
        </div>

        <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-r from-[#60150a] to-[#87281b] rounded-lg">
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-lg">Loading platform metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 sm:mb-12 md:mb-16">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
        <Activity className="size-4 sm:size-5 md:size-6 text-primary" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Insights</h2>
      </div>

      <BentoGrid className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Active Users - Large card */}
        <BentoGridItem
          className="md:col-span-2 border-0 bg-gradient-to-r from-[#60150a] to-[#87281b]"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{stats.users}</div>
              <div className="text-sm sm:text-base md:text-lg opacity-90">Active Users</div>
            </div>
          }
          description="Students currently using the platform"
          header={
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Users className="size-6 sm:size-7 md:size-8 text-blue-light" />
            </div>
          }
          children={
            <FlickeringGrid
              className="absolute inset-0"
              squareSize={9}
              gridGap={3}
              flickerChance={0.3}
              color="#3b0800"
              maxOpacity={0.7}
            />
          }
        />

        {/* Events This Month */}
        <BentoGridItem
          className="bg-gradient-to-r from-[#60150a] to-[#87281b] text-white border-0"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{stats.subscriptionPools}</div>
              <div className="text-sm sm:text-base opacity-90">Pools Requested</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <Handshake className="size-5 sm:size-6 text-green" />
            </div>
          }
          children={
            <FlickeringGrid
              className="absolute inset-0"
              squareSize={9}
              gridGap={3}
              flickerChance={0.3}
              color="#3b0800"
              maxOpacity={0.7}
            />
          }
        />

        {/* Course Reviews */}
        <BentoGridItem
          className="bg-gradient-to-r from-[#60150a] to-[#87281b] text-white border-0"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{stats.courseReviews}</div>
              <div className="text-sm sm:text-base opacity-90">Course Reviews</div>
            </div>
          }
          header={
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <BookOpen className="size-5 sm:size-6 text-secondary-dark" />
            </div>
          }
          children={
            <FlickeringGrid
              className="absolute inset-0"
              squareSize={9}
              gridGap={3}
              flickerChance={0.3}
              color="#3b0800"
              maxOpacity={0.7}
            />
          }
        />

        {/* System Uptime - Wide card */}
        <BentoGridItem
          className="md:col-span-2 bg-gradient-to-r from-[#60150a] to-[#87281b] text-white border-0"
          title={
            <div className="text-white">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{stats.cabPools}</div>
              <div className="text-sm sm:text-base md:text-lg opacity-90">Cabs Requested</div>
            </div>
          }
          header={
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Car className="size-6 sm:size-7 md:size-8 text-green-light" />
            </div>
          }
          children={
            <FlickeringGrid
              className="absolute inset-0"
              squareSize={9}
              gridGap={3}
              flickerChance={0.3}
              color="#3b0800"
              maxOpacity={0.7}
            />
          }
        />
      </BentoGrid>
    </div>
  );
}