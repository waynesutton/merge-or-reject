# Codebase Structure

## Convex Backend

### Core Files

- `convex/schema.ts`

  - Database schema definitions
  - Tables: users, games, snippets, settings, languageVolumes, userStats
  - Optimized indexes for language and difficulty queries
  - Game settings configuration schema

- `convex/game.ts`

  - Game session management
  - Start game functionality with difficulty filtering
  - Score tracking
  - Game state management
  - Snippet selection for games
  - Time limit handling
  - Answer submission and validation

- `convex/games.ts`

  - Game creation and retrieval
  - Save completed games
  - Recent games history
  - User game history
  - Game statistics tracking

- `convex/scores.ts`

  - Score tracking system
  - Global leaderboards
  - Language-specific leaderboards
  - Recent scores feed
  - Personal best tracking

- `convex/users.ts`

  - Anonymous user management
  - User profile handling
  - User statistics
  - User deletion with cascade cleanup
  - User search functionality
  - Anonymous user name updates
  - Admin user role management

- `convex/snippets.ts`

  - Code snippet management
  - AI snippet generation
  - Snippet validation
  - Language-specific snippet organization
  - Volume-based snippet management
  - Snippet tagging system
  - Snippet editing functionality

- `convex/settings.ts`

  - Game configuration management
  - Language volume settings
  - Difficulty settings
  - Time limit configuration
  - AI generation settings

- `convex/init.ts`

  - Initial setup routines
  - Default data population
  - Language volume initialization
  - Game settings initialization

- `convex/auth.ts`

  - Authentication handling
  - Admin access control
  - User role verification
  - Protected route management

- `convex/clerk.ts`

  - Clerk web hook integration
  - User synchronization
  - Authentication events handling
  - Admin user provisioning

- `convex/debug.ts`
  - Debugging utilities
  - System diagnostics
  - Data validation tools

### Generated Files

- `convex/_generated/api.ts`

  - Auto-generated API types
  - Function references
  - Type-safe API endpoints

- `convex/_generated/server.ts`

  - Server-side utilities
  - Context types
  - Database helpers

- `convex/_generated/dataModel.ts`
  - Generated database types
  - Table schemas
  - Type definitions

## Frontend

### Components

- `src/App.tsx`

  - Main application component
  - Routing setup
  - Game flow management
  - State management
  - Dark/Light mode toggle

- `src/components/GameContainer.tsx`

  - Main game logic
  - User interaction handling
  - Game state management
  - Timer integration
  - Snippet display
  - Vote handling (merge/reject)
  - Skip functionality
  - End game functionality
  - Navigation warnings
  - Confirmation dialogs

- `src/components/GameResult.tsx`

  - Game completion display
  - Score presentation
  - Share functionality
  - Statistics display
  - Replay options
  - Anonymous user name updates

- `src/components/ScoresPage.tsx`

  - Leaderboard display
  - Recent games list
  - Score filtering
  - Personal bests
  - Language-specific scores

- `src/components/Leaderboard.tsx`

  - Global rankings
  - Score display
  - User rankings
  - Time period filtering
  - Language filtering

- `src/components/CodeDisplay.tsx`

  - Syntax highlighted code
  - Code editor styling
  - Dark/light mode support

- `src/components/Timer.tsx`

  - Game countdown
  - Visual time indicators
  - Time-based scoring
  - Difficulty-based timing
  - Round management

- `src/components/HomePage.tsx`

  - Game entry point
  - Language selection
  - Difficulty selection
  - User onboarding
  - Quick start options

- `src/components/AdminDashboard.tsx`

  - Admin controls
  - Statistics overview
  - User management
  - Snippet management
  - System settings
  - Snippet editing interface
  - AI generation controls

- `src/components/Header.tsx`

  - Navigation header
  - Theme toggle
  - User information
  - Admin access links

- `src/components/Footer.tsx`

  - Site navigation
  - Social links
  - Version info
  - Credits display

- `src/components/NotFoundPage.tsx`

  - 404 error handling
  - Navigation recovery
  - User guidance

- `src/components/LevelSelector.tsx`

  - Difficulty level selection
  - Visual difficulty indicators
  - Game start functionality

- `src/components/LanguageSelector.tsx`

  - Programming language selection
  - Language icons and descriptions
  - Game initialization

- `src/components/ProtectedRoute.tsx`

  - Admin route protection
  - Authentication verification
  - Redirect handling

- `src/components/HowToPlay.tsx`

  - Game instructions
  - Visual guides
  - Gameplay explanation

- `src/components/Toaster.tsx`
  - Notification system
  - Success/error messages
  - Timed alerts

### Utils & Types

- `src/types.ts`

  - TypeScript definitions
  - Game constants
  - Shared interfaces
  - Type guards
  - Utility types

- `src/lib/openai.ts`
  - OpenAI integration
  - Snippet generation
  - AI configuration
  - Error handling
  - Rate limiting

### Configuration

- `vite.config.ts`

  - Build configuration
  - Plugin setup
  - Environment handling
  - Development server
  - Production optimization

- `tsconfig.json`

  - TypeScript settings
  - Compiler options
  - Path aliases
  - Type checking rules

- `package.json`
  - Project dependencies
  - Scripts
  - Version info
  - Build commands
  - Development tools
