import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { strapiGet, strapiPost, strapiDelete } from "@/lib/apis/strapi"
import { getUserIdByEmail } from "@/lib/userid"

// GET: Fetch all shared trajectories OR user's own shared trajectory
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const mine = searchParams.get("mine") === "true"

        if (mine) {
            // Fetch only user's own shared trajectory
            const session = await auth()
            if (!session?.user?.email) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }

            const userId = await getUserIdByEmail(session.user.email)
            if (!userId) {
                return NextResponse.json({ data: null, message: "User not found" })
            }

            const response = await strapiGet("/shared-trajectories", {
                filters: {
                    user: { id: { $eq: userId } }
                },
                populate: ["user"]
            })

            const userTrajectory = response?.data?.[0]
            if (!userTrajectory) {
                return NextResponse.json({ data: null, message: "No shared trajectory" })
            }

            const attrs = userTrajectory.attributes || userTrajectory
            return NextResponse.json({
                data: {
                    id: userTrajectory.id,
                    title: attrs.title,
                    description: attrs.description,
                    semesters: attrs.semesters || [],
                    totalCredits: attrs.total_credits,
                    authorName: attrs.user?.data?.attributes?.username || attrs.user?.username || "Anonymous",
                    batch: attrs.user?.data?.attributes?.batch || attrs.user?.batch || "",
                    createdAt: attrs.createdAt
                }
            })
        }

        // Fetch all shared trajectories
        const response = await strapiGet("/shared-trajectories", {
            populate: ["user"],
            sort: ["createdAt:desc"]
        })

        if (!response?.data) {
            return NextResponse.json({ data: [] })
        }

        const trajectories = response.data.map((item: any) => {
            const attrs = item.attributes || item
            const user = attrs.user?.data?.attributes || attrs.user || {}
            return {
                id: item.id,
                title: attrs.title,
                description: attrs.description,
                semesters: attrs.semesters || [],
                totalCredits: attrs.total_credits,
                authorName: user.username || "Anonymous",
                batch: user.batch || "",
                createdAt: attrs.createdAt
            }
        })

        return NextResponse.json({ data: trajectories })
    } catch (error) {
        console.error("Error fetching shared trajectories:", error)
        return NextResponse.json({ error: "Failed to fetch trajectories" }, { status: 500 })
    }
}

// POST: Share user's trajectory
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = await getUserIdByEmail(session.user.email)
        if (!userId) {
            return NextResponse.json({ error: "User not found in Strapi" }, { status: 404 })
        }

        const body = await request.json()
        const { title, description, semesters } = body

        // Validate: minimum 6 semesters
        if (!semesters || semesters.length < 6) {
            return NextResponse.json({
                error: "You need at least 6 semesters to share your trajectory"
            }, { status: 400 })
        }

        // Check if user already has a shared trajectory
        const existingResponse = await strapiGet("/shared-trajectories", {
            filters: {
                user: { id: { $eq: userId } }
            }
        })

        if (existingResponse?.data?.length > 0) {
            return NextResponse.json({
                error: "You already have a shared trajectory. Delete it first to share a new one."
            }, { status: 400 })
        }

        // Strip grades from courses for privacy
        const sanitizedSemesters = semesters.map((sem: any) => ({
            id: sem.id,
            name: sem.name,
            courses: sem.courses.map((course: any) => ({
                id: course.id,
                name: course.name,
                credits: course.credits,
                deptCode: course.deptCode,
                type: course.type,
                isInSemester: course.isInSemester
                // grade intentionally omitted
            }))
        }))

        // Calculate total credits
        const totalCredits = sanitizedSemesters.reduce((acc: number, sem: any) => {
            return acc + sem.courses.reduce((semAcc: number, course: any) => semAcc + course.credits, 0)
        }, 0)

        // Create shared trajectory
        const result = await strapiPost("/shared-trajectories", {
            data: {
                title: title || "My Trajectory",
                description: description || "",
                semesters: sanitizedSemesters,
                total_credits: totalCredits,
                user: userId
            }
        })

        return NextResponse.json({
            success: true,
            data: result.data,
            message: "Trajectory shared successfully!"
        })
    } catch (error) {
        console.error("Error sharing trajectory:", error)
        return NextResponse.json({ error: "Failed to share trajectory" }, { status: 500 })
    }
}

// DELETE: Delete user's own shared trajectory
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = await getUserIdByEmail(session.user.email)
        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Find user's shared trajectory
        const existingResponse = await strapiGet("/shared-trajectories", {
            filters: {
                user: { id: { $eq: userId } }
            }
        })

        const existing = existingResponse?.data?.[0]
        if (!existing) {
            return NextResponse.json({ error: "No shared trajectory to delete" }, { status: 404 })
        }

        // Delete it
        await strapiDelete(`/shared-trajectories/${existing.id}`)

        return NextResponse.json({
            success: true,
            message: "Trajectory deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting trajectory:", error)
        return NextResponse.json({ error: "Failed to delete trajectory" }, { status: 500 })
    }
}
