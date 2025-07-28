"use client";

import type React from "react";
import { useState } from "react";
import { Package, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AssetDialog from "./AssetDialog"; // Adjust the import path as needed
import DeveloperCredits from "@/components/developer-credits";

interface Asset {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  status: "Available" | "Overdue";
  overdueDate?: string;
}

interface FormData {
  returnDate: string;
  purpose: string;
  phoneNumber: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    title: "Canon EOS R5 Camera",
    description:
      "Professional mirrorless camera with 45MP sensor, perfect for photography projects and events",
    image: "/MoT logo.png",
    tags: ["Photography", "Equipment", "Professional"],
    status: "Available",
  },
  {
    id: "2",
    title: "MacBook Pro 16-inch",
    description:
      "High-performance laptop with M2 Pro chip, ideal for video editing and development work",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Computing", "Development", "Video Editing"],
    status: "Overdue",
    overdueDate: "2024-12-15",
  },
  {
    id: "3",
    title: "Projector - Epson EB-X41",
    description:
      "3600 lumens projector suitable for presentations and events in large venues",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Presentation", "Events", "Audio-Visual"],
    status: "Available",
  },
  {
    id: "4",
    title: "Audio Interface - Focusrite Scarlett",
    description:
      "Professional audio interface for recording and music production with multiple inputs",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Audio", "Recording", "Music"],
    status: "Available",
  },
  {
    id: "5",
    title: "Drone - DJI Mini 3 Pro",
    description:
      "Compact drone with 4K camera capabilities for aerial photography and videography",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Photography", "Videography", "Aerial"],
    status: "Overdue",
    overdueDate: "2024-12-20",
  },
  {
    id: "6",
    title: "Lighting Kit - Godox SL-60W",
    description:
      "Professional LED lighting setup for photography and video production",
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Lighting", "Photography", "Video"],
    status: "Available",
  },
];

export default function BorrowAssetsPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAssetRequest = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (formData: FormData, asset: Asset) => {
    // Handle form submission logic here
    console.log("Form submitted:", formData, asset);
    // You can add API calls, notifications, etc. here
  };

  const formatOverdueDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Borrow Assets
            </h1>
          </div>
          <p className="text-lg text-center text-muted-foreground max-w-6xl">
            Access professional equipment and resources for your academic and
            project needs. Browse available assets and submit requests with
            proper documentation.
          </p>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockAssets.map((asset) => (
            <Card
              key={asset.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={asset.image || "/placeholder.svg"}
                  alt={asset.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">
                    {asset.title}
                  </CardTitle>
                  <Badge
                    variant={
                      asset.status === "Available" ? "default" : "destructive"
                    }
                    className={
                      asset.status === "Available"
                        ? "shrink-0 bg-green-light hover:bg-green"
                        : "shrink-0 bg-primary-dark text-white hover:bg-primary"
                    }
                  >
                    {asset.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {asset.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-secondary-light/80 dark:bg-secondary/70 dark:text-black text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {asset.status === "Overdue" && asset.overdueDate && (
                  <div className="flex items-center gap-2 text-destructive text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    <span>
                      Overdue since {formatOverdueDate(asset.overdueDate)}
                    </span>
                  </div>
                )}

                {asset.status === "Available" && (
                  <Button
                    className="w-full"
                    onClick={() => handleAssetRequest(asset)}
                  >
                    Request Asset
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DeveloperCredits developers={[{name: "Soham Tulsyan", role: "Lead Developer", profileUrl: "www.linkedin.com/in/soham-tulsyan-0902482a7"}]}/>
      </div>

      {/* Asset Request Dialog */}
      <AssetDialog
        asset={selectedAsset}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
