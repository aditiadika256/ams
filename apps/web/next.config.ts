import type { NextConfig } from "next";
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';
const iframeSources = (process.env.COMPONENT_IFRAME_ALLOWED_HOSTS || '')
  .split(',')
  .map((host) => host.trim().toLowerCase())
  .filter((host) => /^[a-z0-9.-]+$/.test(host))
  .map((host) => `https://${host}`)
  .join(' ');
const csp = [
  "default-src 'self'",
  "connect-src 'self' https://ams-lc58.onrender.com http://localhost:8000 http://127.0.0.1:8000 ws: http://localhost:3000 http://localhost:3001",
  "img-src 'self' data: https:",
  "media-src 'self' blob: https:",
  `frame-src 'self'${iframeSources ? ` ${iframeSources}` : ''}`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' blob:" : ""}`,
  "style-src 'self' 'unsafe-inline'",
].join('; ');
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '0' },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@theme-toggles/react'],
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@app': path.resolve(__dirname, './src/app'),
    };
    return config;
  },
};

export default nextConfig;
