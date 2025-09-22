'use client'

import styled from 'styled-components'
import { GamePosition } from '../page'

interface PositionInfoProps {
  position: GamePosition
}

const PositionInfo: React.FC<PositionInfoProps> = ({ position }) => {
  return (
    <InfoContainer>
      <Title>Game Information</Title>
      
      <InfoSection>
        <PlayerContainer>
          <PlayerRow>
            <PlayerLabel>White:</PlayerLabel>
            <PlayerName $color="white">{position.gameInfo.whitePlayer}</PlayerName>
          </PlayerRow>
          <PlayerRow>
            <PlayerLabel>Black:</PlayerLabel>
            <PlayerName $color="black">{position.gameInfo.blackPlayer}</PlayerName>
          </PlayerRow>
        </PlayerContainer>
        
        {position.gameInfo.event && (
          <InfoRow>
            <InfoLabel>Event:</InfoLabel>
            <InfoValue>{position.gameInfo.event}</InfoValue>
          </InfoRow>
        )}
        
        {position.gameInfo.year && (
          <InfoRow>
            <InfoLabel>Year:</InfoLabel>
            <InfoValue>{position.gameInfo.year}</InfoValue>
          </InfoRow>
        )}
        
        <InfoRow>
          <InfoLabel>Position:</InfoLabel>
          <InfoValue>Move {position.moveNumber}</InfoValue>
        </InfoRow>
      </InfoSection>
      
      <Instructions>
        <h3>How to Play</h3>
        <ul>
          <li>Click on a piece to select it</li>
          <li>Click on a highlighted square to move</li>
          <li>This position is from a real GM game</li>
          <li>Try to find the best moves!</li>
        </ul>
      </Instructions>
      
      {position.gameInfo.source && (
        <Source>
          <strong>Source:</strong> {position.gameInfo.source}
        </Source>
      )}
    </InfoContainer>
  )
}

const InfoContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  max-width: 400px;
`

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 24px;
  color: #2c3e50;
  text-align: center;
  border-bottom: 2px solid #3498db;
  padding-bottom: 12px;
`

const InfoSection = styled.div`
  margin-bottom: 24px;
`

const PlayerContainer = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
`

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const PlayerLabel = styled.div`
  font-weight: 600;
  margin-right: 12px;
  min-width: 60px;
  color: #2c3e50;
`

const PlayerName = styled.div<{ $color: string }>`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => props.$color === 'white' ? '#2c3e50' : '#2c3e50'};
  background: ${props => props.$color === 'white' ? 
    'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)' : 
    'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'};
  color: ${props => props.$color === 'white' ? '#2c3e50' : 'white'};
  padding: 8px 16px;
  border-radius: 20px;
  text-align: center;
`

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`

const InfoLabel = styled.div`
  font-weight: 600;
  margin-right: 12px;
  min-width: 60px;
  color: #2c3e50;
  font-size: 0.95rem;
`

const InfoValue = styled.div`
  color: #34495e;
  font-size: 0.95rem;
`

const Instructions = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  h3 {
    margin-bottom: 12px;
    font-size: 1.2rem;
  }
  
  ul {
    list-style: none;
    padding-left: 0;
    
    li {
      margin-bottom: 6px;
      position: relative;
      padding-left: 20px;
      
      &:before {
        content: "♟";
        position: absolute;
        left: 0;
        font-size: 14px;
      }
    }
  }
`

const Source = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
  border-top: 1px solid #ecf0f1;
  padding-top: 16px;
  
  strong {
    color: #2c3e50;
  }
`

export default PositionInfo
