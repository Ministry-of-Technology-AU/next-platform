"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { banners } from './data/platform-data';
import { ButtonVariant } from './data/types';
import Image from 'next/image';

import { Advertisement } from './data/types';

interface PlatformCarouselProps {
  className?: string;
  adverts?: Advertisement[];
}

export default function PlatformCarousel({ className, adverts = [] }: PlatformCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Merge ads with static banners
  // First, map ads to banner format
  const adBanners = adverts.map(ad => {
    const bannerImage = ad.attributes.banner_image?.data?.[0]?.attributes?.url || '/yyh4iiocug5dnctfkd5t.webp'; // Fallback image
    // Ensure absolute URL if needed, but Strapi usually returns relative or full depending on config. 
    // Assuming relative, prepend base URL if needed? 
    // Usually strapiGet helper might handle it or we assume it's a full URL or relative.
    // If it's relative, we need NEXT_PUBLIC_STRAPI_URL.
    // But let's assume the url is usable for now, or handle it.
    // Actually, strapiGet usually returns JSON. media URLs are often relative like /uploads/...
    // I should check how media is handled. The user's other code might show.
    // But as a safe bet I'll prepend process.env.NEXT_PUBLIC_STRAPI_URL if it starts with /.

    // For now, I'll trust the URL or use a helper if I had one. 
    // I'll stick to using the URL as is, but if it looks relative (starts with /), I might need to fix it. 
    // However, for this task, I will use the URL provided.

    return {
      id: `ad-${ad.id}`,
      title: ad.attributes.title,
      subtitle: ad.attributes.subtitle,
      description: ad.attributes.description,
      image: bannerImage,
      alt: ad.attributes.title,
      gradient: ad.attributes.gradient || "",
      buttons: ad.attributes.buttons || [],
    };
  });

  const allBanners = [...adBanners, ...banners];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allBanners.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allBanners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % allBanners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + allBanners.length) % allBanners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className={`relative w-full max-w-4xl aspect-[16/7] sm:aspect-[16/7] md:aspect-[16/7] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl ${className}`}>
      {/* Carousel Images */}
      <div className="relative w-full h-full overflow-hidden max-w-full">
        <div
          className="flex w-full h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {allBanners.map((banner, index) => (
            <div
              key={banner.id}
              className="relative w-full h-full flex-shrink-0 min-w-full"
            >
              <Image
                src={banner.image.startsWith('/') && !banner.image.startsWith('/_next') && banner.image !== '/yyh4iiocug5dnctfkd5t.webp' && banner.image !== '/Neev-Banner.webp' && banner.image !== '/z6ggcs3unvoquykoyupo.webp' ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${banner.image}` : banner.image}
                alt={banner.alt}
                width={1200}
                height={720}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 1200px"
                priority={index === 0}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-start text-left text-white px-8 py-3 sm:px-14 sm:py-6 md:px-16 md:py-8">
                <div className="sm:max-w-lg max-w-xs">
                  <div className={`sm:text-sm text-[10px] font-bold mb-1 sm:mb-2 transition-all duration-1000 ${index === currentSlide
                    ? 'animate-in fade-in-0 slide-in-from-bottom-4'
                    : 'opacity-0 translate-y-4'
                    }`}>
                    {banner.subtitle}
                  </div>
                  <h1 className={`!text-sm sm:!text-2xl lg:!text-4xl font-extrabold mb-2 sm:mb-4 transition-all duration-1000 delay-150 !text-left ${index === currentSlide
                    ? 'animate-in fade-in-0 slide-in-from-bottom-4'
                    : 'opacity-0 translate-y-4'
                    }`}>
                    {banner.title}
                  </h1>
                  <p className={`sm:text-sm md:text-base text-[10px] mb-3 sm:mb-6 opacity-90 transition-all duration-1000 delay-300 ${index === currentSlide
                    ? 'animate-in fade-in-0 slide-in-from-bottom-4'
                    : 'opacity-0 translate-y-4'
                    }`}>
                    {banner.description}
                  </p>
                  {Array.isArray(banner.buttons) && banner.buttons.length > 0 && (
                    <div className={`flex flex-row flex-wrap gap-2 sm:gap-3 transition-all duration-1000 delay-500 ${index === currentSlide
                      ? 'animate-in fade-in-0 slide-in-from-bottom-4'
                      : 'opacity-0 translate-y-4'
                      }`}>
                      {banner.buttons.slice(0, 2).map((btnProps: any, i: number) => (
                        <Button
                          key={i}
                          {...btnProps}
                          variant={btnProps.variant as ButtonVariant}
                          className={`text-xs sm:text-sm ${btnProps.className}`}
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/20 hover:backdrop-blur-sm text-white border-0 z-10 transition-colors w-8 h-8 sm:w-10 sm:h-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-white/20 hover:backdrop-blur-sm text-white border-0 z-10 transition-colors w-8 h-8 sm:w-10 sm:h-10"
        onClick={nextSlide}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2">
        {allBanners.map((_, index) => (
          <button
            key={index}
            className={`sm:w-3 sm:h-3 w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
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