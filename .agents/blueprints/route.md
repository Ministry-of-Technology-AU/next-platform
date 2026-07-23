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

// Optional: Other HTTP method handlers (POST, PUT, DELETE, etc.) can be added here
```



## `layout.tsx` Structure
- `layout.tsx` is a server-side rendered component that is used to wrap the page in a layout. 
- Only add one if the tool is a multi-page one. 
- Keep it broad, since multiple pages will be nested inside this layout, and may not share the exact same attributes.
- Always first check the global layout files to first understand the padding, margins, etc. Accordingly make adjustments in this file. 
- The general structure should be as follows:
    ```tsx
    import { OrientationDialog } from "@/components/orientation-dialog"; //Only if the page cannot be made responsive
    import DeveloperCredits from "@/components/developer-credits";
    import { DismissNewToolAlert } from "@/components/dismiss-new-tool-alert";
    export default function PageNameLayout({
        children,
    }:{
        children: React.ReactNode;
    }){
        const developers = [
            { name: "", 'profileUrl': "", 'role': "" } //Prompt the user to tell you these details. 
        ];

        return(
            <>
                <TourManager />
                <NewToolBanner className="" /> //Style as necessary
                <div className=""> //Add stlying here as necessary for the page
                    <DismissNewToolAlert storageKey=""/> //Refer to the instructions. 
                    <OrientationDialog /> //Only if present. 
                    {children}
                </div>
                <DeveloperCredits developers={developers} />
            </>
        )
    }
    ```
    
- `page.tsx` is a server-side rendered component (unless explicitly told otherwise).
- Always export `export const dynamic = 'force-dynamic'` at the top level, since pages use cookies and must never be statically cached by Next.js.
- Data fetching must be done via a typed async function defined above the page component. This function must:
    - Await `cookies()` from `next/headers` and forward them in the `Cookie` header so the internal API route can authenticate the request.
    - Use `cache: 'no-store'` to prevent stale data.
    - Return a typed result object (never throw to the page component directly).
    - Handle errors gracefully — return an empty/fallback value and an `error` string rather than crashing.
    - Check `response.ok` before parsing JSON.
- The `PageTitle` component (`@/components/page-title`) must always be present and wrapped in a `TourStep` with `id="page-title"` and `order={0}`.
- The general structure should be as follows:

    ```tsx
    import PageTitle from "@/components/page-title";
    import { TourStep } from "@/components/tour-step"; // or wherever TourStep is exported from
    import { PageClientComponent } from "./client";
    import { SomeIcon } from "lucide-react";
    import { SomeType } from "./types";
    import { cookies } from "next/headers";

    // Force dynamic rendering since we're using cookies
    export const dynamic = 'force-dynamic';

    async function fetchPageData(): Promise<{ data: SomeType[]; error: string | null }> {
      try {
        const cookieStore = await cookies();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/[route-name]`,
          {
            headers: {
              Cookie: cookieStore.toString(),
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const json = await response.json();

        if (json.success && json.data) {
          return { data: json.data, error: null };
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        platform.log('Error fetching page data:', err);
        return {
          data: [],
          error: err instanceof Error ? err.message : 'An error occurred',
        };
      }
    }

    export default async function PageNamePage() {
      const { data, error } = await fetchPageData();

      return (
        <div className="pt-6 px-6">
          <TourStep
            id="page-title"
            title="[Page Title]"
            content="[Short description of what this tool does — used in the guided tour]"
            order={0}
          >
            <PageTitle
              icon={SomeIcon}
              text="[Page Title]"
              subheading="[Short subheading describing the page]"
            />
          </TourStep>
          <PageClientComponent initialData={data} initialError={error} />
        </div>
      );
    }
    ```