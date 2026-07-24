# Route Guidelines for next-platform

## Route Structure
- The routes also follow standard Next.js 15 convention. The route name (and slug) should be consistent with the page name. For example, if we're building a route for `src/app/platform/semester-planner` then the route should be `src/app/api/platform/semester-planner`. Refer to `/api/platform/semester-planner/route.ts` for a working example.
- The API routes exist in `src/app/api`. All API routes must be server-side rendered. They can be part of `platform`, `auth` specific routes, for `organisations`, etc. Clear the user intent and understand which interface the route is being built for. 
- Always adhere to the structure mentioned below, unless not possible. In such a case, flag it to the user.  
- Each page follows the following structure:
    - route-name/
        - `route.ts` >>> This is the main route file, that will serve as the required entrypoint to this endpoint.
        - `[id/slug]/` >>> This will be any dynamic routes/endpoints, as standard Next.js API definitions. This will contain its own endpoint structure, following the same overall endpoint structure. 
        - `helper.ts` >>> This file will contain any helper functions that are required for the page. 
        - `<subroute>/` >>> This will be any subroutes, as standard Next.js API definitions. 


## General Guidelines
- For types and mock data, always use the same files already defined in the corresponding page. For example, for semester planner route, use the `src/app/platform/semester-planner/data.ts` and `src/app/platform/semester-planner/types.ts` files, instead of creating new ones. This also ensures strong typesafety and consistency. For any new types/data you need to create, add them to these same files.
- Always abstract the route into helper functions in `helper.ts`. Avoid redundant functions. Define modular functions that can be used in multiple places. Don't over-modularise things, but try to not make routes too big. 
- Always use the predefined libraries and functions we have in the repo to avoid redundancy and maintain consistency. Refer to the `libraries.md` file for instructions. This will be for Strapi, Cloudinary, Google Workspace, etc. 
- For caching practices, follow `caching.md`. 
- Always ensure thorough null handling. In case the API fails to obtain data, pass appropriate error message to the frontend.
- For all auth based practices and RBAC, refer to `auth.md`. 
- Always verify the user's session in every request. If a session expires or is unauthorized, do not send back data, pass an appropriate error. 
- Rely as much as possible on predefined library functions for auth, strapi, etc. 
- Only request as much data from strapi as necessary. This means adding correct filters and parameters - don't over-fetch data. 
- Return appropriate error codes whenever necessary. 
- Use nextjs functions, types and apis where possible, and avoid redundant custom code. 


## `route.ts` Structure
- Server-Side by design.

```tsx
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSemesterData } from "./helper"; // Example helper
import { API_URLS } from "@/lib/api-routes"; // Use your shared API routing config

export const dynamic = 'force-dynamic';

// GET request handler
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    // Example: Fetch data using helper
    const { data, error } = await getSemesterData(cookieStore);

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    platform.log('GET /api/platform/[route-name] error:', err); // Use your logger
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// Optional: Other HTTP method handlers (POST, PUT, DELETE, etc.) can be added here - depends on the usecase. 
```