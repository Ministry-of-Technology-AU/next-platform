"use client";

import { X, Lock, Unlock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ScheduledCourse,
  TIME_SLOTS,
  DAYS,
  DAYS_WITH_SATURDAY,
  COURSE_COLORS,
} from "../types";

interface TimetableGridProps {
  courses: ScheduledCourse[];
  onRemoveCourse: (courseId: string, day: string, slot: string) => void;
  onToggleLock: (courseId: string, day: string, slot: string) => void;
  onRecolorCourse: (
    courseId: string,
    day: string,
    slot: string,
    color: string
  ) => void;
  lockedCourses: Set<string>;
}

// The evening slot that should be hidden by default
const EVENING_SLOT = "8:00pm-9:30pm";

export function TimetableGrid({
  courses,
  onRemoveCourse,
  onToggleLock,
  onRecolorCourse,
  lockedCourses,
}: TimetableGridProps) {
  const getCourseForSlot = (day: string, slot: string) => {
    return courses.find((course) =>
      course.timeSlots.some((ts) => ts.day === day && ts.slot === slot)
    );
  };

  const getCourseKey = (courseId: string, day: string, slot: string) => {
    return `${courseId}-${day}-${slot}`;
  };

  // Check if any course uses the evening slot
  const hasEveningCourse = courses.some((course) =>
    course.timeSlots.some((ts) => ts.slot === EVENING_SLOT)
  );

  // Check if any course has a Saturday class
  const hasSaturdayCourse = courses.some((course) =>
    course.timeSlots.some((ts) => ts.day === "Saturday")
  );

  // Filter time slots to hide evening slot if not needed
  const visibleTimeSlots = TIME_SLOTS.filter(
    (slot) => slot !== EVENING_SLOT || hasEveningCourse
  );

  // Use days with or without Saturday based on course requirements
  const visibleDays = hasSaturdayCourse ? DAYS_WITH_SATURDAY : DAYS;

  // Grid columns: 1 for time + number of visible days
  const gridCols = hasSaturdayCourse ? "grid-cols-7" : "grid-cols-6";
  const lunchColSpan = hasSaturdayCourse ? "col-span-6" : "col-span-5";

  return (
    <ScrollArea className="w-full rounded-md border">
      <div className={`${hasSaturdayCourse ? "min-w-[700px] md:min-w-[950px]" : "min-w-[600px] md:min-w-[800px]"} border-b border-r rounded-lg overflow-hidden`}>
        {/* Header */}
        <div className={`grid ${gridCols} border-b border-border`}>
          <div className="font-semibold text-center p-2 md:p-4 bg-muted dark:bg-muted/40 border-r border-border text-xs md:text-sm">
            Time
          </div>
          {visibleDays.map((day, index) => (
            <div
              key={day}
              className={`font-semibold text-center p-2 md:p-4 bg-muted dark:bg-muted/40 text-xs md:text-sm ${index < visibleDays.length - 1 ? "border-r border-border" : ""
                }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {visibleTimeSlots.map((slot, slotIndex) => (
          <div
            key={slot}
            className={`grid ${gridCols} ${slotIndex < visibleTimeSlots.length - 1 ? "border-b border-border" : ""
              }`}
          >
            <div className="font-medium text-center p-2 md:p-4 bg-muted dark:bg-muted/40 border-r border-border text-xs md:text-sm">
              <span className="hidden sm:inline">{slot}</span>
              <span className="sm:hidden">{slot.length > 8 ? slot.slice(0, 5) + "..." : slot}</span>
            </div>

            {slot === "LUNCH" ? (
              <div className={`${lunchColSpan} p-2 md:p-4 bg-yellow-50 text-center text-xs md:text-sm text-yellow-800 font-medium`}>
                <span className="hidden sm:inline">Lunch Break</span><span className="sm:hidden">Lunch</span>
              </div>
            ) : (
              visibleDays.map((day, dayIndex) => {
                const course = getCourseForSlot(day, slot);
                const courseKey = course
                  ? getCourseKey(course.id, day, slot)
                  : "";
                const isLocked = course ? lockedCourses.has(courseKey) : false;

                return (
                  <div
                    key={`${day}-${slot}`}
                    className={`p-1 md:p-2 min-h-[60px] md:min-h-[80px] ${dayIndex < visibleDays.length - 1 ? "border-r border-border" : ""
                      }`}
                  >
                    {course ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card
                            className="h-full p-1 md:p-2 relative group cursor-pointer transition-all hover:shadow-md border-2"
                            style={{
                              backgroundColor: course.color + "20",
                              borderColor: course.color,
                            }}
                          >
                            <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 flex gap-0.5 md:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 md:h-5 md:w-5 p-0 hover:bg-white/80"
                                onClick={() => onToggleLock(course.id, day, slot)}
                              >
                                {isLocked ? (
                                  <Lock className="h-2 w-2 md:h-3 md:w-3" />
                                ) : (
                                  <Unlock className="h-2 w-2 md:h-3 md:w-3" />
                                )}
                              </Button>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 md:h-5 md:w-5 p-0 hover:bg-white/80"
                                  >
                                    <Palette className="h-2 w-2 md:h-3 md:w-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                  <div className="flex gap-1 flex-wrap max-w-[120px]">
                                    {COURSE_COLORS.map((color) => (
                                      <button
                                        key={color}
                                        onClick={() =>
                                          onRecolorCourse(
                                            course.id,
                                            day,
                                            slot,
                                            color
                                          )
                                        }
                                        className="w-6 h-6 rounded border-2 border-muted hover:border-foreground transition-colors"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>

                              {!isLocked && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 md:h-5 md:w-5 p-0 hover:bg-white/80"
                                  onClick={() =>
                                    onRemoveCourse(course.id, day, slot)
                                  }
                                >
                                  <X className="h-2 w-2 md:h-3 md:w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="space-y-0.5 md:space-y-1">
                              <p
                                className="font-semibold text-[10px] md:text-xs line-clamp-2"
                                style={{ color: course.color }}
                              >
                                {course.name}
                              </p>
                              <p className="text-[8px] md:text-xs text-muted-foreground hidden md:block">
                                {course.professor}
                              </p>
                            </div>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[250px]">
                          <div className="space-y-1">
                            <p className="font-semibold">{course.name}</p>
                            <p className="font-semibold">{course.code}</p>
                            <p className="text-xs">{slot}</p>
                            <p className="text-xs">{course.professor}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] md:text-xs">
                        Free
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
