const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameId } = req.query;
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
      const { error: insertError } = await supabase
        .from('players')
        .insert({
          game_id: gameId,
          color: playerColor,
          is_host: isHost,
          session_id: sessionId || `session-${Date.now()}-${Math.random()}`
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
      hostColor: updatedGame.host_color,
      guestColor: updatedGame.guest_color,
      currentTurn: updatedGame.current_turn,
      gameState: updatedGame.game_state,
      initialFen: updatedGame.initial_fen,
      currentFen: updatedGame.current_fen,
      description: updatedGame.description,
      players: players.reduce((acc, player) => {
        acc[player.color] = {
          color: player.color,
          isHost: player.is_host,
          sessionId: player.session_id,
          joinedAt: player.joined_at,
          lastSeen: player.last_seen
        };
        return acc;
      }, {}),
      moves: []
    };

    console.log(`Player joined game ${gameId} as ${playerColor}`);

    res.json({
      gameData,
      playerColor
    });

  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
