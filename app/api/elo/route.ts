import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

interface EloUpdateRequest {
  positionId?: string
  solved: boolean
  timeSpent: number
  userId: string
  positionFen: string
  gameResult?: 'win' | 'loss' | 'draw'
}

// K-factor constants for ELO adjustment (Chess.com style)
const K_FACTOR = 32 // High volatility for newer players
const SMOOTHING_FACTOR = 400  // Typical 400-point ELO scale

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: EloUpdateRequest = await request.json()
    
    // Get user for current stats
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { games: true }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Calculate ELO change based on performance
    const currentElo = user.chessElo
    
    // Simplified ELO calculation:
    // We model "solving a position well" as defeating a virtual opponent at current level
    const virtualOpponentRating = currentElo
    
    // If solved quickly/correctly, treat like beating equal-rated opponent   
    // If failed/took very long, treat like losing to equal rated opponent
    
    let expectedScore: number
    let actualScore: number
    
    if (data.solved) {
      // Solved well - to adjust based on time spent for refinement
      actualScore = data.timeSpent < 30 ? 1.0 : // "brilliant" quick solve
                    data.timeSpent < 60 ? 0.9 :   // fast solve  
                    data.timeSpent < 180 ? 0.8 : 0.7  // slow solve
    } else {
      actualScore = 0 // loss
    }
    
    // Calculate expected score vs virtual opponent of similar strength  
    expectedScore = 1 / (1 + Math.pow(10, (virtualOpponentRating - currentElo) / SMOOTHING_FACTOR))

    // Apply K-factor
    const ratingChange = K_FACTOR * (actualScore - expectedScore)
    const newElo = Math.max(400, Math.round(currentElo + ratingChange)) // Min 400 ELO

    // Update database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        chessElo: newElo,
        gamesPlayed: user.gamesPlayed + 1,
        wins: data.solved ? user.wins + 1 : user.wins,
        losses: !data.solved ? user.losses + 1 : user.losses,
        puzzleRating: newElo // I'll treat random positions growth similarly; distinguish as needed
      }
    })

    // Log game record
    const newGameRecord = await prisma.game.create({
      data: {
        userId: user.id,
        initialPosition: data.positionFen,
        outcome: data.solved ? 'win' : 'loss',
        eloChange: ratingChange,
        timeSpent: data.timeSpent,
        solved: data.solved
      }
    })

    return NextResponse.json({ 
      newElo,
      eloChange: ratingChange,
      gamesPlayed: updatedUser.gamesPlayed 
    })
    
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update rating.' }, { status: 500 })
  }
}
