import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define a schema for the database tables
export default defineSchema({
  users: defineTable({
    firstName: v.string(),
    username: v.string(),
    profileUrl: v.string(),
    isPrivate: v.boolean(),
    joinedDate: v.string(),
    totalGames: v.number(),
    averageScore: v.number(),
    earnedBadges: v.array(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")), // Strict type for role
    email: v.string(),
    clerkId: v.string(),
  })
    .index("by_profileUrl", ["profileUrl"])
    .index("by_username", ["username"])
    .index("by_clerkId", ["clerkId"]),

  games: defineTable({
    userId: v.id("users"),
    language: v.string(),
    level: v.number(),
    score: v.number(),
    volume: v.number(),
    timestamp: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_language", ["language"]),

  languageVolumes: defineTable({
    language: v.string(),
    currentVolume: v.number(),
    snippetCount: v.number(),
    timeLimit: v.object({
      easy: v.number(),
      medium: v.number(),
      hard: v.number(),
    }),
    snippetsPerGame: v.number(),
  }).index("by_language", ["language"]),

  codeSnippets: defineTable({
    language: v.string(),
    volume: v.number(),
    code: v.string(),
    isValid: v.boolean(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")), // Strict type for difficulty
    createdAt: v.string(),
    createdBy: v.id("users"),
  }).index("by_language_volume", ["language", "volume"]),

  userStats: defineTable({
    userId: v.id("users"),
    language: v.string(),
    gamesPlayed: v.number(),
    averageScore: v.number(),
    highestScore: v.number(),
    lastPlayed: v.string(),
    volumes: v.array(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_language", ["userId", "language"]),
});