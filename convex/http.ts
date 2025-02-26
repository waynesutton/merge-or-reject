/**
 * http.ts
 *
 * HTTP endpoints for external integrations.
 *
 * Changes made:
 * - Created HTTP router file for external API endpoints
 * - Added Clerk webhook endpoint at /clerk-webhook
 * - Added security verification for Clerk webhooks
 * - Implemented proper error responses
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk webhook handler
 *
 * This endpoint receives webhook events from Clerk and forwards them to our internal handler.
 * It performs basic verification that the request is coming from Clerk.
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Extract headers for webhook verification
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify that required webhook headers are present
    if (!headers["svix-id"] || !headers["svix-timestamp"] || !headers["svix-signature"]) {
      return new Response(JSON.stringify({ error: "Missing required Clerk webhook headers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Parse the webhook payload
      const payload = await request.json();

      // Forward to internal action for processing
      await ctx.runAction(internal.clerk.clerkWebhook, {
        headers,
        payload,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Webhook handler error:", error);

      return new Response(
        JSON.stringify({
          error: "Webhook processing failed",
          message: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
