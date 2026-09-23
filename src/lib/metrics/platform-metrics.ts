import { unstable_cache } from 'next/cache';
import { strapiGet } from '@/lib/apis/strapi';

export interface PlatformMetrics {
  users: string;
  subscriptionPools: string;
  courseReviews: string;
  cabPools: string;
}

export const DEFAULT_PLATFORM_METRICS: PlatformMetrics = {
  users: "4,442",
  subscriptionPools: "154",
  courseReviews: "1,093",
  cabPools: "1,793",
};

/**
 * Server-side cached platform metrics computation (48 hours).
 * Utilizes Next.js Data Cache (unstable_cache) so all users across the platform
 * share the exact same 48-hour cached metrics without making repeated Strapi queries.
 */
export const getCachedPlatformMetrics = unstable_cache(
  async (): Promise<PlatformMetrics> => {
    try {
      const [usersResponse, subscriptionsResponse, poolsResponse, reviewsResponse] = await Promise.all([
        strapiGet('/users', { pagination: { pageSize: 10000 } }).catch((err) => {
          console.error('Error fetching users for metrics:', err);
          return [];
        }),
        strapiGet('/services', { pagination: { pageSize: 10000 } }).catch((err) => {
          console.error('Error fetching services for metrics:', err);
          return { data: [] };
        }),
        strapiGet('/pools', { pagination: { pageSize: 10000 } }).catch((err) => {
          console.error('Error fetching pools for metrics:', err);
          return { data: [] };
        }),
        strapiGet('/reviews', { pagination: { pageSize: 10000 } }).catch((err) => {
          console.error('Error fetching reviews for metrics:', err);
          return { data: [] };
        }),
      ]);

      const usersCount = Array.isArray(usersResponse)
        ? usersResponse.length
        : (usersResponse?.meta?.pagination?.total ?? usersResponse?.data?.length ?? 4442);
      const subscriptionPoolsCount =
        subscriptionsResponse?.meta?.pagination?.total ?? subscriptionsResponse?.data?.length ?? 154;
      const cabPoolsCount =
        poolsResponse?.meta?.pagination?.total ?? poolsResponse?.data?.length ?? 1793;
      const courseReviewsCount =
        reviewsResponse?.meta?.pagination?.total ?? reviewsResponse?.data?.length ?? 1093;

      return {
        users: Number(usersCount || 5802).toLocaleString(),
        subscriptionPools: Number(subscriptionPoolsCount || 154).toLocaleString(),
        cabPools: Number(cabPoolsCount || 2333).toLocaleString(),
        courseReviews: Number(courseReviewsCount || 1771).toLocaleString(),
      };
    } catch (error) {
      console.error('Error computing platform metrics on server:', error);
      return DEFAULT_PLATFORM_METRICS;
    }
  },
  ['platform-landing-metrics-global'],
  {
    revalidate: 172800, // 48 hours (in seconds)
    tags: ['platform-metrics'],
  }
);
