/**
 * clerk.ts
 *
 * Handles Clerk webhook events for user synchronization.
 * Only admin users are synced to the database, while regular users remain anonymous until starting a game.
 *
 * Changes made:
 * - Fixed TypeScript type errors with proper type guards
 * - Added proper type definitions for Clerk webhook data
 * - Improved error handling for webhook verification
 * - Updated user synchronization to only sync admin users
 * - Added type guard for UserJSON vs DeletedObjectJSON
 * - Fixed mutation calls to use proper function references
 */

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import { UserJSON, DeletedObjectJSON } from "@clerk/types";

// Type guard to check if the data is UserJSON
function isUserJSON(data: unknown): data is UserJSON {
  return typeof data === "object" && data !== null && "email_addresses" in data && "id" in data;
}

export const clerkWebhook = internalAction({
  args: {
    headers: v.any(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET");
    }

    // Verify webhook signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(JSON.stringify(args.payload), args.headers) as WebhookEvent;
    } catch (err) {
      console.error("Failed to verify webhook:", err);
      throw new Error("Failed to verify webhook");
    }

    const eventType = evt.type;
    if (
      eventType !== "user.created" &&
      eventType !== "user.updated" &&
      eventType !== "user.deleted"
    ) {
      return;
    }

    // Check if the event data is a user event
    if (!isUserJSON(evt.data)) {
      console.error("Invalid user data received");
      return;
    }

    const data = evt.data;
    const clerkId = data.id;

    if (!clerkId) {
      throw new Error("Missing Clerk ID in webhook");
    }

    // Get primary email
    const primaryEmailId = data.primary_email_address_id;
    const email =
      data.email_addresses?.find((email) => email.id === primaryEmailId)?.email_address || "";

    // Get user name
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Anonymous User";

    // Check if user has admin role in public metadata
    const isAdmin = (data.public_metadata as { role?: string })?.role === "admin";

    switch (eventType) {
      case "user.created":
      case "user.updated":
        // Only sync admin users to the database
        if (isAdmin) {
          try {
            await ctx.runMutation(internal.users._syncUser, {
              clerkId,
              email,
              name,
              role: "admin",
            });
          } catch (error) {
            console.error("Failed to sync admin user:", error);
            throw new Error("Failed to sync admin user");
          }
        }
        break;

      case "user.deleted":
        // Optionally handle user deletion if needed
        // Regular users aren't in the database unless they start a game
        // Admin users might need to be removed
        if (isAdmin) {
          try {
            await ctx.runMutation(internal.users._deleteUser, { clerkId });
          } catch (error) {
            console.error("Failed to delete admin user:", error);
          }
        }
        break;
    }
  },
});
