# Project Files Overview

## Frontend Files

### Core Application Files

- `src/App.tsx`
  - Main application component
  - Handles routing and global state
  - Manages theme switching and layout

### Components

- `src/components/GameContainer.tsx`

  - Main game container component
  - Manages game state and user interactions
  - Handles swipe gestures and animations
  - Controls game flow and scoring
  - Implements keyboard shortcuts
  - Manages mobile-friendly interface

- `src/components/CodeDisplay.tsx`

  - Displays code snippets with syntax highlighting
  - Handles swipe animations and visual feedback
  - Shows merge/reject indicators
  - Manages dark/light mode styling

- `src/components/GameResult.tsx`

  - Displays game completion screen
  - Shows final score and statistics
  - Provides options to play again or share results

- `src/components/Timer.tsx`

  - Countdown timer for each code review
  - Visual progress indicator
  - Adapts to different difficulty levels

- `src/components/Header.tsx`

  - Navigation header component
  - Theme toggle functionality
  - User authentication status

- `src/components/Footer.tsx`

  - Site footer with links and information
  - Social media integration
  - Copyright information

- `src/components/HomePage.tsx`

  - Landing page component
  - Language selection interface
  - Game introduction and instructions

- `src/components/AdminDashboard.tsx`

  - Admin control panel
  - Game statistics and management
  - Snippet generation controls
  - User management interface

- `src/components/ScoresPage.tsx`
  - Leaderboards display
  - Score filtering and sorting
  - User statistics

### Type Definitions

- `src/types/index.ts`
  - TypeScript type definitions
  - Game state interfaces
  - Component prop types
  - API response types

## Backend Files (Convex)

### Core Backend Files

- `convex/schema.ts`

  - Database schema definitions
  - Table structures and relationships
  - Index configurations

- `convex/game.ts`

  - Core game logic
  - Snippet validation
  - Score calculation
  - Game state management

- `convex/games.ts`

  - Game session management
  - Game creation and updates
  - Game state persistence

- `convex/scores.ts`

  - Score tracking and leaderboards
  - Score aggregation
  - Performance statistics

- `convex/users.ts`

  - User management
  - Anonymous user creation
  - User preferences

- `convex/snippets.ts`

  - Code snippet management
  - Snippet generation
  - Snippet validation

- `convex/admin.ts`

  - Admin functionality
  - Game configuration
  - System management

- `convex/settings.ts`

  - Application settings
  - Game configuration
  - System preferences

- `convex/init.ts`

  - Initial setup
  - Database initialization
  - Default configurations

- `convex/auth.ts`

  - Authentication logic
  - User session management
  - Security controls

- `convex/clerk.ts`
  - Clerk integration
  - Authentication webhooks
  - User management

## Configuration Files

- `package.json`

  - Project dependencies
  - Scripts and commands
  - Project metadata

- `tsconfig.json`

  - TypeScript configuration
  - Compiler options
  - Project settings

- `.env`
  - Environment variables
  - API keys
  - Configuration settings
