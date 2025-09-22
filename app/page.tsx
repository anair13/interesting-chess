'use client'

import { useState, useEffect } from 'react'
import ChessBoard from './components/ChessBoard'
import PositionInfo from './components/PositionInfo'
import PositionFilter from './components/PositionFilter'
import Authentication from './components/Authentication'
import { getRandomGmPosition, GamePosition } from './data/gmPositions'
import styled from 'styled-components'

export default function Home() {
  const [currentPosition, setCurrentPosition] = useState<GamePosition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRandomPosition()
  }, [])

  const loadRandomPosition = async () => {
    setLoading(true)
    try {
      // Load a random GM position from our database
      const position = getRandomGmPosition()
      setCurrentPosition(position)
    } catch (error) {
      console.error('Error loading position:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner>Loading chess position...</LoadingSpinner>
      </LoadingContainer>
    )
  }

  if (!currentPosition) {
    return (
      <ErrorContainer>
        <ErrorMessage>Failed to load chess position</ErrorMessage>
        <RetryButton onClick={loadRandomPosition}>Try Again</RetryButton>
      </ErrorContainer>
    )
  }

  return (
    <MainContainer>
      <Header>
        <h1>Chess Random Positions</h1>
        <p>Play chess starting from real Grandmaster game positions</p>
        <Authentication />
      </Header>
      
      <PositionFilter onNewPosition={setCurrentPosition} />
      
      <GameContainer>
        <ChessBoardContainer>
          <ChessBoard initialFen={currentPosition.fen} />
        </ChessBoardContainer>
        
        <InfoContainer>
          <PositionInfo position={currentPosition} />
          <NewGameButton onClick={loadRandomPosition}>
            New Random Position
          </NewGameButton>
        </InfoContainer>
      </GameContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #2c3e50;
  }
  p {
    font-size: 1.2rem;
    color: #7f8c8d;
  }
`

const GameContainer = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`

const ChessBoardContainer = styled.div`
  flex: 0 0 auto;
`

const InfoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px;
`

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

const LoadingSpinner = styled.div`
  font-size: 1.2rem;
  color: #7f8c8d;
`

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`

const ErrorMessage = styled.div`
  font-size: 1.2rem;
  color: #e74c3c;
`

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2980b9;
  }
`

const NewGameButton = styled.button`
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`
