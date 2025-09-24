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
  },
  {
    id: 3,
    title: "Pool a Cab",
    description: "Share rides with others",
    icon: Users,
    href: "/pool-cab",
    isLastUsed: false,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100"
  },
  {
    id: 4,
    title: "Create Tickets",
    description: "Report issues or requests",
    icon: Ticket,
    href: "/create-tickets",
    isLastUsed: false,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100"
  }
];

export default function QuickAccessCards() {
  return (
    <div className="mb-12 sm:mb-16">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Clock className="size-5 sm:size-6 text-primary" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Pick up where you left off:</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 min-w-0">
        {quickAccessItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.id}
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 dark:bg-black/80 backdrop-blur-sm ${
                index === 0 ? 'lg:transform lg:rotate-1' : 
                index === 1 ? 'lg:transform lg:-rotate-1' :
                index === 2 ? 'lg:transform lg:rotate-1' : 
                'lg:transform lg:-rotate-1'
              } hover:rotate-0`}
            >
              <Button 
                variant="ghost" 
                className="w-full h-full p-0 bg-transparent hover:bg-transparent"
                asChild
              >
                <Link href={item.href}>
                  <CardContent className="p-4 sm:p-6 h-40 sm:h-48 flex flex-col justify-between relative">
                    {/* Badge for last used */}
                    {item.isLastUsed && (
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 text-xs"
                      >
                        Last Used
                      </Badge>
                    )}
                    
                    {/* Icon */}
                    <div className={`${item.bgColor} dark:bg-opacity-20 ${item.hoverColor} w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110`}>
                      <Icon className={`size-6 sm:size-8 ${item.color} dark:opacity-90`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <TrendingUp className="size-3 sm:size-4 text-primary" />
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