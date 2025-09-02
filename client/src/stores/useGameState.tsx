import { create } from 'zustand';

interface TournamentContext {
  isActive: boolean;
  matchId: string | null;
  currentGame: number;
  bestOf: number;
  gamesWon: number;
  gamesLost: number;
}

interface GameState {
  currentScreen: 'main' | 'queue' | 'game' | 'leaderboard' | 'tournaments' | 'tournament-bracket';
  queueMode: 'casual' | 'ranked' | 'tournament' | null;
  gameMode: '1v1' | '2v2' | '3v3' | null;
  showStatsModal: boolean;
  opponents: Array<{
    name: string;
    mmr: number;
    isTeammate: boolean;
  }>;
  tournamentContext: TournamentContext;
  
  setCurrentScreen: (screen: 'main' | 'queue' | 'game' | 'leaderboard' | 'tournaments' | 'tournament-bracket') => void;
  setQueueMode: (mode: 'casual' | 'ranked' | 'tournament') => void;
  setGameMode: (mode: '1v1' | '2v2' | '3v3') => void;
  setShowStatsModal: (show: boolean) => void;
  setOpponents: (opponents: Array<{ name: string; mmr: number; isTeammate: boolean }>) => void;
  setTournamentContext: (context: TournamentContext) => void;
  startTournamentMatch: (matchId: string, bestOf: number, opponents: Array<{ name: string; mmr: number; isTeammate: boolean }>) => void;
}

export const useGameState = create<GameState>((set, get) => ({
  currentScreen: 'main',
  queueMode: null,
  gameMode: null,
  showStatsModal: false,
  opponents: [],
  tournamentContext: {
    isActive: false,
    matchId: null,
    currentGame: 1,
    bestOf: 1,
    gamesWon: 0,
    gamesLost: 0
  },
  
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setQueueMode: (mode) => set({ queueMode: mode }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setShowStatsModal: (show) => set({ showStatsModal: show }),
  setOpponents: (opponents) => set({ opponents }),
  setTournamentContext: (context) => set({ tournamentContext: context }),
  
  startTournamentMatch: (matchId, bestOf, opponents) => {
    const gameMode = opponents.length === 2 ? '1v1' : opponents.length === 4 ? '2v2' : '3v3';
    set({
      currentScreen: 'game',
      queueMode: 'tournament',
      gameMode,
      opponents,
      tournamentContext: {
        isActive: true,
        matchId,
        currentGame: 1,
        bestOf,
        gamesWon: 0,
        gamesLost: 0
      }
    });
  }
}));
