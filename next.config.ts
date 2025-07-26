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

  // Webpack configuration for Azure compatibility
  webpack: (config, { isServer }) => {
    // Fix for Clerk.js module resolution in Azure
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "next/dist/server/route-modules/app-page/vendored/contexts/loadable": false,
    };

    // Additional module resolution for Azure
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/dynamic": require.resolve("next/dynamic"),
      // Fix for missing loadable context with polyfill
      "next/dist/server/route-modules/app-page/vendored/contexts/loadable": require.resolve("./src/lib/loadable-polyfill.js"),
    };

    // Ignore missing modules that are not critical
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "next/dist/server/route-modules/app-page/vendored/contexts/loadable": "{}",
      });
    }

    return config;
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
