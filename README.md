# 💎 Crystal Crush - Match-3 Game

A polished, dark-themed Match-3 game built with React, Vite, Tailwind CSS, and Framer Motion.

## ✨ Features

### Core Gameplay
- **8x8 Grid** with smooth animations
- **Match-3 Mechanics** - Match 3 or more crystals to score
- **30 Moves** per game
- **Combo System** - Chain matches for multiplier bonuses
- **High Score** tracking with LocalStorage

### Special Items (4 Types)
1. **🔥 Line Breaker** - Destroys entire row and column
2. **💣 Double Bomber** - Explodes twice in 3x3 radius with 200ms delay
3. **⚡ Laser Shot** - Clears cross-shaped lines (horizontal + vertical)
4. **🌟 Chaos Orb** - Destroys all instances of a random color

Special items appear when:
- Creating Match-4 or Match-5 combos
- Making L/T shaped matches
- Random 5% drop chance

### UI/UX
- **Dark Theme** with neon cyan/purple accents
- **Floating Score Text** on matches
- **Board Shake** on invalid moves
- **Smooth Animations** for swapping, falling, and explosions
- **Game Over Modal** with final score and high score
- **Share to Twitter** button

## 🚀 Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **CSS Modules** - Scoped styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 📁 Project Structure

```
match3-game/
├── src/
│   ├── components/
│   │   ├── GameBoard.jsx       # Main game grid
│   │   ├── ScoreBoard.jsx      # Score, moves, high score display
│   │   └── GameOverModal.jsx   # End game modal
│   ├── hooks/
│   │   └── useMatch3Logic.js   # Core game logic
│   ├── App.jsx                 # Main app component
│   ├── main.jsx
│   └── index.css
├── public/
│   └── images/
│       ├── 1.png - 6.png       # Regular crystals
│       └── special/
│           └── 1.png - 4.png   # Special items
└── package.json
```

## 🎮 How to Play

1. Click on a crystal to select it
2. Click on an adjacent crystal to swap
3. Match 3 or more crystals of the same type
4. Create special items by matching 4+ crystals
5. Chain matches for combo multipliers
6. Score as high as you can in 30 moves!

## 🛠️ Development

The game is already running on `http://localhost:5173/`

To start fresh:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

## 🎯 Game Logic Highlights

- **No Infinite Loops** - Robust match detection algorithm
- **Animation Blocking** - Input disabled during cascading matches
- **Modular Code** - Separated logic (hooks) from UI (components)
- **Gravity System** - Crystals fall naturally after matches
- **Special Item Activation** - Cascading explosions handled properly

## 🎨 Customization

- Modify `GRID_SIZE` in `useMatch3Logic.js` for different board sizes
- Adjust `TOTAL_MOVES` for difficulty
- Change `SPECIAL_DROP_CHANCE` for special item frequency
- Update colors in CSS Module files for different themes
- Each component has its own `.module.css` file for easy styling

Enjoy playing! 🎮✨
