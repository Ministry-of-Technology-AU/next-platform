"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    href: "/course-reviews",
    usage: "2.4k users",
    rating: 4.8,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: 2,
    title: "Semester Planner",
    description: "Plan your academic semester",
    icon: CalendarSync,
    href: "/semester-planner",
    usage: "1.8k users",
    rating: 4.6,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    id: 3,
    title: "Wifi Tickets",
    description: "Report wifi connectivity issues",
    icon: WifiPen,
    href: "/wifi-tickets",
    usage: "3.2k users",
    rating: 4.2,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    id: 4,
    title: "Pool a Cab",
    description: "Share rides with fellow students",
    icon: Car,
    href: "/pool-cab",
    usage: "1.5k users",
    rating: 4.7,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
];

export default function PopularToolsCarousel() {

  return (
    <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 w-full overflow-visible">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <Star className="size-4 sm:size-5 md:size-6 text-primary fill-primary flex-shrink-0" />
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          Or use our most popular tools
        </h2>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 max-w-7xl mx-auto w-full overflow-visible">
        {popularTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="group h-52 xs:h-56 sm:h-60 md:h-64 lg:h-[260px] overflow-hidden border-2-var(--color-primary) shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm w-full">
                    <Button
                      variant="ghost"
                      className="w-full h-full p-0 bg-transparent hover:bg-transparent"
                      asChild
                    >
                      <Link href={tool.href}>
                        <CardContent className="p-3 xs:p-3.5 sm:p-4 h-full flex flex-col w-full">
                          {/* Header with icon and rating */}
                          <div className="flex items-start justify-between mb-2 xs:mb-2.5 sm:mb-3">
                            <div className={`${tool.bgColor} dark:bg-opacity-20 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                              <Icon className={`size-4 xs:size-4.5 sm:size-5 ${tool.color} dark:opacity-90`} />
                            </div>
                            <div className="flex items-center gap-0.5 xs:gap-1 flex-shrink-0">
                              <Star className="size-3 xs:size-3.5 sm:size-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {tool.rating}
                              </span>
                            </div>
                          </div>
                          {/* Content */}
                          <div className="flex-1 w-full overflow-hidden">
                            <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1.5 xs:mb-2 sm:mb-2 group-hover:text-primary transition-colors truncate">
                              {tool.title}
                            </h3>
                            <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mb-2 xs:mb-2.5 sm:mb-3 leading-relaxed line-clamp-2 text-center">
                              {tool.description}
                            </p>
                          </div>
                          {/* Usage stats */}
                          <div className="flex items-center justify-between mt-auto pt-1.5 xs:pt-2 w-full">
                            <Badge variant="outline" className="text-[10px] xs:text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0 px-1.5 xs:px-2 py-0.5">
                              {tool.usage}
                            </Badge>
                            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
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