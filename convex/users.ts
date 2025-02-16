import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { UserDoc, GetUserByClerkId, RequireAdmin } from "./types";

// Helper functions
export const getUserByClerkId: GetUserByClerkId = async (ctx, clerkId) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
};

export const requireAdmin: RequireAdmin = async (ctx, clerkId) => {
  const user = await getUserByClerkId(ctx, clerkId);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
};

// Get users for admin dashboard
export const getUsers = query({
  args: { 
    search: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify admin access
    await requireAdmin(ctx, identity.subject);

    let query = ctx.db.query("users");
    
    if (args.search) {
      query = query.filter((q) => 
        q.or(
          q.contains(q.field("username"), args.search!),
          q.contains(q.field("email"), args.search!)
        )
      );
    }

    return await query.collect();
  },
});

// Delete a user
export const deleteUser = mutation({
  args: { 
    userId: v.id("users") 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify admin access
    await requireAdmin(ctx, identity.subject);

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
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const stat of stats) {
      await ctx.db.delete(stat._id);
    }

    // Finally, delete the user
    await ctx.db.delete(args.userId);
  },
});