"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Award,
  Users,
  Ticket,
  Clock,
  TrendingUp
} from 'lucide-react';

const quickAccessItems = [
  {
    id: 1,
    title: "Events Calendar",
    description: "View and manage campus events",
    icon: CalendarDays,
    href: "/events-calendar",
    isLastUsed: true,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100"
  },
  {
    id: 2,
    title: "CGPA Planner",
    description: "Track your academic progress",
    icon: Award,
    href: "/cgpa-planner",
    isLastUsed: false,
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100"
  }
];

export default function QuickAccessCards() {
  return (
    <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 w-full overflow-visible">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <Clock className="size-4 sm:size-5 md:size-6 text-primary flex-shrink-0" />
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          Pick up where you left off:
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 max-w-6xl mx-auto w-full overflow-visible">
        {/* First row - 2 cards side by side */}
        <Card className="group relative overflow-hidden border-2-var(--color-primary) shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm w-full">
          <Button
            variant="ghost"
            className="w-full h-full p-0 bg-transparent hover:bg-transparent"
            asChild
          >
            <Link href={quickAccessItems[0].href}>
              <CardContent className="p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 flex flex-col items-center align-center justify-center w-full">
                {quickAccessItems[0].isLastUsed && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 xs:top-2.5 sm:top-3 md:top-4 left-2 xs:left-2.5 sm:left-3 md:left-4 text-xs border"
                    style={{
                      backgroundColor: "var(--color-primary-light)",
                      color: "white",
                      borderColor: "var(--color-primary)"
                    }}
                  >
                    Last Used
                  </Badge>

                )}


                <div className={`${quickAccessItems[0].bgColor} dark:bg-opacity-20 ${quickAccessItems[0].hoverColor} w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                  {React.createElement(quickAccessItems[0].icon, {
                    className: `size-6 xs:size-7 sm:size-8 md:size-9 lg:size-10 ${quickAccessItems[0].color} dark:opacity-90`
                  })}
                </div>

                <div className="flex-1 text-center">
                  <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 group-hover:text-primary transition-colors">
                    {quickAccessItems[0].title}
                  </h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {quickAccessItems[0].description}
                  </p>
                </div>

                <div className="absolute bottom-2 xs:bottom-2.5 sm:bottom-3 md:bottom-4 right-2 xs:right-2.5 sm:right-3 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TrendingUp className="size-3 xs:size-4 sm:size-5 text-primary" />
                </div>
              </CardContent>
            </Link>
          </Button>
        </Card>

        <Card className="group relative overflow-hidden border-2-var(--color-primary) shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm w-full">
          <Button
            variant="ghost"
            className="w-full h-full p-0 bg-transparent hover:bg-transparent"
            asChild
          >
            <Link href={quickAccessItems[1].href}>
              <CardContent className="p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 flex flex-col items-center align-center justify-center relative w-full">
                <div className={`${quickAccessItems[1].bgColor} dark:bg-opacity-20 ${quickAccessItems[1].hoverColor} w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                  {React.createElement(quickAccessItems[1].icon, {
                    className: `size-6 xs:size-7 sm:size-8 md:size-9 lg:size-10 ${quickAccessItems[1].color} dark:opacity-90`
                  })}
                </div>

                <div className="flex-1 text-center">
                  <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 group-hover:text-primary transition-colors">
                    {quickAccessItems[1].title}
                  </h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {quickAccessItems[1].description}
                  </p>
                </div>

                <div className="absolute bottom-2 xs:bottom-2.5 sm:bottom-3 md:bottom-4 right-2 xs:right-2.5 sm:right-3 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TrendingUp className="size-3 xs:size-4 sm:size-5 text-primary" />
                </div>
              </CardContent>
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}