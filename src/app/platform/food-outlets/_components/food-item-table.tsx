"use client";

import { Star, Flame, AlertCircle, Leaf, Egg } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FoodItem } from "../types";

interface FoodItemTableProps {
    items: FoodItem[];
    onReportCalories: (item: FoodItem) => void;
    onRateItem: (item: FoodItem) => void;
}

function FoodTypeIcon({ type }: { type: FoodItem['foodType'] }) {
    switch (type) {
        case 'veg':
            return (
                <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-green rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-green" />
                </span>
            );
        case 'non-veg':
            return (
                <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-destructive rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                </span>
            );
        case 'egg':
            return (
                <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-secondary-dark rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-secondary-dark" />
                </span>
            );
    }
}

function RatingStars({ rating, count }: { rating: number | null; count: number }) {
    if (rating === null) {
        return <span className="text-muted-foreground text-sm">No ratings</span>;
    }

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= Math.round(rating)
                                ? 'fill-secondary-dark text-secondary-dark'
                                : 'text-gray-light'
                            }`}
                    />
                ))}
            </div>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({count})</span>
        </div>
    );
}

export default function FoodItemTable({ items, onReportCalories, onRateItem }: FoodItemTableProps) {
    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Food Item</TableHead>
                            <TableHead className="font-semibold text-right">Price</TableHead>
                            <TableHead className="font-semibold">Category</TableHead>
                            <TableHead className="font-semibold text-right">
                                <span className="flex items-center gap-1 justify-end">
                                    <Flame className="w-4 h-4" />
                                    Calories
                                </span>
                            </TableHead>
                            <TableHead className="font-semibold text-center">Type</TableHead>
                            <TableHead className="font-semibold">Rating</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">₹{item.price}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {item.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.calories !== null ? (
                                        <span className="flex items-center gap-1 justify-end">
                                            {item.calories} kcal
                                            <span className="text-xs text-muted-foreground">(self)</span>
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground flex items-center gap-1 justify-end">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Not reported
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <FoodTypeIcon type={item.foodType} />
                                        <span className="text-xs capitalize hidden sm:inline">{item.foodType}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <RatingStars rating={item.rating} count={item.ratingCount} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReportCalories(item);
                                            }}
                                            className="text-xs h-8 px-2"
                                        >
                                            <Flame className="w-3.5 h-3.5 mr-1" />
                                            Report
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRateItem(item);
                                            }}
                                            className="text-xs h-8 px-2"
                                        >
                                            <Star className="w-3.5 h-3.5 mr-1" />
                                            Rate
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
