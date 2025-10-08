"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BannerButton, ButtonVariant } from './data/types';
import { banners } from './data/entries';


export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-48 xs:h-56 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl mb-4 sm:mb-6 md:mb-8 max-w-full">
      {/* Carousel Images */}
      <div className="relative w-full h-full overflow-hidden max-w-full">
        <div 
          className="flex w-full h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="relative w-full h-full flex-shrink-0 min-w-full"
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center text-center text-white p-3 xs:p-4 sm:p-6 md:p-8">
                <div className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl px-2 sm:px-4">
                  <h1 className={`text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-bold mb-1 xs:mb-2 sm:mb-3 md:mb-4 transition-all duration-1000 leading-tight ${
                    index === currentSlide 
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.title}
                  </h1>
                  <p className={`text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl opacity-90 transition-all duration-1000 delay-300 leading-snug ${
                    index === currentSlide 
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.subtitle}
                  </p>
                  {Array.isArray(banner.buttons) && banner.buttons.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                      {banner.buttons.slice(0, 3).map((btnProps, i) => (
                        <Button 
                          key={i} 
                          {...btnProps} 
                          variant={btnProps.variant as ButtonVariant}
                          className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-1 xs:left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 z-20 w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="size-3 xs:size-4 sm:size-5 md:size-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 xs:right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 z-20 w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
        onClick={nextSlide}
      >
        <ChevronRight className="size-3 xs:size-4 sm:size-5 md:size-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex space-x-1.5 xs:space-x-2 sm:space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}