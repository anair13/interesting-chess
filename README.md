# Interesting Chess

A multiplayer chess web application where you can play fascinating positions from grandmaster games with friends via shareable links.

## Features

- 🎲 **Random Interesting Positions**: Start games from a curated collection of interesting GM chess positions
- 🎨 **Random Color Assignment**: Get randomly assigned white or black pieces
- 🔗 **Shareable Links**: Send a link to friends to join your game
- ⚡ **Real-time Multiplayer**: Live updates using WebSockets
- 🎯 **Legal Move Validation**: Only legal chess moves are allowed
- 📱 **Responsive Design**: Works on desktop and mobile devices

## How to Play

1. Click "Start New Game" on the landing page
2. You'll be assigned a random color and get an interesting chess position
3. Share the game link with a friend
4. Play chess in real-time when both players are connected!

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd interesting-chess
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

### Running the Application

#### Development Mode
Run both server and client in development mode:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- React frontend on http://localhost:3000

#### Production Mode
1. Build the client:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The application will be available at http://localhost:5000

## Technology Stack

### Backend
- **Express.js**: Web server framework
- **Socket.IO**: Real-time WebSocket communication
- **UUID**: Unique game ID generation

### Frontend
- **React**: UI framework
- **React Router**: Client-side routing
- **Chess.js**: Chess game logic and move validation
- **React Chessboard**: Interactive chess board component
- **Socket.IO Client**: Real-time communication

## Project Structure

```
interesting-chess/
├── server.js                 # Express server with Socket.IO
├── package.json              # Server dependencies
├── interesting-positions.json # Curated GM chess positions
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.js
│   │   │   └── GamePage.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json          # Client dependencies
└── README.md
```

## Game Flow

1. **Create Game**: Player clicks "Start New Game"
   - Server selects random position from `interesting-positions.json`
   - Server assigns random color to host
   - Server generates unique game ID and returns game URL

2. **Join Game**: Friend clicks the shared link
   - Client connects to game via WebSocket
   - Server assigns opposite color to guest
   - Game becomes active when both players connected

3. **Play Game**: Players take turns making moves
   - Moves validated using chess.js
   - Game state synchronized in real-time via WebSocket
   - Visual feedback for whose turn it is

## API Endpoints

- `POST /api/new-game` - Create a new game
- `GET /api/game/:gameId` - Get game state
- `GET /game/:gameId` - Serve game page (React route)

## WebSocket Events

### Client → Server
- `join-game` - Join a game room
- `make-move` - Make a chess move

### Server → Client
- `game-joined` - Successfully joined game
- `game-updated` - Game state changed
- `move-made` - Move was made by opponent
- `player-disconnected` - Opponent disconnected
- `error` - Error occurred

# Chess data

Data from https://github.com/mcognetta/lichess-combined-puzzle-game-db
Copy over the file, bunzip, and run shard.sh to create public/

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
