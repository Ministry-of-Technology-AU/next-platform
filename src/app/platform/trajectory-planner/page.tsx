import { CoursePlannerProvider } from './course-planner-context';
import { CoursePlannerBoard } from './_components/course-planner-board';
import { strapiGet } from "@/lib/apis/strapi";
import { getAuthenticatedUser } from "@/lib/auth";

async function fetchTrajectoryData() {
    try {
        const user = await getAuthenticatedUser();

        if (!user || !user.email) {
            return null;
        }

        // Get user ID from Strapi using email
        const userResponse = await strapiGet("users", {
            filters: {
                email: user.email
            },
            fields: ["id", "email", "course_trajectory"]
        });

        const users = Array.isArray(userResponse) ? userResponse : (userResponse as any)?.results || [];
        const strapiUser = users[0];

        if (!strapiUser) {
            return null;
        }

        // Return the course trajectory data
        return strapiUser.course_trajectory || null;

    } catch (error) {
        console.error("Error fetching trajectory:", error);
        return null;
    }
}

export default async function Page() {
    const trajectoryData = await fetchTrajectoryData();

    return (
        <CoursePlannerProvider initialData={trajectoryData}>
            <div className="h-full">
                <CoursePlannerBoard />
            </div>
        </CoursePlannerProvider>
    );
}