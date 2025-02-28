# Convex Backend for Merge or Reject

This directory contains all the Convex serverless functions for the Merge or Reject game. Below is a guide to the structure and best practices.

## 📁 Directory Structure

```
.
├── schema.ts      # Database schema and table definitions
├── game.ts        # Core game logic and session management
├── games.ts       # Game creation and retrieval functions
├── scores.ts      # Score tracking and leaderboard functions
├── users.ts       # Anonymous user management
├── snippets.ts    # Code snippet management
├── admin.ts       # Admin dashboard functions
├── settings.ts    # Game configuration
├── init.ts        # Initial setup and seeding
├── auth.ts        # Authentication logic
└── clerk.ts       # Clerk webhook integration
```

## 🔑 Key Concepts

### Database Schema

The game uses several tables defined in `schema.ts`:

```ts
// Example schema structure
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    // ... other fields
  }),
  games: defineTable({
    userId: v.id("users"),
    language: v.string(),
    difficulty: v.string(),
    // ... other fields
  }).index("by_user", ["userId"]),
  // ... other tables
});
```

### Function Types

1. **Queries** - Read-only operations:

```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLeaderboard = query({
  args: {
    language: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

2. **Mutations** - Write operations:

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createGame = mutation({
  args: {
    language: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

3. **Actions** - External API calls:

```ts
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateSnippet = action({
  args: {
    language: v.string(),
  },
  handler: async (ctx, args) => {
    // OpenAI API call implementation
  },
});
```

## 🔒 Authentication

We use Clerk for admin authentication. Regular users are anonymous:

```ts
// Example auth check
const isAdmin = await ctx.auth.getUserIdentity();
if (!isAdmin) {
  throw new Error("Admin access required");
}
```

## 📊 Database Queries

Common query patterns:

```ts
// Get user's games
const games = await ctx.db
  .query("games")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect();

// Get recent scores
const scores = await ctx.db.query("scores").order("desc").take(10);
```

## 🚀 Development

1. Make changes to functions
2. Test locally with `npx convex dev`
3. Deploy with `npx convex deploy`

## 📝 Best Practices

1. Always validate input with proper validators
2. Use appropriate indexes for queries
3. Keep functions focused and single-purpose
4. Handle errors gracefully
5. Use internal functions for sensitive operations
6. Document complex logic
7. Follow TypeScript best practices

For more details, see the [Convex documentation](https://docs.convex.dev/).
