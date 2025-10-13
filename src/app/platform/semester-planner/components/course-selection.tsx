"use client";

import { useState, useMemo, useDeferredValue, useRef } from "react";
import { Search, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "../types"
import { TourStep } from "@/components/guided-tour";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface CourseSelectionProps {
  courses: Course[];
  onAddCourse: (course: Course) => void; // Remove color parameter
  className?: string;
}

export function CourseSelection({
  courses,
  onAddCourse,
  className,
}: CourseSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const deferredSearch = useDeferredValue(searchTerm);

  const departments = useMemo(() => {
    const depts = Array.from(
      new Set(courses.map((course) => course.department))
    );
    return depts.sort();
  }, [courses]);
  const filteredCourses = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesSearch =
        query.length === 0 ||
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.professor.toLowerCase().includes(query);
      const matchesDepartment =
        departmentFilter === "all" || course.department === departmentFilter;
      const matchesType = typeFilter === "all" || course.type === typeFilter;

      return matchesSearch && matchesDepartment && matchesType;
    });
  }, [courses, deferredSearch, departmentFilter, typeFilter]);

  const virtualizer = useVirtualizer({
    count: filteredCourses.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 120,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Card
      className={cn(
        "relative flex h-full min-h-[460px] flex-col overflow-hidden border border-border/60 bg-card/80 shadow-[0_25px_100px_-80px_rgba(43,105,72,0.35)] transition-all duration-300 dark:bg-card/60",
        "xl:min-h-[520px] xl:max-h-[720px] 2xl:max-h-[760px]",
        className
      )}
    >
      <div className="space-y-3 border-b border-border/40 bg-background/80 px-5 pb-5 pt-6 dark:bg-background/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="tracking-tight text-foreground/80">Discover courses &amp; lock in favourites</span>
          </div>
          <span className="hidden items-center rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
            {filteredCourses.length} results
          </span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-foreground/60" aria-hidden="true" />
          <TourStep
            id="course-search"
            order={1}
            title="Search for Courses!"
            content="Find courses by name, code, or professor."
            position="right"
          >
            <Input
              placeholder="Search courses, codes, or professors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 rounded-full border-border/60 bg-background pl-10 pr-4 text-left text-sm"
            />
          </TourStep>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-10 flex-1 rounded-full border-border/60 bg-background text-sm">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 flex-1 rounded-full border-border/60 bg-background text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Core">Core</SelectItem>
              <SelectItem value="Elective">Elective</SelectItem>
              <SelectItem value="Lab">Lab</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <div
          ref={scrollParentRef}
          className="flex-1 overflow-y-auto px-3 pb-6 pt-4"
        >
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualItems.map((virtualRow: typeof virtualItems[number]) => {
              const course = filteredCourses[virtualRow.index];
              if (!course) {
                return null;
              }
              return (
                <div
                  key={course.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <Card className="group relative m-2 overflow-hidden rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-background/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold tracking-wide text-foreground">
                            {course.code}
                          </h4>
                          <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-medium">
                            {course.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.name}
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                          Prof. {course.professor}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {course.department}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddCourse(course)}
                        className="ml-2 rounded-full bg-primary/80 px-3 py-2 text-xs font-semibold shadow-sm transition-colors hover:bg-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {filteredCourses.length === 0 && (
          <p className="px-6 pb-6 text-center text-sm text-muted-foreground">
            No courses match your filters.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
