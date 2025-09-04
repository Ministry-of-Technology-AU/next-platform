"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Organisation } from "../data/organisations";

interface OrganisationCardProps {
  organisation: Organisation;
  onClick: () => void;
}

export function OrganisationCard({
  organisation,
  onClick,
}: OrganisationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group w-full cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative">
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20">
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

          {/* Logo */}
          <div className="absolute -bottom-6 mx-auto left-0 right-0 flex items-center justify-center">
            <div className="w-18 h-18 rounded-full bg-background border-2 border-background shadow-sm overflow-hidden">
              {organisation.logo ? (
                <Image
                  src={organisation.logo || "/placeholder.svg"}
                  alt={`${organisation.name} logo`}
                  width={100}
                  height={100}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {organisation.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Inductions Open Badge */}
          {organisation.inductionsOpen && (
            <Badge className="absolute top-2 right-2 bg-green-light">
              Inductions Open
            </Badge>
          )}
        </div>

        <CardContent className="pt-8 pb-4">
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-1 wrap">
              <h3 className="font-semibold text-lg line-clamp-1">
                {organisation.name}
              </h3>
              <Badge
                variant="default"
                className="mt-1 capitalize text-white max-w-fit"
              >
                {organisation.category}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {organisation.description}
            </p>
          </div>
        </CardContent>

        {/* Hover Overlay */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            bg-black/60
            transition-opacity duration-400
            ${isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
        >
          <Button variant="animatedGhost" size="sm" className="text-white font-bold text-lg">
            Read More
          </Button>
        </div>
      </div>
    </Card>
  );
}
