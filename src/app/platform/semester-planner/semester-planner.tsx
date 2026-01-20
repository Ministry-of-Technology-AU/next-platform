"use client";

import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
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
import { useTour } from "@/components/guided-tour";
import { TourStep } from "@/components/guided-tour";


interface SemesterPlannerClientProps {
  courses: Course[];
  initialDrafts?: TimetableDraft[];
}


export function SemesterPlannerClient({ courses, initialDrafts }: SemesterPlannerClientProps) {
  const { isActive: isTourActive, stopTour } = useTour();
  const [sampleCourseId, setSampleCourseId] = useState<string | null>(null);

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
  // State for color picker
  const [showColorPicker, setShowColorPicker] = useState<{
    show: boolean;
    course: Course | null;
  }>({
    show: false,
    course: null,
  });

  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Shift + O
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleToggleFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFullScreen]);

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
      // Don't add if it's the sample course being tracked
      if (sampleCourseId && course.id === sampleCourseId) {
        return;
      }

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
      const hasSaturday = course.timeSlots.some((ts) => ts.day === "Saturday");

      if (hasSaturday) {
        toast.success(
          `${course.code} added. This includes Saturday classes - scroll right to view.`,
          { duration: 4000 }
        );
      } else {
        toast.success(`${course.code} added to timetable`, { duration: 2000 });
      }
    },
    [activeDraftId, activeDraft.courses, checkTimeConflict, sampleCourseId]
  );

  // Add a sample course for the tour step
  const handleAddSampleCourse = useCallback(() => {
    if (courses.length === 0) return;
    const sampleCourse = courses[0];
    setSampleCourseId(sampleCourse.id);
    handleAddCourse(sampleCourse);
  }, [courses, handleAddCourse]);

  // Remove the sample course when tour ends
  useEffect(() => {
    if (!isTourActive && sampleCourseId) {
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === activeDraftId
            ? {
              ...draft,
              courses: draft.courses.filter((c) => c.id !== sampleCourseId),
              updatedAt: new Date(),
            }
            : draft
        )
      );
      setSampleCourseId(null);
    }
  }, [isTourActive, sampleCourseId, activeDraftId]);

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

  const handleRenameDraft = useCallback((draftId: string, newName: string) => {
    if (!newName.trim()) return;
    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, name: newName.trim(), updatedAt: new Date() } : d));
  }, []);

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
      // We want to capture the fullscreen grid to avoid clipping issues on mobile/narrow screens.
      // If not already in fullscreen, we'll temporarily switch to it.
      const wasFullScreen = isFullScreen;

      if (!wasFullScreen) {
        setIsFullScreen(true);
        // Wait for dialog animation and render
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      try {
        const element = document.getElementById("timetable-grid-fullscreen");
        if (!element) {
          console.error("Timetable fullscreen element not found");
          toast.error("Could not find timetable grid. Please try again.", { duration: 3000 });
          return;
        }

        toast.info("Generating screenshot...", { duration: 2000 });

        // Wait a bit more to ensure the element is fully stable
        await new Promise(resolve => setTimeout(resolve, 200));

        // Detect if dark mode is active
        const isDarkMode = document.documentElement.classList.contains("dark");
        const backgroundColor = isDarkMode ? "#09090b" : "#ffffff";

        const dataUrl = await toPng(element, {
          backgroundColor: backgroundColor,
          pixelRatio: 2,
          width: element.scrollWidth,
          height: element.scrollHeight,
          style: {
            transform: "none",
            transformOrigin: "top left",
            overflow: "visible",
            // Force the element to be the full scroll width/height
            minWidth: `${element.scrollWidth}px`,
            minHeight: `${element.scrollHeight}px`,
            maxWidth: "none",
            maxHeight: "none",
          },
          filter: (node) => {
            // Skip script and style nodes that might cause issues
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              if (el.getAttribute?.("data-slot") === "tooltip-content") {
                return false;
              }
            }
            return node.tagName !== "SCRIPT" && node.tagName !== "STYLE";
          }
        });

        if (!dataUrl || dataUrl === "data:,") {
          throw new Error("Failed to generate image data");
        }

        const link = document.createElement("a");
        const draftName = drafts.find((d) => d.id === draftId)?.name || "draft";
        link.download = `timetable-${draftName.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        link.href = dataUrl;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Timetable downloaded successfully! 📸", { duration: 3000 });

      } catch (error) {
        console.error("Download error:", error);
        toast.error(`Failed to download timetable: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          duration: 4000
        });
      } finally {
        // Restore previous state if we toggled it
        if (!wasFullScreen) {
          setIsFullScreen(false);
        }
      }
    },
    [drafts, isFullScreen]
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
                onClick={() => {
                  if (showColorPicker.course) {
                    handleColorSelect(showColorPicker.course, color);
                  }
                }}
                className="w-12 h-12 rounded-lg border-2 border-muted hover:border-foreground transition-colors"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Screen Timetable Dialog */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="w-[98vw] max-w-[98vw] p-6 overflow-x-auto">
          <DialogHeader className="mb-4 hidden">
            {/* Hidden title for accessibility but visually relying on Tabs */}
            <DialogTitle>Full Screen Timetable</DialogTitle>
          </DialogHeader>
          <div className="min-w-[800px]">
            <DraftTabs
              drafts={drafts}
              activeDraftId={activeDraftId}
              onCreateDraft={handleCreateDraft}
              onDuplicateDraft={handleDuplicateDraft}
              onDeleteDraft={handleDeleteDraft}
              onSwitchDraft={setActiveDraftId}
              onDownloadTimetable={handleDownloadTimetable}
              onRenameDraft={handleRenameDraft}
              onToggleFullScreen={() => { }}
              isFullScreenMode={true}
            >
              <TimetableGrid
                courses={activeDraft.courses}
                onRemoveCourse={handleRemoveCourse}
                onToggleLock={handleToggleLock}
                onRecolorCourse={handleRecolorCourse}
                lockedCourses={lockedCourses}
                id="timetable-grid-fullscreen"
              />
            </DraftTabs>
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
            onRenameDraft={handleRenameDraft}
            onToggleFullScreen={handleToggleFullScreen}
          >

            <TourStep
              id="timetable-grid"
              order={5}
              title="Timetable Grid"
              content="This is your timetable grid. Courses appear here once you add them. You can see time slots for each day, lock courses, and change their colors."
              position="left"
              onOpen={handleAddSampleCourse}
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
            </TourStep>
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
