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
import { TourStep } from "@/components/guided-tour";

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
    <TourStep
      id="course-selection"
      order={1}
      title="Select Courses"
      content="Browse the list of available courses below. You can search, filter by department or type, and add courses to your timetable by clicking the + button."
      position="right"
    >
      <Card className="h-[90vh] bg-card dark:bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <TourStep id="course-search" order={2} title="Search for Courses!" content="Find courses by name, code, or professor." position="bottom">
                <Input
                  placeholder="Search courses, codes, or professors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </TourStep>
            </div>

            <div className="flex gap-2">
              <TourStep id="department-filter" order={3} title="Filter by Department" content="Narrow down the course list by selecting a department." position="bottom">
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
              </TourStep>

              <TourStep id="type-filter" order={4} title="Filter by Type" content="Filter courses by their type: Core, Elective, Lab, or Seminar." position="bottom">
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
              </TourStep>
            </div>
          </div>

          <ScrollArea className="h-[70vh]">
            <div className="space-y-2">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="p-3 hover:bg-muted/50 dark:bg-card transition-colors"
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
                        {course.department}
                        {/* {course.department} • {course.credits} credits */}
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
    </TourStep>
  );
}
