import React from 'react';
import { GameLayout } from './components/GameLayout';
import { useGameState } from './stores/useGameState';
import { usePlayerData } from './stores/usePlayerData';
import { useEffect } from 'react';
import { initializeConsoleCommands } from './utils/consoleCommands';

function App() {
  const { initializePlayer } = usePlayerData();
  
  useEffect(() => {
    // Initialize player data on app start
    initializePlayer();
    // Initialize console commands for debugging
    initializeConsoleCommands();
  }, [initializePlayer]);

  return <GameLayout />;
}

export default App;
