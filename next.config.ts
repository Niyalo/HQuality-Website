import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Enable hybrid rendering (static + dynamic)
 
  // Netlify plugin configuration
  webpack: (config) => {
    config.externals.push({
      '@netlify/plugin-nextjs': 'commonjs @netlify/plugin-nextjs',
    });
    return config;
  },
};

export default nextConfig;