# Merge or Reject Game Features

## Core Features

- Anonymous user support with persistent scores
- Real-time code snippet validation game
- Multiple programming languages support (TypeScript, JavaScript, Python, Java, C++, Rust)
- Difficulty levels (Easy, Medium, Hard)
- Volume-based content organization
- AI-generated code snippets using GPT-4

### Language Selection and Code Snippets System

- Frontend language selection via LanguageSelector component
- Real-time language-specific snippet fetching
- Optimized database indexes for language queries:
  - by_language_volume: Fetches snippets by language and volume
  - by_language_difficulty: Fetches snippets by language and difficulty
  - by_language: Manages language-specific volumes and settings
- Automatic volume management per language
- AI-powered snippet generation per language
- Language-specific game session management
- Dynamic difficulty adjustment per language

## Game Mechanics

- Time-limited rounds
- Score tracking
- Progress indicators
- Instant feedback
- Explanation for each snippet

## User Features

- Anonymous user creation
- Persistent scores and stats
- Personal best tracking
- Language-specific statistics

## Social Features

- Global leaderboards
- Recent games feed
- Share scores on social media (Twitter, LinkedIn, Bluesky)

## Admin Features

- Dashboard with game statistics
- Code snippet management
- AI snippet generation control
- Volume management

## Technical Features

- Real-time updates with Convex
- Public access without authentication
- Responsive design
- Dark/Light mode support
