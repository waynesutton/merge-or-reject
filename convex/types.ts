import { QueryCtx, MutationCtx, DatabaseReader, DatabaseWriter } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Type-safe context types
export type Context = {
  query: QueryCtx;
  mutation: MutationCtx;
};

// Document types with strict typing
export type UserRole = "admin" | "user";
export type Difficulty = "easy" | "medium" | "hard";
export type Language = "typescript" | "javascript" | "python" | "rust" | "go" | "sql";

export interface UserDoc extends Doc<"users"> {
  firstName: string;
  username: string;
  profileUrl: string;
  isPrivate: boolean;
  joinedDate: string;
  totalGames: number;
  averageScore: number;
  earnedBadges: string[];
  role: UserRole;
  email: string;
  clerkId: string;
}

export interface GameDoc extends Doc<"games"> {
  userId: Id<"users">;
  language: Language;
  level: number;
  score: number;
  volume: number;
  timestamp: string;
}

export interface LanguageVolumeDoc extends Doc<"languageVolumes"> {
  language: Language;
  currentVolume: number;
  snippetCount: number;
  timeLimit: {
    easy: number;
    medium: number;
    hard: number;
  };
  snippetsPerGame: number;
}

export interface CodeSnippetDoc extends Doc<"codeSnippets"> {
  language: Language;
  volume: number;
  code: string;
  isValid: boolean;
  difficulty: Difficulty;
  createdAt: string;
  createdBy: Id<"users">;
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

// Helper function types
export type GetUserByClerkId = (
  ctx: { db: DatabaseReader },
  clerkId: string
) => Promise<UserDoc | null>;

export type RequireAdmin = (
  ctx: { db: DatabaseReader },
  clerkId: string
) => Promise<UserDoc>;