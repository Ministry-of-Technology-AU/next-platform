'use client';

import * as React from 'react';
import { Megaphone, Bell, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogImage,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from '@/components/ui/morphing-dialog';
import { Organization } from '../types';
import { cn } from '@/lib/utils';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTrackingInductions, setIsTrackingInductions] = React.useState(false);

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const getBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      Club: 'bg-amber-200 text-amber-900 hover:bg-amber-200',
      Society: 'bg-amber-700 text-white hover:bg-amber-700',
      Ministry: 'bg-amber-300 text-amber-900 hover:bg-amber-300',
      Department: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      Fest: 'bg-orange-200 text-orange-900 hover:bg-orange-200',
      Collective: 'bg-yellow-200 text-yellow-900 hover:bg-yellow-200',
      ISO: 'bg-amber-400 text-amber-900 hover:bg-amber-400',
      League: 'bg-amber-500 text-white hover:bg-amber-500',
    };
    return colors[type] || 'bg-gray-200 text-gray-900';
  };

  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <MorphingDialogTrigger
        style={{
          borderRadius: '24px',
        }}
        className="group relative flex flex-col overflow-hidden border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
      >
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <MorphingDialogImage
            src={organization.imageUrl}
            alt={organization.title}
            className="h-80 sm:h-96 lg:h-[420px] w-full object-cover"
          />

          {/* Logo Circle */}
          <div className="absolute left-1/2 top-16 sm:top-20 lg:top-24 flex h-16 w-16 sm:h-20 sm:w-20 -translate-x-1/2 items-center justify-center rounded-full bg-red-900 shadow-lg text-white font-bold text-lg sm:text-xl">
            {organization.title.charAt(0).toUpperCase()}
          </div>

          {organization.inductionsOpen && (
            <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-900 shadow-md">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsTrackingInductions(!isTrackingInductions);
            }}
            className={`absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-md transition-all ${
              isTrackingInductions 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : 'bg-red-900/80 hover:bg-red-900'
            }`}
            title={isTrackingInductions ? 'Stop tracking inductions' : 'Track inductions'}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setIsTrackingInductions(!isTrackingInductions);
              }
            }}
          >
            {isTrackingInductions ? (
              <BellRing className="h-4 w-4 text-white" />
            ) : (
              <Bell className="h-4 w-4 text-white" />
            )}
          </div>

          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-85'
            )}
          />

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <div className="flex justify-start">
              <Badge className={cn('mb-3 text-xs sm:text-sm', getBadgeColor(organization.type))}>
              {organization.type}
              </Badge>
            </div>
            <div className="mb-3 flex items-start justify-between gap-2">
              <MorphingDialogTitle className="text-lg sm:text-xl font-semibold leading-tight">
              {organization.title}
              </MorphingDialogTitle>
            </div>

            <MorphingDialogSubtitle
              className={cn(
              'text-sm sm:text-base text-left leading-relaxed text-white/90 transition-all duration-300',
              isHovered ? 'line-clamp-4' : 'line-clamp-3'
              )}
            >
              {truncateDescription(organization.description, isHovered ? 70 : 50)}
            </MorphingDialogSubtitle>

            {isHovered && (
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <span className="rounded-full bg-white/20 px-3 py-1.5">
                Click to read more
              </span>
              </div>
            )}
            </div>
        </div>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: '24px',
          }}
          className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-neutral-200 bg-white shadow-xl sm:w-[600px] sm:max-h-[90vh]"
        >
          <div className="relative">
            <MorphingDialogImage
              src={organization.imageUrl}
              alt={organization.title}
              className="h-80 sm:h-96 w-full object-cover"
            />
            
            {/* Logo Circle for Dialog */}
            <div className="absolute left-1/2 top-16 sm:top-20 flex h-20 w-20 sm:h-24 sm:w-24 -translate-x-1/2 items-center justify-center rounded-full bg-red-900 shadow-xl text-white font-bold text-xl sm:text-2xl">
              {organization.title.charAt(0).toUpperCase()}
            </div>

            <div className="absolute left-6 top-6 flex items-center gap-3">
              {organization.inductionsOpen && (
                <div className="flex items-center gap-2 rounded-full bg-red-900 px-4 py-2 shadow-lg">
                  <Megaphone className="h-5 w-5 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Inductions Open
                  </span>
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTrackingInductions(!isTrackingInductions);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-lg transition-all ${
                  isTrackingInductions 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-red-900/90 hover:bg-red-900'
                }`}
              >
                {isTrackingInductions ? (
                  <BellRing className="h-5 w-5 text-white" />
                ) : (
                  <Bell className="h-5 w-5 text-white" />
                )}
                <span className="text-sm font-semibold text-white">
                  {isTrackingInductions ? 'Tracking' : 'Track Inductions'}
                </span>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-6">
            <MorphingDialogTitle className="text-3xl font-bold text-neutral-900">
              {organization.title}
            </MorphingDialogTitle>

            <div className="mt-2 flex items-center gap-2">
              <Badge className={cn('text-sm', getBadgeColor(organization.type))}>
                {organization.type}
              </Badge>
            </div>

            <MorphingDialogSubtitle className="mt-2 text-sm text-neutral-600">
              {organization.categories.join(' • ')}
            </MorphingDialogSubtitle>

            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, scale: 0.8, y: 100 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: 100 },
              }}
            >
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    About
                  </h3>
                  <p className="leading-relaxed text-neutral-700">
                    {organization.fullDescription}
                  </p>
                </div>

                {organization.categories.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {organization.categories.map((category, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </MorphingDialogDescription>
          </div>

          <MorphingDialogClose className="text-neutral-900" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
