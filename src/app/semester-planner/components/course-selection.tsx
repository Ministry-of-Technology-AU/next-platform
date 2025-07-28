"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "../types"

interface CourseSelectionProps {
  courses: Course[];
  onAddCourse: (course: Course) => void; // Remove color parameter
}

export function CourseSelection({
  courses,
  onAddCourse,
}: CourseSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const departments = useMemo(() => {
    const depts = Array.from(
      new Set(courses.map((course) => course.department))
    );
    return depts.sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.professor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" || course.department === departmentFilter;
      const matchesType = typeFilter === "all" || course.type === typeFilter;

      return matchesSearch && matchesDepartment && matchesType;
    });
  }, [courses, searchTerm, departmentFilter, typeFilter]);

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses, codes, or professors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Elective">Elective</SelectItem>
                <SelectItem value="Lab">Lab</SelectItem>
                <SelectItem value="Seminar">Seminar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{course.code}</h4>
                      <Badge variant="outline" className="text-xs">
                        {course.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {course.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prof. {course.professor}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.department} • {course.credits} credits
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddCourse(course)}
                    className="ml-2"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
