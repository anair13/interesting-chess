# Chess Random Positions

A modern chess website inspired by chess.com, but with a unique twist - every game starts from an interesting board position taken from real Grandmaster games. Discover and play through positions that have been played in famous games by chess legends like Kasparov, Fischer, Carlsen, and many more.

## Features

### ✨ Core Features
- **Play chess starting from famous GM game positions** 
- **Interactive chess board with real-time move validation**
- **Beautiful modern UI** designed with Styled Components
- **Mobile responsive** chess board  
- **Position filtering** by player, year range, opening type
- **Real GM game data** with player names, events, and descriptions

### 🎮 Gameplay
- Full legal-move validation using chess.js engine
- Click-to-move interface
- Piece animations and visual feedback
- Real-time game state tracking (check, checkmate, stalemate)

### 🔍 Position Discovery
- Scroll through dozens of famous positions from historic games
- Filter positions by specific players like "Kasparov" or "Carlsen"
- Find games from time periods (e.g., 1990-2005)
- Look for specific openings like "Sicilian Defense" or "Queen's Gambit"

## Technology Stack

- **Framework:** Next.js 14 with TypeScript
- **UI:** Styled Components for responsive design  
- **Game Engine:** chess.js for move validation and game logic
- **Language:** TypeScript for robust development

## Quick Setup 

1. **Install dependencies**
```bash
npm install
```

2. **Run in development mode**
```bash
npm run dev
```

3. **Open in browser** at http://localhost:3000

4. **Build for production** (optional)
```bash
npm run build && npm run start
```

## How to Play

1. **Load** a random interesting position 
2. **Click** any of your pieces to select it
3. **Move** to highlighted squares to make legal moves  
4. **Try** new positions with the "New Random Position" button
5. **Filter** by player/opening/year to explore specific areas

## Included Game Positions

The app includes carefully selected positions from games featuring:

- **Bobby Fischer** (World Championships 1972)
- **Garry Kasparov** (The Immortal Game, Modern Classics)
- **Magnus Carlsen** (2023+ Contemporary Masterpieces)  
- **Hikaru Nakamura** (Tactical Fireworks)
- **Paul Morphy** (19th Century Genius)
- **Viswanathan Anand** (Modern Endgame Study)
- **And dozens more legendary players...**

Each position comes with original game context including player names, dates, tournaments, and where available - notes on what makes the position particularly interesting.

## Future Enhancements

- **Position database expansion** (adding hundreds more GM positions)
- **Move analysis** via integration with chess engines 
- **Puzzle mode conversion** of GM positions to craft educational exercises
- **Save/load game states** for extended analysis sessions
- **Position rating system** to categorize difficulty levels

## Development

The source code is modular, well-documented, and ready for enhancements:

- `app/page.tsx` - Main dashboard and game initialization
- `app/components/ChessBoard.tsx` - Interactive chess board with engine integration
- `app/components/PositionFilter.tsx` - Smart filtering interface  
- `app/components/PositionInfo.tsx` - Position history display
- `app/data/gmPositions.ts` - Database of curated GM positions

The chess.js integration makes it easy to modify rules or add features.
