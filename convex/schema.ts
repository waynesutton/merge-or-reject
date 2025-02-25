import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Store game settings
  gameSettings: defineTable({
    timeLimits: v.object({
      easy: v.number(),
      medium: v.number(),
      hard: v.number(),
    }),
    snippetsPerGame: v.object({
      easy: v.number(),
      medium: v.number(),
      hard: v.number(),
    }),
    aiGeneration: v.object({
      enabled: v.boolean(),
      validRatio: v.number(),
      maxPerRequest: v.number(),
      minSnippetsBeforeGeneration: v.number(),
    }),
  }),

  // Store language volumes information
  languageVolumes: defineTable({
    language: v.string(),
    currentVolume: v.number(),
    snippetCount: v.number(),
    aiGeneratedCount: v.number(),
    lastAiGeneration: v.string(),
  }).index("by_language", ["language"]),

  // Store code snippets for the game
  codeSnippets: defineTable({
    language: v.string(),
    volume: v.number(),
    code: v.string(),
    isValid: v.boolean(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    explanation: v.string(),
    tags: v.array(v.string()),
    aiGenerated: v.optional(v.boolean()),
    createdAt: v.string(),
  })
    .index("by_language_volume", ["language", "volume"])
    .index("by_language_difficulty", ["language", "difficulty"]),

  // Store game sessions
  games: defineTable({
    userId: v.id("users"),
    language: v.string(),
    level: v.number(),
    volume: v.number(),
    score: v.number(),
    timestamp: v.string(),
    snippetsPlayed: v.array(v.id("codeSnippets")),
    userAnswers: v.array(v.boolean()),
  }).index("by_userId", ["userId"]),

  // Store user statistics per language
  userStats: defineTable({
    userId: v.id("users"),
    language: v.string(),
    gamesPlayed: v.number(),
    averageScore: v.number(),
    highestScore: v.number(),
    lastPlayed: v.string(),
    volumes: v.array(v.number()),
  }).index("by_userId_language", ["userId", "language"]),

  // Store users with authentication
  users: defineTable({
    name: v.string(),
    isAnonymous: v.boolean(),
    totalGames: v.number(),
    averageScore: v.number(),
    role: v.union(v.literal("admin"), v.literal("user")),
    clerkId: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
});
