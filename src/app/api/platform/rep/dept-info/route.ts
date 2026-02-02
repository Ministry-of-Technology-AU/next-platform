import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDeptForRep, DEPT_NAMES } from "@/lib/constants/dept-rep-map"
import { strapiGet, strapiPut, strapiPost } from "@/lib/apis/strapi"

// GET: Fetch dept_info for authenticated rep's department
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const deptCode = getDeptForRep(session.user.email)

        if (!deptCode) {
            return NextResponse.json({ error: "Not a department representative" }, { status: 403 })
        }

        // Fetch from Strapi
        const response = await strapiGet("/dept-infos", {
            filters: {
                dept_code: { $eq: deptCode }
            }
        })

        const deptInfo = response?.data?.[0]

        if (!deptInfo) {
            // Return empty structure if no data in Strapi yet
            return NextResponse.json({
                data: null,
                dept_code: deptCode,
                dept_name: DEPT_NAMES[deptCode] || deptCode,
                message: "No data in Strapi. You can create it via the dashboard."
            })
        }

        // Strapi v4 returns data in attributes, v5 returns flat
        const attrs = deptInfo.attributes || deptInfo

        return NextResponse.json({
            data: {
                id: deptInfo.id,
                dept_code: attrs.dept_code,
                dept_name: attrs.dept_name,
                degree_templates: attrs.degree_templates || [],
                ideal_trajectories: attrs.ideal_trajectories || [],
                last_updated_by: attrs.last_updated_by,
                updatedAt: attrs.updatedAt
            }
        })
    } catch (error) {
        console.error("Error fetching dept info:", error)
        return NextResponse.json({ error: "Failed to fetch department info" }, { status: 500 })
    }
}

// PUT: Update dept_info for authenticated rep's department
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const deptCode = getDeptForRep(session.user.email)

        if (!deptCode) {
            return NextResponse.json({ error: "Not a department representative" }, { status: 403 })
        }

        const body = await request.json()
        const { degree_templates, ideal_trajectories } = body

        // First, check if entry exists
        const existingResponse = await strapiGet("/dept-infos", {
            filters: {
                dept_code: { $eq: deptCode }
            }
        })

        const existingEntry = existingResponse?.data?.[0]

        const updateData = {
            data: {
                dept_code: deptCode,
                dept_name: DEPT_NAMES[deptCode] || deptCode,
                degree_templates: degree_templates,
                ideal_trajectories: ideal_trajectories,
                last_updated_by: session.user.email
            }
        }

        let result
        if (existingEntry) {
            // Update existing entry
            result = await strapiPut(`/dept-infos/${existingEntry.id}`, updateData)
        } else {
            // Create new entry
            result = await strapiPost("/dept-infos", updateData)
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            message: existingEntry ? "Updated successfully" : "Created successfully"
        })
    } catch (error) {
        console.error("Error updating dept info:", error)
        return NextResponse.json({ error: "Failed to update department info" }, { status: 500 })
    }
}
