import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable strict mode for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Azure App Service optimization
  output: 'standalone',

  // Optimize for Azure deployment
  experimental: {
    // Disable SWC minify for Azure compatibility
    swcMinify: false,
  },

  // Ensure proper server configuration for Azure
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client side
  },

  // Security: Block access to uploads directory
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/blocked', // This will return 404
      },
    ];
  },

  // Additional security headers
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, nosnippet, noarchive',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
