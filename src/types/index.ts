export type Level = 1 | 2 | 3;
export type Language = 'typescript' | 'rust' | 'javascript' | 'python' | 'go' | 'sql';

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredGames: number;
}

export const BADGES: Badge[] = [
  {
    id: 'hello_world',
    name: 'Hello, World!',
    emoji: '🌍',
    description: 'Your first step into the game',
    requiredGames: 1
  },
  {
    id: 'code_explorer',
    name: 'Code Explorer',
    emoji: '🧭',
    description: "You're starting to navigate the world of AI-generated code",
    requiredGames: 3
  },
  {
    id: 'syntax_warrior',
    name: 'Syntax Warrior',
    emoji: '⚔️',
    description: "You've battled through multiple rounds of code review",
    requiredGames: 9
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    emoji: '🔎',
    description: "You're spotting bugs like a pro",
    requiredGames: 12
  },
  {
    id: 'merge_commander',
    name: 'Merge Commander',
    emoji: '🔄',
    description: 'You know when to merge and when to reject',
    requiredGames: 24
  },
  {
    id: 'refactor_wizard',
    name: 'Refactor Wizard',
    emoji: '👑',
    description: "You've seen enough code to refactor everything in sight",
    requiredGames: 50
  },
  {
    id: 'commit_legend',
    name: 'Commit Legend',
    emoji: '🚀',
    description: 'Your game record is solid—time to push to production',
    requiredGames: 100
  }
];

export interface CodeSnippet {
  code: string;
  isValid: boolean;
  language: Language;
  volume: number;
}

export interface GameScore {
  id: string;
  playerName: string;
  score: number;
  language: Language;
  level: Level;
  timestamp: string;
  volume: number;
}

export interface UserStats {
  language: Language;
  gamesPlayed: number;
  averageScore: number;
  highestScore: number;
  lastPlayed: string;
  volumes: number[];
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  profileUrl: string;
  isPrivate: boolean;
  joinedDate: string;
  totalGames: number;
  averageScore: number;
  stats: UserStats[];
  earnedBadges: string[]; // Array of badge IDs
}

export interface LanguageVolume {
  language: Language;
  currentVolume: number;
  snippetCount: number;
}

export const LEVEL_TIMES: Record<Level, number> = {
  1: 120,
  2: 100,
  3: 30,
};

export const LANGUAGES: Record<Language, string> = {
  typescript: 'TypeScript',
  rust: 'Rust',
  javascript: 'JavaScript',
  python: 'Python',
  go: 'Go',
  sql: 'SQL',
};