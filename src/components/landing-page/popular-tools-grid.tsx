"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Star,
  ClipboardPenLine,
  CalendarSync,
  WifiPen,
  Car
} from 'lucide-react';

const popularTools = [
  {
    id: 1,
    title: "Course Reviews",
    description: "Read and write course reviews",
    icon: ClipboardPenLine,
    href: "/platform/course-reviews",
    gradient: "from-blue-500 to-cyan-500",
  iconBg: "bg-blue-50 dark:bg-blue-950/30",
  iconColor: "text-blue-600 dark:text-blue-400",
  hoverClass: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
  },
  {
    id: 2,
    title: "Semester Planner",
    description: "Plan your academic semester",
    icon: CalendarSync,
    href: "/platform/semester-planner",
    gradient: "from-green-500 to-emerald-500",
  iconBg: "bg-green-50 dark:bg-green-950/30",
  iconColor: "text-green-600 dark:text-green-400",
  hoverClass: "group-hover:text-green-600 dark:group-hover:text-green-400",
  },
  {
    id: 3,
    title: "Wifi Tickets",
    description: "Raise a ticket about wifi issues",
    icon: WifiPen,
    href: "/platform/wifi-tickets",
    gradient: "from-purple-500 to-pink-500",
  iconBg: "bg-purple-50 dark:bg-purple-950/30",
  iconColor: "text-purple-600 dark:text-purple-400",
  hoverClass: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
  },
  {
    id: 4,
    title: "Pool a Cab",
    description: "Share rides with other students",
    icon: Car,
    href: "/platform/pool-cab",
    gradient: "from-orange-500 to-red-500",
  iconBg: "bg-orange-50 dark:bg-orange-950/30",
  iconColor: "text-orange-600 dark:text-orange-400",
  hoverClass: "group-hover:text-orange-500 dark:group-hover:text-orange-300",
  }
];

export default function PopularToolsGrid() {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Star className="size-5 sm:size-6 text-primary fill-primary" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Or use our most popular tools
        </h2>
      </div>
      
      {/* Responsive Grid - 2 cols on mobile/tablet, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {popularTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              className="group relative h-48 sm:h-52 lg:h-56 border border-gray-200 dark:border-border overflow-hidden transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-background/70"
            >
              {/* Gradient accent line at top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />

              <Button
                variant="ghost"
                className="w-full h-full p-0 bg-transparent hover:bg-transparent"
                asChild
              >
                <Link href={tool.href}>
                  <CardContent className="p-4 sm:p-5 lg:p-6 h-full flex flex-col items-center justify-center relative">
                    {/* Icon with background */}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center rounded-xl ${tool.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`size-7 sm:size-8 ${tool.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-1.5 sm:space-y-2">
                      <h3 className={cn("text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300", tool.hoverClass)}>
                        {tool.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 px-1">
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