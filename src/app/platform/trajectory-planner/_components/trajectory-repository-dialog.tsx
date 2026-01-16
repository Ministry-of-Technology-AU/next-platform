"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, User, Calendar, Plus, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Course } from "../types"

interface SharedTrajectory {
    id: number
    title: string
    description?: string
    semesters: { id: string; name: string; courses: Omit<Course, 'grade'>[] }[]
    totalCredits: number
    authorName: string
    batch: string
    createdAt: string
}

interface TrajectoryRepositoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImportCourses?: (courses: Omit<Course, 'grade'>[]) => void
}

export function TrajectoryRepositoryDialog({
    open,
    onOpenChange,
    onImportCourses
}: TrajectoryRepositoryDialogProps) {
    const [trajectories, setTrajectories] = useState<SharedTrajectory[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedId, setExpandedId] = useState<number | null>(null)

    useEffect(() => {
        if (open) {
            fetchTrajectories()
        }
    }, [open])

    const fetchTrajectories = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/platform/trajectory-planner/shared")
            const data = await res.json()
            if (res.ok && data.data) {
                setTrajectories(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch trajectories:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter trajectories based on search
    const filteredTrajectories = useMemo(() => {
        if (!searchQuery.trim()) return trajectories

        const query = searchQuery.toLowerCase()
        return trajectories.filter(t =>
            t.title.toLowerCase().includes(query) ||
            t.authorName.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query)
        )
    }, [trajectories, searchQuery])

    const handleImportAll = (trajectory: SharedTrajectory) => {
        const allCourses = trajectory.semesters.flatMap(sem => sem.courses)
        onImportCourses?.(allCourses)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Trajectory Repository
                    </DialogTitle>
                    <DialogDescription>
                        Browse trajectories shared by other students. Click to view details and import courses.
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Trajectories List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredTrajectories.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchQuery ? "No trajectories match your search" : "No shared trajectories yet"}
                        </div>
                    ) : (
                        filteredTrajectories.map((trajectory) => (
                            <Collapsible
                                key={trajectory.id}
                                open={expandedId === trajectory.id}
                                onOpenChange={(open) => setExpandedId(open ? trajectory.id : null)}
                            >
                                <Card>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {expandedId === trajectory.id ? (
                                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <div>
                                                        <CardTitle className="text-base">{trajectory.title}</CardTitle>
                                                        <div className="flex items-center gap-3 text-xs mt-1 text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {trajectory.authorName}
                                                            </span>
                                                            {trajectory.batch && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {trajectory.batch}
                                                                </Badge>
                                                            )}
                                                            <span>{trajectory.semesters.length} semesters</span>
                                                            <span>{trajectory.totalCredits} credits</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="pt-0">
                                            {trajectory.description && (
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    {trajectory.description}
                                                </p>
                                            )}

                                            {/* Semester Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                {/* Monsoon */}
                                                <div className="space-y-2">
                                                    <div className="font-semibold text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                                                        Monsoon
                                                    </div>
                                                    {trajectory.semesters
                                                        .filter((_, idx) => idx % 2 === 0)
                                                        .map((sem) => (
                                                            <div key={sem.id} className="border rounded text-xs">
                                                                <div className="bg-orange-50 dark:bg-orange-900/20 px-2 py-1 font-medium">
                                                                    {sem.name}
                                                                </div>
                                                                <div className="p-2 space-y-1">
                                                                    {sem.courses.map((c, idx) => (
                                                                        <div key={idx} className="flex justify-between">
                                                                            <span className="truncate">{c.name}</span>
                                                                            <span className="text-muted-foreground">{c.credits}cr</span>
                                                                        </div>
                                                                    ))}
                                                                    {sem.courses.length === 0 && (
                                                                        <span className="text-muted-foreground italic">Empty</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>

                                                {/* Spring */}
                                                <div className="space-y-2">
                                                    <div className="font-semibold text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                                        Spring
                                                    </div>
                                                    {trajectory.semesters
                                                        .filter((_, idx) => idx % 2 === 1)
                                                        .map((sem) => (
                                                            <div key={sem.id} className="border rounded text-xs">
                                                                <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 font-medium">
                                                                    {sem.name}
                                                                </div>
                                                                <div className="p-2 space-y-1">
                                                                    {sem.courses.map((c, idx) => (
                                                                        <div key={idx} className="flex justify-between">
                                                                            <span className="truncate">{c.name}</span>
                                                                            <span className="text-muted-foreground">{c.credits}cr</span>
                                                                        </div>
                                                                    ))}
                                                                    {sem.courses.length === 0 && (
                                                                        <span className="text-muted-foreground italic">Empty</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleImportAll(trajectory)}
                                                className="w-full"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Import All Courses to Tray
                                            </Button>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
