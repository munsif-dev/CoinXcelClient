import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Enables static HTML export
  reactStrictMode: true, // Recommended for better development experience
  // Ensure images are properly handled
  images: {
    unoptimized: true, // Needed for static exports
  },
  // Enable proper CSS handling
  transpilePackages: [],
};

export default nextConfig;
