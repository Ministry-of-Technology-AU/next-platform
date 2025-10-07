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
  Car
} from 'lucide-react';

const popularTools = [
  {
    id: 1,
    title: "Course Reviews",
    description: "Read and write course reviews",
    icon: ClipboardPenLine,
    href: "/platform/course-reviews",
    color: "text-blue-400",
  },
  {
    id: 2,
    title: "Semester Planner", 
    description: "Plan your academic semester",
    icon: CalendarSync,
    href: "/platform/semester-planner",
    color: "text-green-400",
  },
  {
    id: 3,
    title: "Wifi Tickets",
    description: "COMING SOON",
    icon: WifiPen,
    href: "/platform",
    color: "text-purple-400",
  },
  {
    id: 4,
    title: "Pool a Cab",
    description: "COMING SOON",
    icon: Car,
    href: "/platform",
    color: "text-orange-400",
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {popularTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="group h-40 sm:h-48 lg:h-56 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-background"
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