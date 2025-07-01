import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable HTTPS in development for WebRTC compatibility on network IPs
  experimental: {
    serverComponentsExternalPackages: ['@openai/agents'],
  },
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
        ],
      },
    ];
  },
};

export default nextConfig;
