"use client";

import { useState, useCallback } from "react";
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
}

export function SemesterPlannerClient({ courses }: SemesterPlannerClientProps) {
  const [drafts, setDrafts] = useState<TimetableDraft[]>([
    {
      id: "1",
      name: "Draft 1",
      courses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [activeDraftId, setActiveDraftId] = useState("1");
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
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  const handleAddCourse = useCallback(
    (course: Course) => {
      // Check for time conflicts
      if (checkTimeConflict(course, activeDraft.courses)) {
        toast.error(
          "Time conflict detected! This course overlaps with an existing course.",
          {
            duration: 3000,
          }
        );
        return;
      }

      // Show color picker
      setShowColorPicker({ course, show: true });
    },
    [activeDraftId, activeDraft.courses, checkTimeConflict]
  );

  const handleColorSelect = useCallback(
    (course: Course, color: string) => {
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

      setShowColorPicker({ course: courses[0], show: false });
      toast.success(`${course.code} added to timetable`, { duration: 2000 });
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

      <div className="flex flex-col lg:grid lg:grid-cols-[350px_1fr] gap-6">
        {/* Timetable - shows first on mobile */}
        <div className="order-2 lg:order-2 space-y-4">
          <DraftTabs
            drafts={drafts}
            activeDraftId={activeDraftId}
            onCreateDraft={handleCreateDraft}
            onDuplicateDraft={handleDuplicateDraft}
            onDeleteDraft={handleDeleteDraft}
            onSwitchDraft={setActiveDraftId}
            onDownloadTimetable={handleDownloadTimetable}
          >
            <div id="timetable-grid">
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

        {/* Course Selection - shows second on mobile */}
        <div className="order-1 lg:order-1 space-y-4">
          <CourseSelection courses={courses} onAddCourse={handleAddCourse} />
        </div>
      </div>
    </>
  );
}
