'use client'

import { useState, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import styled from 'styled-components'

interface ChessBoardProps {
  initialFen: string
}

interface Piece {
  type: string
  color: string
}

interface Square {
  file: number
  rank: number
}

const ChessBoard: React.FC<ChessBoardProps> = ({ initialFen }) => {
  const [game, setGame] = useState<Chess | null>(null)
  const [board, setBoard] = useState<Piece[][] | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const validateAndLoadFEN = (fenString: string) => {
    try {
      setError(null) // Clear any previous error
      const chess = new Chess(fenString)
      setGame(chess)
      updateBoard(chess)
    } catch (err) {
      console.error('Invalid FEN:', fenString, err)
      // Fallback to starting position if FEN is invalid
      try {
        const fallbackChess = new Chess()
        setGame(fallbackChess)
        updateBoard(fallbackChess)
        setError(`Invalid position. Showing starting position instead.`)
      } catch (fallbackErr) {
        setError(`Unable to load chess position`)
        setGame(null)
        setBoard(null)
      }
    }
  }

  useEffect(() => {
    validateAndLoadFEN(initialFen)
  }, [initialFen])

  const updateBoard = (chess: Chess) => {
    const boardState: Piece[][] = Array(8).fill(null).map(() => Array(8).fill(null))
    
    // Convert chess.js board representation to our board
    const board = chess.board()
    board.forEach((rank, rankIndex) => {
      rank.forEach((piece, fileIndex) => {
        if (piece) {
          boardState[7-rankIndex][fileIndex] = {
            type: piece.type,
            color: piece.color
          }
        }
      })
    })
    
    setBoard(boardState)
  }

  const handleSquareClick = (row: number, col: number) => {
    if (!game) return

    const clickedSquare = { file: col, rank: 7 - row }
    
    // If no piece is selected, select the piece at this square
    if (!selectedSquare) {
      const squareAlgebraic = `${'abcdefgh'[col]}${8-row}`
      const piece = game.get(squareAlgebraic)
      
      if (piece && ((piece.color === 'w' && game.turn() === 'w') || (piece.color === 'b' && game.turn() === 'b'))) {
        setSelectedSquare(clickedSquare)
        const moves = game.moves({ square: squareAlgebraic, verbose: true })
        setLegalMoves(moves.map(move => move.to))
      }
      return
    }

    // Try to make a move
    const fromSquare = `${'abcdefgh'[selectedSquare.file]}${selectedSquare.rank + 1}`
    const toSquare = `${'abcdefgh'[col]}${8-row}`
    
    try {
      const move = game.move({
        from: fromSquare,
        to: toSquare,
        promotion: 'q' // Always promote to queen for simplicity
      })
      
      if (move) {
        setGame(new Chess(game.fen()))
        updateBoard(game)
        setSelectedSquare(null)
        setLegalMoves([])
      }
    } catch (error) {
      // Invalid move
      setSelectedSquare(null)
      setLegalMoves([])
    }
  }

  const isSquareSelected = (row: number, col: number) => {
    if (!selectedSquare) return false
    return selectedSquare.file === col && selectedSquare.rank === 7 - row
  }

  const isLegalMove = (row: number, col: number) => {
    const squareAlgebraic = `${'abcdefgh'[col]}${8-row}`
    return legalMoves.includes(squareAlgebraic)
  }

  const getPieceSymbol = (piece: Piece) => {
    const symbols = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    }
    return symbols[piece.color][piece.type]
  }

  if (error && !game && !board) {
    return (
      <BoardContainer ref={boardRef}>
        <ErrorDisplay>
          <h3>⚠️ Position Error</h3>
          <p>{error}</p>
          <button onClick={() => validateAndLoadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}>
            Try Starting Position
          </button>
        </ErrorDisplay>
      </BoardContainer>
    )
  }

  if (!board || !game) {
    return <LoadingBoard>Loading board...</LoadingBoard>
  }

  return (
    <BoardContainer ref={boardRef}>
      {error && (
        <ErrorBanner>
          <span>⚠️</span> {error}
        </ErrorBanner>
      )}
      <BoardElement>
        {board.map((rank, row) => 
          rank.map((piece, col) => (
            <Square
              key={`${row}-${col}`}
              $isWhite={(row + col) % 2 === 0}
              $isSelected={isSquareSelected(row, col)}
              $isLegalMove={isLegalMove(row, col)}
              onClick={() => handleSquareClick(row, col)}
            >
              {piece && <Piece $isWhite={piece.color === 'w'}>
                {getPieceSymbol(piece)}
              </Piece>}
              {isLegalMove(row, col) && !piece && <LegalMoveIndicator />}
            </Square>
          ))
        )}
      </BoardElement>
      
      <BoardInfo>
        <div>
          <strong>Turn:</strong> {game.turn() === 'w' ? 'White' : 'Black'}
        </div>
        <div>
          <strong>FEN:</strong> {game.fen()}
        </div>
        {game.isCheckmate() && <CheckmateText>Checkmate!</CheckmateText>}
        {game.isStalemate() && <StalemateText>Stalemate!</StalemateText>}
        {game.isCheck() && <CheckText>Check!</CheckText>}
      </BoardInfo>
    </BoardContainer>
  )
}

const BoardContainer = styled.div`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
`

const BoardElement = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 480px;
  height: 480px;
  border: 3px solid #555;
  background: #f0d9b5;
  
  @media (max-width: 768px) {
    width: 350px;
    height: 350px;
  }
  
  @media (max-width: 480px) {
    width: 280px;
    height: 280px;
  }
`

const Square = styled.div<{
  $isWhite: boolean
  $isSelected: boolean
  $isLegalMove: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${props => props.$isWhite ? '#f0d9b5' : '#b58863'};
  
  ${props => props.$isSelected && `
    background: ${props.$isWhite ? '#f1df7b' : '#c7b975'};
  `}
  
  ${props => props.$isLegalMove && `
    box-shadow: inset 0 0 0 3px #42a5f5;
  `}
  
  &:hover {
    background: ${props => {
      if (props.$isSelected) return props.$isWhite ? '#f1df7b' : '#c7b975'
      return props.$isWhite ? '#e6cc7e' : '#a1734b'
    }};
  }
`

const Piece = styled.div<{ $isWhite: boolean }>`
  font-size: 40px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  user-select: none;
  cursor: pointer;
  transition: transform 0.1s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    font-size: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`

const LegalMoveIndicator = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(66, 165, 245, 0.6);
  border: 2px solid #42a5f5;
`

const LoadingBoard = styled.div`
  width: 480px;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  border: 3px solid #ddd;
  border-radius: 12px;
`

const BoardInfo = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-size: 0.9rem;
  line-height: 1.6;
  
  strong {
    color: #2c3e50;
  }
`

const CheckmateText = styled.div`
  color: #e74c3c;
  font-weight: bold;
  margin-top: 10px;
  font-size: 1.1rem;
`

const StalemateText = styled.div`
  color: #f39c12;
  font-weight: bold;
  margin-top: 10px;
  font-size: 1.1rem;
`

const CheckText = styled.div`
  color: #f39c12;
  font-weight: bold;
  margin-top: 10px;
  font-size: 1.1rem;
`

const ErrorDisplay = styled.div`
  width: 480px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fee;
  border: 2px solid #ff6b6b;
  border-radius: 12px;
  padding: 20px;
  
  h3 {
    color: #d73409;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    text-align: center;
    margin-bottom: 16px;
  }
  
  button {
    padding: 8px 16px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    
    &:hover {
      background: #2980b9;
    }
  }
  
  @media (max-width: 768px) {
    width: 350px;
    height: 150px;
  }
  
  @media (max-width: 480px) {
    width: 280px;
    height: 130px;
    font-size: 0.9rem;
    h3 { font-size: 1rem; }
    p { font-size: 0.8rem; }
  }
`

const ErrorBanner = styled.div`
  background: #ffe6e6;
  border: 1px solid #ff6b6b;
  color: #d73409;
  padding: 8px 16px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
`

export default ChessBoard
