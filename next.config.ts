import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This allows the build to finish even if there are linting warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This allows the build to finish even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
