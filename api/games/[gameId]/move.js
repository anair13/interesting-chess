const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameId } = req.query;
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
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .eq('session_id', sessionId)
      .single();

    if (playerError || !player) {
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
      hostColor: updatedGame.host_color,
      guestColor: updatedGame.guest_color,
      currentTurn: updatedGame.current_turn,
      gameState: updatedGame.game_state,
      initialFen: updatedGame.initial_fen,
      currentFen: updatedGame.current_fen,
      description: updatedGame.description,
      players: players.reduce((acc, p) => {
        acc[p.color] = {
          color: p.color,
          isHost: p.is_host,
          sessionId: p.session_id,
          joinedAt: p.joined_at,
          lastSeen: p.last_seen
        };
        return acc;
      }, {}),
      moves: []
    };

    console.log(`Move made in game ${gameId}: ${move.san}`);

    res.json({
      success: true,
      gameState: gameData
    });

  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
