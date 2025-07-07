import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable HTTPS in development for WebRTC compatibility on network IPs
  serverExternalPackages: ['@openai/agents'],
  
  // Enable compression
  compress: true,
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  
  // Bundle analyzer for development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      return config;
    },
  }),
  
  // Add headers for development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Add caching headers for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
