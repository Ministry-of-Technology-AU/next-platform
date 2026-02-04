"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Clock, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FoodOutlet, FoodItem } from "./types";
import OutletCard from "./_components/outlet-card";
import FoodItemTable from "./_components/food-item-table";
import CalorieReportDialog from "./_components/calorie-report-dialog";
import RatingDialog from "./_components/rating-dialog";

interface FoodOutletsClientProps {
    outlets: FoodOutlet[];
}

export default function FoodOutletsClient({ outlets }: FoodOutletsClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [cuisineFilter, setCuisineFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOutlet, setSelectedOutlet] = useState<FoodOutlet | null>(null);

    // Dialog states
    const [calorieDialogOpen, setCalorieDialogOpen] = useState(false);
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

    // Get unique cuisines for filter
    const availableCuisines = useMemo(() => {
        const cuisines = [...new Set(outlets.map(o => o.cuisine))];
        return cuisines.sort();
    }, [outlets]);

    // Filter outlets
    const filteredOutlets = useMemo(() => {
        return outlets.filter(outlet => {
            const matchesSearch =
                outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                outlet.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                outlet.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCuisine = cuisineFilter === "all" || outlet.cuisine === cuisineFilter;
            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "open" && outlet.isOpen) ||
                (statusFilter === "closed" && !outlet.isOpen);

            return matchesSearch && matchesCuisine && matchesStatus;
        });
    }, [outlets, searchTerm, cuisineFilter, statusFilter]);

    const handleReportCalories = (item: FoodItem) => {
        setSelectedItem(item);
        setCalorieDialogOpen(true);
    };

    const handleRateItem = (item: FoodItem) => {
        setSelectedItem(item);
        setRatingDialogOpen(true);
    };

    const handleCalorieSubmit = (calories: number) => {
        console.log("Calorie report submitted:", { item: selectedItem, calories });
        // Backend integration will go here
        setCalorieDialogOpen(false);
        setSelectedItem(null);
    };

    const handleRatingSubmit = (rating: number, review: string) => {
        console.log("Rating submitted:", { item: selectedItem, rating, review });
        // Backend integration will go here
        setRatingDialogOpen(false);
        setSelectedItem(null);
    };

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search outlets or food items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Cuisines" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cuisines</SelectItem>
                        {availableCuisines.map(cuisine => (
                            <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open Now</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results summary */}
            <div className="mb-4 text-sm text-muted-foreground">
                {filteredOutlets.length} outlet{filteredOutlets.length !== 1 ? 's' : ''} found
                {searchTerm && ` matching "${searchTerm}"`}
            </div>

            {/* Outlets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredOutlets.map(outlet => (
                    <OutletCard
                        key={outlet.id}
                        outlet={outlet}
                        isSelected={selectedOutlet?.id === outlet.id}
                        onSelect={() => setSelectedOutlet(selectedOutlet?.id === outlet.id ? null : outlet)}
                    />
                ))}
            </div>

            {/* Empty state */}
            {filteredOutlets.length === 0 && (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No outlets found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Selected Outlet Detail */}
            {selectedOutlet && (
                <div className="bg-card rounded-lg border border-border p-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold">{selectedOutlet.name}</h2>
                                <Badge variant={selectedOutlet.isOpen ? "default" : "secondary"}>
                                    {selectedOutlet.isOpen ? "Open" : "Closed"}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {selectedOutlet.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {selectedOutlet.openingHours}
                                </span>
                            </div>
                        </div>
                        <Badge variant="outline" className="self-start">
                            {selectedOutlet.cuisine}
                        </Badge>
                    </div>

                    <p className="text-muted-foreground mb-6">{selectedOutlet.description}</p>

                    <FoodItemTable
                        items={selectedOutlet.items}
                        onReportCalories={handleReportCalories}
                        onRateItem={handleRateItem}
                    />
                </div>
            )}

            {/* Dialogs */}
            <CalorieReportDialog
                open={calorieDialogOpen}
                onOpenChange={setCalorieDialogOpen}
                item={selectedItem}
                onSubmit={handleCalorieSubmit}
            />

            <RatingDialog
                open={ratingDialogOpen}
                onOpenChange={setRatingDialogOpen}
                item={selectedItem}
                onSubmit={handleRatingSubmit}
            />
        </>
    );
}
