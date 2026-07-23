"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Star,
  ClipboardPenLine,
  CalendarSync,
  WifiPen,
  Car,
  CalendarDays,
  Trophy,
  Award,
} from 'lucide-react';

const ALL_POPULAR_TOOLS = [
  {
    id: 1,
    title: "Course Reviews",
    description: "Read and write course reviews",
    icon: ClipboardPenLine,
    href: "/platform/course-reviews",
    color: "text-primary-light",
    roles: null, // null = available to all roles
  },
  {
    id: 2,
    title: "Semester Planner", 
    description: "Plan your academic semester",
    icon: CalendarSync,
    href: "/platform/semester-planner",
    color: "text-secondary",
    roles: null,
  },
  {
    id: 3,
    title: "Wifi Tickets",
    description: "Raise a ticket about wifi issues",
    icon: WifiPen,
    href: "/platform/wifi-tickets",
    color: "text-green",
    roles: ['student', 'beta_tester', 'organization', 'rep', 'hor_member', 'user'], // not ashoka_admin
  },
  {
    id: 4,
    title: "Pool a Cab",
    description: "Pool a Cab with fellow Ashokans",
    icon: Car,
    href: "/platform/pool-cab",
    color: "text-blue",
    roles: ['student', 'beta_tester', 'organization', 'rep', 'hor_member', 'user'], // not ashoka_admin
  },
  {
    id: 5,
    title: "Events Calendar",
    description: "Stay up to date with campus events",
    icon: CalendarDays,
    href: "/platform/events-calendar",
    color: "text-orange-400",
    roles: null,
  },
  {
    id: 6,
    title: "Sports",
    description: "Follow campus sports leagues",
    icon: Trophy,
    href: "/platform/sports",
    color: "text-yellow-500",
    roles: null,
  },
];

// Tools shown on the dashboard for ashoka_admin (excludes removed tools like Course Reviews)
const ASHOKA_ADMIN_TOOL_IDS = [2, 4, 5, 6];

interface PopularToolsGridProps {
  role?: string;
}

export default function PopularToolsGrid({ role }: PopularToolsGridProps) {
  const isAshokaAdmin = role === 'ashoka_admin';

  const tools = isAshokaAdmin
    ? ALL_POPULAR_TOOLS.filter(t => ASHOKA_ADMIN_TOOL_IDS.includes(t.id))
    : ALL_POPULAR_TOOLS.filter(t => t.roles === null || (role && t.roles?.includes(role)));

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Star className="size-5 sm:size-6 text-primary fill-primary" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Use our most popular tools!
        </h2>
      </div>
      
      {/* Responsive Grid - 2 cols on mobile/tablet, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="group h-40 sm:h-48 lg:h-56 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-card"
            >
              <Button 
                variant="ghost" 
                className="w-full h-full p-0 bg-transparent hover:bg-transparent"
                asChild
              >
                <Link href={tool.href}>
                  <CardContent className="p-3 sm:p-4 lg:p-6 h-full flex flex-col items-center justify-center">
                    {/* Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 flex items-center justify-center">
                      <Icon className={`size-6 sm:size-8 ${tool.color}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="sm:!text-xl !text-sm font-medium mb-1 sm:mb-2 group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}