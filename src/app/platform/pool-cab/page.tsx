import { Car, Loader } from "lucide-react"
import PoolCabForm from "./PoolCabForm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import PageTitle from "@/components/page-title";
import { Suspense } from "react";

async function existPoolRequest() {
    const cookieStore = await cookies();
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/pool-cab`, {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Cookie': cookieStore.toString() },
        });
        if (res.ok) {
            const data = await res.json();
            console.log("Pool Request Check Response:", data);
            return data;
        }
    } catch (error) {
        console.error("Error checking pool request:", error);
    }
}

export default async function PoolCab() {
    const existingRequest = await existPoolRequest();
    console.log("Existing Pool Request:", existingRequest);
    if (existingRequest?.success && existingRequest?.userPool) {
        console.log("User has existing pool, redirecting to results");
        redirect('/platform/pool-cab/results');
    }
    return (
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">
                {/* Header Section */}
                <div className="max-w-7xl container mx-auto p-6 space-y-6">
                    <PageTitle text="Pool a Cab" subheading="Find others traveling on the same route and share a cab to save money and reduce environmental impact.
                        Fill in your travel details below to find potential cab partners or create a new pool request." icon={Car} />
                    <div className="my-4 border-t border-gray-300"></div>
                </div>

                {/* Form Component */}
                <Suspense fallback={<Loader />}>
                    <PoolCabForm />
                </Suspense>
            </div>
        </div>
    )
}