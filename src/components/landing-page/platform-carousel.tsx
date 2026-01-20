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
  autoPlay?: boolean;
  manualSlide?: number;
  onSlideChange?: (index: number) => void;
}

export default function PlatformCarousel({
  className,
  adverts = [],
  autoPlay = true,
  manualSlide,
  onSlideChange
}: PlatformCarouselProps) {
  const [internalSlide, setInternalSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Use manualSlide if provided, otherwise internal state
  const currentSlide = manualSlide !== undefined ? manualSlide : internalSlide;

  // Merge ads with static banners
  // First, map ads to banner format
  const adBanners = adverts.map(ad => {
    const bannerImage = ad.attributes.banner_image?.data?.[0]?.attributes?.url || '/yyh4iiocug5dnctfkd5t.webp'; // Fallback image
    // Ensure absolute URL if needed, but Strapi usually returns relative or full depending on config. 

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

  // const allBanners = [...adBanners, ...banners];
  const allBanners = adBanners.length > 0 ? [...adBanners] : [...banners];

  useEffect(() => {
    // Sync internal state if manualSlide changes (optional, but good for switching modes)
    if (manualSlide !== undefined) {
      setInternalSlide(manualSlide);
    }
  }, [manualSlide]);

  useEffect(() => {
    setIsAutoPlaying(autoPlay);
  }, [autoPlay]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      const next = (currentSlide + 1) % allBanners.length;
      if (manualSlide === undefined) {
        setInternalSlide(next);
      }
      onSlideChange?.(next);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allBanners.length, currentSlide, manualSlide, onSlideChange]);

  const goToSlide = (index: number) => {
    if (manualSlide === undefined) {
      setInternalSlide(index);
    }
    onSlideChange?.(index);

    // Only pause autoplay if we are in internal mode and autoplay was initially on
    if (autoPlay && manualSlide === undefined) {
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % allBanners.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentSlide - 1 + allBanners.length) % allBanners.length;
    goToSlide(prev);
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
                alt={banner.title || 'Banner'}
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
                      {banner.buttons.slice(0, 2).map((btnProps: any, i: number) => {
                        const { url, className: btnClassName, style: btnStyle, ...otherProps } = btnProps;

                        // Smart Hex Extraction Logic
                        const hexStyles: React.CSSProperties = {};
                        const filteredClasses = (btnClassName || "").split(" ").filter((cls: string) => {
                          const bgMatch = cls.match(/^bg-\[#([A-Fa-f0-9]+)\]$/);
                          if (bgMatch) {
                            hexStyles.backgroundColor = `#${bgMatch[1]}`;
                            return false;
                          }
                          const textMatch = cls.match(/^text-\[#([A-Fa-f0-9]+)\]$/);
                          if (textMatch) {
                            hexStyles.color = `#${textMatch[1]}`;
                            return false;
                          }
                          const borderMatch = cls.match(/^border-\[#([A-Fa-f0-9]+)\]$/);
                          if (borderMatch) {
                            hexStyles.borderColor = `#${borderMatch[1]}`;
                            return false;
                          }
                          return true;
                        });

                        const finalStyle = { ...hexStyles, ...btnStyle };
                        const finalClassName = `text-xs sm:text-sm ${filteredClasses.join(" ")}`;

                        const handleClick = url
                          ? () => {
                            // Validate URL before opening
                            if (!url || url === '#' || url === 'https://' || url === 'http://') {
                              return; // Don't open invalid URLs
                            }

                            // Ensure URL is absolute
                            let absoluteUrl = url;
                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                              absoluteUrl = `https://${url}`;
                            }

                            window.open(absoluteUrl, '_blank');
                          }
                          : otherProps.onClick;

                        return (
                          <Button
                            key={i}
                            {...otherProps}
                            onClick={handleClick}
                            style={finalStyle}
                            variant={otherProps.variant as ButtonVariant}
                            className={finalClassName}
                          >
                            {otherProps.children}
                          </Button>
                        );
                      })}
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