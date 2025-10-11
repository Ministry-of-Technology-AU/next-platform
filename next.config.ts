import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // output: "export",
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  
  // Optimize build performance and memory usage
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Reduce memory usage during build by splitting chunks more efficiently
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // ~240KB chunks
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            enforce: true,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            chunks: 'all',
            minChunks: 2,
            enforce: true,
          },
        },
      }
      
      // Additional memory optimizations
      config.optimization.minimize = true
      config.optimization.sideEffects = false
    }
    
    return config
  },
  
  // Enable experimental optimizations
  experimental: {
    webpackMemoryOptimizations: true,
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
