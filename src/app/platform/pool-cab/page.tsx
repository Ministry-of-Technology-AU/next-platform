import { Car, Loader } from "lucide-react"
import PoolCabForm from "./PoolCabForm"
import ActivePoolRequest from "./ActivePoolRequest"
import PageTitle from "@/components/page-title";
import { Suspense } from "react";
import { strapiGet } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { auth } from "@/auth";

async function existPoolRequest() {
    try {
        const session = await auth();
        const userId = await getUserIdByEmail(session?.user?.email || '');

        if (!userId) {
            console.log("User not found, cannot check for existing pool");
            return null;
        }

        // Get current date to filter future or recent pools
        const today = new Date().toISOString().split('T')[0];

        // Query Strapi directly for user's pool (only available ones)
        const userPoolResponse = await strapiGet('/pools', {
            filters: {
                pooler: {
                    id: {
                        $eq: userId
                    }
                },
                status: 'available',
                day: {
                    $gte: today
                }
            },
            populate: ['pooler'],
            sort: ['day:asc', 'time:asc'],
            pagination: {
                limit: 1
            }
        });

        const userPool = userPoolResponse?.data?.[0] || null;
        console.log("User's pool from Strapi:", userPool);

        return {
            success: true,
            userPool: userPool
        };
    } catch (error) {
        console.error("Error checking pool request from Strapi:", error);
        return null;
    }
}

export default async function PoolCab() {
    const existingRequest = await existPoolRequest();
    console.log("Existing Pool Request:", existingRequest);

    // Check if user has existing pool (query already filters for status='available')
    const hasActivePool = existingRequest?.success && existingRequest?.userPool;

    return (
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">
                {/* Header Section */}
                <div className="max-w-7xl container mx-auto p-6 space-y-6">
                    <PageTitle
                        text="Pool a Cab"
                        subheading={hasActivePool
                            ? "You have an active pool request. Manage it below or view all available pools."
                            : "Find others traveling on the same route and share a cab to save money and reduce environmental impact. Fill in your travel details below to find potential cab partners or create a new pool request."
                        }
                        icon={Car}
                    />
                    <div className="my-4 border-t border-gray-300"></div>
                </div>

                {/* Conditional Rendering: Show Active Pool or Form */}
                <Suspense fallback={<Loader />}>
                    {hasActivePool ? (
                        <ActivePoolRequest userPool={existingRequest.userPool} />
                    ) : (
                        <PoolCabForm />
                    )}
                </Suspense>
            </div>
        </div>
    )
}