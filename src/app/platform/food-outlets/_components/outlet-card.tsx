"use client";

import { MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FoodOutlet } from "../types";

interface OutletCardProps {
    outlet: FoodOutlet;
    isSelected: boolean;
    onSelect: () => void;
}

export default function OutletCard({ outlet, isSelected, onSelect }: OutletCardProps) {
    // Calculate average rating across all items
    const avgRating = outlet.items.reduce((acc, item) => acc + (item.rating || 0), 0) / outlet.items.length;
    const itemCount = outlet.items.length;

    // Get most popular categories
    const categories = [...new Set(outlet.items.map(i => i.category))].slice(0, 3);

    return (
        <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 ${isSelected ? 'ring-2 ring-primary border-primary shadow-lg' : ''
                } ${!outlet.isOpen ? 'opacity-75' : ''}`}
            onClick={onSelect}
        >
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{outlet.name}</h3>
                            <Badge
                                variant={outlet.isOpen ? "default" : "secondary"}
                                className={`text-xs shrink-0 ${outlet.isOpen ? 'bg-green/90 hover:bg-green' : ''}`}
                            >
                                {outlet.isOpen ? "Open" : "Closed"}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{outlet.location}</span>
                        </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''
                        }`} />
                </div>

                {/* Rating & Time */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                    <span className="flex items-center gap-1 text-secondary-dark">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{avgRating.toFixed(1)}</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {outlet.openingHours}
                    </span>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {categories.map(cat => (
                        <Badge key={cat} variant="outline" className="text-xs font-normal">
                            {cat}
                        </Badge>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="font-medium">{outlet.cuisine}</span>
                    <span>{itemCount} items</span>
                </div>
            </CardContent>
        </Card>
    );
}
