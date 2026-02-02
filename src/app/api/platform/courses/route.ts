"use server";
import { strapiGet } from "@/lib/apis/strapi";

export async function GET() {
  try {
    const filters: any = {
      year: { $in: [2024, 2025] }
    };

    // add pagination of 2000 items
    const pagination = {
      page: 1,
      pageSize: 2000
    };

    const data = await strapiGet("/courses", {
      fields: ["courseCode", "courseTitle", "semester", "year"],
      populate: ["faculties", "course_reviews", "reviews"],      
      filters: filters,
      sort: ["year:desc"],
      pagination: pagination
    });
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return Response.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}