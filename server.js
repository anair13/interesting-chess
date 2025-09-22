const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://interesting-chess.vercel.app", "https://*.vercel.app"]
      : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Configure for serverless environment
  transports: process.env.NODE_ENV === 'production' 
    ? ['polling'] 
    : ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://interesting-chess.vercel.app", "https://*.vercel.app"]
    : "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Serve static files from client/build
app.use(express.static(path.join(__dirname, 'client/build')));

// Function to load a random position from sharded files
const getRandomPosition = () => {
  // Generate random shard number (only 100, 101, 102)
  const availableShards = ['100', '101', '102'];
  const shardNumber = availableShards[Math.floor(Math.random() * availableShards.length)];
  const shardPath = path.join(__dirname, 'client', 'public', 'data', 'shards', `positions-${shardNumber}.json`);
  
  console.log(`🎲 Attempting to load shard: positions-${shardNumber}.json`);
  console.log(`📁 Full path: ${shardPath}`);
  
  try {
    // Check if file exists first
    if (!fs.existsSync(shardPath)) {
      console.error(`❌ Shard file does not exist: ${shardPath}`);
      throw new Error(`File not found: ${shardPath}`);
    }
    
    const shardData = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    console.log(`✅ Successfully loaded shard with ${shardData.length} positions`);
    
    // Select random position from the shard
    const randomIndex = Math.floor(Math.random() * shardData.length);
    const selectedPuzzle = shardData[randomIndex];
    
    console.log(`🎯 Selected puzzle ${randomIndex}:`, selectedPuzzle?.puzzle?.PuzzleId || 'Unknown ID');
    console.log(`🎯 FEN: ${selectedPuzzle?.puzzle?.FEN}`);
    console.log(`📝 Themes: ${selectedPuzzle?.puzzle?.Themes || 'No themes'}`);
    
    // Convert to the expected format
    const position = {
      fen: selectedPuzzle?.puzzle?.FEN,
      description: `Puzzle ${selectedPuzzle?.puzzle?.PuzzleId || 'Unknown'}: ${selectedPuzzle?.puzzle?.Themes || 'Chess puzzle'}`
    };
    
    return position;
  } catch (error) {
    console.error(`❌ Error loading shard ${shardNumber}:`, error.message);
    console.log(`🔄 Falling back to starting position`);
    
    // Fallback to a default position if shard loading fails
    return {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      description: "Starting position (fallback)"
    };
  }
};

// Store active games
const games = new Map();

// Game class to manage game state
class Game {
  constructor() {
    this.id = uuidv4();
    this.players = {};
    this.currentTurn = 'white';
    this.moves = [];
    this.gameState = 'waiting'; // waiting, active, finished
    
    // Select random position and assign random colors
    const randomPosition = getRandomPosition();
    this.initialFen = randomPosition.fen;
    this.currentFen = randomPosition.fen;
    this.description = randomPosition.description;
    
    // Randomly assign colors
    const colors = ['white', 'black'];
    const randomColor = colors[Math.floor(Math.random() * 2)];
    this.hostColor = randomColor;
    this.guestColor = randomColor === 'white' ? 'black' : 'white';
  }

  addPlayer(socketId, isHost = false) {
    const color = isHost ? this.hostColor : this.guestColor;
    this.players[color] = {
      socketId,
      color,
      isHost
    };
    
    if (Object.keys(this.players).length === 2) {
      this.gameState = 'active';
    }
    
    return color;
  }

  removePlayer(socketId) {
    for (const [color, player] of Object.entries(this.players)) {
      if (player.socketId === socketId) {
        delete this.players[color];
        break;
      }
    }
    
    if (Object.keys(this.players).length === 0) {
      this.gameState = 'finished';
    }
  }

  makeMove(move, socketId) {
    // Find player making the move
    const player = Object.values(this.players).find(p => p.socketId === socketId);
    if (!player) return false;
    
    // Check if it's player's turn
    if (player.color !== this.currentTurn) return false;
    
    // Add move to history
    this.moves.push({
      ...move,
      color: player.color,
      timestamp: Date.now()
    });
    
    // Update current FEN (in a real app, you'd validate the move and update FEN properly)
    this.currentFen = move.fen;
    
    // Switch turns
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    
    return true;
  }

  getGameData() {
    return {
      id: this.id,
      players: this.players,
      currentTurn: this.currentTurn,
      gameState: this.gameState,
      initialFen: this.initialFen,
      currentFen: this.currentFen,
      description: this.description,
      moves: this.moves,
      hostColor: this.hostColor,
      guestColor: this.guestColor
    };
  }
}

// API Routes
app.post('/api/new-game', (req, res) => {
  const game = new Game();
  games.set(game.id, game);
  
  res.json({
    gameId: game.id,
    hostColor: game.hostColor,
    gameUrl: `${req.protocol}://${req.get('host')}/game/${game.id}`,
    initialFen: game.initialFen,
    description: game.description
  });
});

app.get('/api/game/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json(game.getGameData());
});

// HTTP endpoint for joining games (production alternative to Socket.IO)
app.post('/api/game/:gameId/join', (req, res) => {
  const { isHost } = req.body;
  const game = games.get(req.params.gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  if (game.gameState === 'finished') {
    return res.status(400).json({ error: 'Game has ended' });
  }
  
  // Check if game is full
  if (Object.keys(game.players).length >= 2) {
    return res.status(400).json({ error: 'Game is full' });
  }
  
  const playerColor = game.addPlayer('http-player-' + Date.now(), isHost);
  
  res.json({
    gameData: game.getGameData(),
    playerColor
  });
});

// HTTP endpoint for making moves (production alternative to Socket.IO)
app.post('/api/game/:gameId/move', (req, res) => {
  const { move } = req.body;
  const game = games.get(req.params.gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // For HTTP version, we'll accept moves without strict socket validation
  // In a real app, you'd want proper player authentication
  if (game.makeMove(move, 'http-player')) {
    res.json({ success: true, gameState: game.getGameData() });
  } else {
    res.status(400).json({ error: 'Invalid move' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', (data) => {
    const { gameId, isHost } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    if (game.gameState === 'finished') {
      socket.emit('error', { message: 'Game has ended' });
      return;
    }
    
    // Check if game is full
    if (Object.keys(game.players).length >= 2 && !Object.values(game.players).some(p => p.socketId === socket.id)) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }
    
    const playerColor = game.addPlayer(socket.id, isHost);
    socket.join(gameId);
    
    // Send game state to the joining player
    socket.emit('game-joined', {
      ...game.getGameData(),
      playerColor
    });
    
    // Notify all players in the game
    io.to(gameId).emit('game-updated', game.getGameData());
    
    console.log(`Player ${socket.id} joined game ${gameId} as ${playerColor}`);
  });

  socket.on('make-move', (data) => {
    const { gameId, move } = data;
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    if (game.makeMove(move, socket.id)) {
      // Broadcast the move to all players in the game
      io.to(gameId).emit('move-made', {
        move,
        gameState: game.getGameData()
      });
      
      console.log(`Move made in game ${gameId}:`, move);
    } else {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all games
    for (const [gameId, game] of games.entries()) {
      if (Object.values(game.players).some(p => p.socketId === socket.id)) {
        game.removePlayer(socket.id);
        
        // Notify remaining players
        io.to(gameId).emit('player-disconnected', game.getGameData());
        
        // Clean up empty games
        if (game.gameState === 'finished' && Object.keys(game.players).length === 0) {
          games.delete(gameId);
        }
        
        break;
      }
    }
  });
});

// Serve React app for all other routes (including /game/:gameId)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes that don't exist
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the React app for all other routes
  const indexPath = path.join(__dirname, 'client/build', 'index.html');
  console.log('Serving React app for route:', req.path, 'from:', indexPath);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
