import { NextRequest, NextResponse } from "next/server";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import timetableData from "@/data/timetable-planner.json";

interface RawCourseData {
  courseCode: string;
  courseTitle: string;
  faculty: string;
  classCounts: number;
  classDetails: string[];
  semester: string;
  year: string;
  description?: string;
  prerequisites?: any[];
}

interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  slot: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  department: string;
  type: 'Core' | 'Elective' | 'Lab' | 'Seminar';
  credits: number;
  timeSlots: TimeSlot[];
}

function parseTimeSlots(classDetails: string[]): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];
  
  if (!classDetails || classDetails.length === 0) {
    return timeSlots;
  }

  // Parse the classDetails string format: "Thursday-15:00-16:30 ( AC-03-LR-003 ) Tuesday-15:00-16:30 ( AC-03-LR-003 )"
  const classString = classDetails[0];
  const dayTimePattern = /(\w+)-(\d{2}:\d{2})-(\d{2}:\d{2})/g;
  let match;

  while ((match = dayTimePattern.exec(classString)) !== null) {
    const [, day, startTime, endTime] = match;
    
    // Convert 24-hour format to 12-hour format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes}${ampm}`;
    };

    const formattedSlot = `${formatTime(startTime)}-${formatTime(endTime)}`;
    
    // Map day names and validate
    const dayMap: { [key: string]: TimeSlot['day'] } = {
      'Monday': 'Monday',
      'Tuesday': 'Tuesday', 
      'Wednesday': 'Wednesday',
      'Thursday': 'Thursday',
      'Friday': 'Friday'
    };

    if (dayMap[day]) {
      timeSlots.push({
        day: dayMap[day],
        slot: formattedSlot
      });
    }
  }

  return timeSlots;
}

function getDepartmentFromCourseCode(courseCode: string): string {
  // Extract department from course code (e.g., "CS-101" -> "Computer Science")
  const prefix = courseCode.split('-')[0];
  
  const departmentMap: { [key: string]: string } = {
    'CS': 'Computer Science',
    'MATH': 'Mathematics',
    'PHYS': 'Physics',
    'ENG': 'English',
    'HIST': 'History',
    'ECON': 'Economics',
    'BIO': 'Biology',
    'CHEM': 'Chemistry',
    'POL': 'Political Science',
    'PSY': 'Psychology',
    'FC': 'Foundation Course',
    'YIF': 'Young India Fellowship'
  };

  return departmentMap[prefix] || 'General Studies';
}

function determineCourseType(courseCode: string): Course['type'] {
  // Determine course type based on course code patterns
  if (courseCode.startsWith('FC-')) {
    return 'Core';
  }
  if (courseCode.includes('LAB') || courseCode.includes('Lab')) {
    return 'Lab';
  }
  if (courseCode.includes('SEM') || courseCode.includes('Seminar')) {
    return 'Seminar';
  }
  // Default logic: courses ending in numbers like 101, 201 are typically core
  if (/\d{3}$/.test(courseCode)) {
    return 'Core';
  }
  return 'Elective';
}

function estimateCredits(classCounts: number): number {
  // Estimate credits based on class counts
  // Most courses with 2 classes per week are 3-4 credits
  // Courses with 1 class per week are usually 2-3 credits
  if (classCounts >= 3) return 4;
  if (classCounts === 2) return 3;
  return 2;
}

function getLastSyncInfo(): { date: string; time: string } {
  const metadata = timetableData[0] as any;
  return {
    date: metadata.dateLastFetched || 'Unknown',
    time: metadata.timeLastFetched || 'Unknown'
  };
}

async function fetchCourses(): Promise<RawCourseData[]> {
  // Skip the first element which contains metadata and filter out non-course entries
  return timetableData.slice(1).filter((item: any) => 
    item.courseCode && item.courseTitle && item.faculty
  ) as RawCourseData[];
}

async function formatCourses(): Promise<Course[]> {
  const rawCourses = await fetchCourses();
  
  return rawCourses.map((course, index) => {
    const timeSlots = parseTimeSlots(course.classDetails);
    
    return {
      id: `${course.courseCode}-${index}`,
      code: course.courseCode,
      name: course.courseTitle,
      professor: course.faculty.replace('@ashoka.edu.in', '').replace(/\./g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      department: getDepartmentFromCourseCode(course.courseCode),
      type: determineCourseType(course.courseCode),
      credits: estimateCredits(course.classCounts),
      timeSlots
    } as Course;
  }).filter(course => course.timeSlots.length > 0); // Only include courses with valid time slots
}

export async function GET() {
  try {
    const courses = await formatCourses();
    const syncInfo = getLastSyncInfo();
    
    return NextResponse.json({
      success: true,
      data: {
        courses,
        syncInfo
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftName, courses, userEmail } = body;

    // Validate required fields
    if (!draftName || !courses || !Array.isArray(courses)) {
      return NextResponse.json(
        { success: false, error: 'Draft name and courses array are required' },
        { status: 400 }
      );
    }

    // Extract only the necessary fields for saving
    const draftData = {
      name: draftName,
      courses: courses.map((course: any) => ({
        code: course.code,
        name: course.name,
        timeSlots: course.timeSlots
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Implement user identification (from session/auth)
    // For now, using userEmail from request body as placeholder
    
    try {
      // TODO: Replace with actual user identification logic
      // Step 1: Get user by email (you'll need to implement this based on your auth system)
      /*
      const userResponse = await strapiGet({
        path: "users",
        params: {
          filters: {
            email: userEmail // or get from session/auth
          }
        }
      });

      if (!userResponse.data || userResponse.data.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const user = userResponse.data[0];
      
      // Step 2: Get current sem planner drafts
      const currentDrafts = user.attributes?.semPlannerDrafts || [];
      
      // Step 3: Append new draft
      const updatedDrafts = [...currentDrafts, draftData];
      
      // Step 4: Update user with new drafts array
      await strapiPut({
        path: `users/${user.id}`,
        data: {
          semPlannerDrafts: updatedDrafts
        }
      });
      */

      // Placeholder response - replace with actual Strapi implementation
      console.log('Draft data to save:', draftData);
      console.log('User email (if provided):', userEmail);
      
      return NextResponse.json({
        success: true,
        message: 'Draft saved successfully (placeholder implementation)',
        data: draftData
      });

    } catch (strapiError) {
      console.error('Strapi error:', strapiError);
      return NextResponse.json(
        { success: false, error: 'Failed to save draft to user profile' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
