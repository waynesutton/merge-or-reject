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
    return await ctx.db.query("users").collect();
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
  },
  returns: v.object({
    userId: v.id("users"),
    isNewUser: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
      });
      return { userId: existingUser._id, isNewUser: false };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      isAnonymous: false,
      totalGames: 0,
      averageScore: 0,
      role: "user", // Default role
    });

    return { userId, isNewUser: true };
  },
});

/**
 * Create an anonymous user - public access
 */
export const createAnonymousUser = mutation({
  args: {},
  returns: v.object({
    userId: v.id("users"),
    name: v.string(),
  }),
  handler: async (ctx) => {
    const defaultName = `Player ${Math.floor(Math.random() * 1000)}`;
    const userId = await ctx.db.insert("users", {
      name: defaultName,
      isAnonymous: true,
      totalGames: 0,
      averageScore: 0,
      role: "user",
    });
    return { userId, name: defaultName };
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
    userId: v.id("users"),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify admin access
    await requireAdmin(ctx, args.clerkId);

    // Delete user's games
    const games = await ctx.db
      .query("games")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const game of games) {
      await ctx.db.delete(game._id);
    }

    // Delete user's stats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId_language", (q) => q.eq("userId", args.userId))
      .collect();

    for (const stat of stats) {
      await ctx.db.delete(stat._id);
    }

    // Finally, delete the user
    await ctx.db.delete(args.userId);
    return null;
  },
});
