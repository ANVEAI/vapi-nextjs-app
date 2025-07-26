import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

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
