import type { NextConfig } from "next";

const nextConfig: any = {
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // Next 15+ specific CORS warnings from External IPs when using dev server
  allowedDevOrigins: ['178.254.30.48', 'localhost', '127.0.0.1'],
};

export default nextConfig;
