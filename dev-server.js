const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure you have .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Interesting positions data
const interestingPositions = [
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    description: "Italian Game: Classical Variation - Sharp tactical position"
  },
  {
    fen: "rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/8/PP2PPPP/RNBQKBNR w KQkq c6 0 3",
    description: "Caro-Kann Defense: Classical Variation - Strategic middlegame"
  },
  {
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5",
    description: "Italian Game: Hungarian Defense - Complex position"
  },
  {
    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4",
    description: "Queen's Gambit Declined: Orthodox Defense - Classical setup"
  },
  {
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    description: "Spanish Opening: Morphy Defense - Critical decision point"
  }
];

// API Routes

// Create new game
app.post('/api/games/new', async (req, res) => {
  try {
    console.log('🎮 Creating new game...');
    
    // Select random position
    const randomPosition = interestingPositions[Math.floor(Math.random() * interestingPositions.length)];
    
    // Randomly assign colors
    const colors = ['white', 'black'];
    const hostColor = colors[Math.floor(Math.random() * 2)];
    const guestColor = hostColor === 'white' ? 'black' : 'white';

    // Create game in database
    const { data: game, error } = await supabase
      .from('games')
      .insert({
        host_color: hostColor,
        guest_color: guestColor,
        current_turn: 'white',
        initial_fen: randomPosition.fen,
        current_fen: randomPosition.fen,
        description: randomPosition.description,
        game_state: 'waiting'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create game' });
    }

    console.log('✅ Created new game:', game.id);

    res.json({
      gameId: game.id,
      hostColor: game.host_color,
      gameUrl: `${req.headers.origin || 'http://localhost:3000'}/game/${game.id}`,
      initialFen: game.initial_fen,
      description: game.description
    });

  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get game data
app.get('/api/games/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    // Get game data
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId);

    if (playersError) {
      console.error('Error fetching players:', playersError);
      return res.status(500).json({ error: 'Failed to fetch players' });
    }

    // Get recent moves
    const { data: moves, error: movesError } = await supabase
      .from('moves')
      .select('*')
      .eq('game_id', gameId)
      .order('move_number', { ascending: true });

    if (movesError) {
      console.error('Error fetching moves:', movesError);
      return res.status(500).json({ error: 'Failed to fetch moves' });
    }

    // Format response
    const gameData = {
      id: game.id,
      host_color: game.host_color,
      guest_color: game.guest_color,
      current_turn: game.current_turn,
      game_state: game.game_state,
      initial_fen: game.initial_fen,
      current_fen: game.current_fen,
      description: game.description,
      players: players.reduce((acc, player) => {
        acc[player.color] = {
          color: player.color,
          is_host: player.is_host,
          session_id: player.session_id,
          joined_at: player.joined_at,
          last_seen: player.last_seen
        };
        return acc;
      }, {}),
      moves: moves || []
    };

    res.json(gameData);

  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join game
app.post('/api/games/:gameId/join', async (req, res) => {
  const { gameId } = req.params;
  const { isHost, sessionId } = req.body;

  try {
    // Get game data
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.game_state === 'finished') {
      return res.status(400).json({ error: 'Game has ended' });
    }

    // Check existing players
    const { data: existingPlayers, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId);

    if (playersError) {
      console.error('Error fetching players:', playersError);
      return res.status(500).json({ error: 'Failed to check players' });
    }

    // Determine player color
    const playerColor = isHost ? game.host_color : game.guest_color;
    
    // Check if this color is already taken
    const existingPlayer = existingPlayers.find(p => p.color === playerColor);
    if (existingPlayer) {
      // Update existing player's last seen
      await supabase
        .from('players')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', existingPlayer.id);
    } else {
      // Add new player
      const finalSessionId = sessionId || `session-${Date.now()}-${Math.random()}`;
      console.log('➕ Adding new player with session ID:', finalSessionId);
      
      const { error: insertError } = await supabase
        .from('players')
        .insert({
          game_id: gameId,
          color: playerColor,
          is_host: isHost,
          session_id: finalSessionId
        });

      if (insertError) {
        console.error('Error adding player:', insertError);
        return res.status(500).json({ error: 'Failed to join game' });
      }
    }

    // Check if game should become active
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId);

    if (allPlayers && allPlayers.length === 2 && game.game_state === 'waiting') {
      // Activate the game
      await supabase
        .from('games')
        .update({ game_state: 'active' })
        .eq('id', gameId);
    }

    // Get updated game data
    const { data: updatedGame } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId);

    const gameData = {
      id: updatedGame.id,
      host_color: updatedGame.host_color,
      guest_color: updatedGame.guest_color,
      current_turn: updatedGame.current_turn,
      game_state: updatedGame.game_state,
      initial_fen: updatedGame.initial_fen,
      current_fen: updatedGame.current_fen,
      description: updatedGame.description,
      players: players.reduce((acc, player) => {
        acc[player.color] = {
          color: player.color,
          is_host: player.is_host,
          session_id: player.session_id,
          joined_at: player.joined_at,
          last_seen: player.last_seen
        };
        return acc;
      }, {}),
      moves: []
    };

    console.log(`✅ Player joined game ${gameId} as ${playerColor}`);

    res.json({
      gameData,
      playerColor
    });

  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Make move
app.post('/api/games/:gameId/move', async (req, res) => {
  const { gameId } = req.params;
  const { move, sessionId } = req.body;

  try {
    // Get game data
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.game_state !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    // Get player making the move
    console.log('🔍 Looking for player with session ID:', sessionId);
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .eq('session_id', sessionId)
      .single();

    if (playerError || !player) {
      console.error('❌ Player not found:', playerError);
      
      // Debug: Show all players in this game
      const { data: allPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId);
      
      console.log('🔍 All players in game:', allPlayers);
      return res.status(403).json({ error: 'Player not found' });
    }

    // Verify it's the player's turn
    if (player.color !== game.current_turn) {
      return res.status(400).json({ error: 'Not your turn' });
    }

    // Get current move number
    const { data: moves, error: movesError } = await supabase
      .from('moves')
      .select('move_number')
      .eq('game_id', gameId)
      .order('move_number', { ascending: false })
      .limit(1);

    if (movesError) {
      console.error('Error fetching moves:', movesError);
      return res.status(500).json({ error: 'Failed to fetch move history' });
    }

    const nextMoveNumber = moves && moves.length > 0 ? moves[0].move_number + 1 : 1;

    // Record the move
    const { error: moveInsertError } = await supabase
      .from('moves')
      .insert({
        game_id: gameId,
        player_color: player.color,
        from_square: move.from,
        to_square: move.to,
        promotion: move.promotion || null,
        san: move.san,
        fen_after: move.fen,
        move_number: nextMoveNumber
      });

    if (moveInsertError) {
      console.error('Error recording move:', moveInsertError);
      return res.status(500).json({ error: 'Failed to record move' });
    }

    // Update game state
    const nextTurn = game.current_turn === 'white' ? 'black' : 'white';
    
    const { error: gameUpdateError } = await supabase
      .from('games')
      .update({
        current_fen: move.fen,
        current_turn: nextTurn
      })
      .eq('id', gameId);

    if (gameUpdateError) {
      console.error('Error updating game:', gameUpdateError);
      return res.status(500).json({ error: 'Failed to update game' });
    }

    // Get updated game data
    const { data: updatedGame } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId);

    const gameData = {
      id: updatedGame.id,
      host_color: updatedGame.host_color,
      guest_color: updatedGame.guest_color,
      current_turn: updatedGame.current_turn,
      game_state: updatedGame.game_state,
      initial_fen: updatedGame.initial_fen,
      current_fen: updatedGame.current_fen,
      description: updatedGame.description,
      players: players.reduce((acc, p) => {
        acc[p.color] = {
          color: p.color,
          is_host: p.is_host,
          session_id: p.session_id,
          joined_at: p.joined_at,
          last_seen: p.last_seen
        };
        return acc;
      }, {}),
      moves: []
    };

    console.log(`✅ Move made in game ${gameId}: ${move.san}`);

    res.json({
      success: true,
      gameState: gameData
    });

  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at:`);
  console.log(`   POST http://localhost:${PORT}/api/games/new`);
  console.log(`   GET  http://localhost:${PORT}/api/games/:gameId`);
  console.log(`   POST http://localhost:${PORT}/api/games/:gameId/join`);
  console.log(`   POST http://localhost:${PORT}/api/games/:gameId/move`);
  console.log(`\n💡 Make sure your React app is configured to proxy to this server`);
});
