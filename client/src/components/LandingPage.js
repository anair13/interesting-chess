import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const startNewGame = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/games/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      
      const data = await response.json();
      
      // Navigate to the game page
      navigate(`/game/${data.gameId}?host=true`);
      
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error('Error creating game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">Interesting Chess</h1>
      <p className="landing-subtitle">
        Play fascinating chess positions from grandmaster games with your friends. 
        Start a new game, get assigned a random color, and share the link to begin!
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        className="start-game-btn" 
        onClick={startNewGame}
        disabled={loading}
      >
        {loading ? 'Creating Game...' : 'Start New Game'}
      </button>
      
      <div style={{ marginTop: '3rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
        <p>✨ Random interesting GM positions</p>
        <p>🎲 Random color assignment</p>
        <p>🔗 Share link with friends</p>
        <p>⚡ Real-time multiplayer</p>
      </div>
    </div>
  );
};

export default LandingPage;
