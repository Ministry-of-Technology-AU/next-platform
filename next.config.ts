import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  // Caching tiers: .agents/blueprints/caching.md
  // CloudFront domain for /_next/static (JS, CSS, fonts). Read at build time. Unset = served from EC2.
  assetPrefix: process.env.ASSET_PREFIX || undefined,
  // In-memory copy of the Data Cache. Default is 50 MB; L2 only holds a few global keys.
  cacheMaxMemorySize: 10 * 1024 * 1024,
  async headers() {
    return [
      {
        // /public images and fonts. Rename a file when you replace it, or browsers keep the old one for 7 days.
        source: '/:path*.:ext(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    styledComponents: true,
  },
  typescript: {
    // Skip type checking only when SKIP_TYPECHECK=true is passed
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === 'true',
  },
}

export default nextConfig