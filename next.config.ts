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
}

export default nextConfig