"use client";

import { X, Lock, Unlock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="w-full overflow-x-auto rounded-3xl bg-background p-2 shadow-inner dark:bg-background/40">
      <div className="w-full min-w-[560px] md:min-w-[760px] overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-sm dark:bg-background/50">
        {/* Header */}
        <div className="grid grid-cols-6 border-b border-border/40 bg-muted/70">
          <div className="border-r border-border/40 p-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground md:p-4 md:text-sm">
            Time
          </div>
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground md:p-4 md:text-sm ${
                index < DAYS.length - 1 ? "border-r border-border/40" : ""
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {TIME_SLOTS.map((slot, slotIndex) => (
          <div
            key={slot}
            className={`grid grid-cols-6 ${
              slotIndex < TIME_SLOTS.length - 1 ? "border-b border-border/40" : ""
            }`}
          >
            <div className="border-r border-border/30 bg-muted/40 p-2 text-center text-[10px] font-semibold tracking-wide text-muted-foreground md:p-4 md:text-sm">
              <span className="hidden sm:inline">{slot}</span>
              <span className="sm:hidden">{slot.length > 8 ? slot.slice(0, 5) + "..." : slot}</span>
            </div>

            {slot === "LUNCH" ? (
              <div className="col-span-5 flex items-center justify-center gap-2 bg-secondary/15 p-2 text-center text-xs font-semibold text-secondary-foreground md:p-4 md:text-sm">
                🍽️ <span className="hidden sm:inline">Lunch Break</span>
                <span className="sm:hidden">Lunch</span>
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
                    className={`min-h-[70px] p-1 md:min-h-[90px] md:p-2 ${
                      dayIndex < DAYS.length - 1 ? "border-r border-border/30" : ""
                    }`}
                  >
                    {course ? (
                      <div
                        className="group relative flex h-full flex-col justify-between px-2 py-2 text-left transition-colors md:px-3 md:py-3"
                        style={{
                          backgroundColor: `${course.color}12`,
                          boxShadow: `inset 0 0 0 1px ${course.color}33`,
                        }}
                      >
                        <div className="absolute right-1 top-1 flex gap-1 rounded-full bg-background/95 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 rounded-full p-0 text-foreground/70 hover:bg-background/80"
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
                                className="h-6 w-6 rounded-full p-0 text-foreground/70 hover:bg-background/80"
                              >
                                <Palette className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto rounded-xl border border-border/50 bg-background/90 p-2 shadow-lg">
                              <div className="flex max-w-[140px] flex-wrap gap-1">
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
                                    className="h-6 w-6 rounded-full border-2 border-border/50 transition-colors hover:border-foreground"
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
                              className="h-6 w-6 rounded-full p-0 text-foreground/70 hover:bg-background/80"
                              onClick={() =>
                                onRemoveCourse(course.id, day, slot)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold tracking-wide" style={{ color: course.color }}>
                            {course.code}
                          </p>
                          <p className="hidden text-[11px] font-medium text-foreground/90 sm:block">
                            {course.name}
                          </p>
                          <p className="hidden text-[10px] text-muted-foreground md:block">
                            {course.professor}
                          </p>
                          <p className="hidden text-[10px] text-muted-foreground/80 lg:block">
                            {course.department}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted/30 text-[10px] font-medium text-muted-foreground md:text-xs">
                        Free Slot
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
