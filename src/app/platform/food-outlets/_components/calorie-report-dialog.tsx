"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FoodItem } from "../types";

interface CalorieReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: FoodItem | null;
    onSubmit: (calories: number) => void;
}

export default function CalorieReportDialog({
    open,
    onOpenChange,
    item,
    onSubmit,
}: CalorieReportDialogProps) {
    const [calories, setCalories] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const calorieValue = parseInt(calories, 10);

        if (isNaN(calorieValue) || calorieValue <= 0) {
            setError("Please enter a valid calorie count");
            return;
        }

        if (calorieValue > 5000) {
            setError("Calorie count seems too high. Please verify.");
            return;
        }

        onSubmit(calorieValue);
        setCalories("");
        setError("");
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setCalories("");
            setError("");
        }
        onOpenChange(open);
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        Report Calories
                    </DialogTitle>
                    <DialogDescription>
                        Help others by reporting the calorie count for <strong>{item.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <div className="space-y-4">
                            {/* Current Info */}
                            {item.calories !== null && (
                                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                    <p className="text-muted-foreground">
                                        Current reported calories: <span className="font-medium text-foreground">{item.calories} kcal</span>
                                    </p>
                                </div>
                            )}

                            {/* Calorie Input */}
                            <div className="space-y-2">
                                <Label htmlFor="calories">Calorie Count (kcal)</Label>
                                <Input
                                    id="calories"
                                    type="number"
                                    placeholder="e.g., 350"
                                    value={calories}
                                    onChange={(e) => {
                                        setCalories(e.target.value);
                                        setError("");
                                    }}
                                    min="1"
                                    max="5000"
                                    className="text-lg"
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>

                            {/* Helpful tip */}
                            <p className="text-xs text-muted-foreground">
                                💡 You can usually find calorie information on the menu or by asking the vendor.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="gap-1">
                            <Flame className="w-4 h-4" />
                            Submit Report
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
