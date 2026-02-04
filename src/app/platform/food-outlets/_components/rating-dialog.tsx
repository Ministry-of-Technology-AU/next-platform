"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FoodItem } from "../types";

interface RatingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: FoodItem | null;
    onSubmit: (rating: number, review: string) => void;
}

export default function RatingDialog({
    open,
    onOpenChange,
    item,
    onSubmit,
}: RatingDialogProps) {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [review, setReview] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        onSubmit(rating, review);
        resetForm();
    };

    const resetForm = () => {
        setRating(0);
        setHoveredRating(0);
        setReview("");
        setError("");
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-secondary-dark fill-secondary-dark" />
                        Rate this item
                    </DialogTitle>
                    <DialogDescription>
                        Share your experience with <strong>{item.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="py-4 space-y-6">
                        {/* Star Rating */}
                        <div className="space-y-3">
                            <Label>Your Rating</Label>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                                setRating(star);
                                                setError("");
                                            }}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                                        ? 'fill-secondary-dark text-secondary-dark'
                                                        : 'text-gray-light hover:text-gray'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-muted-foreground h-5">
                                    {ratingLabels[hoveredRating || rating]}
                                </span>
                            </div>
                            {error && (
                                <p className="text-sm text-destructive text-center">{error}</p>
                            )}
                        </div>

                        {/* Review Text */}
                        <div className="space-y-2">
                            <Label htmlFor="review">Review (optional)</Label>
                            <Textarea
                                id="review"
                                placeholder="Share your thoughts about this item..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                rows={3}
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {review.length}/500 characters
                            </p>
                        </div>

                        {/* Current rating info */}
                        {item.rating !== null && (
                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                <p className="text-muted-foreground">
                                    Current average: <span className="font-medium text-foreground">{item.rating.toFixed(1)}</span>
                                    <span className="text-xs ml-1">({item.ratingCount} ratings)</span>
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="gap-1">
                            <Star className="w-4 h-4" />
                            Submit Rating
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
