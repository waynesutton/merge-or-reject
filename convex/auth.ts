import { DatabaseReader } from "./_generated/server";
import { UserDoc } from "./types";
import { ConvexError } from "convex/values";

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
 * Helper function to require admin role
 * Throws an error if the user is not an admin
 */
export const requireAdmin = async (
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
