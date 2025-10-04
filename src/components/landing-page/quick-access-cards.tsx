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
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Clock className="size-5 sm:size-6 text-primary" />
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Pick up where you left off:</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
        {/* First row - 2 cards side by side */}
        <Card className="group relative overflow-hidden border-2-var(--color-primary) shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            className="w-full h-full p-0 bg-transparent hover:bg-transparent"
            asChild
          >
            <Link href={quickAccessItems[0].href}>
              <CardContent className="p-6 sm:p-8 h-48 sm:h-56 flex flex-col items-center align-center justify-center">
                {quickAccessItems[0].isLastUsed && (
                  <Badge
                    variant="secondary"
                    className="absolute top-3 sm:top-4 left-6 sm:left-2 text-xs border"
                    style={{
                      backgroundColor: "var(--color-primary-light)",
                      color: "white",
                      borderColor: "var(--color-primary)"
                    }}
                  >
                    Last Used
                  </Badge>

                )}


                <div className={`${quickAccessItems[0].bgColor} dark:bg-opacity-20 ${quickAccessItems[0].hoverColor} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300 group-hover:scale-110`}>
                  {React.createElement(quickAccessItems[0].icon, {
                    className: `size-8 sm:size-10 ${quickAccessItems[0].color} dark:opacity-90`
                  })}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    {quickAccessItems[0].title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {quickAccessItems[0].description}
                  </p>
                </div>

                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TrendingUp className="size-4 sm:size-5 text-primary" />
                </div>
              </CardContent>
            </Link>
          </Button>
        </Card>

        <Card className="group relative overflow-hidden border-2-var(--color-primary) shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            className="w-full h-full p-0 bg-transparent hover:bg-transparent"
            asChild
          >
            <Link href={quickAccessItems[1].href}>
              <CardContent className="p-6 sm:p-8 h-48 sm:h-56 flex flex-col items-center align-center justify-center relative">
                <div className={`${quickAccessItems[0].bgColor} dark:bg-opacity-20 ${quickAccessItems[0].hoverColor} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300 group-hover:scale-110`}>
                  {React.createElement(quickAccessItems[0].icon, {
                    className: `size-8 sm:size-10 ${quickAccessItems[0].color} dark:opacity-90`
                  })}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    {quickAccessItems[1].title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {quickAccessItems[1].description}
                  </p>
                </div>

                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <TrendingUp className="size-4 sm:size-5 text-primary" />
                </div>
              </CardContent>
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}