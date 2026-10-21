import { z } from "zod"
import { toGradeKey } from "@/app/platform/cgpa-planner/utils"
import { COURSE_TYPES, CREDIT_OPTIONS, DEPARTMENT_CODES, PLAN_LIMITS } from "./data"
import type {
    Course,
    CoursePlannerState,
    CourseType,
    Credits,
    DegreeTemplate,
    DepartmentCode,
    Grade,
    IdealTrajectory,
    Semester,
    SharedSemester,
} from "./types"

/**
 * Validates trajectory JSON from outside the planner: request bodies, plans saved on the user
 * (including ones saved before the planner used CGPA grades) and templates reps edit in Strapi.
 * Lenient field by field, so one bad course never loses a whole plan. Unknown keys are dropped.
 */


const isCredits = (value: unknown): value is Credits => CREDIT_OPTIONS.includes(value as Credits)
const isCourseType = (value: unknown): value is CourseType => COURSE_TYPES.includes(value as CourseType)
const isDepartment = (value: unknown): value is DepartmentCode =>
    value === "" || DEPARTMENT_CODES.includes(value as Exclude<DepartmentCode, "">)

const clip = (max: number) => z.string().trim().transform((value) => value.slice(0, max))

// `.catch` before any transform: zod 4 treats a missing key as a failure, and the fallback covers it.
const GradeSchema = z
    .string()
    .catch("")
    .transform((raw): Grade => {
        // toGradeKey also reads the bare "F" and "TP" that plans saved before the CGPA grades used.
        return toGradeKey(raw)
    })

const CourseFieldsSchema = z.object({
    name: clip(PLAN_LIMITS.nameLength).catch(""),
    credits: z.custom<Credits>(isCredits).catch(4),
    deptCode: z.custom<DepartmentCode>(isDepartment).catch(""),
    type: z.custom<CourseType>(isCourseType).catch("Major"),
    isInSemester: z.boolean().optional().catch(undefined),
    grade: GradeSchema,
})

/** The course without its grade: for templates and for anything shared with other students. */
function withoutGrade({ name, credits, deptCode, type, isInSemester }: Omit<Course, "id">): Omit<Course, "id" | "grade"> {
    return isInSemester === undefined ? { name, credits, deptCode, type } : { name, credits, deptCode, type, isInSemester }
}

const IdSchema = z.union([z.string(), z.number()]).transform(String).pipe(z.string().min(1).max(64))

const CourseSchema = CourseFieldsSchema.extend({ id: IdSchema })

/** Parses each item on its own and keeps the ones that pass. */
function parseEach<T>(schema: z.ZodType<T>, items: unknown[]): T[] {
    return items.flatMap((item) => {
        const parsed = schema.safeParse(item)
        return parsed.success ? [parsed.data] : []
    })
}

const toCourse = ({ grade, ...rest }: z.infer<typeof CourseSchema>): Course => (grade ? { ...rest, grade } : rest)

const SemesterSchema = z.object({
    id: IdSchema,
    name: clip(PLAN_LIMITS.nameLength).catch("Semester"),
    // Trimmed, not rejected: a semester over the cap keeps its first courses.
    courses: z.array(z.unknown()).catch([]).transform((items) => items.slice(0, PLAN_LIMITS.coursesPerSemester)),
})

function toSemester(raw: z.infer<typeof SemesterSchema>): Semester {
    return { id: raw.id, name: raw.name, courses: parseEach(CourseSchema, raw.courses).map(toCourse) }
}

const PlannerStateSchema = z.object({
    semesters: z.array(z.unknown()).max(PLAN_LIMITS.semesters),
    availableCourses: z.array(z.unknown()).max(PLAN_LIMITS.unplacedCourses),
})

/** A clean plan, or null when the input isn't a plan at all (or is over the size limits). */
export function normalisePlannerState(raw: unknown): CoursePlannerState | null {
    const parsed = PlannerStateSchema.safeParse(raw)
    if (!parsed.success) return null
    return {
        semesters: parseEach(SemesterSchema, parsed.data.semesters).map(toSemester),
        availableCourses: parseEach(CourseSchema, parsed.data.availableCourses).map(toCourse),
    }
}

/** POST /api/platform/trajectory-planner */
export const SaveTrajectoryBodySchema = z.object({
    state: z.unknown().transform((raw, ctx) => {
        const state = normalisePlannerState(raw)
        if (!state) ctx.addIssue({ code: "custom", message: "Not a trajectory, or too large" })
        return state ?? { semesters: [], availableCourses: [] }
    }),
})

/** Semesters as they are shared and stored in the repository: grades dropped. */
export const SharedSemestersSchema = z
    .array(z.unknown())
    .max(PLAN_LIMITS.semesters)
    .transform((items): SharedSemester[] =>
        parseEach(SemesterSchema, items)
            .map(toSemester)
            .map(({ id, name, courses }) => ({ id, name, courses: courses.map((course) => ({ id: course.id, ...withoutGrade(course) })) })),
    )

/** POST /api/platform/trajectory-planner/shared. Grades are dropped here, before anything is stored. */
export const ShareTrajectoryBodySchema = z.object({
    title: z
        .string()
        .catch("")
        .transform((value) => value.trim().slice(0, PLAN_LIMITS.titleLength))
        .pipe(z.string().min(1, "Give your trajectory a title before sharing it.")),
    description: clip(PLAN_LIMITS.descriptionLength).optional().default(""),
    semesters: SharedSemestersSchema,
})

// ---------------------------------------------------------------------------
// Templates edited by department reps (Strapi `dept-infos`)
// ---------------------------------------------------------------------------


const figure = z.coerce.number().refine(Number.isFinite).catch(0)

const DegreeTemplateSchema = z.object({
    id: IdSchema,
    name: clip(PLAN_LIMITS.nameLength),
    batch: clip(PLAN_LIMITS.nameLength).catch(""),
    policyDocPath: z.string().optional().catch(undefined),
    requiredCredits: z
        .object({
            major: figure,
            minor: figure,
            fc: figure,
            cc: figure,
            concentration: figure,
            openCredits: figure,
            total: figure,
        })
        .catch({ major: 0, minor: 0, fc: 0, cc: 0, concentration: 0, openCredits: 0, total: 0 }),
    defaultCourses: z.array(z.unknown()).catch([]),
})

const IdealSemesterSchema = z.object({
    semester: figure,
    name: clip(PLAN_LIMITS.nameLength).catch(""),
    courses: z.array(z.unknown()).catch([]),
})

const IdealTrajectorySchema = z.object({
    templateId: IdSchema,
    semesters: z.array(z.unknown()).catch([]),
    notes: z.string().optional().catch(undefined),
    policyDocPath: z.string().optional().catch(undefined),
})

const templateCourses = (items: unknown[]) => parseEach(CourseFieldsSchema, items).map(withoutGrade)

export function parseDegreeTemplates(items: unknown[]): DegreeTemplate[] {
    return parseEach(DegreeTemplateSchema, items).map((template) => ({
        ...template,
        defaultCourses: templateCourses(template.defaultCourses),
    }))
}

export function parseIdealTrajectories(items: unknown[]): IdealTrajectory[] {
    return parseEach(IdealTrajectorySchema, items).map((trajectory) => ({
        ...trajectory,
        semesters: parseEach(IdealSemesterSchema, trajectory.semesters).map((semester) => ({
            ...semester,
            courses: templateCourses(semester.courses),
        })),
    }))
}
