import type { NextConfig } from 'next';
import { getSecurityHeaders } from './src/lib/http-security-headers';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders(isDevelopment),
      },
    ];
  },
};

export default nextConfig;
