"use client";

import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
} from "lucide-react";
import type { Organisation } from "../data/organisations";

interface OrganisationDialogProps {
  organisation: Organisation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const socialIcons = {
  email: Mail,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  website: Globe,
};

export function OrganisationDialog({
  organisation,
  open,
  onOpenChange,
}: OrganisationDialogProps) {
  if (!organisation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Banner and Logo */}
          <div className="relative">
            <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
              {organisation.banner ? (
                <Image
                  src={organisation.banner || "/placeholder.svg"}
                  alt={`${organisation.name} banner`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
              )}
            </div>

            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <div className="w-30 h-30 rounded-full bg-background border-4 border-background shadow-lg overflow-hidden">
                {organisation.logo ? (
                  <Image
                    src={organisation.logo || "/placeholder.svg"}
                    alt={`${organisation.name} logo`}
                    width={120}
                    height={120}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {organisation.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title and Tags */}
          <div className="pt-8 space-y-4">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold">{organisation.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {organisation.category}
                </Badge>
                {organisation.inductionsOpen && (
                  <Badge className="bg-green hover:bg-green-dark">
                    Inductions Open
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* People Involved */}
            <div>
              <h3 className="font-semibold mb-2">People Involved</h3>
              <div className="flex justify-center flex-wrap gap-2">
                {organisation.people.map((person, index) => (
                  <Badge key={index} variant="secondary">
                    {person}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Inductions Deadline */}
            {organisation.inductionsOpen && organisation.inductionsDeadline && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200 text-center">
                  Inductions Deadline: {organisation.inductionsDeadline}
                </p>
              </div>
            )}

            {/* Social Media */}
            <div>
              <h3 className="font-semibold mb-3">Connect With Us</h3>
              <div className="flex flex-wrap justify-around gap-2">
                {Object.entries(organisation.socialMedia).map(
                  ([platform, url]) => {
                    const Icon =
                      socialIcons[platform as keyof typeof socialIcons];
                    if (!Icon || !url) return null;

                    return (
                      <Button
                        key={platform}
                        variant="animated"
                        size="sm"
                        asChild
                        className="flex items-center gap-2"
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Icon className="h-4 w-4" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      </Button>
                    );
                  }
                )}
              </div>
            </div>

            <Separator />

            {/* Full Description */}
            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <div
                className="prose prose-sm max-w-none dark:prose-invert text-justify"
                dangerouslySetInnerHTML={{
                  __html: organisation.fullDescription,
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
