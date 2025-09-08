import { strapiGet } from "@/lib/apis/strapi";
import { NextResponse } from "next/server";
import { organizations as dummyOrganizations } from "@/app/(pages)/events-calendar/data/calendar-data";

export async function GET(request: Request) {
  try {
    // Fetch organizations from Strapi
    const strapiResponse = await strapiGet('organisations');
    
    // Return the full Strapi data without mapping
    // This allows other components to use the complete data
    return NextResponse.json({
      success: true,
      data: strapiResponse.data
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    
    // If there's an error, still return the dummy data as fallback
    return NextResponse.json({
      success: true,
      data: dummyOrganizations
    });
  }
}