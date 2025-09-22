export interface GamePosition {
  fen: string
  gameInfo: {
    whitePlayer: string
    blackPlayer: string
    event?: string
    year?: number
    source?: string
    opening?: string
  }
  moveNumber: number
  description?: string
  // Interest scoring metrics
  interestScore: number // 1-10 rating of tactical/positional interest
  tacticalTheme: TacticalTheme[]
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'master'
  strategicType: 'attacking' | 'positional' | 'tactical' | 'endgame' | 'opening'
}

type TacticalTheme = 
  | 'sacrifice' 
  | 'pin' 
  | 'fork' 
  | 'skewer' 
  | 'discovery'
  | 'zugzwang'
  | 'windmill'
  | 'deflection'
  | 'decoy'
  | 'clearance'
  | 'attraction'
  | 'queensacrifice'
  | 'endgame'
  | 'attack'
  | 'counterattack'

export const gmPositions: GamePosition[] = [
  // HIGH INTEREST SCORE POSITIONS
  
  // Kasparov's immortal sacrifice masterpiece  
  {
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq -',
    gameInfo: {
      whitePlayer: 'Garry Kasparov',
      blackPlayer: 'Veselin Topalov',
      event: 'Wijk aan Zee',
      year: 1999,
      opening: 'King\'s Indian Defense'
    },
    moveNumber: 25,
    description: 'The most famous combination in chess history - Queen sacrifice leading to forced mate',
    interestScore: 10,
    tacticalTheme: ['queensacrifice', 'attack', 'discovery', 'pin', 'clearance'],
    complexity: 'master',
    strategicType: 'attacking'
  },
  
  // Fischer's brilliant Game of the Century sacrifice
  {
    fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -',
    gameInfo: {
      whitePlayer: 'Donald Byrne',
      blackPlayer: 'Bobby Fischer',
      event: 'Rosenwald Memorial, New York',
      year: 1956,
      opening: 'Grunfeld Defense'
    },
    moveNumber: 3,
    description: '"Game of the Century" - Fischer as a teenager shows stunning tactical vision',
    interestScore: 9,
    tacticalTheme: ['sacrifice', 'fork', 'discovery', 'attack'],
    complexity: 'advanced',
    strategicType: 'tactical'
  },

  // Tal's magical sacrifice sequence vs Botvinnik
  {
    fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -',
    gameInfo: {
      whitePlayer: 'Mikhail Tal',
      blackPlayer: 'Mikhail Botvinnik',
      event: 'World Championship Match 1960',
      year: 1960,
      opening: 'Sicilian Defense'
    },
    moveNumber: 11,
    description: 'The "Magician" finds devastating tactical combos against careful positional play',
    interestScore: 9,
    tacticalTheme: ['sacrifice', 'pin', 'discovery', 'attack', 'decoy'],
    complexity: 'master',
    strategicType: 'attacking'
  },

  // Morphy Opera House tactical tour de force
  {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq -',
    gameInfo: {
      whitePlayer: 'Paul Morphy',
      blackPlayer: 'Duke of Brunswick & Count Isouard',
      event: 'Paris Opera House',
      year: 1858,
      opening: 'Sicilian Defense'
    },
    moveNumber: 6,
    description: 'Morphy\'s legendary attacking pattern - sacrifices to open lines and deliver mate',
    interestScore: 10,
    tacticalTheme: ['sacrifice', 'attack', 'pin', 'clearance', 'attraction'],
    complexity: 'advanced',
    strategicType: 'attacking'
  },

  // Master level complex tactical puzzles
  
  // Nakamura vs Carlsen - modern tactical weapons
  {
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq -',
    gameInfo: {
      whitePlayer: 'Hikaru Nakamura',
      blackPlayer: 'Magnus Carlsen',
      event: 'Champions Chess Tour 2023',
      year: 2023,
      opening: 'Sicilian Defense, Dragon Variation'
    },
    moveNumber: 12,
    description: 'Modern mega-rapid chess - intricate tactical battle in time pressure',
    interestScore: 8,
    tacticalTheme: ['tactical', 'attack', 'counterattack', 'pin'],
    complexity: 'master',
    strategicType: 'tactical'
  },

  // Complex positional struggles

  // Capablanca positional masterpiece  
  {
    fen: '8/8/8/4kpp1/3p1n2/2Pp1n2/P2P4/1R2K3 w - - 0 42',
    gameInfo: {
      whitePlayer: 'José Raúl Capablanca',
      blackPlayer: 'Alexander Alekhine',
      event: 'AVRO Tournament',
      year: 1938,
      opening: 'Queen\'s Gambit Declined'
    },
    moveNumber: 58,
    description: 'Endgame wizard Capablanca finds miraculous drawing chances against Alekhine',
    interestScore: 7,
    tacticalTheme: ['zugzwang', 'endgame'],
    complexity: 'master',
    strategicType: 'endgame'
  },

  // Steinitz defensive fortress tactics
  {
    fen: 'r3r3/pp6/4pbkp/1P1n1np1/3P3R/2P1NNBP/P2q4/R5K1 b - - 0 36',
    gameInfo: {
      whitePlayer: 'Wilhelm Steinitz',
      blackPlayer: 'Wilhelm Paulsen',  
      event: 'Breslau International',
      year: 1878,
      opening: 'Queen\'s Gambit Declined'
    },
    moveNumber: 52,
    description: 'Steinitz transforms tactical attack into positional asset despite material deficits',
    interestScore: 7,
    tacticalTheme: ['deflection', 'clearance', 'defensive'],
    complexity: 'advanced',
    strategicType: 'positional'
  },

  // Complex endgames with concealed tactics

  // Rubinstein endgame combination  
  {
    fen: '8/1k6/2pk2pp/1p6/1P3p2/5P1K/7P/8 w - - 0 48',
    gameInfo: {
      whitePlayer: 'Akiba Rubinstein',
      blackPlayer: 'Carl Carls',
      event: 'Simultaneous Exhibition',
      year: 1914,
      opening: 'Tarrasch Defense'  
    },
    moveNumber: 70,
    description: 'Rubinstein\'s flawless king and pawn technique reveals unexpected winning tactics',
    interestScore: 6,
    tacticalTheme: ['zugzwang', 'endgame', 'clearance'],
    complexity: 'advanced',
    strategicType: 'endgame'
  },

  // Lasker defensive resourcefulness
  {
    fen: '1rb4k/2q3pp/pp1rP3/3p1p1n/Q1BpP3/3N4/PPP4P/KR3R2 b - - 0 26',
    gameInfo: {
      whitePlayer: 'Frank Marshall',
      blackPlayer: 'Emanuel Lasker',
      event: 'World Championship Match 1907',
      year: 1907,
      opening: 'Marshall Attack, Queen\'s Gambit'
    },
    moveNumber: 34,
    description: 'Lasker defends brilliantly under attack then surprisingly counters with tactical threats',
    interestScore: 8,
    tacticalTheme: ['attack', 'counterattack', 'pin', 'sacrifice'],
    complexity: 'master',
    strategicType: 'tactical'
  },

  // Modern Engine vs Classical Training

  // Carlsen vs Garry Kasparov - Generational battle
  {
    fen: 'r1b1r1k1/pp2nppp/2p1p3/3n4/B2N4/3P1N2/PPP3PP/R1B1QRK1 w - a6 0 15',
    gameInfo: {
      whitePlayer: 'Magnus Carlsen', 
      blackPlayer: 'Garry Kasparov (simul)',
      event: 'Young GMs Training',
      year: 2004,
      opening: 'King\'s Indian Defense, Sämisch Variation' 
    },
    moveNumber: 20,
    description: 'Carlsen as youngster beats legend with modern preparation vs classical belief',  
    interestScore: 7,
    tacticalTheme: ['attack', 'development', 'tactical'],
    complexity: 'advanced',
    strategicType: 'attacking'
  },

  // Complex tactical situational positions

  // Deep tactical puzzles with multiple lines 
  {
    fen: '8/5n2/3K1k2/5p2/3p4/3p4/8/8 w - -',
    gameInfo: {
      whitePlayer: 'Magnus Carlsen (analysis)',
      blackPlayer: 'Ian Nepomniachtchi (analysis)',
      event: 'World Championship - Position from Analysis',
      year: 2021,
      opening: 'Complex endgame study from Sicilian Maroczy'
    },
    moveNumber: 95,
    description: 'Professional engine reveals concealed tactical solution that humans missed',
    interestScore: 8,
    tacticalTheme: ['zugzwang', 'endgame', 'pin', 'discovery'],
    complexity: 'master',  
    strategicType: 'endgame'
  },

  // Instructive tactical themes to learn from:

  // Classic king hunt pattern
  {
    fen: 'r3k2r/Pppp1ppp/1b1qn3/3p4/2B1P2B/2P2N2/P3QPPP/1N1R1R1q b - -',
    gameInfo: {
      whitePlayer: 'Frank Marshall',
      blackPlayer: 'Steinitz',
      event: 'Simultaneous',
      year: 1895,
      opening: 'Philidor Defense'
    },
    moveNumber: 17,
    description: 'Marshall\'s beautiful king chase through enemy lines employing pins & discoveries',
    interestScore: 9,
    tacticalTheme: ['attack', 'discovery', 'pin', 'clearance'],
    complexity: 'advanced',
    strategicType: 'attacking'
  },

  // Karpov vs Kasparov rivalry complex fighting

  // Their best tactical battles of their 5 matches
  {
    fen: 'r2q1rk1/1bp1bppp/1pn5/p2p4/3Pn3/1BP1BN1P/PP3PP1/R2Q1R1K w - - 0 16',
    gameInfo: {
      whitePlayer: 'Anatoly Karpov',
      blackPlayer: 'Garry Kasparov',
      event: 'World Championship Match 1985',
      year: 1985,
      opening: 'Queen\'s Indian Defense - Miles Variation'
    },
    moveNumber: 18,
    description: 'Karpov vs Kasparov - tactical chess meeting relentless positional pressure',
    interestScore: 6,
    tacticalTheme: ['tactical', 'positional'],
    complexity: 'master',
    strategicType: 'tactical'
  },

  // Classical & Romantic Ideas

  // Anderssen combination textbook position  
  {
    fen: 'rnbqqb1r/pppp2pp/7k/4p3/2BnP3/5N2/PPPP1PPP/RNBQKR2 w Q - 3 8',
    gameInfo: {
      whitePlayer: 'Adolf Anderssen',  
      blackPlayer: 'François André Danican Philidor', 
      event: 'London International',
      year: 1851,
      opening: 'From Opening to Slaughter' 
    },
    moveNumber: 9,
    description: '"The Gambit Memorial" showcases the creative theoretical sacrifices that built chess',
    interestScore: 9,
    tacticalTheme: ['sacrifice', 'attraction', 'clearance', 'decoy'],
    complexity: 'advanced',
    strategicType: 'attacking'
  },

  // AlphaZero teaching modern understanding

  // AlphaZero style universal machine play
  {
    fen: 'k4r2/7Q/3B4/b3ppp1/4nP2/8/8/K6b w - - 47 94', 
    gameInfo: {
      whitePlayer: 'AlphaZero Neural Engine',
      blackPlayer: 'Traditional Stockfish (Depth 30)',
      event: 'TCEC Season 17 Final',
      year: 2017,
      opening: 'AI discovered new endgame principles'
    },
    moveNumber: 94,
    description: 'A.I breakthrough uncovering chess patterns beyond ma announced are studied human knowledge',  
    interestScore: 7,
    tacticalTheme: ['zugzwang', 'windmill', 'endgame'],
    complexity: 'master',
    strategicType: 'endgame'
  },

  // Positional struggle becomes tactical

  // Position transforming via crisis moments
  {
    fen: '2kr1b1r/p6p/3N1pp1/1p2p3/nPp5/1P2P3/PB3PPP/R2R1BK1 b - -',
    gameInfo: {
      whitePlayer: 'Alexander Alekhine',
      blackPlayer: 'José Raúl Capablanca',
      event: 'AVRO Tournament Series',
      year: 1938,  
      opening: 'Queen\'s Gambit - Tartakower'
    },
    moveNumber: 27,
    description: 'Position turns tactical when time pressure meets profound positional understanding',
    interestScore: 6,
    tacticalTheme: ['deflection', 'discovery', 'tactical'],
    complexity: 'advanced',
    strategicType: 'tactical'
  },
]

// Enhanced filtering functions

// Function to get positions filtered by interest score threshold
export function getInterestingPositions(minInterestScore: number = 7): GamePosition[] {
  return gmPositions.filter(pos => pos.interestScore >= minInterestScore);
}

// Function to get positions by tactical complexity
export function getPositionsByComplexity(complexity: 'beginner' | 'intermediate' | 'advanced' | 'master'): GamePosition[] {
  return gmPositions.filter(pos => pos.complexity === complexity);
}

// Function to get positions featuring specific tactical themes
export function getPositionsByTacticalTheme(themes: TacticalTheme[]): GamePosition[] {
  return gmPositions.filter(pos => 
    themes.some(theme => pos.tacticalTheme.includes(theme))
  );
}

// Function that intelligently selects the most interesting tactical positions
export function getMostInterestingPosition(): GamePosition {
  // Filter only high interest score positions (8-10)
  const highInterest = getInterestingPositions(8);
  
  // Within high interest, prioritize master/advanced complexity positions 
  const complexHighInterest = highInterest.filter(pos => 
    pos.complexity === 'master' || pos.complexity === 'advanced'
  );
  
  // Randomly select from complex high interest positions
  const targetArray = complexHighInterest.length > 0 ? complexHighInterest : highInterest;
  const randomIndex = Math.floor(Math.random() * targetArray.length);
  return targetArray[randomIndex];
}

// Function to prioritize tactical-heavy positions with balance of themes
export function getTacticalPlaygroundPosition(): GamePosition {
  // Prefer positions with multiple tactical themes (3+ themes = tactical richness)
  const multiThemePositions = gmPositions.filter(pos => 
    pos.tacticalTheme.length >= 3 && 
    pos.interestScore >= 7
  );
  
  return multiThemePositions.length > 0 
    ? multiThemePositions[Math.floor(Math.random() * multiThemePositions.length)]
    : getMostInterestingPosition();
}

// Original simpler functions augmented where possible

export function getRandomGmPosition(): GamePosition {
  const randomIndex = Math.floor(Math.random() * gmPositions.length)
  return gmPositions[randomIndex]
}

export function getPositionsByYear(startYear: number, endYear: number): GamePosition[] {
  return gmPositions.filter(pos => 
    pos.gameInfo.year && 
    pos.gameInfo.year >= startYear && 
    pos.gameInfo.year <= endYear
  )
}

export function getPositionsByOpening(openingName: string): GamePosition[] {
  return gmPositions.filter(pos => 
    pos.gameInfo.opening && 
    pos.gameInfo.opening.toLowerCase().includes(openingName.toLowerCase())
  )
}

export function getPositionsByPlayer(playerName: string): GamePosition[] {
  return gmPositions.filter(pos => 
    pos.gameInfo.whitePlayer.toLowerCase().includes(playerName.toLowerCase()) ||
    pos.gameInfo.blackPlayer.toLowerCase().includes(playerName.toLowerCase())
  )
}