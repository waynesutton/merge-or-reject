import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
      if (!('role' in userData)) {
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