# Cursor Rules: Merge or Reject AI Code Review

A game where developers test their **code review skills** against AI-generated code snippets.

## Project Name
**Merge or Reject AI Code Review**

## Description
A competitive and educational game where developers analyze AI-generated code snippets and decide whether to **merge** or **reject** them based on quality, security, and best practices.

## Tech Stack

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **Authentication**: Clerk
- **State Management**: React Hooks

### Backend
- **Database**: Convex
- **AI Integration**: OpenAI API

### Deployment
- **Hosting**: Netlify
- **Build Tool**: Vite

## Required Experience

### Languages
#### TypeScript (Intermediate)
- Type definitions
- Interfaces
- Generics
- React with TypeScript

#### JavaScript (Intermediate)
- ES6+ features
- Async/await
- Promises
- DOM manipulation

### Frameworks
#### React (Intermediate)
- Hooks (`useState`, `useEffect`, `useRef`)
- Context API
- Component lifecycle
- Performance optimization

#### Tailwind CSS (Intermediate)
- Responsive design
- Custom configurations
- Dark mode
- Animation classes

### Tools
#### Vite (Basic)
- Project setup
- Development server
- Build configuration

#### Git (Basic)
- Version control
- Branching
- Pull requests

## Features

### Authentication
**Provider**: Clerk
- Email/password signup
- User profiles
- Role-based access
- Admin dashboard

### Database
**Provider**: Convex
- **Schemas**: `users`, `games`, `codeSnippets`, `languageVolumes`, `gameSettings`, `userStats`

### Gameplay
#### Mechanics
- Multiple programming languages
- Three difficulty levels
- Time-based challenges
- Score tracking
- Volume progression

#### Supported Languages
- TypeScript
- JavaScript
- Python
- Rust
- Go
- SQL

#### Difficulty Levels
- **Easy**: 3 rounds, 120 seconds per round
- **Medium**: 5 rounds, 100 seconds per round
- **Hard**: 7 rounds, 30 seconds per round

### Admin Dashboard
- Code snippet management
- AI snippet generation
- Game settings configuration
- Analytics tracking
- User management

### User Interface
- Dark/light mode toggle
- Responsive design
- Animated transitions
- Code syntax highlighting
- Confetti celebrations
- Leaderboards

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- OpenAI API key
- Clerk account
- Convex account

### Setup Steps
1. Clone the repository
2. Install dependencies (`npm install` or `yarn install`)
3. Configure environment variables
4. Set up Clerk authentication
5. Initialize Convex database
6. Configure OpenAI API

### Environment Variables
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_OPENAI_API_KEY`
- `CONVEX_DEPLOYMENT`
- `CLERK_SECRET_KEY`

## Deployment

### Hosting Provider: Netlify
**Configuration**:
- **Build Command**:
  ```sh
  npx convex deploy --cmd 'npm run build'
  ```
- **Publish Directory**: `dist`
- **Environment Variables**: Enabled
- **Automatic Deploys**: Enabled

---

This document outlines the **rules, setup, and structure** for the **Merge or Reject AI Code Review** game. 🚀
