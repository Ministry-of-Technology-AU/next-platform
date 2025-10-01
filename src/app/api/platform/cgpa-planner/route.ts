"use server";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getUserIdByEmail } from "@/lib/userid";
import { ParsedCGPAData } from "@/app/platform/cgpa-planner/types";
import {auth} from "@/auth";

// export async function GET() {
//   try {
//     console.log('CGPA API: GET request received');
    
//     // Get authenticated user
//     const user = await getAuthenticatedUser();
//     console.log('CGPA API: User authenticated:', !!user);
    
//     if (!user) {
//       console.log('CGPA API: No authenticated user');
//       return NextResponse.json(
//         { error: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     // Get user ID from email
//     console.log('CGPA API: Getting user ID for email:', user.email);
//     const userId = await getUserIdByEmail(user.email);
//     console.log('CGPA API: User ID found:', userId);
    
//     if (!userId) {
//       console.log('CGPA API: User not found in Strapi');
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Fetch user data with CGPA data
//     console.log('CGPA API: Fetching user data from Strapi...');
//     const userData = await strapiGet(`/users/${userId}`, {
//       fields: ["id", "email", "cgpa_data"]
//     });
//     console.log('CGPA API: User data received:', !!userData.data);

//     if (!userData.data) {
//       console.log('CGPA API: No user data found in Strapi');
//       return NextResponse.json(
//         { error: "User data not found" },
//         { status: 404 }
//       );
//     }

//     // Return CGPA data if it exists, otherwise return empty structure
//     const cgpaData = userData.data.cgpa_data || {
//       degreeCGPA: 0,
//       majorCGPA: 0,
//       totalCredits: 0,
//       semesters: []
//     };

//     return NextResponse.json({
//       success: true,
//       data: cgpaData
//     });

//   } catch (error) {
//     console.error("Error fetching CGPA data:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST() {
//   try {
//     // Get authenticated user
//     const user = await getAuthenticatedUser();
//     if (!user) {
//       return NextResponse.json(
//         { error: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     // Get user ID from email
//     const userId = await getUserIdByEmail(user.email);
//     if (!userId) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Clear CGPA data by setting it to null
//     await strapiPut(`/users/${userId}`, {
//       cgpa_data: null
//     });

//     return NextResponse.json({
//       success: true,
//       message: "CGPA data cleared successfully"
//     });

//   } catch (error) {
//     console.error("Error clearing CGPA data:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     // Get authenticated user
//     const user = await getAuthenticatedUser();
//     if (!user) {
//       return NextResponse.json(
//         { error: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     // Get user ID from email
//     const userId = await getUserIdByEmail(user.email);
//     if (!userId) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Parse request body
//     const body = await request.json();
//     const cgpaData: ParsedCGPAData = body.cgpa_data;

//     if (!cgpaData) {
//       return NextResponse.json(
//         { error: "CGPA data is required" },
//         { status: 400 }
//       );
//     }

//     // Save CGPA data to Strapi
//     await strapiPut(`/users/${userId}`, {
//       cgpa_data: cgpaData
//     });

//     return NextResponse.json({
//       success: true,
//       message: "CGPA data saved successfully"
//     });

//   } catch (error) {
//     console.error("Error saving CGPA data:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(){
        const session = await auth();
        if (!session?.user?.email) {
          return Response.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        // Get user ID from email
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }
        const userData = await strapiGet(`users/${userId}`);
        return (NextResponse.json({
            message: "CGPA data cleared successfully"
        }));
}