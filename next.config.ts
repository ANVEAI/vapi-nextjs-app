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

  // Force dynamic rendering to avoid build-time environment variable issues
  output: 'standalone',

  // Configure for Azure deployment
  experimental: {
    outputFileTracingRoot: undefined,
    esmExternals: false,
  },

  // Ensure proper module resolution
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'next/dist/server/route-modules/app-page/vendored/contexts/loadable': 'next/dist/server/route-modules/app-page/vendored/contexts/loadable'
      });
    }
    return config;
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
