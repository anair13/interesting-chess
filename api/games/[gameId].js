const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async function handler(req, res) {
  const { gameId } = req.query;

  if (req.method === 'GET') {
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
        hostColor: game.host_color,
        guestColor: game.guest_color,
        currentTurn: game.current_turn,
        gameState: game.game_state,
        initialFen: game.initial_fen,
        currentFen: game.current_fen,
        description: game.description,
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
        moves: moves || []
      };

      res.json(gameData);

    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
