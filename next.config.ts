import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration
  // Use standalone for Cloud Run deployment (supports API routes)
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
