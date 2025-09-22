'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import styled from 'styled-components'
import { useState, useEffect } from 'react'

// For now, assume we need to setup, but we're here also checking signIn behavior

const Authentication: React.FC = () => {
  const { data: session, status } = useSession()
  const [userRating, setUserRating] = useState<number | null>(null)

  useEffect(() => {
    if (session?.user && (session.user as any).chessElo) {
      setUserRating((session.user as any).chessElo)
    }
  }, [session])

  if (status === "loading") {
    return (
      <AuthContainer>
        <AuthText>Loading...</AuthText>
      </AuthContainer>
    )
  }

  if (session) {
    return (
      <AuthContainer>
        <UserSection>
          <UserPic src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
          <UserInfo>
            <AuthText>Welcome, {session.user?.name || 'User'}!</AuthText>
            {(session.user as any)?.chessElo && (
              <RatingText>
                ELO: {(session.user as any).chessElo}
              </RatingText>
            )}
          </UserInfo>
        </UserSection>
        <StyledButton $type="signOut" onClick={() => signOut()}>
          Logout
        </StyledButton>
      </AuthContainer>
    )
  }

  const handleSignIn = async () => {
    try {
      // Simple sign-in with just minimal redirect configuration
      await signIn('google')
    } catch (signInError) {
      console.error("Google sign-in failure:", signInError) 
      alert("Google Sign-In is configured as incomplete. See environment variables.")
    }
  }


  return (
    <AuthContainer>
      <AuthText>Ready to play GM positions?</AuthText>
      <StyledButton $type="signIn" onClick={handleSignIn}>
        Login with Google
      </StyledButton>
    </AuthContainer>
  )
}

const AuthContainer = styled.div`
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
`

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const UserPic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #3498db;
  object-fit: cover;
`

const UserInfo = styled.div`
  text-align: left;
`

const AuthText = styled.p`
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
  margin: 0;
`

const RatingText = styled.span`
  color: #27ae60;
  font-size: 0.9rem;
  font-weight: 600;
`

const StyledButton = styled.button<{ $type: 'signIn' | 'signOut' }>`
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 20px;
  transition: all 0.2s;
  cursor: pointer;
  min-width: 130px;

  ${props => props.$type === 'signIn' && `
    background: linear-gradient(135deg, #6574cd 0%, #764ba2 100%);
    color: white;
    border: 1px solid transparent;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
    }
  `}

  ${props => props.$type === 'signOut' && `
    background: white;
    color: #e74c3c;
    border: 1px solid #e74c3c;
    
    &:hover {
      background: #e74c3c;
      color: white;
    }
  `}
`


export default Authentication
