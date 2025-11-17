"use client";

import { useState, useMemo } from "react";
import { Search, Plus, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCardClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleAddCourse = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onAddCourse(course);
  };

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

      return matchesSearch && matchesDepartment;
    });
  }, [courses, searchTerm, departmentFilter]);

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

            <TourStep id="department-filter" order={3} title="Filter by Department" content="Narrow down the course list by selecting a department." position="bottom">
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full">
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
          </div>

          <ScrollArea className="h-[70vh]">
            <div className="space-y-2">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="p-3 hover:bg-muted/50 dark:bg-card transition-colors cursor-pointer"
                  onClick={() => handleCardClick(course)}
                  title="Click to learn more about this course (description, prerequisites, and location)"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{course.code}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prof. {course.professor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.department}
                      </p>
                    </div>
                    <div className="ml-2">
                      <Button
                        size="sm"
                        onClick={(e) => handleAddCourse(course, e)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Course Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl overflow-hidden flex flex-col">
          {selectedCourse && (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
          <span>{selectedCourse.code}</span>
          {(selectedCourse as any).hasSaturday && (
            <Badge variant="destructive" className="text-xs">
              Saturday Class
            </Badge>
          )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div>
          <h3 className="font-semibold text-lg mb-2">{selectedCourse.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
            <strong>Professor:</strong> {selectedCourse.professor}
              </p>
              <p className="text-muted-foreground">
            <strong>Department:</strong> {selectedCourse.department}
              </p>
              {/* <p className="text-muted-foreground">
            <strong>Credits:</strong> {(selectedCourse as any).credits || 'TBA'}
              </p> */}
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
            <p className="font-medium">Location</p>
            <p className="text-muted-foreground text-sm">
              {(selectedCourse as any).location || 'TBA'}
            </p>
              </div>
            </div>
          </div>
          {(selectedCourse as any).hasSaturday && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ This course has Saturday classes which won&apos;t appear on the timetable but may create scheduling conflicts.
              </p>
            </div>
          )}
            </div>
            
            <div>
          <h4 className="font-medium mb-2">Prerequisites</h4>
          <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-muted/30">
            {(selectedCourse as any).prerequisites && (selectedCourse as any).prerequisites.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
            {(selectedCourse as any).prerequisites.map((prereq: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground">{prereq}</li>
            ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No prerequisites</p>
            )}
          </div>
            </div>
            
            <div>
          <h4 className="font-medium mb-2">Description</h4>
          <div className="max-h-60 overflow-y-auto border rounded-md p-3 bg-muted/30">
            {(selectedCourse as any).description && (selectedCourse as any).description !== 'No description available' ? (
              <div 
            className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: (selectedCourse as any).description }}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">No description available</p>
            )}
          </div>
            </div>
          </div>
        </>
          )}
        </DialogContent>
      </Dialog>
    </TourStep>
  );
}
