"use client";

import { X, Lock, Unlock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type ScheduledCourse,
  TIME_SLOTS,
  DAYS,
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

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 border-b border-border">
          <div className="font-semibold text-center p-4 bg-muted border-r border-border">
            Time
          </div>
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`font-semibold text-center p-4 bg-muted ${
                index < DAYS.length - 1 ? "border-r border-border" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time slots */}
        {TIME_SLOTS.map((slot, slotIndex) => (
          <div
            key={slot}
            className={`grid grid-cols-6 ${
              slotIndex < TIME_SLOTS.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="font-medium text-center p-4 bg-muted border-r border-border text-sm">
              {slot}
            </div>

            {slot === "LUNCH" ? (
              <div className="col-span-5 p-4 bg-yellow-50 text-center text-sm text-yellow-800 font-medium">
                🍽️ Lunch Break
              </div>
            ) : (
              DAYS.map((day, dayIndex) => {
                const course = getCourseForSlot(day, slot);
                const courseKey = course
                  ? getCourseKey(course.id, day, slot)
                  : "";
                const isLocked = course ? lockedCourses.has(courseKey) : false;

                return (
                  <div
                    key={`${day}-${slot}`}
                    className={`p-2 min-h-[80px] ${
                      dayIndex < DAYS.length - 1 ? "border-r border-border" : ""
                    }`}
                  >
                    {course ? (
                      <Card
                        className="h-full p-2 relative group cursor-pointer transition-all hover:shadow-md border-2"
                        style={{
                          backgroundColor: course.color + "20",
                          borderColor: course.color,
                        }}
                      >
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-white/80"
                            onClick={() => onToggleLock(course.id, day, slot)}
                          >
                            {isLocked ? (
                              <Lock className="h-3 w-3" />
                            ) : (
                              <Unlock className="h-3 w-3" />
                            )}
                          </Button>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 hover:bg-white/80"
                              >
                                <Palette className="h-3 w-3" />
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
                              className="h-5 w-5 p-0 hover:bg-white/80"
                              onClick={() =>
                                onRemoveCourse(course.id, day, slot)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p
                            className="font-semibold text-xs"
                            style={{ color: course.color }}
                          >
                            {course.code}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {course.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.professor}
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
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
    </div>
  );
}
