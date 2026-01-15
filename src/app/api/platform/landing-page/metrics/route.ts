import { NextResponse } from "next/server";
import { strapiGet } from "@/lib/apis/strapi";

export async function GET(){
    try {
        // Fetch users data
        const usersResponse = await strapiGet('/users', { pagination: { pageSize: 10000 } });
        const totalUsers = usersResponse.length || 0;

        // Fetch subscription pools data
        const subscriptionsResponse = await strapiGet('/services', { pagination: { pageSize: 10000 } });
        const totalSubscriptionPools = subscriptionsResponse.data?.length || 0;

        // Fetch cab pools data  
        const poolsResponse = await strapiGet('/pools', { pagination: { pageSize: 10000 } });
        const totalCabPools = poolsResponse.data?.length || 0;

        // Fetch course reviews data
        const reviewsResponse = await strapiGet('/reviews', { pagination: { pageSize: 10000 } });
        const totalCourseReviews = reviewsResponse.data?.length || 0;

        const metricsData = {
            users: totalUsers,
            subscriptionPools: totalSubscriptionPools,
            cabPools: totalCabPools,
            courseReviews: totalCourseReviews,
        };

        // console.log("Platform Metrics:", metricsData);

        return NextResponse.json(metricsData);
    } catch (error) {
        console.error("Error fetching platform metrics:", error);
        return NextResponse.json({
            error: 'Failed to fetch platform metrics'
        }, { status: 500 });
    }
}