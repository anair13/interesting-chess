import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase } from '../lib/supabase';

const GamePage = () => {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const isHost = searchParams.get('host') === 'true';
  
  const [game, setGame] = useState(new Chess());
  const [gameData, setGameData] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [gameState, setGameState] = useState('loading');
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}-${Math.random()}`);

  // Initialize game and join
  useEffect(() => {
    const initializeGame = async () => {
      try {
        console.log('🎮 Initializing game:', gameId);
        
        // Join the game
        const response = await fetch(`/api/games/${gameId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            isHost,
            sessionId 
          })
        });

        if (!response.ok) {
          throw new Error('Failed to join game');
        }

        const data = await response.json();
        console.log('🎮 Joined game:', data);
        
        setGameData(data.gameData);
        setPlayerColor(data.playerColor);
        setGameState(data.gameData.game_state === 'active' ? 'active' : 'waiting');
        
        // Initialize chess game with the position
        const newGame = new Chess(data.gameData.current_fen);
        setGame(newGame);
        
        // Set share link
        const currentUrl = window.location.origin + window.location.pathname;
        setShareLink(currentUrl);
        
        console.log('🎮 Game initialized with FEN:', data.gameData.current_fen);
        console.log('🎮 Player color:', data.playerColor);
        
      } catch (err) {
        console.error('Failed to initialize game:', err);
        setError('Failed to join game');
        setGameState('error');
      }
    };

    if (gameId) {
      initializeGame();
    }
  }, [gameId, isHost, sessionId]);

  // Helper function to refresh game data
  const refreshGameData = useCallback(async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setGameData(data);
      }
    } catch (error) {
      console.error('Failed to refresh game data:', error);
    }
  }, [gameId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameId) return;

    console.log('🔔 Setting up real-time subscriptions for game:', gameId);

    // Subscribe to game updates
    const gameSubscription = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('🔔 Game update received:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updatedGame = payload.new;
            
            setGameData(prevData => ({
              ...prevData,
              current_turn: updatedGame.current_turn,
              current_fen: updatedGame.current_fen,
              game_state: updatedGame.game_state
            }));
            
            // Update chess game state
            const newGame = new Chess(updatedGame.current_fen);
            setGame(newGame);
            
            // Update game state
            if (updatedGame.game_state === 'active') {
              setGameState('active');
            }
            
            console.log('🔔 Updated game state with FEN:', updatedGame.current_fen);
          }
        }
      )
      .subscribe();

    // Subscribe to player updates
    const playersSubscription = supabase
      .channel(`players-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('🔔 Player update received:', payload);
          
          // Refresh game data to get updated players
          refreshGameData();
        }
      )
      .subscribe();

    // Subscribe to moves
    const movesSubscription = supabase
      .channel(`moves-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moves',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('🔔 New move received:', payload);
          
          // The game update will handle the FEN change
          // This is just for logging/notifications
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      console.log('🔔 Cleaning up subscriptions');
      gameSubscription.unsubscribe();
      playersSubscription.unsubscribe();
      movesSubscription.unsubscribe();
    };
  }, [gameId, refreshGameData]);

  // Handle piece drops (moves)
  const onDrop = useCallback(async (sourceSquare, targetSquare, piece) => {
    console.log('🎯 onDrop called:', { sourceSquare, targetSquare, piece });
    console.log('🎯 Current game FEN:', game.fen());
    console.log('🎯 Game turn (chess.js):', game.turn(), 'Player color:', playerColor);
    console.log('🎯 Server current turn:', gameData?.current_turn);
    
    // Check if game is active
    if (!gameData || gameData.game_state !== 'active') {
      console.log('❌ Game not active');
      return false;
    }

    // Check if it's player's turn
    if (gameData.current_turn !== playerColor) {
      console.log('❌ Not your turn');
      return false;
    }

    // Create a temporary game instance to test the move
    const tempGame = new Chess(game.fen());
    
    try {
      // Try the move without promotion first
      let move = tempGame.move({
        from: sourceSquare,
        to: targetSquare
      });

      // If that fails and it's a pawn move to the back rank, try with promotion
      if (move === null && piece.toLowerCase().includes('p')) {
        const toRank = targetSquare[1];
        if ((playerColor === 'white' && toRank === '8') || (playerColor === 'black' && toRank === '1')) {
          move = tempGame.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
          });
        }
      }

      if (move === null) {
        console.log('❌ Invalid move - chess.js rejected it');
        console.log('❌ Available moves from', sourceSquare, ':', tempGame.moves({ square: sourceSquare }));
        return false;
      }

      console.log('✅ Valid move:', move);

      // Apply the move to the actual game (optimistic update)
      const actualMove = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: move.promotion
      });

      // Send move to server
      const response = await fetch(`/api/games/${gameId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          move: {
            from: sourceSquare,
            to: targetSquare,
            promotion: actualMove.promotion,
            fen: game.fen(),
            san: actualMove.san
          },
          sessionId
        })
      });

      if (!response.ok) {
        // Revert the optimistic update
        setGame(new Chess(gameData.current_fen));
        console.error('Move rejected by server');
        return false;
      }

      console.log('✅ Move accepted by server');
      return true;

    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  }, [game, gameData, playerColor, gameId, sessionId]);

  // Copy share link function
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // Render loading state
  if (gameState === 'loading') {
    return (
      <div className="game-container">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  // Render error state
  if (gameState === 'error') {
    return (
      <div className="game-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Render connecting state
  if (!gameData) {
    return (
      <div className="game-container">
        <div className="loading">Connecting...</div>
      </div>
    );
  }

  const isPlayerTurn = gameData.current_turn === playerColor;
  const opponentColor = playerColor === 'white' ? 'black' : 'white';
  const opponentConnected = gameData.players && gameData.players[opponentColor];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">Interesting Chess</h1>
          <p className="game-description">{gameData.description}</p>
          
          <div className="game-info">
            <div className="player-info">
              <div className={`color-indicator ${playerColor}`}></div>
              <span>You are playing {playerColor}</span>
            </div>
            
            <div className="turn-indicator">
              {gameData.game_state === 'waiting' ? 'Waiting for opponent...' :
               isPlayerTurn ? 'Your turn' : `${gameData.current_turn}'s turn`}
            </div>
            
            <div className="player-info">
              <div className={`color-indicator ${opponentColor}`}></div>
              <span>
                Opponent: {opponentConnected ? 'Connected' : 'Waiting...'}
              </span>
            </div>
          </div>
        </div>

        <div className="game-board-container">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation={playerColor}
            arePiecesDraggable={gameData.game_state === 'active' && isPlayerTurn}
            boardWidth={Math.min(500, window.innerWidth - 40)}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            customDropSquareStyle={{
              boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
            }}
            id="chess-board"
          />
        </div>

        {gameData.game_state === 'waiting' && (
          <div className="share-link-container">
            <h3 className="share-link-title">Share this link with your friend:</h3>
            <input
              type="text"
              value={shareLink}
              readOnly
              className="share-link-input"
              onClick={(e) => e.target.select()}
            />
            <button onClick={copyShareLink} className="copy-link-btn">
              {linkCopied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        )}

        <div className="game-status">
          {game.isCheckmate() && `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`}
          {game.isCheck() && !game.isCheckmate() && 'Check!'}
          {game.isDraw() && 'Game is a draw!'}
          {game.isStalemate() && 'Stalemate!'}
        </div>
      </div>
    </DndProvider>
  );
};

export default GamePage;