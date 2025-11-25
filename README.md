# Stork Crush

A polished, dark-themed Match-3 game with **Solo & Multiplayer modes** built with React, Vite, Firebase, and Framer Motion.

## Features

### Game Modes
- **Solo Mode** - Play alone and beat your high score
- **Multiplayer Mode** - Compete with friends in real-time!

### Core Gameplay
- **8x8 Grid**
- **Match-3 Mechanics**
- **Combo System**

### Special Items (4 Types)
1. **Line Breaker**
2. **Double Bomber**
3. **Laser Shot**
4. **Chaos Orb**

Special items appear when:
- Creating Match-4 or Match-5 combos
- Making L/T shaped matches
- Random 5% drop chance

### Multiplayer Features
- **Room-based System** - Create or join game rooms
- **Real-time Score Sync** - See everyone's score live via Firebase
- **Live Leaderboard** - Final ranking with medals 🥇🥈🥉
- **Username Validation** - No duplicate names allowed
- **Host Controls** - Host can start the game
- **Share Link** - Easy invite system for friends

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Firebase Realtime Database** - Multiplayer sync
- **CSS Modules** - Scoped styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Development

### Prerequisites
- Node.js 16+ installed
- Firebase project (already configured)

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Game will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

Enjoy playing! 🎮✨
