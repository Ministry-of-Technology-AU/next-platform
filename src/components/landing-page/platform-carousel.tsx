"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { banners } from './data/platform-data';
import { BannerButton, ButtonVariant } from './data/types';

interface PlatformCarouselProps {
  className?: string;
}

export default function PlatformCarousel({ className }: PlatformCarouselProps) {
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
    <div className={`relative w-full max-w-4xl aspect-[16/7] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Carousel Images */}
      <div className="relative w-full h-full overflow-hidden">
        <div 
          className="flex w-full h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="relative w-full h-full flex-shrink-0"
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-start text-left text-white p-6 md:p-8">
                <div className="max-w-lg">
                  <div className={`text-sm font-bold mb-2 transition-all duration-1000 ${
                    index === currentSlide 
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.subtitle}
                  </div>
                  <h1 className={`text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 transition-all duration-1000 delay-150 !text-left ${
                    index === currentSlide 
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.title}
                  </h1>
                  <p className={`text-sm md:text-base mb-6 opacity-90 transition-all duration-1000 delay-300 ${
                    index === currentSlide 
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.description}
                  </p>
                  {Array.isArray(banner.buttons) && banner.buttons.length > 0 && (
                    <div className={`flex flex-wrap gap-3 transition-all duration-1000 delay-500 ${
                      index === currentSlide 
                        ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                        : 'opacity-0 translate-y-4'
                    }`}>
                      {banner.buttons.slice(0, 2).map((btnProps, i) => (
                        <Button 
                          key={i} 
                          {...btnProps} 
                          variant={btnProps.variant as ButtonVariant}
                          className={btnProps.className}
                        >
                          {btnProps.children}
                        </Button>
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
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/20 hover:backdrop-blur-sm text-white border-0 z-10 transition-colors"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/20 hover:backdrop-blur-sm text-white border-0 z-10 transition-colors"
        onClick={nextSlide}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}