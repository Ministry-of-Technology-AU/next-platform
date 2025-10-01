"use server";
import { strapiGet } from "@/lib/apis/strapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extract pagination parameters from query string
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const year = parseInt(searchParams.get('year') || '2024');
  
  // Optional search/filter parameters
  const search = searchParams.get('search') || '';
  const semester = searchParams.get('semester') || '';

  try {
    const filters: any = {
      year: { $eq: year }
    };

    // Add search filter if provided
    if (search) {
      filters.$or = [
        { courseCode: { $containsi: search } },
        { courseTitle: { $containsi: search } }
      ];
    }

    // Add semester filter if provided
    if (semester) {
      filters.semester = { $eq: semester };
    }

    const data = await strapiGet("/courses", {
      fields: ["courseCode", "courseTitle", "semester", "year"],
      populate: ["faculties", "course_reviews", "reviews"],
      pagination: { 
        page: page,
        pageSize: pageSize 
      },
      filters: filters,
      sort: ["year:desc"],
    });

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return Response.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}