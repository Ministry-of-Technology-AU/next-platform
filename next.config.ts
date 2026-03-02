import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  typescript: {
    // Skip type checking only when SKIP_TYPECHECK=true is passed
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === 'true',
  },
}

export default nextConfig