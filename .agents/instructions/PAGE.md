# Page Guidelines for next-platform

## Page Structure
- The pages follow standard Next.js convention, the page name (and slug) is the same as the file name in the app directory. For example, the CGPA Planner feature will be inside a directory called `cgpa-planner`. Use Indian English spellings for the same. When creating a tool from scratch, first ask what it needs to be named.
- Refer to `src/app/platform/semester-planner` for the general structure and layout of pages. Always adhere to the structure mentioned below, unless not possible. In such a case, flag it to the user. 
- Each page follows the following structure:
    - page-name/
        - `page.tsx` <<< This is the main page file. It will necessarily be a server-side rendered unless mentioned otherwise. 
        - `layout.tsx` <<< This file will handle any layout specific to the page. It will necessarily be a server-side rendered unless mentioned otherwise. Skip this if the tool/page we're trying to create is not multi-page. 
        - `_components/` <<< This directory will include any page specific components that aren't used in more than 1 other pages. For more general components, use/create existing ones in `src/app/platform/components`.
        - `types.ts` <<< This file will include any type definitions specific to the page. For more general or globally used types, save them as separate files in `src/types/` (if used in more than 1 app)
        - `utils.ts` <<< This file will include any utility functions specific to the page. In case the page doesn't require this, we'll skip it. 
        - `[slug or uid]/` <<< Directory for dynamic routing. Skip this if the tool/page we're trying to create doesn't require dynamic routing. This should only consist of a `page.tsx` file (same principles as mentioned above) unless necessary. 
        - `client.tsx` <<< This will be the main client side component that makes the page interactable. Basically the orchestrator component which calls components from `_components` folder and makes the page interactable. 
        - `data.ts` <<< This file will contain the sample or mock data for the page. This data may be used as a fallback in case the api fails or data isn't available. Additionally, this file may also contain any extra data that we may need, for example holiday dates for the semester planner, or colours for preferences, etc. Again, if something can be more generalised and used across different pages, eg. majors (used in sem planner, cgpa planner, trajectory planner, etc) then save them in the `src/data/` directory.


## General Guidelines
- Always abstract the page into components. We don't want fat pages.
- Always abstract types into more general types and save in types.ts for the tool. Avoid defining redundant types. 
- Try to make the components general and modular. Don't over-modularise things, but try to not make pages too big. 
- Absolutely minimize the number of client side API calls that are made. Unless necessary, make API calls from the server side rendered `page.tsx` file, and pass it down to the client components via props.
- Avoid hardcoding API urls. `NEXT_PUBLIC_BASE_URL` exists in `.env`, which can be used as the base URL for the API. 
- Unless absolutely necessary, never interact with strapi, google workspace, or other APIs directly. Always create and interact with a server side route (check `.agents/instructions/ROUTE.md` for instructions).
- Use shadcn based components for the UI. Refer to the documentation at https://ui.shadcn.com/ and the available components in `@/components`. Use the /shadcn-ui skill for reference. 
- Once a page is fully created, ask the user to proceed with creating a guided tour. Refer to the `GUIDED TOUR` section in `.agents/instructions/COMPONENTS.md` for more instructions. 
- Upon completion of a page, ensure that the page is fully responsive and works well on both mobile and desktop devices. In case a page cannot be made responsive properly, flag it with the user, and add the `@/components/orientation-dialog.tsx` component. 
- Always have a Page Title (`@/components/page-title.tsx`) and Developer Credits (`@/components/developer-credits.tsx`) component in the page. Developer Credits will be in `layout.tsx` if present, or `page.tsx` otherwise. Page Title will always be in `page.tsx`
- Once a page is fully created and ready to deploy, add the `New Tool Banner` to the page, and update the `What's new dialog`, `New Tool Alert`, and `Sidebar` accordingly. Refer to `.agents/instructions/COMPONENTS.md` for instructions. 

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
    

## `page.tsx` Structure
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