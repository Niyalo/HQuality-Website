import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.sanity.io","images.unsplash.com"]
  },

  // Netlify plugin configuration
  webpack: (config) => {
    config.externals.push({
      "@netlify/plugin-nextjs": "commonjs @netlify/plugin-nextjs",
    });
    return config;
  },
};

export default nextConfig;
