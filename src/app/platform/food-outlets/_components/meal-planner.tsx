"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meal, MealPlanItem, DayPlan, WeekPlan } from "../types";
import WeekCalendar, { getMonday } from "./week-calendar";
import NutritionCharts from "./nutrition-charts";
import MealCard from "./meal-card";
import AddFoodDialog from "./add-food-dialog";

// Generate a unique ID
function uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Create default meals for a new day
function createDefaultMeals(): Meal[] {
    return [
        { id: uid(), name: "Breakfast", items: [] },
        { id: uid(), name: "Lunch", items: [] },
        { id: uid(), name: "Snacks", items: [] },
    ];
}

function getDateKey(d: Date): string {
    return d.toISOString().split("T")[0];
}

// Generate some sample data for today so charts aren't empty
function createSampleData(): WeekPlan {
    const today = new Date();
    const key = getDateKey(today);

    return {
        [key]: {
            date: key,
            saved: true,
            meals: [
                {
                    id: uid(), name: "Breakfast", items: [
                        {
                            id: uid(), name: "Masala Maggi", price: 40, calories: 320,
                            foodType: "veg", nutrients: { protein: 8, carbs: 45, fat: 12, fiber: 2 },
                            outletId: "dhaba", outletName: "Dhaba", isCustom: false,
                        },
                    ]
                },
                { id: uid(), name: "Lunch", items: [] },
                {
                    id: uid(), name: "Snacks", items: [
                        {
                            id: uid(), name: "Iced Latte", price: 110, calories: 120,
                            foodType: "veg", nutrients: { protein: 4, carbs: 15, fat: 5, fiber: 0 },
                            outletId: "nescafe", outletName: "Nescafe Corner", isCustom: false,
                        },
                    ]
                },
            ],
        },
    };
}

export default function MealPlanner() {
    const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [weekPlan, setWeekPlan] = useState<WeekPlan>(() => createSampleData());
    const [chartsOpen, setChartsOpen] = useState(false);
    const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
    const [activeMealId, setActiveMealId] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    const selectedDateKey = getDateKey(selectedDate);

    // Get or create the day plan for the selected date
    const currentDayPlan: DayPlan = useMemo(() => {
        if (weekPlan[selectedDateKey]) return weekPlan[selectedDateKey];
        return { date: selectedDateKey, meals: createDefaultMeals(), saved: true };
    }, [weekPlan, selectedDateKey]);

    // Week dates for charts
    const weekDates = useMemo(() => {
        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [weekStart]);

    // Check if current plan has unsaved changes
    const hasUnsavedChanges = !currentDayPlan.saved;

    // Update the week plan for the current day
    const updateDayPlan = useCallback((updater: (plan: DayPlan) => DayPlan) => {
        setWeekPlan(prev => {
            const current = prev[selectedDateKey] || { date: selectedDateKey, meals: createDefaultMeals(), saved: true };
            const updated = updater(current);
            return { ...prev, [selectedDateKey]: { ...updated, saved: false } };
        });
        setSaveStatus("idle");
    }, [selectedDateKey]);

    // ── Meal Actions ──────────────────────────────────────────

    const handleRenameMeal = useCallback((mealId: string, newName: string) => {
        updateDayPlan(plan => ({
            ...plan,
            meals: plan.meals.map(m => m.id === mealId ? { ...m, name: newName } : m),
        }));
    }, [updateDayPlan]);

    const handleDeleteMeal = useCallback((mealId: string) => {
        updateDayPlan(plan => ({
            ...plan,
            meals: plan.meals.filter(m => m.id !== mealId),
        }));
    }, [updateDayPlan]);

    const handleAddMeal = useCallback(() => {
        const newMeal: Meal = { id: uid(), name: "New Meal", items: [] };
        updateDayPlan(plan => ({
            ...plan,
            meals: [...plan.meals, newMeal],
        }));
    }, [updateDayPlan]);

    const handleRemoveItem = useCallback((mealId: string, itemId: string) => {
        updateDayPlan(plan => ({
            ...plan,
            meals: plan.meals.map(m =>
                m.id === mealId ? { ...m, items: m.items.filter(i => i.id !== itemId) } : m
            ),
        }));
    }, [updateDayPlan]);

    const handleEditItem = useCallback((mealId: string, itemId: string, updates: Partial<MealPlanItem>) => {
        updateDayPlan(plan => ({
            ...plan,
            meals: plan.meals.map(m =>
                m.id === mealId
                    ? { ...m, items: m.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
                    : m
            ),
        }));
    }, [updateDayPlan]);

    // Open add-food dialog for a specific meal
    const handleAddCustomItem = useCallback((mealId: string) => {
        setActiveMealId(mealId);
        setAddFoodDialogOpen(true);
    }, []);

    // Add a custom food item to the active meal
    const handleFoodAdded = useCallback((item: MealPlanItem) => {
        if (!activeMealId) return;
        updateDayPlan(plan => ({
            ...plan,
            meals: plan.meals.map(m =>
                m.id === activeMealId ? { ...m, items: [...m.items, item] } : m
            ),
        }));
        setActiveMealId(null);
    }, [activeMealId, updateDayPlan]);

    // Add from outlet (called externally via context/prop)
    const addItemFromOutlet = useCallback((item: MealPlanItem, mealId?: string) => {
        updateDayPlan(plan => {
            const targetMealId = mealId || plan.meals[0]?.id;
            if (!targetMealId) return plan;
            return {
                ...plan,
                meals: plan.meals.map(m =>
                    m.id === targetMealId ? { ...m, items: [...m.items, item] } : m
                ),
            };
        });
    }, [updateDayPlan]);

    // Save handler (stub)
    const handleSave = useCallback(() => {
        setSaveStatus("saving");
        // Simulate save delay
        setTimeout(() => {
            setWeekPlan(prev => ({
                ...prev,
                [selectedDateKey]: { ...prev[selectedDateKey], saved: true },
            }));
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }, 500);
        console.log("Saving meal plan:", currentDayPlan);
    }, [selectedDateKey, currentDayPlan]);

    // Format today label
    const isToday = (() => {
        const now = new Date();
        return selectedDate.getDate() === now.getDate() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getFullYear() === now.getFullYear();
    })();

    const dayLabel = isToday
        ? "Today's Plan"
        : selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    return (
        <div className="space-y-4">
            {/* Week Calendar */}
            <div className="bg-card rounded-lg border border-border p-4">
                <WeekCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onWeekChange={setWeekStart}
                    weekStart={weekStart}
                />
            </div>

            {/* Nutrition Charts (Collapsible) */}
            <div className="bg-card rounded-lg border border-border px-4 py-2">
                <NutritionCharts
                    weekPlan={weekPlan}
                    weekDates={weekDates}
                    isOpen={chartsOpen}
                    onOpenChange={setChartsOpen}
                />
            </div>

            {/* Day Plan */}
            <div className="bg-card rounded-lg border border-border p-4">
                {/* Header with Save + Add */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{dayLabel}</h3>
                    <div className="flex items-center gap-2">
                        {/* Save Button */}
                        <Button
                            variant={hasUnsavedChanges ? "default" : "outline"}
                            size="sm"
                            onClick={handleSave}
                            disabled={saveStatus === "saving" || (!hasUnsavedChanges && saveStatus !== "saved")}
                            className={`gap-1.5 transition-all ${hasUnsavedChanges
                                    ? "bg-green hover:bg-green-dark text-white ring-2 ring-green/30"
                                    : ""
                                }`}
                        >
                            {saveStatus === "saving" ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : saveStatus === "saved" ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save
                                </>
                            )}
                        </Button>

                        {/* Add Meal */}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleAddMeal}
                            className="gap-1"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Meal Cards */}
                <div className="space-y-4">
                    {currentDayPlan.meals.map(meal => (
                        <MealCard
                            key={meal.id}
                            meal={meal}
                            onRenameMeal={handleRenameMeal}
                            onDeleteMeal={handleDeleteMeal}
                            onRemoveItem={handleRemoveItem}
                            onAddCustomItem={handleAddCustomItem}
                            onEditItem={handleEditItem}
                        />
                    ))}

                    {currentDayPlan.meals.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="mb-2">No meals yet</p>
                            <Button variant="outline" size="sm" onClick={handleAddMeal}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add a Meal
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Food Dialog */}
            <AddFoodDialog
                open={addFoodDialogOpen}
                onOpenChange={setAddFoodDialogOpen}
                onAdd={handleFoodAdded}
            />
        </div>
    );
}
