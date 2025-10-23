'use client';

import * as React from 'react';
import { ArrowUpRight, Megaphone } from 'lucide-react';
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
            className="h-64 w-full object-cover"
          />

          {organization.inductionsOpen && (
            <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-900 shadow-md">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
          )}

          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-900 shadow-md transition-transform group-hover:scale-110">
            <ArrowUpRight className="h-4 w-4 text-white" />
          </div>

          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-80'
            )}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="mb-2 flex items-start justify-between gap-2">
              <MorphingDialogTitle className="text-lg font-semibold leading-tight">
                {organization.title}
              </MorphingDialogTitle>
            </div>

            <Badge className={cn('mb-2 text-xs', getBadgeColor(organization.type))}>
              {organization.type}
            </Badge>

            <MorphingDialogSubtitle
              className={cn(
                'text-sm leading-relaxed text-white/90 transition-all duration-300',
                isHovered ? 'line-clamp-3' : 'line-clamp-2'
              )}
            >
              {truncateDescription(organization.description, isHovered ? 120 : 80)}
            </MorphingDialogSubtitle>

            {isHovered && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                <span className="rounded-full bg-white/20 px-2 py-1">
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
              className="h-80 w-full object-cover"
            />
            {organization.inductionsOpen && (
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-red-900 px-4 py-2 shadow-lg">
                <Megaphone className="h-5 w-5 text-white" />
                <span className="text-sm font-semibold text-white">
                  Inductions Open
                </span>
              </div>
            )}
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
