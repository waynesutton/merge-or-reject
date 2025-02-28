# Merge or Reject - Open Source Code Review Game

Merge or Reject is an open source game where developers test their code review skills against AI-generated code snippets. Players must decide whether to merge or reject code based on their analysis, making it a fun way to improve code review abilities.

## 🎮 Game Features

### Authentication & Users

- No login required to play the game
- Anonymous users are created only when starting a game
- Clerk authentication for admin access
- Admin dashboard with comprehensive controls
- User scores and progress tracked anonymously
- Customizable display names after game completion

### Core Gameplay

- Real-time code snippet validation
- Multiple programming languages supported:
  - TypeScript
  - JavaScript
  - Python
  - Java
  - C++ (cpp)
  - Rust
- Three difficulty levels:
  - Easy (120 seconds, 3 rounds)
  - Medium (100 seconds, 5 rounds)
  - Hard (30 seconds, 7 rounds)
- Volume-based progression system
- AI-generated code snippets using GPT-4
- Instant feedback and detailed explanations
- Skip option for challenging snippets
- Visual effects and celebrations

### User Features

- Anonymous user creation
- Persistent scores and statistics
- Personal best tracking per language
- Language-specific progress
- Dark/light mode preference
- Share scores on social media
- Global leaderboards
- Recent games feed

### Admin Features

- Comprehensive dashboard
- Game statistics monitoring
- Code snippet management
- AI generation controls
- Volume and difficulty settings
- Snippet editing capabilities
- User role management

## 🛠 Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS with custom theme
- Lucide React icons
- Canvas Confetti
- PowerGlitch effects

### Backend

- Convex for serverless backend
- Real-time data sync
- OpenAI GPT-4 integration
- Clerk authentication
- Public API endpoints

### Database

- Convex's built-in database
- Real-time subscriptions
- Optimized indexes
- Automatic scaling

## 📁 Project Structure

### Convex Backend

```
convex/
├── schema.ts      # Database schema
├── game.ts        # Game logic
├── games.ts       # Game management
├── scores.ts      # Leaderboards
├── users.ts       # User management
├── snippets.ts    # Code snippets
├── admin.ts       # Admin controls
├── settings.ts    # Configuration
├── init.ts        # Setup
├── auth.ts        # Authentication
└── clerk.ts       # Clerk webhooks
```

### Frontend Components

```
src/
├── App.tsx
├── components/
│   ├── GameContainer.tsx
│   ├── GameResult.tsx
│   ├── ScoresPage.tsx
│   ├── CodeDisplay.tsx
│   ├── Timer.tsx
│   ├── HomePage.tsx
│   ├── AdminDashboard.tsx
│   ├── Header.tsx
│   └── Footer.tsx
└── types/
    └── index.ts
```

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/merge-or-reject.git
   cd merge-or-reject
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Add your OpenAI API key and Clerk credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Convex for backend infrastructure
- Clerk for authentication
- React and Vite teams
- All contributors and players!
