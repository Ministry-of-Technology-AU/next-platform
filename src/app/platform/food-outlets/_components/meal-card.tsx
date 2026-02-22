"use client";

import { useState, useRef, useEffect } from "react";
import { X, Pencil, Check, Plus, Trash2, Flame, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Meal, MealPlanItem, FoodType } from "../types";

interface MealCardProps {
    meal: Meal;
    onRenameMeal: (mealId: string, newName: string) => void;
    onDeleteMeal: (mealId: string) => void;
    onRemoveItem: (mealId: string, itemId: string) => void;
    onAddCustomItem: (mealId: string) => void;
    onEditItem: (mealId: string, itemId: string, updates: Partial<MealPlanItem>) => void;
}

function FoodTypeIcon({ type }: { type: FoodType }) {
    const colors = {
        veg: "border-green bg-green",
        "non-veg": "border-destructive bg-destructive",
        egg: "border-secondary-dark bg-secondary-dark",
    };
    const [borderColor, bgColor] = colors[type].split(" ");
    return (
        <span className={`inline-flex items-center justify-center w-4 h-4 border-2 ${borderColor} rounded-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${bgColor}`} />
        </span>
    );
}

export default function MealCard({
    meal,
    onRenameMeal,
    onDeleteMeal,
    onRemoveItem,
    onAddCustomItem,
    onEditItem,
}: MealCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(meal.name);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (editName.trim() && editName !== meal.name) {
            onRenameMeal(meal.id, editName.trim());
        } else {
            setEditName(meal.name);
        }
        setIsEditing(false);
    };

    const totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
    const totalPrice = meal.items.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="border border-border rounded-lg">
            {/* Meal Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                            <Input
                                ref={inputRef}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename();
                                    if (e.key === "Escape") { setEditName(meal.name); setIsEditing(false); }
                                }}
                                onBlur={handleRename}
                                className="h-7 text-sm font-semibold px-2"
                            />
                        </div>
                    ) : (
                        <>
                            <span className="text-sm font-semibold uppercase tracking-wider truncate">
                                {meal.name}
                            </span>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                                title="Rename meal"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {meal.items.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {totalCalories > 0 && `${totalCalories} kcal`}
                            {totalCalories > 0 && totalPrice > 0 && " • "}
                            {totalPrice > 0 && `₹${totalPrice}`}
                        </span>
                    )}
                    <button
                        onClick={() => onDeleteMeal(meal.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete meal"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Meal Items */}
            <div className="divide-y divide-border">
                {meal.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2.5 group hover:bg-muted/20 transition-colors"
                    >
                        <FoodTypeIcon type={item.foodType} />

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {item.price > 0 && <span>₹{item.price}</span>}
                                {item.price > 0 && item.calories > 0 && <span>•</span>}
                                {item.calories > 0 && (
                                    <span className="flex items-center gap-0.5">
                                        <Flame className="w-3 h-3" />
                                        {item.calories} cal
                                    </span>
                                )}
                                {item.outletName && (
                                    <>
                                        <span>•</span>
                                        <span className="truncate">{item.outletName}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => onRemoveItem(meal.id, item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove item"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}

                {/* Add item button */}
                <button
                    onClick={() => onAddCustomItem(meal.id)}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add {meal.name}
                </button>
            </div>
        </div>
    );
}
