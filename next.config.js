/**
 * next.config.js
 *
 * Changes made:
 * - Added Content Security Policy headers
 * - Configured allowed sources for scripts, styles, and connections
 * - Added necessary domains for Clerk authentication
 * - Added Sentry domains for error tracking
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Allow Clerk domains
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.clerk.dev *.clerk.accounts.dev cdn.jsdelivr.net",
              // Allow styles
              "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net",
              // Allow images
              "img-src 'self' data: https:",
              // Allow connections to APIs and services
              "connect-src 'self' *.clerk.dev *.clerk.accounts.dev *.ingest.sentry.io",
              // Allow frames for Clerk
              "frame-src 'self' *.clerk.dev *.clerk.accounts.dev",
              // Allow web workers
              "worker-src 'self' blob:",
              // Allow manifests
              "manifest-src 'self'",
              // Allow fonts
              "font-src 'self' data: cdn.jsdelivr.net",
            ].join("; "),
          },
        ],
      },
    ];
  },
  // Add any other Next.js config options here
};

module.exports = nextConfig;
