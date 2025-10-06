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
        <div className="overflow-visible rounded-2xl min-w-0">
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
                  <Card className="group h-48 sm:h-56 overflow-visible border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-background shadow-lg min-w-0">
                    <Button 
                      variant="ghost" 
                      className="w-full h-full p-0 bg-transparent hover:bg-transparent"
                      asChild
                    >
                      <Link href={tool.href}>
                        <CardContent className="p-4 sm:p-6 h-full flex flex-col items-center justify-center min-w-0">
                          {/* Icon */}
                          <div className="w-12 h-12 mb-3 flex items-center justify-center">
                            <Icon className={`size-8 ${tool.color}`} />
                          </div>
                          {/* Content */}
                          <div className="text-center min-w-0">
                            <h3 className="text-base font-medium mb-2 group-hover:text-primary dark:group-hover:text-secondary transition-colors">
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