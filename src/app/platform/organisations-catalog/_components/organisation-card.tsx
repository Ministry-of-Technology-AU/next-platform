'use client';

import * as React from 'react';
import Image from 'next/image';
import { Bell, Users, Crown, Globe, Instagram, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Organization } from '../types';
import { cn } from '@/lib/utils';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const getBadgeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    const colors: Record<string, string> = {
      club: 'bg-amber-200 text-amber-900',
      society: 'bg-amber-700 text-white',
      ministry: 'bg-amber-300 text-amber-900',
      department: 'bg-amber-100 text-amber-800',
      fest: 'bg-orange-200 text-orange-900',
      collective: 'bg-yellow-200 text-yellow-900',
      iso: 'bg-amber-400 text-amber-900',
      league: 'bg-amber-500 text-white',
    };
    return colors[normalizedType] || 'bg-gray-200 text-gray-900';
  };

  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  const hasValidSocialLinks = () => {
    return organization.instagram || organization.twitter || organization.linkedin || 
           organization.youtube || organization.website;
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'NA';
    }
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Use profile_url if available, fallback to imageUrl, then to placeholder
  const displayImageUrl = organization.profile_url || organization.imageUrl || 
    `https://api.dicebear.com/7.x/initials/svg?seed=${organization.title}&backgroundColor=f59e0b&textColor=ffffff`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all duration-200 group">
          {/* Circular Image */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              <Image
                src={displayImageUrl}
                alt={organization.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized={displayImageUrl.includes('dicebear.com')}
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
              {organization.title}
            </h3>
            
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
              {stripHtmlTags(organization.description)}
            </p>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                size="sm" 
                className="w-full text-xs bg-red-900 hover:bg-red-800"
                onClick={(e) => e.stopPropagation()}
              >
                Track Inductions
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs border-gray-300 hover:bg-gray-50"
                onClick={(e) => e.stopPropagation()}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-6">
            {/* Left - Icon */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                <Image
                  src={displayImageUrl}
                  alt={organization.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized={displayImageUrl.includes('dicebear.com')}
                />
              </div>
            </div>

            {/* Right - Quick Details */}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {organization.title}
              </DialogTitle>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge className={cn('text-sm', getBadgeColor(organization.type))}>
                  {organization.type}
                </Badge>
                {organization.inductionsOpen && (
                  <Badge className="bg-green-100 text-green-800 text-sm">
                    Inductions Open
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Members:</span>
                  <p className="text-gray-900">
                    {(organization.circle1_humans?.length || 0) + (organization.circle2_humans?.length || 0)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Type:</span>
                  <p className="text-gray-900">{organization.type}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button className="bg-red-900 hover:bg-red-800">
                  <Bell className="w-4 h-4 mr-2" />
                  Track Inductions
                </Button>
                {hasValidSocialLinks() && (
                  <Button variant="outline">
                    View Social Links
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Description */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-3">About</h3>
          <p className="text-gray-700 leading-relaxed">
            {stripHtmlTags(organization.fullDescription || organization.description)}
          </p>
        </div>

        {/* Accordion Sections */}
        <div className="mt-6">
          <Accordion type="multiple" className="w-full">
            {/* Core Team */}
            {organization.circle2_humans && organization.circle2_humans.length > 0 && (
              <AccordionItem value="core-team">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    Core Team ({organization.circle2_humans.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organization.circle2_humans.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.username || 'user'}`} />
                          <AvatarFallback className="bg-amber-100 text-amber-800">
                            {getInitials(member.username || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.username || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {member.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Members */}
            {organization.circle1_humans && organization.circle1_humans.length > 0 && (
              <AccordionItem value="members">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Members ({organization.circle1_humans.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {organization.circle1_humans.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.username || 'user'}`} />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(member.username || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.username || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {member.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Induction Information */}
            <AccordionItem value="inductions">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  Induction Information
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {organization.inductionsOpen ? (
                      <Badge className="bg-green-100 text-green-800">Open</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Closed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {organization.inductionsOpen 
                      ? "This organization is currently accepting new members. Click 'Track Inductions' to get notified about updates."
                      : "Inductions are currently closed. Track this organization to get notified when they open."}
                  </p>
                  <Button className="bg-red-900 hover:bg-red-800">
                    <Bell className="w-4 h-4 mr-2" />
                    {organization.inductionsOpen ? 'Apply Now' : 'Get Notified'}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Social Links */}
            {hasValidSocialLinks() && (
              <AccordionItem value="social">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    Social Links
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-3">
                    {organization.instagram && (
                      <a 
                        href={organization.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        <Instagram className="h-4 w-4" />
                        <span className="text-sm font-medium">Instagram</span>
                      </a>
                    )}
                    {organization.linkedin && (
                      <a 
                        href={organization.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </a>
                    )}
                    {organization.twitter && (
                      <a 
                        href={organization.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span className="text-sm font-medium">Twitter</span>
                      </a>
                    )}
                    {organization.youtube && (
                      <a 
                        href={organization.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span className="text-sm font-medium">YouTube</span>
                      </a>
                    )}
                    {organization.website && (
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-sm font-medium">Website</span>
                      </a>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
