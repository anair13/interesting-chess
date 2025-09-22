const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  },
  {
    fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 4 5",
    description: "Queen's Gambit Declined: Tartakower Defense - Dynamic position"
  },
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 1 4",
    description: "Italian Game: Paris Defense - Tactical complications ahead"
  },
  {
    fen: "rnbqkb1r/pp1ppppp/5n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq c6 0 3",
    description: "Caro-Kann Defense: Exchange Variation - Endgame technique"
  },
  {
    fen: "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5",
    description: "Italian Game: Hungarian Defense - Piece coordination"
  },
  {
    fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq d6 0 3",
    description: "Queen's Pawn Game: London System - Solid development"
  }
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
        current_turn: 'white', // Games always start with white
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

    console.log('Created new game:', game.id);

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
}
