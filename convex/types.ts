/**
 * types.ts
 *
 * Type definitions for the application.
 *
 * Changes made:
 * - Added types for admin verification and authentication
 * - Updated document interfaces to match schema changes
 * - Added Clerk-related types for webhook integration
 * - Added error handling types for consistent error responses
 */

import {
  QueryCtx,
  MutationCtx,
  ActionCtx,
  DatabaseReader,
  DatabaseWriter,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Type-safe context types
export type Context = {
  query: QueryCtx;
  mutation: MutationCtx;
  action: ActionCtx;
};

// Document types with strict typing
export type UserRole = "admin" | "user";
export type Difficulty = "easy" | "medium" | "hard";
export type Language = "typescript" | "javascript" | "python" | "rust" | "go" | "sql";

export interface UserDoc extends Doc<"users"> {
  name: string;
  isAnonymous: boolean;
  totalGames: number;
  averageScore: number;
  role: UserRole;
  clerkId?: string;
  email?: string;
  createdAt: string;
}

export interface GameDoc {
  _id: Id<"games">;
  _creationTime: number;
  userId: Id<"users">;
  language: Language;
  difficulty: Difficulty;
  score: number;
  snippetsCompleted: number;
  level: number;
  timestamp: string;
  snippetsPlayed: Id<"codeSnippets">[];
  userAnswers: boolean[];
  createdAt: string;
}

export interface LanguageVolumeDoc extends Doc<"languageVolumes"> {
  language: Language;
  currentVolume: number;
  snippetCount: number;
  aiGeneratedCount: number;
  lastAiGeneration: string;
}

export interface CodeSnippetDoc extends Doc<"codeSnippets"> {
  language: Language;
  volume: number;
  code: string;
  isValid: boolean;
  difficulty: Difficulty;
  explanation: string;
  tags: string[];
  aiGenerated?: boolean;
  createdAt: string;
}

export interface UserStatsDoc extends Doc<"userStats"> {
  userId: Id<"users">;
  language: Language;
  gamesPlayed: number;
  averageScore: number;
  highestScore: number;
  lastPlayed: string;
  volumes: number[];
}

export interface GameSettingsDoc extends Doc<"gameSettings"> {
  timeLimits: {
    easy: number;
    medium: number;
    hard: number;
  };
  snippetsPerGame: {
    easy: number;
    medium: number;
    hard: number;
  };
  aiGeneration: {
    enabled: boolean;
    validRatio: number;
    maxPerRequest: number;
    minSnippetsBeforeGeneration: number;
  };
}

// Auth types
export type AuthError = {
  code: "UNAUTHORIZED" | "NOT_FOUND" | "DATABASE_ERROR";
  message: string;
};

// Helper function types
export type GetUserByClerkId = (
  ctx: { db: DatabaseReader },
  clerkId: string
) => Promise<UserDoc | null>;

export type RequireAdmin = (
  ctx: QueryCtx | MutationCtx | ActionCtx,
  clerkId: string
) => Promise<string>;

export type RequireAdminRole = (ctx: { db: DatabaseReader }, clerkId: string) => Promise<UserDoc>;

export type RequireAuth = (ctx: { db: DatabaseReader }, clerkId: string | null) => Promise<UserDoc>;

// Clerk integration types
export interface ClerkSyncResult {
  userId: string;
  isNew: boolean;
  error?: string;
}

// User synchronization types
export interface SyncUserArgs {
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface DeleteUserArgs {
  clerkId: string;
}

// Admin verification
export interface AdminVerificationResult {
  isAdmin: boolean;
  userId?: Id<"users">;
  error?: string;
}
