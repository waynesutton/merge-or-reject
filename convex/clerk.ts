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
 * - Enhanced admin role detection from Clerk public metadata
 * - Added detailed logging for easier debugging
 * - Improved error handling with specific error messages
 */

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import { UserJSON, DeletedObjectJSON } from "@clerk/types";
import { hasAdminRole } from "./auth";

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
      const error = "Missing CLERK_WEBHOOK_SECRET environment variable";
      console.error(error);
      throw new Error(error);
    }

    // Verify webhook signature
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(JSON.stringify(args.payload), args.headers) as WebhookEvent;
      console.log(`Verified webhook event of type: ${evt.type}`);
    } catch (err) {
      console.error("Failed to verify webhook:", err);
      throw new Error(
        `Failed to verify webhook: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    const eventType = evt.type;
    if (
      eventType !== "user.created" &&
      eventType !== "user.updated" &&
      eventType !== "user.deleted"
    ) {
      console.log(`Ignoring irrelevant event type: ${eventType}`);
      return;
    }

    // Check if the event data is a user event
    if (!isUserJSON(evt.data)) {
      console.error("Invalid user data received in webhook");
      return;
    }

    const data = evt.data;
    const clerkId = data.id;

    if (!clerkId) {
      const error = "Missing Clerk ID in webhook data";
      console.error(error);
      throw new Error(error);
    }

    console.log(`Processing ${eventType} event for user: ${clerkId}`);

    // Get primary email
    const primaryEmailId = data.primary_email_address_id;
    const email =
      data.email_addresses?.find((email) => email.id === primaryEmailId)?.email_address || "";

    if (!email) {
      console.log(`No primary email found for user ${clerkId}`);
    }

    // Get user name
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || "Anonymous User";

    // Use auth utility to check if user has admin role
    const isAdmin = hasAdminRole(data);
    console.log(`User ${clerkId} has admin role: ${isAdmin}`);

    switch (eventType) {
      case "user.created":
      case "user.updated":
        // Only sync admin users to the database
        if (isAdmin) {
          try {
            const result = await ctx.runMutation(internal.users._syncUser, {
              clerkId,
              email,
              name,
              role: "admin",
            });

            if (result.error) {
              console.error(`Failed to sync admin user: ${result.error}`);
            } else {
              console.log(
                `${result.isNew ? "Created" : "Updated"} admin user ${result.userId} for ClerkID ${clerkId}`
              );
            }
          } catch (error) {
            console.error("Exception while syncing admin user:", error);
            throw new Error(
              `Failed to sync admin user: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        } else {
          console.log(`Skipping sync for non-admin user ${clerkId}`);
        }
        break;

      case "user.deleted":
        // Handle user deletion
        try {
          await ctx.runMutation(internal.users._deleteUser, { clerkId });
          console.log(`Deleted user with ClerkID ${clerkId}`);
        } catch (error) {
          console.error("Failed to delete user:", error);
          // Don't throw here to prevent webhook failures on deletion
        }
        break;
    }
  },
});
