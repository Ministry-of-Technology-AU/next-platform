'use client';

import * as React from 'react';
import { Megaphone, Smartphone, Globe, Instagram, Twitter, Linkedin, Youtube, ChevronDown, X, Bell, BellRing, Loader2 } from 'lucide-react';
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
import {
  ButtonGroup,
} from '@/components/ui/button-group';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { CopyButton } from '@/components/ui/shadcn-io/copy-button';
import { Organization } from '../types';
import { cn } from '@/lib/utils';
import { useCategoryColors } from './category-colors-context';
import { Disclosure, DisclosureTrigger, DisclosureContent } from '@/components/ui/disclosure';
interface OrganizationCardProps {
  organization: Organization;
  isTracking?: boolean;
  trackLoading?: boolean;
  onTrack?: (orgId: string) => void;
  onUntrack?: (orgId: string) => void;
}

const sanitizeHtml = (html: string) => {
  if (!html) return '';
  return html
    .replace(/style\s*=\s*(['"])(.*?)\1/gi, (match, quote, styleContent) => {
      const cleanStyles = styleContent
        .split(';')
        .map((s: string) => s.trim())
        .filter((s: string) => {
          const lower = s.toLowerCase();
          return (
            !lower.startsWith('font-family') &&
            !lower.startsWith('color') &&
            !lower.startsWith('background-color') &&
            !lower.includes('font-family') &&
            !lower.includes('color')
          );
        })
        .join('; ');
      return cleanStyles ? `style=${quote}${cleanStyles}${quote}` : '';
    })
    .replace(/\s*(color|face|bgcolor)\s*=\s*(['"])(.*?)\2/gi, '')
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '');
};

const RichTextRenderer: React.FC<{ html: string }> = ({ html }) => {
  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none text-black dark:text-white font-nunito"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};

const truncateEmail = (email: string, maxLength: number = 30) => {
  if (email.length <= maxLength) return email;
  const [localPart, domain] = email.split('@');
  if (localPart.length > maxLength - 3) {
    return `${localPart.slice(0, maxLength - 3)}...@${domain}`;
  }
  return email;
};

interface MemberTagProps {
  username: string;
  email: string;
}

const MemberTag: React.FC<MemberTagProps> = ({ username, email }) => {
  const handleCopyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-light/70 hover:bg-neutral-200 dark:hover:bg-gray-dark/60 rounded-full text-xs font-medium text-black dark:text-white cursor-default transition-colors">
          {username}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-800 text-white"
        sideOffset={5}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <span className="text-xs">{truncateEmail(email)}</span>
        <div onClick={handleCopyClick} onPointerDown={handleCopyClick}>
          <CopyButton 
            content={email} 
            variant="ghost" 
            size="sm"
            className="hover:bg-neutral-800 dark:hover:bg-neutral-700"
          />
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export function OrganizationCard({ organization, isTracking = false, trackLoading = false, onTrack, onUntrack }: OrganizationCardProps) {
  const { categoryColors } = useCategoryColors();
  const [isHovered, setIsHovered] = React.useState(false);
  const [bannerSrc, setBannerSrc] = React.useState(organization.bannerUrl);
  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    setBannerSrc(organization.bannerUrl);
    setLogoError(false);
  }, [organization.bannerUrl, organization.logoUrl]);

  const handleTrackToggle = React.useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (trackLoading) return;
    if (isTracking) {
      onUntrack?.(organization.id);
    } else {
      onTrack?.(organization.id);
    }
  }, [isTracking, trackLoading, onTrack, onUntrack, organization.id]);

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Get color based on organization type
  const getCategoryColor = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType === 'club') return categoryColors.clubs;
    if (lowerType === 'society') return categoryColors.societies;
    if (lowerType === 'ministry') return categoryColors.ministries;
    if (lowerType === 'iso' || lowerType === 'league') return categoryColors.departments;
    return categoryColors.others;
  };

  const getBadgeColor = (type: string) => {
    const color = getCategoryColor(type);
    return `text-white hover:opacity-90`;
  };

  const getBadgeStyle = (type: string) => {
    return {
      backgroundColor: getCategoryColor(type),
    };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getLogoUrl = (): string => {
    // If there's a profile image, use it; otherwise use initial
    if (organization.logoUrl) {
      return organization.logoUrl;
    }
    // Return empty string to show initial
    return '';
  };

  const LogoCircle: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'small' }) => {
    const sizeClasses = size === 'small' 
      ? 'h-16 w-16 sm:h-20 sm:w-20 text-lg sm:text-xl' 
      : 'h-24 w-24 sm:h-28 sm:w-28 text-2xl sm:text-3xl';
    
    const logoUrl = getLogoUrl();

    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-red-900 shadow-lg sm:shadow-xl text-white font-bold overflow-hidden',
        sizeClasses
      )}>
        {logoUrl && !logoError ? (
          <img 
            src={logoUrl} 
            alt={organization.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setLogoError(true)}
          />
        ) : (
          organization.name.charAt(0).toUpperCase()
        )}
      </div>
    );
  };

  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <div className="group relative">
        <MorphingDialogTrigger
          className="relative flex flex-col overflow-hidden border-2 bg-white shadow-sm transition-all duration-300 hover:shadow-lg w-full h-full text-left"
          style={{ borderRadius: '24px' }}
        >
          <div
            className="relative w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
          <MorphingDialogImage
            src={bannerSrc}
            alt={organization.name}
            className="h-80 sm:h-96 lg:h-[420px] w-full object-cover block"
            onError={() => setBannerSrc('/orgs_catalogue_default.png')}
          />

          {/* Logo Circle */}
          <div className="absolute left-1/2 top-16 sm:top-20 lg:top-24 flex -translate-x-1/2 z-10">
            <LogoCircle size="small" />
          </div>



          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-85'
            )}
          />

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <div className="flex justify-start">
              <Badge 
                className={cn('mb-3 text-xs sm:text-sm', getBadgeColor(organization.type))}
                style={getBadgeStyle(organization.type)}
              >
              {organization.type.charAt(0).toUpperCase() + organization.type.slice(1)}
              </Badge>
            </div>
            <div className="mb-3 flex items-start justify-between gap-2">
              <MorphingDialogTitle className="text-lg sm:text-xl font-semibold leading-tight">
              {organization.name}
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

        {/* Tracking button absolutely positioned over the card, outside the Trigger */}
        {organization.inductionsOpen && (
          <button
            onClick={handleTrackToggle}
            disabled={trackLoading}
            className={`absolute left-4 top-4 z-20 flex items-center justify-center rounded-full shadow-md cursor-pointer transition-all ${
              isTracking
                ? 'h-10 w-10 bg-amber-500 hover:bg-amber-600'
                : 'h-10 w-10 bg-red-900 hover:bg-red-800'
            } ${trackLoading ? 'opacity-80 cursor-wait' : ''}`}
            title={isTracking ? 'Stop tracking inductions' : 'Track inductions'}
            aria-label={isTracking ? 'Stop tracking inductions' : 'Track inductions'}
          >
            {trackLoading ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : isTracking ? (
              <BellRing className="h-5 w-5 text-white" />
            ) : (
              <Megaphone className="h-5 w-5 text-white" />
            )}
          </button>
        )}
      </div>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: '24px',
          }}
          className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 shadow-xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[80vw] xl:w-[80vw] sm:max-h-[90vh]"
        >
          {/* Scrollable Content Container */}
          <div className="overflow-y-auto">
            <div className="sticky top-0 z-10 relative">
              <MorphingDialogImage
                src={bannerSrc}
                alt={organization.name}
                className="h-72 sm:h-80 md:h-96 w-full object-cover block"
                onError={() => setBannerSrc('/orgs_catalogue_default.png')}
              />
              
              {/* Dark Overlay (dimmed) */}
              <div className="absolute inset-0 bg-black/80" />
              
              {/* Top-right close button */}
              <MorphingDialogClose className="text-white z-30 top-4 right-4 hover:opacity-80">
                <X className="h-6 w-6" />
              </MorphingDialogClose>

              <div className="absolute left-6 top-6 z-30 flex items-center gap-3">
                {organization.inductionsOpen && (
                  <div className="flex items-center gap-2 rounded-full bg-red-900 px-4 py-2 shadow-lg">
                    <Megaphone className="h-5 w-5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {`Inductions Open${organization.inductionEnd ? ' | Deadline: ' +  formatDate(organization.inductionEnd) : ''}`}
                    </span>
                  </div>
                )}
                {organization.inductionsOpen && (
                  <button
                    onClick={handleTrackToggle}
                    disabled={trackLoading}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-lg transition-all ${
                      isTracking 
                        ? 'bg-amber-500 hover:bg-amber-600' 
                        : 'bg-red-900/90 hover:bg-red-900'
                    } ${trackLoading ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    {trackLoading ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : isTracking ? (
                      <BellRing className="h-5 w-5 text-white" />
                    ) : (
                      <Bell className="h-5 w-5 text-white" />
                    )}
                    <span className="text-sm font-semibold text-white">
                      {trackLoading ? 'Updating...' : isTracking ? 'Tracking' : 'Track Inductions'}
                    </span>
                  </button>
                )}
              </div>

              {/* Banner content split into 30/70 columns with vertical divider */}
              <div className="absolute inset-0 z-20">
                <div className="flex h-full w-full items-center p-6 sm:p-8">
                  <div className="w-full grid grid-cols-1 md:grid-cols-10 gap-6 items-center">
                    {/* Left: Logo ~30% */}
                    <div className="md:col-span-3 flex justify-center">
                      <LogoCircle size="large" />
                    </div>
                    {/* Divider */}
                    <div className="hidden md:block md:col-span-1">
                      <div className="h-24 w-px bg-white/30 mx-auto" />
                    </div>
                    {/* Right: Placeholder content ~70% */}
                    <div className="md:col-span-6 text-white text-left">
                      <div className="space-y-2">
                                      <div className="flex flex-wrap items-start gap-3 mb-3">
                <MorphingDialogTitle className="text-3xl font-bold text-white font-nunito dark:text-white">
                  {organization.name}
                </MorphingDialogTitle>
                <Badge 
                  className={cn('text-sm h-fit mt-1', getBadgeColor(organization.type))}
                  style={getBadgeStyle(organization.type)}
                >
                  {organization.type.charAt(0).toUpperCase() + organization.type.slice(1)}
                </Badge>

                {/* Social Links */}
        
                    <div>
                      <ButtonGroup orientation="horizontal" className="w-full flex-wrap">
                        {organization.instagram && (
                          <button
                            onClick={() => {
                              window.open(
                                organization.instagram.startsWith('http') 
                                  ? organization.instagram 
                                  : `https://instagram.com/${organization.instagram}`,
                                '_blank'
                              );
                            }}
                            className="flex bg-background/80 text-black dark:text-white hover:text-white hover:bg-primary-extralight items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                            title="Instagram"
                          >
                            <Instagram className="h-4 w-4" />
                            <span className="hidden sm:inline">Instagram</span>
                          </button>
                        )}
                        {organization.twitter ? (
                          <button
                            onClick={() => {
                              window.open(
                                organization.twitter.startsWith('http') 
                                  ? organization.twitter 
                                  : `https://twitter.com/${organization.twitter}`,
                                '_blank'
                              );
                            }}
                            className="flex bg-background/80 text-black dark:text-white hover:text-white hover:bg-blue-light items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                            title="Twitter"
                          >
                            <Twitter className="h-4 w-4" />
                            <span className="hidden sm:inline">Twitter</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed"
                            title="Twitter not available"
                          >
                            <Twitter className="h-4 w-4" />
                            <span className="hidden sm:inline">Twitter</span>
                          </button>
                        )}
                        {organization.linkedin ? (
                          <button
                            onClick={() => {
                              window.open(
                                organization.linkedin.startsWith('http') 
                                  ? organization.linkedin 
                                  : `https://linkedin.com/in/${organization.linkedin}`,
                                '_blank'
                              );
                            }}
                            className="flex bg-background/80 text-black dark:text-white hover:text-white hover:bg-blue-dark items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                            title="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span className="hidden sm:inline">LinkedIn</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed"
                            title="LinkedIn not available"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span className="hidden sm:inline">LinkedIn</span>
                          </button>
                        )}
                        {organization.youtube ? (
                          <button
                            onClick={() => {
                              window.open(
                                organization.youtube.startsWith('http') 
                                  ? organization.youtube 
                                  : `https://youtube.com/${organization.youtube}`,
                                '_blank'
                              );
                            }}
                            className="flex bg-background/80 text-black dark:text-white hover:text-white hover:bg-primary-bright items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                            title="YouTube"
                          >
                            <Youtube className="h-4 w-4" />
                            <span className="hidden sm:inline">YouTube</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed"
                            title="YouTube not available"
                          >
                            <Youtube className="h-4 w-4" />
                            <span className="hidden sm:inline">YouTube</span>
                          </button>
                        )}
                        {organization.website ? (
                          <button
                            onClick={() => {
                              window.open(
                                organization.website.startsWith('http') 
                                  ? organization.website 
                                  : `https://${organization.website}`,
                                '_blank'
                              );
                            }}
                            className="flex bg-background/80 text-black dark:text-white hover:text-white hover:bg-secondary-extradark items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                            title="Website"
                          >
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">Website</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed"
                            title="Website not available"
                          >
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">Website</span>
                          </button>
                        )}
                        {organization.whatsapp ? (
                          <button
                            onClick={() => {
                              window.open(
                                `https://wa.me/${organization.whatsapp.replace(/\D/g, '')}`,
                                '_blank'
                              );
                            }}
                            className="flex bg-background/80 text-black dark:text-white hover:text-white hover:bg-green items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                            title="WhatsApp"
                          >
                            <Smartphone className="h-4 w-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed"
                            title="WhatsApp not available"
                          >
                            <Smartphone className="h-4 w-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                        )}
                      </ButtonGroup>
                    </div>
                  

                  
              </div>

              {/**People section */}
                                {organization.circle1_humans && organization.circle1_humans.length > 0 && (
                    <div className="text-left">
                      <h6 className="mb-3 text-lg font-semibold text-left !text-left">
                        People
                      </h6>
                      <div className="flex flex-wrap gap-1.5">
                        {organization.circle1_humans.map((member, index) => (
                          <MemberTag 
                            key={index}
                            username={member.username}
                            email={member.email}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                                        {/* Induction Information moved to top-right in a Disclosure */}
                  {organization.inductionsOpen && (<Disclosure className="mx-6 mt-6 rounded-lg bg-gray-light/70 dark:bg-gray-dark/60 border border-neutral-200 dark:border-neutral-700">
                    <DisclosureTrigger className="w-full">
                      <div className="flex items-center justify-between w-full p-4 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                        <h4 className="text-lg font-bold">
                          Induction Information
                        </h4>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </DisclosureTrigger>
                    <DisclosureContent>
                      <div className="p-4 rounded-lg">
                        <h4 className="mb-2 text-base font-semibold text-amber-900 dark:text-amber-100">
                          {`Inductions Open${organization.inductionEnd ? ' | ' + formatDate(organization.inductionEnd) : ''}`}
                        </h4>
                        {organization.inductionDescription ? (
                          <RichTextRenderer html={organization.inductionDescription} />
                        ) : (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            No induction details provided.
                          </p>
                        )}
                      </div>
                    </DisclosureContent>
                  </Disclosure>)}

            <div className="p-6">



              {/* <MorphingDialogSubtitle className="text-sm text-neutral-600 dark:text-neutral-400">
                {organization.description}
              </MorphingDialogSubtitle> */}

              <MorphingDialogDescription
                disableLayoutAnimation
                variants={{
                  initial: { opacity: 0, scale: 0.8, y: 100 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.8, y: 100 },
                }}
              >
                <div className="">
                  {/* About Section */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                      About
                    </h3>
                    <div className="leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {organization.fullDescription || organization.description ? (
                        <RichTextRenderer html={organization.fullDescription || organization.description} />
                      ) : null}
                    </div>
                  </div>

                  {/* Members Section */}

                  {organization.circle2_humans && organization.circle2_humans.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
                        Circle 2 (Coordinators)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {organization.circle2_humans.map((member, index) => (
                          <MemberTag 
                            key={index}
                            username={member.username}
                            email={member.email}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  
                </div>
              </MorphingDialogDescription>
            </div>
          </div>
          {/* Bottom close removed in favor of top-right close */}
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
