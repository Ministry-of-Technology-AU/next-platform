"use client";

import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { CourseSelection } from "./components/course-selection";
import { TimetableGrid } from "./components/timetable-grid";
import { DraftTabs } from "./components/draft-tabs";
import type {
  Course,
  ScheduledCourse,
  TimetableDraft,
} from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COURSE_COLORS } from "./types";


interface SemesterPlannerClientProps {
  courses: Course[];
  initialDrafts?: TimetableDraft[];
}

export function SemesterPlannerClient({ courses, initialDrafts }: SemesterPlannerClientProps) {
  const [drafts, setDrafts] = useState<TimetableDraft[]>(() => {
    if (Array.isArray(initialDrafts) && initialDrafts.length > 0) {
      return initialDrafts.map((d: any) => ({
        ...d,
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date(),
      }));
    }
    return [
      {
        id: "1",
        name: "Draft 1",
        courses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  });

  // Set activeDraftId to first draft's id if drafts exist, else "1"
  const [activeDraftId, setActiveDraftId] = useState(() => {
    if (Array.isArray(initialDrafts) && initialDrafts.length > 0) {
      return initialDrafts[0].id;
    }
    return "1";
  });

  // If initialDrafts changes, update drafts and activeDraftId
  useEffect(() => {
    if (Array.isArray(initialDrafts) && initialDrafts.length > 0) {
      setDrafts(initialDrafts.map((d: any) => ({
        ...d,
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date(),
      })));
      setActiveDraftId(initialDrafts[0].id);
    }
  }, [initialDrafts]);
  const [lockedCourses, setLockedCourses] = useState<Set<string>>(new Set());
  const [showColorPicker, setShowColorPicker] = useState<{
    course: Course;
    show: boolean;
  }>({
    course: courses[0],
    show: false,
  });

  const activeDraft = drafts.find((d) => d.id === activeDraftId)!;

  const checkTimeConflict = useCallback(
    (newCourse: Course, existingCourses: ScheduledCourse[]) => {
      for (const newTimeSlot of newCourse.timeSlots) {
        for (const existingCourse of existingCourses) {
          for (const existingTimeSlot of existingCourse.timeSlots) {
            if (
              existingTimeSlot.day === newTimeSlot.day &&
              existingTimeSlot.slot === newTimeSlot.slot
            ) {
              return {
                hasConflict: true,
                conflictingCourse: existingCourse,
                conflictingSlot: existingTimeSlot
              };
            }
          }
        }
      }
      return { hasConflict: false };
    },
    []
  );

  // Default color mapping for departments/majors
  const DEPARTMENT_COLOR_MAP: Record<string, string> = {
    "Computer Science": COURSE_COLORS[0],
    "Mathematics": COURSE_COLORS[1],
    "Physics": COURSE_COLORS[2],
    "English": COURSE_COLORS[3],
    "History": COURSE_COLORS[4],
    "Economics": COURSE_COLORS[5],
    "Biology": COURSE_COLORS[6],
    "Chemistry": COURSE_COLORS[7],
    // Add more as needed
  };

  const handleAddCourse = useCallback(
    (course: Course) => {
      // Check for time conflicts
      const conflictResult = checkTimeConflict(course, activeDraft.courses);
      if (conflictResult.hasConflict) {
        const conflictingCourse = conflictResult.conflictingCourse!;
        const conflictingSlot = conflictResult.conflictingSlot!;
        toast.error(
          `⚠️ TIME CONFLICT DETECTED! ${course.code} (${course.name}) clashes with ${conflictingCourse.code} (${conflictingCourse.name}) on ${conflictingSlot.day} at ${conflictingSlot.slot}.`,
          {
            duration: 6000,
            style: {
              backgroundColor: '#87281B',
              color: 'white',
              border: '2px solid #87281B',
              fontSize: '16px',
              fontWeight: 'bold',
            },
          }
        );
        return;
      }

      // Assign default color based on department
      const color = DEPARTMENT_COLOR_MAP[course.department] || COURSE_COLORS[0];
      const scheduledCourse: ScheduledCourse = { ...course, color };

      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === activeDraftId
            ? {
                ...draft,
                courses: [...draft.courses, scheduledCourse],
                updatedAt: new Date(),
              }
            : draft
        )
      );
      toast.success(`${course.code} added to timetable`, { duration: 2000 });
    },
    [activeDraftId, activeDraft.courses, checkTimeConflict]
  );

  // Color picker is now only for changing color, not for adding
  const handleColorSelect = useCallback(
    (course: Course, color: string) => {
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === activeDraftId
            ? {
                ...draft,
                courses: draft.courses.map((c) =>
                  c.id === course.id ? { ...c, color } : c
                ),
                updatedAt: new Date(),
              }
            : draft
        )
      );
      setShowColorPicker({ course: courses[0], show: false });
      toast.success("Course color updated", { duration: 2000 });
    },
    [activeDraftId, courses]
  );

  const handleRemoveCourse = useCallback(
    (courseId: string, day: string, slot: string) => {
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === activeDraftId
            ? {
                ...draft,
                courses: draft.courses.filter(
                  (course) =>
                    !(
                      course.id === courseId &&
                      course.timeSlots.some(
                        (ts) => ts.day === day && ts.slot === slot
                      )
                    )
                ),
                updatedAt: new Date(),
              }
            : draft
        )
      );

      // Remove from locked courses if it was locked
      const key = `${courseId}-${day}-${slot}`;
      setLockedCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });

      toast.success("Course removed from timetable", { duration: 2000 });
    },
    [activeDraftId]
  );

  const getLockedCoursesForDraft = useCallback(() => {
    const lockedCoursesList: ScheduledCourse[] = [];

    for (const course of activeDraft.courses) {
      for (const timeSlot of course.timeSlots) {
        const key = `${course.id}-${timeSlot.day}-${timeSlot.slot}`;
        if (lockedCourses.has(key)) {
          lockedCoursesList.push(course);
          break; // Only add the course once even if multiple slots are locked
        }
      }
    }

    return lockedCoursesList;
  }, [activeDraft.courses, lockedCourses]);

  const handleCreateDraft = useCallback(
    (name: string) => {
      const lockedCoursesList = getLockedCoursesForDraft();

      const newDraft: TimetableDraft = {
        id: Date.now().toString(),
        name,
        courses: [...lockedCoursesList], // Include locked courses
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setDrafts((prev) => [...prev, newDraft]);
      setActiveDraftId(newDraft.id);

      if (lockedCoursesList.length > 0) {
        toast.success(
          `Draft "${name}" created with ${lockedCoursesList.length} locked courses`,
          { duration: 3000 }
        );
      } else {
        toast.success(`Draft "${name}" created`, { duration: 2000 });
      }
    },
    [getLockedCoursesForDraft]
  );

  const handleDuplicateDraft = useCallback(
    (sourceId: string, newName: string) => {
      const sourceDraft = drafts.find((d) => d.id === sourceId);
      if (!sourceDraft) return;

      const newDraft: TimetableDraft = {
        id: Date.now().toString(),
        name: newName,
        courses: [...sourceDraft.courses],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setDrafts((prev) => [...prev, newDraft]);
      setActiveDraftId(newDraft.id);
      toast.success(`Draft "${newName}" created from "${sourceDraft.name}"`, {
        duration: 2000,
      });
    },
    [drafts]
  );

  const handleDeleteDraft = useCallback(
    (draftId: string) => {
      if (drafts.length <= 1) {
        toast.error("Cannot delete the last draft", { duration: 2000 });
        return;
      }

      setDrafts((prev) => prev.filter((d) => d.id !== draftId));

      if (activeDraftId === draftId) {
        const remainingDrafts = drafts.filter((d) => d.id !== draftId);
        setActiveDraftId(remainingDrafts[0].id);
      }

      toast.success("Draft deleted", { duration: 2000 });
    },
    [drafts, activeDraftId]
  );

  const handleDownloadTimetable = useCallback(
    async (draftId: string) => {
      const element = document.getElementById("timetable-grid");
      if (!element) return;

      try {
        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
        });

        const link = document.createElement("a");
        link.download = `timetable-${
          drafts.find((d) => d.id === draftId)?.name || "draft"
        }.png`;
        link.href = canvas.toDataURL();
        link.click();

        toast.success("Timetable downloaded successfully", { duration: 2000 });
      } catch (error) {
        toast.error("Failed to download timetable", { duration: 2000 });
      }
    },
    [drafts]
  );

  const handleToggleLock = useCallback(
    (courseId: string, day: string, slot: string) => {
      const key = `${courseId}-${day}-${slot}`;
      setLockedCourses((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
          toast.success("Course unlocked", { duration: 2000 });
        } else {
          newSet.add(key);
          toast.success("Course locked - will appear in new drafts", {
            duration: 3000,
          });
        }
        return newSet;
      });
    },
    []
  );

  const handleRecolorCourse = useCallback(
    (courseId: string, day: string, slot: string, color: string) => {
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === activeDraftId
            ? {
                ...draft,
                courses: draft.courses.map((course) =>
                  course.id === courseId ? { ...course, color } : course
                ),
                updatedAt: new Date(),
              }
            : draft
        )
      );
      toast.success("Course color updated", { duration: 2000 });
    },
    [activeDraftId]
  );

  return (
    <>
      {/* Color Picker Dialog */}
      <Dialog
        open={showColorPicker.show}
        onOpenChange={(open) =>
          setShowColorPicker((prev) => ({ ...prev, show: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Choose Color for {showColorPicker.course?.code}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 p-4">
            {COURSE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(showColorPicker.course, color)}
                className="w-12 h-12 rounded-lg border-2 border-muted hover:border-foreground transition-colors"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col lg:grid lg:grid-cols-[350px_1fr] gap-6 min-w-0">
        {/* Timetable - shows first on mobile, second on desktop */}
        <div className="order-1 lg:order-2 space-y-4 min-w-0">
          <DraftTabs
            drafts={drafts}
            activeDraftId={activeDraftId}
            onCreateDraft={handleCreateDraft}
            onDuplicateDraft={handleDuplicateDraft}
            onDeleteDraft={handleDeleteDraft}
            onSwitchDraft={setActiveDraftId}
            onDownloadTimetable={handleDownloadTimetable}
          >
            <div id="timetable-grid" className="min-w-0">
              <TimetableGrid
                courses={activeDraft.courses}
                onRemoveCourse={handleRemoveCourse}
                onToggleLock={handleToggleLock}
                onRecolorCourse={handleRecolorCourse}
                lockedCourses={lockedCourses}
              />
            </div>
          </DraftTabs>
        </div>

        {/* Course Selection - shows second on mobile, first on desktop */}
        <div className="order-2 lg:order-1 space-y-4 min-w-0">
          <CourseSelection courses={courses} onAddCourse={handleAddCourse} />
        </div>
      </div>
    </>
  );
}
