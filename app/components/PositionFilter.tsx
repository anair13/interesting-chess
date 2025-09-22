'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { 
  getRandomGmPosition, 
  getPositionsByYear, 
  getPositionsByOpening, 
  getPositionsByPlayer,
  getInterestingPositions,
  getPositionsByComplexity,
  getMostInterestingPosition,
  getTacticalPlaygroundPosition,
  GamePosition 
} from '../data/gmPositions'

interface PositionFilterProps {
  onNewPosition: (position: any) => void
}

const PositionFilter: React.FC<PositionFilterProps> = ({ onNewPosition }) => {
  const [showFilters, setShowFilters] = useState(false)
  const [playerFilter, setPlayerFilter] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [openingFilter, setOpeningFilter] = useState('')
  const [tacticalTheme, setTacticalTheme] = useState<string>('')
  const [complexityLevel, setComplexityLevel] = useState<string>('')

  const handleRandomPosition = () => {
    const position = getRandomGmPosition()
    onNewPosition(position)
  }

  const handleHighInterestPosition = () => {
    const position = getMostInterestingPosition()
    onNewPosition(position)
  }

  const handleTacticalPosition = () => {
    const position = getTacticalPlaygroundPosition()
    onNewPosition(position)
  }

  const handleFilteredPosition = () => {
    let filteredPositions = []

    // Apply filters based on selected criteria
    if (playerFilter.trim()) {
      filteredPositions = getPositionsByPlayer(playerFilter.trim())
    }
    
    if (yearFrom.trim() && yearTo.trim()) {
      const fromYear = parseInt(yearFrom)
      const toYear = parseInt(yearTo)
      const yearPositions = getPositionsByYear(fromYear, toYear)
      
      if (filteredPositions.length > 0) {
        // Filter common positions
        filteredPositions = filteredPositions.filter(pos => 
          yearPositions.some(yp => yp.fen === pos.fen)
        )
      } else {
        filteredPositions = yearPositions
      }
    }
    
    if (openingFilter.trim()) {
      const openingPositions = getPositionsByOpening(openingFilter.trim())
      
      if (filteredPositions.length > 0) {
        // Filter common positions
        filteredPositions = filteredPositions.filter(pos => 
          openingPositions.some(op => op.fen === pos.fen)
        )
      } else {
        filteredPositions = openingPositions
      }
    }

    if (tacticalTheme.trim()) {
      const themePositions = filteredPositions.length > 0 
        ? filteredPositions.filter(pos => pos.tacticalTheme.includes(tacticalTheme as any))
        : []
      
      filteredPositions = themePositions
    }

    if (complexityLevel.trim()) {
      const complexityPositions = filteredPositions.length > 0 
        ? filteredPositions.filter(pos => pos.complexity === complexityLevel)
        : getPositionsByComplexity(complexityLevel as any)
      
      filteredPositions = complexityPositions
    }

    // If no filters or no results from filters, get random position
    if (filteredPositions.length === 0) {
      filteredPositions = getPositionsByYear(1800, 2030) // all positions
    }

    // Select random from filtered
    const randomIndex = Math.floor(Math.random() * filteredPositions.length)
    onNewPosition(filteredPositions[randomIndex])
  }

  return (
    <FilterContainer>
      <ActionButtons>
        <HighInterestButton onClick={handleHighInterestPosition}>
          🎯 High Interest
        </HighInterestButton>
        <TacticalButton onClick={handleTacticalPosition}>
          ⚔️ Tactical Masterpiece
        </TacticalButton>
        <RandomButton onClick={handleRandomPosition}>
          🎲 Random
        </RandomButton>
        <FilterButton onClick={() => setShowFilters(!showFilters)}>
          🔍 Filters
        </FilterButton>
      </ActionButtons>
      
      {showFilters && (
        <FilterPanel>
          <FilterRow>
            <FilterLabel>Player:</FilterLabel>
            <FilterInput 
              type="text"
              placeholder="e.g., Kasparov, Carlsen"
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value)}
            />
          </FilterRow>
          
          <FilterRow>
            <FilterLabel>Year Range:</FilterLabel>
            <FilterInput 
              type="number"
              placeholder="from"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
            />
            <FilterInput 
              type="number"
              placeholder="to"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
            />
          </FilterRow>
          
          <FilterRow>
            <FilterLabel>Opening:</FilterLabel>
            <FilterInput 
              type="text"
              placeholder="e.g., Sicilian, Queen's Gambit"
              value={openingFilter}
              onChange={(e) => setOpeningFilter(e.target.value)}
            />
          </FilterRow>
          
          <FilterRow>
            <FilterLabel>Tactical Theme:</FilterLabel>
            <FilterSelect value={tacticalTheme} onChange={(e) => setTacticalTheme(e.target.value)}>
              <option value="">All themes</option>
              <option value="sacrifice">Sacrifice</option>
              <option value="queensacrifice">Queen Sacrifice</option>
              <option value="pin">Pin</option>
              <option value="fork">Fork</option>
              <option value="discovery">Discovery</option>
              <option value="attack">Attack</option>
              <option value="endgame">Endgame</option>
            </FilterSelect>
          </FilterRow>
          
          <FilterRow>
            <FilterLabel>Complexity:</FilterLabel>
            <FilterSelect value={complexityLevel} onChange={(e) => setComplexityLevel(e.target.value)}>
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="master">Master</option>
            </FilterSelect>
          </FilterRow>
          
          <ApplyButton onClick={handleFilteredPosition}>
            Get Filtered Position
          </ApplyButton>
        </FilterPanel>
      )}
    </FilterContainer>
  )
}

const FilterContainer = styled.div`
  margin-bottom: 20px;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 15px;
`

const FilterButton = styled.button`
  padding: 12px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }
`

const RandomButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
  }
`

const HighInterestButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
`

const TacticalButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(253, 121, 168, 0.4);
  }
`

const FilterPanel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: 0 auto;
`

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const FilterLabel = styled.label`
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
  
  @media (max-width: 480px) {
    min-width: auto;
  }
`

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
  
  &::placeholder {
    color: #bdc3c7;
  }
`

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`

const ApplyButton = styled.button`
  padding: 12px 24px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-top: 10px;
  
  &:hover {
    background: #229954;
    transform: translateY(-1px);
  }
`

export default PositionFilter
