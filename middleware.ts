/**
 * middleware.ts
 *
 * Changes made:
 * - Added middleware for handling CSP headers
 * - Configured Clerk authentication middleware
 * - Added nonce generation for inline scripts
 * - Added proper CSP directives for all required resources
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";

// Generate a unique nonce for each request
function generateNonce() {
  return Buffer.from(uuidv4()).toString("base64");
}

// Middleware to handle CSP headers
function updateHeaders(request: NextRequest) {
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);

  // Set nonce in header for use in _document.tsx
  requestHeaders.set("x-nonce", nonce);

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' *.clerk.dev *.clerk.accounts.dev cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com`,
    "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net",
    "img-src 'self' data: https:",
    `connect-src 'self' *.clerk.dev *.clerk.accounts.dev *.ingest.sentry.io challenges.cloudflare.com scdn.clerk.com segapi.clerk.com`,
    "frame-src 'self' *.clerk.dev *.clerk.accounts.dev",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "font-src 'self' data: cdn.jsdelivr.net",
  ].join("; ");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

// Combine with Clerk's auth middleware
export default authMiddleware({
  beforeAuth: (req) => {
    return updateHeaders(req);
  },
  // Add Clerk configuration here
  publicRoutes: ["/", "/api(.*)"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
