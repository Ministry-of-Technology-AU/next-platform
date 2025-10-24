import { Users, Loader } from "lucide-react"
import PoolSubscriptionForm from "./PoolSubscriptionForm"
import ActivePoolSubscription from "./ActivePoolSubscription"
import PageTitle from "@/components/page-title";
import { Suspense } from "react";
import { strapiGet } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

async function existSubscriptionPool() {
    try {
        const session = await auth();
        const userId = await getUserIdByEmail(session?.user?.email || '');

        if (!userId) {
            console.log("User not found, cannot check for existing subscription");
            return null;
        }

        // Get current date to filter future or current subscriptions
        const today = new Date().toISOString().split('T')[0];

        // Query Strapi directly for user's subscription (only open ones)
        const userSubscriptionResponse = await strapiGet('/services', {
            filters: {
                user: {
                    id: {
                        $eq: userId
                    }
                },
                status: 'open',
                end: {
                    $gte: today
                }
            },
            populate: ['user'],
            sort: ['start:asc'],
            pagination: {
                limit: 1
            }
        });

        const userSubscription = userSubscriptionResponse?.data?.[0] || null;
        console.log("User's subscription from Strapi:", userSubscription);

        return {
            success: true,
            userSubscription: userSubscription
        };
    } catch (error) {
        console.error("Error checking subscription pool from Strapi:", error);
        return null;
    }
}

export default async function PoolSubscription() {
    const existingRequest = await existSubscriptionPool();
    console.log("Existing Subscription Pool:", existingRequest);

    // Check if user has existing subscription (query already filters for status='open')
    const hasActiveSubscription = existingRequest?.success && existingRequest?.userSubscription;

    return (
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">
                {/* Header Section */}
                <div className="max-w-7xl container mx-auto p-6 space-y-6">
                    <PageTitle
                        text="Pool Subscriptions"
                        subheading={hasActiveSubscription
                            ? "You have an active subscription pool. Manage it below or view all available pools."
                            : "Find others to share subscription costs for popular services like Netflix, Spotify, ChatGPT, and more. Create a pool or join existing ones to save money on monthly subscriptions."
                        }
                        icon={Users}
                    />
                    <div className="my-4 border-t border-gray-300"></div>
                </div>

                {/* Conditional Rendering: Show Active Subscription or Form */}
                <Suspense fallback={<Loader />}>
                    {hasActiveSubscription ? (
                        <ActivePoolSubscription userSubscription={existingRequest.userSubscription} />
                    ) : (
                        <PoolSubscriptionForm />
                    )}
                </Suspense>
            </div>
        </div>
    )
}