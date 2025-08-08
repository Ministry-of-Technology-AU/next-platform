import { Calendar, Clock } from "lucide-react";
import { Toaster } from "sonner";
import { SemesterPlannerClient } from "./semester-planner";

// Mock data - in real app this would come from API
const mockCourses = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Computer Science",
    professor: "Dr. Smith",
    department: "Computer Science",
    type: "Core" as const,
    credits: 3,
    timeSlots: [
      { day: "Monday" as const, slot: "8:30am-10:00am" },
      { day: "Wednesday" as const, slot: "8:30am-10:00am" },
      { day: "Friday" as const, slot: "8:30am-10:00am" },
    ],
  },
  {
    id: "2",
    code: "MATH201",
    name: "Calculus II",
    professor: "Dr. Johnson",
    department: "Mathematics",
    type: "Core" as const,
    credits: 4,
    timeSlots: [
      { day: "Tuesday" as const, slot: "10:10am-11:40am" },
      { day: "Thursday" as const, slot: "10:10am-11:40am" },
    ],
  },
  {
    id: "3",
    code: "PHYS101",
    name: "Physics I",
    professor: "Dr. Brown",
    department: "Physics",
    type: "Core" as const,
    credits: 3,
    timeSlots: [
      { day: "Monday" as const, slot: "11:50am-1:20pm" },
      { day: "Wednesday" as const, slot: "11:50am-1:20pm" },
    ],
  },
  {
    id: "4",
    code: "ENG102",
    name: "English Composition",
    professor: "Prof. Davis",
    department: "English",
    type: "Core" as const,
    credits: 3,
    timeSlots: [
      { day: "Tuesday" as const, slot: "3:00pm-4:30pm" },
      { day: "Thursday" as const, slot: "3:00pm-4:30pm" },
    ],
  },
  {
    id: "5",
    code: "CS201",
    name: "Data Structures",
    professor: "Dr. Wilson",
    department: "Computer Science",
    type: "Core" as const,
    credits: 3,
    timeSlots: [
      { day: "Monday" as const, slot: "4:40pm-6:10pm" },
      { day: "Wednesday" as const, slot: "4:40pm-6:10pm" },
    ],
  },
  {
    id: "6",
    code: "ART101",
    name: "Introduction to Art",
    professor: "Prof. Garcia",
    department: "Fine Arts",
    type: "Elective" as const,
    credits: 2,
    timeSlots: [{ day: "Friday" as const, slot: "3:00pm-4:30pm" }],
  },
  {
    id: "7",
    code: "CS102",
    name: "Programming Fundamentals",
    professor: "Dr. Lee",
    department: "Computer Science",
    type: "Core" as const,
    credits: 3,
    timeSlots: [
      { day: "Monday" as const, slot: "8:30am-10:00am" }, // Conflicts with CS101
      { day: "Friday" as const, slot: "10:10am-11:40am" },
    ],
  },
];

export default function SemesterPlannerPage() {
  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Semester Planner</h1>
            <p className="text-muted-foreground">
              Plan and organize your course schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
          <span>
            Last synced on {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString()}
          </span>
        </div>

        <SemesterPlannerClient courses={mockCourses} />
      </div>
      <Toaster position="top-right" />
    </>
  );
}
