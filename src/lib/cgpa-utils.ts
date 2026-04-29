import { ParsedCGPAData, ParsedSemester, ParsedCourse, GradeKey, AttemptSource, CourseAttempt } from "@/lib/cgpa-types";
import { gradePointsMap } from "@/app/platform/cgpa-planner/data";

/**
 * Validates if data is in the expected frontend format
 */
export function isFrontendFormat(data: any): data is ParsedCGPAData {
  return (
    data &&
    typeof data.degreeCGPA === 'number' &&
    typeof data.majorCGPA === 'number' &&
    typeof data.totalCredits === 'number' &&
    Array.isArray(data.semesters) &&
    data.semesters.every((semester: any) =>
      typeof semester.semester === 'string' &&
      Array.isArray(semester.courses) &&
      typeof semester.gpa === 'number' &&
      typeof semester.semesterCreditsEarned === 'number' &&
      typeof semester.cgpa === 'number'
    )
  );
}

/**
 * Sanitizes and validates CGPA data before saving
 */
export function sanitizeCGPAData(data: any): ParsedCGPAData {
  if (!isFrontendFormat(data)) {
    throw new Error('Invalid CGPA data format');
  }

  // Ensure numeric values are properly formatted
  const sanitized: ParsedCGPAData = {
    degreeCGPA: Number(data.degreeCGPA.toFixed(2)),
    majorCGPA: Number(data.majorCGPA.toFixed(2)),
    totalCredits: Math.round(data.totalCredits),
    semesters: data.semesters.map((semester: ParsedSemester) => ({
      ...semester,
      gpa: Number(semester.gpa.toFixed(2)),
      semesterCreditsEarned: Math.round(semester.semesterCreditsEarned),
      cgpa: Number(semester.cgpa.toFixed(2)),
      courses: semester.courses.map((course: ParsedCourse) => ({
        ...course,
        creditsRegistered: course.creditsRegistered !== null && course.creditsRegistered !== undefined ? Math.round(course.creditsRegistered) : null,
        creditsEarned: course.creditsEarned !== null && course.creditsEarned !== undefined ? Math.round(course.creditsEarned) : null,
        gradePoints: course.gradePoints !== null && course.gradePoints !== undefined ? Number(course.gradePoints.toFixed(1)) : null
      }))
    }))
  };

  return sanitized;
}

export const getCourseKey = (course: ParsedCourse) => {
  const rawCode = course.code?.trim();
  if (rawCode && rawCode !== '--') {
    return rawCode.toUpperCase();
  }

  const rawTitle = course.title?.trim();
  if (rawTitle && rawTitle !== '--') {
    return rawTitle.toUpperCase();
  }

  return null;
};

export const normalizeGrade = (grade: string | null | undefined): GradeKey | null => {
  if (!grade) return null;
  const trimmed = grade.trim();
  if (!trimmed || trimmed === '--' || trimmed === 'Select') return null;
  if (Object.prototype.hasOwnProperty.call(gradePointsMap, trimmed)) {
    return trimmed as GradeKey;
  }
  return null;
};

export const createAttempt = ({
  key,
  grade,
  creditsRegistered,
  creditsEarned,
  gradePointsValue,
  source,
  sIdx,
  cIdx,
}: {
  key: string;
  grade: GradeKey | null;
  creditsRegistered: number | null | undefined;
  creditsEarned: number | null | undefined;
  gradePointsValue?: number | null;
  source: AttemptSource;
  sIdx: number | null;
  cIdx: number | null;
}): CourseAttempt | null => {
  if (!grade) return null;

  const registered = typeof creditsRegistered === 'number' && !Number.isNaN(creditsRegistered) ? creditsRegistered : 0;
  const earned = typeof creditsEarned === 'number' && !Number.isNaN(creditsEarned) ? creditsEarned : 0;
  let effectiveCredits = registered > 0 ? registered : earned;
  let gradePoints = 0;
  let gpaCredits = 0;
  let earnedCredits = 0;
  let ratio: number | null = null;

  // P/F auto-detection mapping
  // If it's P or F (w P/F), don't count towards gpaCredits, just earned credits
  if (grade === 'AU') {
    return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source, sIdx, cIdx };
  }

  if (grade === 'P') {
    earnedCredits = effectiveCredits;
    return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source, sIdx, cIdx };
  }

  if (grade === 'F (w P/F)') {
    // Did not pass, no earned credits, no gpa credits
    return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source, sIdx, cIdx };
  }

  if (grade === 'TP (w credits)') {
    earnedCredits = Math.max(earned, Math.max(effectiveCredits, 2));
    return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source, sIdx, cIdx };
  }

  if (grade === 'TP (w/o credits)') {
    return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source, sIdx, cIdx };
  }

  effectiveCredits = effectiveCredits > 0 ? effectiveCredits : earned;
  if (effectiveCredits <= 0) {
    return null;
  }

  const mapped = gradePointsMap[grade as keyof typeof gradePointsMap];
  if (typeof mapped === 'number') {
    gpaCredits = effectiveCredits;
    gradePoints = mapped * gpaCredits;
  } else if (typeof gradePointsValue === 'number') {
    gpaCredits = effectiveCredits;
    gradePoints = gradePointsValue;
  }

  earnedCredits = Math.max(earned, effectiveCredits);
  // if F (w/o P/F), earned credits should be 0, but usually AMS has it as 0 anyway.
  if (grade.startsWith('F')) {
    earnedCredits = 0;
  }

  ratio = gpaCredits > 0 ? gradePoints / gpaCredits : null;

  return { key, gradeLabel: grade, gradePoints, gpaCredits, earnedCredits, ratio, source, sIdx, cIdx };
};

export const chooseBetterAttempt = (currentBest: CourseAttempt, candidate: CourseAttempt): CourseAttempt => {
  const bestRatio = currentBest.ratio;
  const candidateRatio = candidate.ratio;

  if (candidateRatio !== null && bestRatio !== null) {
    if (candidateRatio !== bestRatio) {
      return candidateRatio > bestRatio ? candidate : currentBest;
    }

    if (candidate.gradePoints !== currentBest.gradePoints) {
      return candidate.gradePoints > currentBest.gradePoints ? candidate : currentBest;
    }

    return candidate.gpaCredits < currentBest.gpaCredits ? candidate : currentBest;
  }

  if (candidateRatio !== null && bestRatio === null) {
    if (candidateRatio <= 0) {
      return currentBest;
    }
    return candidate;
  }

  if (candidateRatio === null && bestRatio !== null) {
    if (bestRatio <= 0) {
      return candidate;
    }
    return currentBest;
  }

  if (candidate.earnedCredits !== currentBest.earnedCredits) {
    return candidate.earnedCredits > currentBest.earnedCredits ? candidate : currentBest;
  }

  return currentBest;
};

export function parseGradeDataText(text: string): ParsedCGPAData {
  const lines = text.split('\n').map((line) => line.trim());
  const data: ParsedCGPAData = {
    degreeCGPA: 0,
    majorCGPA: 0,
    totalCredits: 0,
    semesters: []
  };

  let currentSemester: ParsedSemester | null = null;
  let courseSection = false;

  for (const line of lines) {
    if (line.includes('Degree/Diploma CGPA')) {
      const parts = line.match(/Degree\/Diploma CGPA: (\d+\.\d+).*CGPA for Major: (\d+\.\d+).*Total counted credits: (\d+)/);
      if (parts) {
        data.degreeCGPA = parseFloat(parts[1]);
        data.majorCGPA = parseFloat(parts[2]);
        data.totalCredits = parseInt(parts[3], 10);
      }
    } else if (line.startsWith('Monsoon') || line.startsWith('Spring') || line.startsWith('Summer')) {
      if (currentSemester) {
        data.semesters.push(currentSemester);
      }
      currentSemester = {
        semester: line,
        courses: [],
        gpa: 0,
        semesterCreditsEarned: 0,
        cgpa: 0
      };
      courseSection = true;
    } else if (line.includes('GPA') && line.includes('Semester Credits Earned') && line.includes('CGPA')) {
      const gpaMatch = line.match(/GPA:\s*(\d+\.\d+)/);
      const creditsMatch = line.match(/Semester Credits Earned:\s*(\d+)/);
      const cgpaMatch = line.match(/CGPA:\s*(\d+\.\d+)/);

      if (currentSemester) {
        if (gpaMatch) currentSemester.gpa = parseFloat(gpaMatch[1]);
        if (creditsMatch) currentSemester.semesterCreditsEarned = parseInt(creditsMatch[1], 10);
        if (cgpaMatch) currentSemester.cgpa = parseFloat(cgpaMatch[1]);
      }
    } else if (courseSection && line.match(/^\d+/) && !line.includes('systems.support')) {
      const [_, code, title, creditsRegistered, grade, creditsEarned, gradePoints] = line.split(/\t+/);
      if (currentSemester) {
        currentSemester.courses.push({
          code,
          title,
          creditsRegistered: parseFloat(creditsRegistered) || null,
          grade: grade !== '--' ? grade : null,
          creditsEarned: parseFloat(creditsEarned) || null,
          gradePoints: parseFloat(gradePoints) || null,
        });
      }
    }
  }

  if (currentSemester) {
    data.semesters.push(currentSemester);
  }

  return data;
}

export function computeBestCourseSummary(
  rawPastSemesters: ParsedSemester[],
  currentUpcomingSemester: ParsedSemester | null,
  currentSemesterGrades: Record<number, string>,
  userDefinedRetakes: Record<number, string> = {},
  ignoredRetakeKeys: string[] = [],
  detachedPastIndices: string[] = [],
  userDefinedPastRetakes: Record<string, string> = {}
) {
  const attempts = new Map<string, CourseAttempt[]>();
  const ignoredSet = new Set(ignoredRetakeKeys);
  const detachedSet = new Set(detachedPastIndices);

  const pushAttempt = (key: string, attempt: CourseAttempt | null) => {
    if (!attempt) return;
    if (!attempts.has(key)) {
      attempts.set(key, [attempt]);
    } else {
      attempts.get(key)!.push(attempt);
    }
  };

  // Past Semesters
  rawPastSemesters.forEach((semester, sIdx) => {
    semester.courses.forEach((course, cIdx) => {
      const baseKey = getCourseKey(course);
      if (!baseKey) return;
      // 0 Credits logic: NEVER count as a retake (always separate bucket)
      let key = baseKey;
      if ((course.creditsRegistered || 0) === 0 && (course.creditsEarned || 0) === 0) {
        key = `${baseKey}_past_${sIdx}_${cIdx}_0c`;
      } else if (userDefinedPastRetakes[`${sIdx}-${cIdx}`]) {
        key = userDefinedPastRetakes[`${sIdx}-${cIdx}`];
      } else if (detachedSet.has(`${sIdx}-${cIdx}`)) {
        key = `${baseKey}_past_${sIdx}_${cIdx}_detached`;
      }

      const normalizedGrade = normalizeGrade(course.grade);
      if (!normalizedGrade) return;
      const attempt = createAttempt({
        key: baseKey, // keep original key for the attempt itself
        grade: normalizedGrade,
        creditsRegistered: course.creditsRegistered,
        creditsEarned: course.creditsEarned,
        gradePointsValue: course.gradePoints,
        source: 'past',
        sIdx,
        cIdx,
      });
      pushAttempt(key, attempt);
    });
  });

  // Current Semester
  if (currentUpcomingSemester) {
    currentUpcomingSemester.courses.forEach((course, index) => {
      const baseKey = getCourseKey(course);
      if (!baseKey) return;

      let key = baseKey;

      const isZeroCredit = (course.creditsRegistered || 0) === 0;

      if (isZeroCredit) {
        // If 0 credits, NEVER a retake.
        key = `${baseKey}_current_${index}_0c`;
      } else if (userDefinedRetakes[index]) {
        // Explicit user retake link
        key = userDefinedRetakes[index];
      } else if (ignoredSet.has(baseKey)) {
        // Explicitly ignored auto-retake link
        key = `${baseKey}_current_${index}_ignored`;
      }

      const selectedGrade = normalizeGrade(currentSemesterGrades[index]);
      if (!selectedGrade) return;
      const attempt = createAttempt({
        key: baseKey,
        grade: selectedGrade,
        creditsRegistered: course.creditsRegistered,
        creditsEarned: null,
        source: 'current',
        sIdx: null,
        cIdx: index,
      });
      pushAttempt(key, attempt);
    });
  }

  let totalGradePoints = 0;
  let totalGpaCredits = 0;
  let totalEarnedCredits = 0;
  const retakenPastKeys = new Set<string>();
  const autoDetectedRetakeKeysList: string[] = [];
  const overwrittenPastIndices: string[] = [];
  const activeRetakePastIndices: string[] = [];

  // Identify auto detected retakes
  const seenPast = new Set<string>();
  rawPastSemesters.forEach((sem) => sem.courses.forEach((course) => {
    const key = getCourseKey(course);
    const isZeroCredit = (course.creditsRegistered || 0) === 0 && (course.creditsEarned || 0) === 0;
    if (key && !isZeroCredit) seenPast.add(key);
  }));

  if (currentUpcomingSemester) {
    currentUpcomingSemester.courses.forEach((course, idx) => {
      const key = getCourseKey(course);
      const isZeroCredit = (course.creditsRegistered || 0) === 0;
      // auto-detected only if seen in past, not zero credit, and not explicitly ignored by user
      if (key && !isZeroCredit && seenPast.has(key)) {
        autoDetectedRetakeKeysList.push(key);
      }
    });
  }

  attempts.forEach((courseAttempts, bucketKey) => {
    // Find if this bucket had multiple valid attempts
    if (courseAttempts.length > 1) {
      retakenPastKeys.add(bucketKey);
    }

    const bestAttempt = courseAttempts.reduce<CourseAttempt | null>((best, candidate) => {
      if (!candidate) return best;
      if (!best) return candidate;
      return chooseBetterAttempt(best, candidate);
    }, null);

    if (!bestAttempt) return;

    // Record overwritten and active retakes for past semesters
    if (courseAttempts.length > 1) {
      courseAttempts.forEach(attempt => {
        if (attempt.source === 'past' && attempt.sIdx !== null && attempt.cIdx !== null) {
          if (attempt === bestAttempt) {
            activeRetakePastIndices.push(`${attempt.sIdx}-${attempt.cIdx}`);
          } else {
            overwrittenPastIndices.push(`${attempt.sIdx}-${attempt.cIdx}`);
          }
        }
      });
    }

    totalGradePoints += bestAttempt.gradePoints;
    totalGpaCredits += bestAttempt.gpaCredits;
    totalEarnedCredits += bestAttempt.earnedCredits;
  });

  return {
    totalGradePoints,
    totalGpaCredits,
    totalEarnedCredits,
    retakenPastKeys: Array.from(retakenPastKeys),
    autoDetectedRetakeKeys: autoDetectedRetakeKeysList,
    overwrittenPastIndices,
    activeRetakePastIndices,
  };
}