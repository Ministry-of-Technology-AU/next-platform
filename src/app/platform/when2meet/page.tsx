"use server";

import { Card, CardHeader } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";
import PageTitle from "@/components/page-title";
import DeveloperCredits from "@/components/developer-credits";
import TimeSlotPage from "./components/TimeSlotPage";
import { cookies } from "next/headers";
import { TimeTableDraft, TimeTableWithOwnership, When2MeetPageProps } from "./types";
import { auth } from "@/auth";
import { getUserIdByEmail } from "@/lib/userid"; // Adjust path as needed
import { strapiGet } from "@/lib/apis/strapi";

async function fetchTimeTableData(uid?: string): Promise<{
    data: TimeTableWithOwnership | null;
    error?: string;
}> {
    // If no UID provided, return null (blank timetable)
    if (!uid) {
        return { data: null };
    }

    const cookieStore = await cookies();

    try {
        // Get current authenticated user
        const session = await auth();
        if (!session?.user?.email) {
            return {
                data: null,
                error: "Authentication required to view this timetable"
            };
        }

        const userEmail = session.user.email;
        const currentUserId = await getUserIdByEmail(userEmail);

        if (!currentUserId) {
            return {
                data: null,
                error: "Could not verify user identity"
            };
        }

        // Fetch timetable from Strapi
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/when2meet`,
            {
                cache: 'no-store',
                headers: {
                    'Cookie': cookieStore.toString(),
                    'uid': uid
                },
            }
        );

        console.log('When2Meet: Response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('When2Meet: API result:', result);

            if (result.success && result.data) {
                const timetableData = result.data as TimeTableDraft;

                // Check if current user is the owner
                const isOwner = timetableData.grid.owner === currentUserId.toString();

                return {
                    data: {
                        ...timetableData,
                        isOwner
                    }
                };
            } else {
                console.log('When2Meet: No TimeTableDraft data found in API result.');
                return {
                    data: null,
                    error: "Timetable not found"
                };
            }
        } else {
            const errorText = await response.text();
            console.error('When2Meet: Response not OK:', response.status, errorText);
            return {
                data: null,
                error: `Failed to load timetable: ${response.status}`
            };
        }
    } catch (e) {
        console.error('Error fetching TimeTableDraft Data:', e);
        return {
            data: null,
            error: "An error occurred while loading the timetable"
        };
    }
}

export default async function When2MeetPage({ params }: When2MeetPageProps) {
    const { data: tt, error } = await fetchTimeTableData(params.uid);

    return (
        <div className="mt-2 xs:mt-3 sm:mt-4 md:mt-5 mx-2 xs:mx-3 sm:mx-4 md:mx-6 mb-2 xs:mb-3 sm:mb-4">
            {error ? (
                <Card className="p-6">
                    <div className="flex items-center gap-3 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                </Card>
            ) : (
                <TimeSlotPage data={tt} />
            )}
        </div>
    );
}