import React from 'react';
import { GameLayout } from './components/GameLayout';
import { useGameState } from './stores/useGameState';
import { usePlayerData } from './stores/usePlayerData';
import { useEffect } from 'react';

function App() {
  const { initializePlayer } = usePlayerData();
  
  useEffect(() => {
    // Initialize player data on app start
    initializePlayer();
  }, [initializePlayer]);

  return <GameLayout />;
}

export default App;
