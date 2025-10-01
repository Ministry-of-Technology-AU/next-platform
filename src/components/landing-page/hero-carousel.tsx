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
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-8 sm:mb-12">
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
                style={{ width: '100%', height: '100%' }}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center text-center text-white p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl">
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 transition-all duration-1000 ${
                    index === currentSlide 
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.title}
                  </h1>
                  <p className={`text-sm sm:text-base md:text-xl lg:text-2xl opacity-90 transition-all duration-1000 delay-300 ${
                    index === currentSlide 
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    {banner.subtitle}
                  </p>
                  {Array.isArray(banner.buttons) && banner.buttons.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {banner.buttons.slice(0, 3).map((btnProps, i) => (
                        <Button key={i} {...btnProps} variant={btnProps.variant as ButtonVariant} />
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="size-4 sm:size-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="size-4 sm:size-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
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