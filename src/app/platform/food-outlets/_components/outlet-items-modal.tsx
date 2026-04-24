"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Phone, Clock, Star, X, Plus, Flame, Leaf, Egg } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodOutlet, FoodItem, FoodType } from "../types";
import CalorieReportDialog from "./calorie-report-dialog";
import { Rating, RatingButton } from "@/components/ui/star-rating";
import { toast } from "sonner";

interface OutletItemsModalProps {
    outlet: FoodOutlet | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allowedAllergens?: string[];
}

function FoodTypeIcon({ type }: { type: FoodType }) {
    switch (type) {
        case 'veg':
            return (
                <span className="inline-flex items-center justify-center w-4 h-4 border-2 border-green rounded-sm" title="Vegetarian">
                    <span className="w-1.5 h-1.5 rounded-full bg-green" />
                </span>
            );
        case 'non-veg':
            return (
                <span className="inline-flex items-center justify-center w-4 h-4 border-2 border-destructive rounded-sm" title="Non-Vegetarian">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                </span>
            );
        case 'egg':
            return (
                <span className="inline-flex items-center justify-center w-4 h-4 border-2 border-secondary-dark rounded-sm" title="Egg">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-dark" />
                </span>
            );
    }
}

export default function OutletItemsModal({ outlet, open, onOpenChange, allowedAllergens = [] }: OutletItemsModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [foodTypeFilter, setFoodTypeFilter] = useState<FoodType | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [calorieDialogOpen, setCalorieDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
    const [userRating, setUserRating] = useState<number>(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Get unique categories from this outlet's items
    const categories = useMemo(() => {
        if (!outlet) return ['All'];
        const cats = [...new Set(outlet.items.map(i => i.category))];
        return ['All', ...cats];
    }, [outlet]);

    // Filter items
    const filteredItems = useMemo(() => {
        if (!outlet) return [];
        const allowedValues = allowedAllergens.map(a => a.toLowerCase());

        return outlet.items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFoodType = foodTypeFilter === 'all' || item.foodType === foodTypeFilter;
            const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
            
            const itemAllergens = (item.allergens || "None").split(',').map(a => a.trim().toLowerCase()).filter(a => a !== 'none' && a !== '');
            // If allowedAllergens is passed, enforce that ALL of the item's allergens must be in the allowedValues list
            const matchesAllergens = !allowedAllergens.length || itemAllergens.length === 0 || itemAllergens.every(a => allowedValues.includes(a));

            return matchesSearch && matchesFoodType && matchesCategory && matchesAllergens;
        });
    }, [outlet, searchTerm, foodTypeFilter, categoryFilter, allowedAllergens]);

    const handleReportCalories = (item: FoodItem) => {
        setSelectedItem(item);
        setCalorieDialogOpen(true);
    };

    const handleCalorieSubmit = (calories: number) => {
        console.log("Calorie report:", { item: selectedItem, calories });
        setCalorieDialogOpen(false);
        setSelectedItem(null);
    };

    const handleAddToPlan = (item: FoodItem) => {
        // Stub for right panel integration
        console.log("Add to plan:", item);
    };

    const handleRatingChange = async (value: number) => {
        if (!outlet) return;
        setUserRating(value);
        setIsSubmittingRating(true);
        try {
            const response = await fetch('/api/platform/food-outlets/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: value, foodOutletId: outlet.documentId || outlet.id })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Review submitted!");
            } else {
                toast.error(result.error || "Failed to submit review");
            }
        } catch (error) {
            toast.error("Network error submitting review");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    if (!outlet) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-xl">
                    <DialogHeader className="shrink-0">
                        <div className="flex items-start gap-4">
                            {/* Logo */}
                            <div className="w-16 h-16 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                {outlet.logoUrl ? (
                                    <img src={outlet.logoUrl} alt={outlet.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <span className="text-2xl font-bold text-primary">
                                        {outlet.name.charAt(0)}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <DialogTitle className="text-xl">{outlet.name}</DialogTitle>
                                        <Badge variant={outlet.isOpen ? "default" : "secondary"} className={outlet.isOpen ? 'bg-green/90' : ''}>
                                            {outlet.isOpen ? "Open" : "Closed"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-full border border-border/50 sm:ml-auto mr-6 sm:mr-8 shrink-0 w-max">
                                        <Rating 
                                            value={userRating} 
                                            onValueChange={handleRatingChange} 
                                            className={isSubmittingRating ? "opacity-50 pointer-events-none" : ""}
                                        >
                                            <RatingButton size={14} className="text-muted-foreground hover:text-yellow-400" />
                                            <RatingButton size={14} className="text-muted-foreground hover:text-yellow-400" />
                                            <RatingButton size={14} className="text-muted-foreground hover:text-yellow-400" />
                                            <RatingButton size={14} className="text-muted-foreground hover:text-yellow-400" />
                                            <RatingButton size={14} className="text-muted-foreground hover:text-yellow-400" />
                                        </Rating>
                                        <span className="text-xs font-medium text-muted-foreground mr-1">
                                            {isSubmittingRating ? "Saving..." : "Rate"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-secondary-dark text-secondary-dark" />
                                        <span className="font-medium text-foreground">{outlet.rating}</span>
                                        <span>({outlet.ratingCount})</span>
                                    </span>
                                    <span>•</span>
                                    <span>{outlet.cuisine}</span>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {outlet.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {outlet.contactNumber}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {outlet.openingHours}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-3">{outlet.description}</p>
                    </DialogHeader>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 py-3 border-b border-border shrink-0">
                        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 w-full"
                            />
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="flex flex-1 sm:flex-none border border-border rounded-md overflow-hidden bg-background">
                                {(['all', 'veg', 'non-veg', 'egg'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFoodTypeFilter(type)}
                                        className={`flex-1 sm:flex-none px-2.5 py-1.5 text-xs transition-colors ${foodTypeFilter === type
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        {type === 'all' ? 'All' : type === 'non-veg' ? 'Non-Veg' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 sm:flex-none sm:w-32">
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-full h-9 bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto py-2 -mx-6 px-6">
                        <div className="space-y-2">
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                                >
                                    <FoodTypeIcon type={item.foodType} />

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.name}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <Badge variant="outline" className="text-[10px] sm:text-xs font-normal py-0 h-5">
                                                {item.category}
                                            </Badge>
                                            {item.calories !== null && (
                                                <span className="flex items-center gap-0.5">
                                                    <Flame className="w-3 h-3" />
                                                    {item.calories} kcal
                                                </span>
                                            )}
                                            {item.allergens && item.allergens.toLowerCase().trim() !== 'none' && item.allergens.trim() !== '' && (
                                                <Badge variant="outline" className="text-[10px] font-normal py-0 h-5 border-yellow-500/50 text-yellow-600 bg-yellow-500/10 shrink-0">
                                                    <span className="truncate max-w-[120px] sm:max-w-none">
                                                        Contains {item.allergens}
                                                    </span>
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-base sm:text-lg whitespace-nowrap">
                                            {item.isMRP ? <span className="text-sm text-muted-foreground mr-1 font-normal">MRP:</span> : null}
                                            ₹{item.price}
                                        </span>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleReportCalories(item)}
                                            className="h-8 px-2 text-xs"
                                            title="Report calories"
                                        >
                                            <Flame className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleAddToPlan(item)}
                                            className="h-8 px-2"
                                            title="Add to plan"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {filteredItems.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No items match your filters</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 pt-3 border-t border-border text-sm text-muted-foreground">
                        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} shown
                    </div>
                </DialogContent>
            </Dialog>

            <CalorieReportDialog
                open={calorieDialogOpen}
                onOpenChange={setCalorieDialogOpen}
                item={selectedItem}
                onSubmit={handleCalorieSubmit}
            />
        </>
    );
}
