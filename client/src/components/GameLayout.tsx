import React from 'react';
import { PlayerCard } from './PlayerCard';
import { MainMenu } from './MainMenu';
import { QueueScreen } from './QueueScreen';
import { GameScreen } from './GameScreen';
import { StatsScreen } from './StatsScreen';
import { useGameState } from '../stores/useGameState';

export function GameLayout() {
  const { currentScreen } = useGameState();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenu />;
      case 'queue':
        return <QueueScreen />;
      case 'game':
        return <GameScreen />;
      case 'stats':
        return <StatsScreen />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <PlayerCard />
        <div className="mt-6">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
