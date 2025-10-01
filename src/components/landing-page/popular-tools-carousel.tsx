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
  Car,
  Tv,
  ShoppingBag,
  Boxes,
  GalleryHorizontalEnd,
  Building2,
  UserCog,
  MailPlus,
  ChevronLeft,
  ChevronRight
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
  },
  {
    id: 5,
    title: "Pool Subscription",
    description: "Share streaming subscriptions",
    icon: Tv,
    href: "/pool-subscription",
    usage: "980 users",
    rating: 4.5,
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    id: 6,
    title: "Borrow Assets",
    description: "Borrow equipment and resources",
    icon: ShoppingBag,
    href: "/borrow-assets",
    usage: "1.2k users",
    rating: 4.4,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    id: 7,
    title: "Resources",
    description: "Access academic resources",
    icon: Boxes,
    href: "/resources",
    usage: "2.1k users",
    rating: 4.6,
    color: "text-teal-600",
    bgColor: "bg-teal-50"
  },
  {
    id: 8,
    title: "Organizations",
    description: "Explore student organizations",
    icon: GalleryHorizontalEnd,
    href: "/organisations-catalogue",
    usage: "1.7k users",
    rating: 4.3,
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  },
  {
    id: 9,
    title: "SG Compose",
    description: "Send messages to student government",
    icon: MailPlus,
    href: "/sg-compose/outbox",
    usage: "890 users",
    rating: 4.1,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50"
  },
  {
    id: 10,
    title: "My Profile",
    description: "Manage your profile settings",
    icon: UserCog,
    href: "/profile",
    usage: "2.8k users",
    rating: 4.5,
    color: "text-violet-600",
    bgColor: "bg-violet-50"
  }
];

export default function PopularToolsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  
  // Update items per view based on screen size
  React.useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 cards
      } else {
        setItemsPerView(4); // Desktop: 4 cards
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, popularTools.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  return (
    <div className="mb-8 sm:mb-12 min-w-0">
      <div className="flex items-center gap-3 mb-4 sm:mb-8">
        <Star className="size-5 sm:size-6 text-primary fill-primary" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Or use our most popular tools</h2>
      </div>
      <div className="relative min-w-0">
        {/* Carousel Container */}
        <div className="overflow-hidden rounded-2xl min-w-0">
          <div 
            className="flex transition-transform duration-500 ease-in-out min-w-0"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(popularTools.length / itemsPerView) * 100}%`
            }}
          >
            {popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="flex-shrink-0 px-2 sm:px-3 min-w-0"
                  style={{ width: `${100 / popularTools.length}%` }}
                >
                  <Card className="group h-40 sm:h-48 overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/90 dark:bg-black/90 backdrop-blur-sm min-w-0">
                    <Button 
                      variant="ghost" 
                      className="w-full h-full p-0 bg-transparent hover:bg-transparent"
                      asChild
                    >
                      <Link href={tool.href}>
                        <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between min-w-0">
                          {/* Header with icon and rating */}
                          <div className="flex items-start justify-between mb-2 sm:mb-4">
                            <div className={`${tool.bgColor} dark:bg-opacity-20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 min-w-0`}>
                              <Icon className={`size-5 sm:size-6 ${tool.color} dark:opacity-90`} />
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="size-3 sm:size-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{tool.rating}</span>
                            </div>
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 group-hover:text-primary transition-colors min-w-0">
                              {tool.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 leading-relaxed line-clamp-2 min-w-0">
                              {tool.description}
                            </p>
                          </div>
                          {/* Usage stats */}
                          <div className="flex items-center justify-between min-w-0">
                            <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {tool.usage}
                            </Badge>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          </div>
                        </CardContent>
                      </Link>
                    </Button>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-black/90 text-gray-700 dark:text-gray-300 border-0 shadow-lg z-10"
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="size-4 sm:size-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-black/90 text-gray-700 dark:text-gray-300 border-0 shadow-lg z-10"
          onClick={nextSlide}
          disabled={currentIndex === maxIndex}
        >
          <ChevronRight className="size-4 sm:size-6" />
        </Button>
        {/* Dots Indicator */}
        <div className="flex justify-center mt-2 sm:mt-6 space-x-2 min-w-0">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}