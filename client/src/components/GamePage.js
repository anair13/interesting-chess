import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import io from 'socket.io-client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const GamePage = () => {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const isHost = searchParams.get('host') === 'true';
  
  const [socket, setSocket] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [gameData, setGameData] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [gameState, setGameState] = useState('loading');
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join game when socket is ready
  useEffect(() => {
    if (socket && gameId) {
      socket.emit('join-game', { gameId, isHost });
      
      // Set share link
      const currentUrl = window.location.origin + window.location.pathname;
      setShareLink(currentUrl);
    }
  }, [socket, gameId, isHost]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('game-joined', (data) => {
      console.log('🎮 Game joined:', data);
      setGameData(data);
      setPlayerColor(data.playerColor);
      setGameState('joined');
      
      // Initialize chess game with the position
      const newGame = new Chess(data.currentFen);
      setGame(newGame);
      console.log('🎮 Initialized game with FEN:', data.currentFen);
      console.log('🎮 Game turn after init:', newGame.turn(), 'Player color:', data.playerColor);
    });

    socket.on('game-updated', (data) => {
      console.log('🎮 Game updated:', data);
      setGameData(data);
      if (data.gameState === 'active') {
        setGameState('active');
      }
      
      // Sync game state when game updates
      if (data.currentFen) {
        const newGame = new Chess(data.currentFen);
        setGame(newGame);
        console.log('🎮 Synced game state with FEN:', data.currentFen);
        console.log('🎮 Game turn after sync:', newGame.turn());
      }
    });

    socket.on('move-made', (data) => {
      console.log('🎮 Move made:', data);
      const newGame = new Chess(data.gameState.currentFen);
      setGame(newGame);
      setGameData(data.gameState);
      console.log('🎮 Updated game after move, FEN:', data.gameState.currentFen);
      console.log('🎮 Game turn after move:', newGame.turn());
    });

    socket.on('player-disconnected', (data) => {
      setGameData(data);
      setGameState('waiting');
    });

    socket.on('error', (data) => {
      setError(data.message);
      setGameState('error');
    });

    return () => {
      socket.off('game-joined');
      socket.off('game-updated');
      socket.off('move-made');
      socket.off('player-disconnected');
      socket.off('error');
    };
  }, [socket]);

  const onDrop = useCallback((sourceSquare, targetSquare, piece) => {
    console.log('🎯 onDrop called:', { sourceSquare, targetSquare, piece });
    console.log('🎯 Current game FEN:', game.fen());
    console.log('🎯 Game turn (chess.js):', game.turn(), 'Player color:', playerColor);
    console.log('🎯 Server current turn:', gameData?.currentTurn);
    
    // Check if game is active first
    if (gameData.gameState !== 'active') {
      console.log('❌ Game not active');
      return false;
    }

    // Use server state as the authoritative source for turns
    if (!gameData || gameData.currentTurn !== playerColor) {
      console.log('❌ Server says not your turn');
      return false;
    }

    // If there's a mismatch between chess.js and server, sync the game state
    const currentTurn = game.turn(); // 'w' for white, 'b' for black
    const serverTurn = gameData.currentTurn === 'white' ? 'w' : 'b';
    
    if (currentTurn !== serverTurn) {
      console.log('🔄 Game state out of sync! Resyncing...');
      console.log('🔄 Chess.js turn:', currentTurn, 'Server turn:', serverTurn);
      
      // Resync the game state with server's FEN
      const syncedGame = new Chess(gameData.currentFen);
      setGame(syncedGame);
      
      console.log('🔄 Resynced game with FEN:', gameData.currentFen);
      console.log('🔄 New game turn:', syncedGame.turn());
      
      // Try the move with the synced game
      const tempGame = new Chess(gameData.currentFen);
      
      try {
        let move = tempGame.move({
          from: sourceSquare,
          to: targetSquare
        });

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
          console.log('❌ Invalid move after resync');
          console.log('❌ Available moves from', sourceSquare, ':', tempGame.moves({ square: sourceSquare }));
          return false;
        }

        // Apply the move to the synced game
        const actualMove = syncedGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: move.promotion
        });

        // Send move to server
        socket.emit('make-move', {
          gameId,
          move: {
            from: sourceSquare,
            to: targetSquare,
            promotion: actualMove.promotion,
            fen: syncedGame.fen(),
            san: actualMove.san
          }
        });

        return true;
      } catch (error) {
        console.error('Move error after resync:', error);
        return false;
      }
    }

    // Create a temporary game instance to test the move without affecting the main game
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

      // Apply the move to the actual game
      const actualMove = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: move.promotion
      });

      // Send move to server
      socket.emit('make-move', {
        gameId,
        move: {
          from: sourceSquare,
          to: targetSquare,
          promotion: actualMove.promotion,
          fen: game.fen(),
          san: actualMove.san
        }
      });

      return true;
    } catch (error) {
      console.error('Move error:', error);
      console.log('❌ Game state might be out of sync');
      return false;
    }
  }, [game, gameData, playerColor, socket, gameId]);

  // Add mouse event logging
  const onPieceDragBegin = useCallback((piece, sourceSquare) => {
    console.log('🖱️ Drag begin:', { piece, sourceSquare });
    
    // Add mouse event listener to track position during drag
    const handleMouseMove = (e) => {
      console.log('🖱️ Mouse during drag:', { x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Clean up listener after a short time
    setTimeout(() => {
      document.removeEventListener('mousemove', handleMouseMove);
    }, 100);
  }, []);

  const onPieceDragEnd = useCallback((piece, sourceSquare) => {
    console.log('🖱️ Drag end:', { piece, sourceSquare });
  }, []);

  const onSquareClick = useCallback((square, e) => {
    console.log('🖱️ Square clicked:', square);
    if (e) {
      console.log('🖱️ Mouse position at click:', { x: e.clientX, y: e.clientY });
    }
  }, []);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setLinkCopied(true);
      // Reset the copied state after 2 seconds
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

  if (gameState === 'loading') {
    return (
      <div className="game-container">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <div className="game-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="game-container">
        <div className="loading">Connecting...</div>
      </div>
    );
  }

  const isPlayerTurn = gameData.currentTurn === playerColor;
  const opponentColor = playerColor === 'white' ? 'black' : 'white';
  const opponentConnected = gameData.players[opponentColor];

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
              {gameData.gameState === 'waiting' ? 'Waiting for opponent...' :
               isPlayerTurn ? 'Your turn' : `${gameData.currentTurn}'s turn`}
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
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onSquareClick={onSquareClick}
            boardOrientation={playerColor}
            arePiecesDraggable={gameData.gameState === 'active' && isPlayerTurn}
            boardWidth={Math.min(500, window.innerWidth - 40)}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            customDropSquareStyle={{
              boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
            }}
            customDragLayerStyle={{
              cursor: 'grabbing'
            }}
            id="chess-board"
            snapToCursor={false}
          />
        </div>

        {gameData.gameState === 'waiting' && (
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
