"use client";

import { MapPin, Phone, Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FoodOutlet } from "../types";

interface OutletCardProps {
    outlet: FoodOutlet;
    onClick: () => void;
}

export default function OutletCard({ outlet, onClick }: OutletCardProps) {
    const itemCount = outlet.items.length;

    return (
        <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98] ${!outlet.isOpen ? 'opacity-70' : ''
                }`}
            onClick={onClick}
        >
            <CardContent className="p-4">
                {/* Header with Logo and Status */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Logo placeholder */}
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                        {outlet.logoUrl ? (
                            <img src={outlet.logoUrl} alt={outlet.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {outlet.name.charAt(0)}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{outlet.name}</h3>
                            <Badge
                                variant={outlet.isOpen ? "default" : "secondary"}
                                className={`text-xs shrink-0 ${outlet.isOpen ? 'bg-green/90 hover:bg-green' : ''}`}
                            >
                                {outlet.isOpen ? "Open" : "Closed"}
                            </Badge>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-secondary-dark text-secondary-dark" />
                            <span className="font-medium">{outlet.rating}</span>
                            <span className="text-muted-foreground text-xs">({outlet.ratingCount})</span>
                        </div>
                    </div>
                </div>

                {/* Top Rated Items */}
                <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Top Items</p>
                    <div className="flex flex-wrap gap-1">
                        {outlet.items.slice(0, 3).map(item => (
                            <Badge key={item.id} variant="outline" className="text-xs font-normal">
                                {item.name}
                                <span className="ml-1 text-muted-foreground">₹{item.price}</span>
                            </Badge>
                        ))}
                        {outlet.items.length > 3 && (
                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                +{outlet.items.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{outlet.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{outlet.contactNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{outlet.openingHours}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
