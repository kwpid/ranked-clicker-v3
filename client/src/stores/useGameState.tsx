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
    score: number;
    isAI: boolean;
    isTeammate: boolean;
    title?: string;
  }>;
  tournamentContext: TournamentContext;
  
  setCurrentScreen: (screen: 'main' | 'queue' | 'game' | 'leaderboard' | 'tournaments' | 'tournament-bracket') => void;
  setQueueMode: (mode: 'casual' | 'ranked' | 'tournament') => void;
  setGameMode: (mode: '1v1' | '2v2' | '3v3') => void;
  setShowStatsModal: (show: boolean) => void;
  setOpponents: (opponents: Array<{ name: string; score: number; isAI: boolean; isTeammate: boolean; title?: string }>) => void;
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
    // Determine game mode based on total team size (player + teammates + opponents)
    // 1v1: 1 opponent, 2v2: 3 opponents (1 teammate + 2 enemies), 3v3: 5 opponents (2 teammates + 3 enemies)
    const totalOpponents = opponents.length;
    let gameMode: '1v1' | '2v2' | '3v3';
    
    if (totalOpponents === 1) {
      gameMode = '1v1';
    } else if (totalOpponents === 3) {
      gameMode = '2v2';
    } else {
      gameMode = '3v3';
    }
    
    // Convert opponents to proper game format immediately
    const gameOpponents = opponents.map(o => ({
      name: o.name,
      score: 0,
      isAI: true,
      isTeammate: o.isTeammate,
      title: 'Tournament Opponent'
    }));
    
    
    set({
      currentScreen: 'game',
      queueMode: 'tournament',
      gameMode,
      opponents: gameOpponents,
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
