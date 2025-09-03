import React from 'react';
import { PlayerCard } from './PlayerCard';
import { MainMenu } from './MainMenu';
import { QueueScreen } from './QueueScreen';
import { GameScreen } from './GameScreen';
import { StatsScreen } from './StatsScreen';
import { LeaderboardScreen } from './LeaderboardScreen';
import { TournamentScreen } from './TournamentScreen';
import { TournamentBracket } from './TournamentBracket';
import { TournamentBanner } from './TournamentBanner';
import NewsScreen from './NewsScreen';
import NewsModal from './NewsModal';
import { useGameState } from '../stores/useGameState';

export function GameLayout() {
  const { currentScreen, showStatsModal, setCurrentScreen } = useGameState();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenu />;
      case 'queue':
        return <QueueScreen />;
      case 'game':
        return <GameScreen />;
      case 'leaderboard':
        return <LeaderboardScreen onBack={() => setCurrentScreen('main')} />;
      case 'tournaments':
        return <TournamentScreen />;
      case 'tournament-bracket':
        return <TournamentBracket />;
      case 'news':
        return <NewsScreen />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TournamentBanner />
      <div className="container mx-auto px-4 py-6">
        {currentScreen !== 'queue' && currentScreen !== 'game' && currentScreen !== 'leaderboard' && currentScreen !== 'tournaments' && currentScreen !== 'tournament-bracket' && currentScreen !== 'news' && <PlayerCard />}
        <div className={currentScreen !== 'queue' && currentScreen !== 'game' && currentScreen !== 'leaderboard' && currentScreen !== 'tournaments' && currentScreen !== 'tournament-bracket' && currentScreen !== 'news' ? 'mt-6' : ''}>
          {renderScreen()}
        </div>
      </div>
      {showStatsModal && <StatsScreen />}
      <NewsModal />
    </div>
  );
}
