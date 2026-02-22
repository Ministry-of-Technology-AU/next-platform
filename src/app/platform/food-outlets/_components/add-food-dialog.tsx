"use client";

import { useState } from "react";
import { Plus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MealPlanItem, FoodType } from "../types";

interface AddFoodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (item: MealPlanItem) => void;
}

export default function AddFoodDialog({ open, onOpenChange, onAdd }: AddFoodDialogProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [calories, setCalories] = useState("");
    const [foodType, setFoodType] = useState<FoodType>("veg");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [fiber, setFiber] = useState("");
    const [error, setError] = useState("");

    const resetForm = () => {
        setName("");
        setPrice("");
        setCalories("");
        setFoodType("veg");
        setProtein("");
        setCarbs("");
        setFat("");
        setFiber("");
        setError("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Please enter a food name");
            return;
        }

        const item: MealPlanItem = {
            id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: name.trim(),
            price: parseFloat(price) || 0,
            calories: parseFloat(calories) || 0,
            foodType,
            nutrients: {
                protein: parseFloat(protein) || 0,
                carbs: parseFloat(carbs) || 0,
                fat: parseFloat(fat) || 0,
                fiber: parseFloat(fiber) || 0,
            },
            isCustom: true,
        };

        onAdd(item);
        resetForm();
        onOpenChange(false);
    };

    const handleClose = (open: boolean) => {
        if (!open) resetForm();
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Add Custom Food
                    </DialogTitle>
                    <DialogDescription>
                        Add a custom food item to your meal plan. Nutrient values are optional.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-3">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="food-name">Name *</Label>
                            <Input
                                id="food-name"
                                placeholder="e.g., Homemade Salad"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(""); }}
                            />
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>

                        {/* Price + Calories + Type row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="food-price">Price (₹)</Label>
                                <Input id="food-price" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="food-cal">Calories</Label>
                                <Input id="food-cal" type="number" placeholder="0" value={calories} onChange={(e) => setCalories(e.target.value)} min="0" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Type</Label>
                                <Select value={foodType} onValueChange={(v) => setFoodType(v as FoodType)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="veg">Veg</SelectItem>
                                        <SelectItem value="non-veg">Non-Veg</SelectItem>
                                        <SelectItem value="egg">Egg</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Nutrient Breakdown */}
                        <div>
                            <Label className="text-muted-foreground text-xs mb-2 block">Nutrient Breakdown (grams, optional)</Label>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Protein</Label>
                                    <Input type="number" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} min="0" className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Carbs</Label>
                                    <Input type="number" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} min="0" className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Fat</Label>
                                    <Input type="number" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} min="0" className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Fiber</Label>
                                    <Input type="number" placeholder="0" value={fiber} onChange={(e) => setFiber(e.target.value)} min="0" className="h-8 text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
                        <Button type="submit">Add Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
