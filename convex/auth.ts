/**
 * auth.ts
 *
 * Authentication utilities for Clerk integration with Convex database.
 *
 * Changes made:
 * - Created auth utility file for Clerk-Convex synchronization
 * - Added admin validation functions
 * - Implemented detailed error handling
 * - Added typed error responses
 * - Defined requireAdmin utility for securing admin-only endpoints
 */

import { DatabaseReader } from "./_generated/server";
import { UserDoc } from "./types";
import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Helper function to get a user by their Clerk ID
 */
export const getUserByClerkId = async (
  ctx: { db: DatabaseReader },
  clerkId: string
): Promise<UserDoc | null> => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
};

/**
 * Error types for authentication failures
 */
export type AuthError = {
  code: "UNAUTHORIZED" | "NOT_FOUND" | "DATABASE_ERROR";
  message: string;
};

/**
 * Check if a user object from Clerk has admin role in their public metadata
 * Can be used on client-side to determine if a user should have admin access
 */
export function checkClerkAdminRole(user: any): boolean {
  if (!user) return false;

  // Check public metadata for role field
  if (user.publicMetadata && typeof user.publicMetadata === "object") {
    return user.publicMetadata.role === "admin";
  }

  return false;
}

/**
 * Verify if a user has admin privileges based on their Clerk ID
 * Used by query functions to check admin access
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  clerkId: string
): Promise<string> {
  if (!clerkId) {
    throw new Error("UNAUTHORIZED: No authentication credentials provided");
  }

  try {
    // Handle different context types separately
    if ("runQuery" in ctx) {
      // Action context
      const actionCtx = ctx as ActionCtx;
      // Use the internal getUserRole function
      const role = await actionCtx.runQuery(internal.users._getUserRole, { clerkId });

      if (role !== "admin") {
        throw new Error("UNAUTHORIZED: User does not have admin privileges");
      }
    } else if ("db" in ctx) {
      // Query or Mutation context
      if (isQueryCtx(ctx)) {
        const queryCtx = ctx as QueryCtx;
        const users = await queryCtx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .collect();

        if (users.length === 0) {
          throw new Error("NOT_FOUND: User not found in database");
        }

        const user = users[0];
        if (user.role !== "admin") {
          throw new Error("UNAUTHORIZED: User does not have admin privileges");
        }
      } else {
        // Mutation context
        const mutationCtx = ctx as MutationCtx;
        const users = await mutationCtx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .collect();

        if (users.length === 0) {
          throw new Error("NOT_FOUND: User not found in database");
        }

        const user = users[0];
        if (user.role !== "admin") {
          throw new Error("UNAUTHORIZED: User does not have admin privileges");
        }
      }
    } else {
      throw new Error("DATABASE_ERROR: Invalid context type");
    }

    return clerkId;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`UNAUTHORIZED: ${error}`);
  }
}

// Type guard for QueryCtx
function isQueryCtx(ctx: QueryCtx | MutationCtx): ctx is QueryCtx {
  return "db" in ctx && "storage" in ctx && !("scheduler" in ctx);
}

/**
 * Process Clerk auth data to determine if a user has admin privileges
 * Used by the Clerk webhook to sync admin status
 */
export function hasAdminRole(userData: any): boolean {
  // Check if the user has the admin role in their public metadata
  if (userData?.public_metadata && typeof userData.public_metadata === "object") {
    return userData.public_metadata.role === "admin";
  }
  return false;
}

/**
 * Extract error code from error message for consistent error handling
 */
export function extractErrorCode(error: Error): AuthError {
  const message = error.message;

  if (message.startsWith("UNAUTHORIZED:")) {
    return {
      code: "UNAUTHORIZED",
      message: message.substring("UNAUTHORIZED:".length).trim(),
    };
  }

  if (message.startsWith("NOT_FOUND:")) {
    return {
      code: "NOT_FOUND",
      message: message.substring("NOT_FOUND:".length).trim(),
    };
  }

  return {
    code: "DATABASE_ERROR",
    message: `Operation failed: ${message}`,
  };
}

/**
 * Helper function to require admin role
 * Throws an error if the user is not an admin
 */
export const requireAdminRole = async (
  ctx: { db: DatabaseReader },
  clerkId: string
): Promise<UserDoc> => {
  const user = await getUserByClerkId(ctx, clerkId);
  if (!user) {
    throw new ConvexError("User not found");
  }
  if (user.role !== "admin") {
    throw new ConvexError("Unauthorized: Admin access required");
  }
  return user;
};

/**
 * Helper function to require authentication
 * Throws an error if the user is not authenticated
 */
export const requireAuth = async (
  ctx: { db: DatabaseReader },
  clerkId: string | null
): Promise<UserDoc> => {
  if (!clerkId) {
    throw new ConvexError("Authentication required");
  }
  const user = await getUserByClerkId(ctx, clerkId);
  if (!user) {
    throw new ConvexError("User not found");
  }
  return user;
};
