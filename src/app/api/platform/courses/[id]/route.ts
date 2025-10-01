import { strapiGet, strapiPost } from "@/lib/apis/strapi";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('Course ID from params:', id);

  if (!id) {
    return Response.json({ error: "Course ID is required" }, { status: 400 });
  }

  try {
    const data = await strapiGet(`/courses/${id}`, {
      fields: ["courseCode", "courseTitle", "semester", "year"],
      populate: ["faculties", "course_reviews", "reviews"],
    });

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    return Response.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Submitting review for course ID:', id);

    if (!id) {
      return Response.json({ error: "Course ID is required" }, { status: 400 });
    }

    const json = await request.json();
    console.log("Received review data:", json);

    // Validate required fields
    if (!json.data || !json.data.course) {
      console.error("Missing required fields:", json);
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the course ID in the data matches the URL parameter
    if (parseInt(json.data.course) !== parseInt(id)) {
      return Response.json(
        { success: false, error: "Course ID mismatch" },
        { status: 400 }
      );
    }

    // Forward the request to Strapi
    console.log("Sending review to Strapi...");
    const response = await strapiPost("/reviews", json);
    console.log("Strapi response:", response);

    return Response.json({ success: true, data: response });
  } catch (error) {
    console.error("Error submitting review:", error);
    
    // More detailed error handling
    if (error instanceof Error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return Response.json(
      { success: false, error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}