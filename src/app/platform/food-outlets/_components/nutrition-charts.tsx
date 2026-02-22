"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DayPlan } from "../types";

interface NutritionChartsProps {
    weekPlan: Record<string, DayPlan>;
    weekDates: Date[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const PIE_COLORS = ["#87281b", "#ffcd74", "#519872", "#0267c1"];
const NUTRIENT_LABELS = ["Protein", "Carbs", "Fat", "Fiber"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function NutritionCharts({ weekPlan, weekDates, isOpen, onOpenChange }: NutritionChartsProps) {
    // Aggregate nutrients for the selected day (today or selected)
    const todayKey = weekDates.length > 0
        ? weekDates.find(d => {
            const now = new Date();
            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
        })
        : undefined;

    // Aggregate all nutrients across the full week for the pie chart
    const nutrientData = useMemo(() => {
        let protein = 0, carbs = 0, fat = 0, fiber = 0;

        Object.values(weekPlan).forEach(dayPlan => {
            dayPlan.meals.forEach(meal => {
                meal.items.forEach(item => {
                    protein += item.nutrients.protein;
                    carbs += item.nutrients.carbs;
                    fat += item.nutrients.fat;
                    fiber += item.nutrients.fiber;
                });
            });
        });

        if (protein + carbs + fat + fiber === 0) return [];

        return [
            { name: "Protein", value: Math.round(protein), unit: "g" },
            { name: "Carbs", value: Math.round(carbs), unit: "g" },
            { name: "Fat", value: Math.round(fat), unit: "g" },
            { name: "Fiber", value: Math.round(fiber), unit: "g" },
        ];
    }, [weekPlan]);

    // Weekly calorie data for bar chart
    const calorieData = useMemo(() => {
        return weekDates.map((date, i) => {
            const key = date.toISOString().split("T")[0];
            const dayPlan = weekPlan[key];
            let calories = 0;
            if (dayPlan) {
                dayPlan.meals.forEach(meal => {
                    meal.items.forEach(item => {
                        calories += item.calories;
                    });
                });
            }
            return { day: DAY_SHORT[i], calories };
        });
    }, [weekPlan, weekDates]);

    const totalCalories = calorieData.reduce((sum, d) => sum + d.calories, 0);
    const hasData = nutrientData.length > 0 || totalCalories > 0;

    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/30 rounded-md transition-colors">
                <span className="text-sm font-medium">
                    Nutrition Overview
                    {totalCalories > 0 && (
                        <span className="ml-2 text-muted-foreground font-normal">
                            {totalCalories} kcal this week
                        </span>
                    )}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>

            <CollapsibleContent>
                {!hasData ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Add food items to see nutrition data
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                        {/* Nutrient Pie Chart */}
                        {nutrientData.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Nutrient Split (Week)</p>
                                <div className="h-[140px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={nutrientData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={55}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {nutrientData.map((_, idx) => (
                                                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`${value}g`]}
                                                contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Legend */}
                                <div className="flex flex-wrap justify-center gap-3 mt-1">
                                    {nutrientData.map((item, idx) => (
                                        <div key={item.name} className="flex items-center gap-1 text-xs">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: PIE_COLORS[idx] }}
                                            />
                                            <span className="text-muted-foreground">{item.name}</span>
                                            <span className="font-medium">{item.value}g</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Calorie Bar Chart */}
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Calories This Week</p>
                            <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={calorieData} barSize={20}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            formatter={(value) => [`${value} kcal`]}
                                            contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                                        />
                                        <Bar dataKey="calories" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
