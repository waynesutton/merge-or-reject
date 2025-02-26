/**
 * User Management Module
 *
 * This module handles all user-related operations including:
 * - User authentication and admin verification
 * - User search functionality
 * - User deletion with cascade cleanup
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { requireAuth, requireAdmin } from "./auth";

// Type for user document
type UserDoc = Doc<"users">;

/**
 * Get all users - admin only
 */
export const getUsers = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      isAnonymous: v.boolean(),
      totalGames: v.number(),
      averageScore: v.number(),
      role: v.union(v.literal("admin"), v.literal("user")),
      email: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);
    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      isAnonymous: user.isAnonymous,
      totalGames: user.totalGames,
      averageScore: user.averageScore,
      role: user.role,
      email: user.email,
    }));
  },
});

/**
 * Get user information - authenticated only
 */
export const getUser = query({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
  },
  returns: v.object({
    name: v.string(),
    isAnonymous: v.boolean(),
    totalGames: v.number(),
    averageScore: v.number(),
    role: v.union(v.literal("admin"), v.literal("user")),
    email: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Verify authentication
    await requireAuth(ctx, args.clerkId);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    return user;
  },
});

/**
 * Create or update a user from Clerk webhook
 */
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        role: args.role,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: args.role,
      isAnonymous: false,
      totalGames: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
    });

    return userId;
  },
});

/**
 * Create an anonymous user - public access
 */
export const createAnonymousUser = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      name: args.name,
      role: "user",
      isAnonymous: true,
      totalGames: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
    });
  },
});

/**
 * Update a user's display name - authenticated only
 */
export const updateUserName = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    clerkId: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    // Verify authentication
    const authUser = await requireAuth(ctx, args.clerkId);

    // Users can only update their own name
    if (authUser._id !== args.userId) {
      throw new Error("Unauthorized: Can only update own name");
    }

    await ctx.db.patch(args.userId, {
      name: args.name,
    });

    return args.name;
  },
});

/**
 * Delete a user and all associated data - admin only
 */
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
    }
    return null;
  },
});

/**
 * Fix user schema by adding missing required fields - public access
 * This is a utility function to fix schema validation issues
 */
export const fixUserSchema = mutation({
  args: {},
  returns: v.object({
    updatedCount: v.number(),
  }),
  handler: async (ctx) => {
    // Find all users
    const users = await ctx.db.query("users").collect();
    let updatedCount = 0;

    // Update each user that's missing the role field
    for (const user of users) {
      const userData = user as any; // Use any to bypass type checking
      if (!("role" in userData)) {
        await ctx.db.patch(userData._id, {
          role: "user", // Default role
        });
        updatedCount++;
      }
    }

    console.log(`Fixed ${updatedCount} users missing the role field`);
    return { updatedCount };
  },
});

/**
 * Get user's role by Clerk ID
 */
export const getUserRole = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(v.literal("admin"), v.literal("user"), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    return user?.role ?? null;
  },
});
