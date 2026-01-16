"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Share2, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Semester, Course } from "../types"

interface ShareTrajectoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    semesters: Semester[]
    onSuccess?: () => void
}

export function ShareTrajectoryDialog({
    open,
    onOpenChange,
    semesters,
    onSuccess
}: ShareTrajectoryDialogProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isSharing, setIsSharing] = useState(false)

    const handleShare = async () => {
        if (!title.trim()) {
            toast.error("Please enter a title for your trajectory")
            return
        }

        setIsSharing(true)
        try {
            const res = await fetch("/api/platform/trajectory-planner/shared", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    semesters
                })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Trajectory shared successfully!")
                onOpenChange(false)
                setTitle("")
                setDescription("")
                onSuccess?.()
            } else {
                toast.error(data.error || "Failed to share trajectory")
            }
        } catch (error) {
            toast.error("Failed to share trajectory")
        } finally {
            setIsSharing(false)
        }
    }

    // Calculate totals for preview
    const totalCredits = semesters.reduce((acc, sem) =>
        acc + sem.courses.reduce((semAcc, c) => semAcc + c.credits, 0), 0
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Share Your Trajectory</DialogTitle>
                    <DialogDescription>
                        Share your course trajectory with other students. Grades will be hidden for privacy.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title & Description */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., CS Major with Econ Minor (4yr)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief notes about your trajectory"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm">Preview (Grades Hidden)</h4>
                            <span className="text-xs text-muted-foreground">
                                {semesters.length} semesters • {totalCredits} credits
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Monsoon Semesters (odd) */}
                            <div className="space-y-3">
                                <div className="font-semibold text-sm bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded">
                                    Monsoon Semester
                                </div>
                                {semesters
                                    .filter((_, idx) => idx % 2 === 0)
                                    .map((sem, idx) => (
                                        <div key={sem.id} className="border rounded-lg overflow-hidden">
                                            <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-2">
                                                <span className="font-medium text-sm">{sem.name}</span>
                                            </div>
                                            {sem.courses.length > 0 ? (
                                                <div className="divide-y">
                                                    {sem.courses.map((course) => (
                                                        <div
                                                            key={course.id}
                                                            className="px-3 py-2 text-sm flex justify-between"
                                                        >
                                                            <span>{course.name}</span>
                                                            <span className="text-muted-foreground text-xs">
                                                                {course.credits}cr • {course.type}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-muted-foreground italic">
                                                    No courses
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {/* Spring Semesters (even) */}
                            <div className="space-y-3">
                                <div className="font-semibold text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded">
                                    Spring Semester
                                </div>
                                {semesters
                                    .filter((_, idx) => idx % 2 === 1)
                                    .map((sem) => (
                                        <div key={sem.id} className="border rounded-lg overflow-hidden">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
                                                <span className="font-medium text-sm">{sem.name}</span>
                                            </div>
                                            {sem.courses.length > 0 ? (
                                                <div className="divide-y">
                                                    {sem.courses.map((course) => (
                                                        <div
                                                            key={course.id}
                                                            className="px-3 py-2 text-sm flex justify-between"
                                                        >
                                                            <span>{course.name}</span>
                                                            <span className="text-muted-foreground text-xs">
                                                                {course.credits}cr • {course.type}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-muted-foreground italic">
                                                    No courses
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleShare} disabled={isSharing || !title.trim()}>
                        {isSharing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Share2 className="mr-2 h-4 w-4" />
                        )}
                        Share to Repository
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
