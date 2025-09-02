import { create } from 'zustand';

interface GameState {
  currentScreen: 'main' | 'queue' | 'game';
  queueMode: 'casual' | 'ranked' | null;
  gameMode: '1v1' | '2v2' | '3v3' | null;
  showStatsModal: boolean;
  opponents: Array<{
    name: string;
    mmr: number;
    isTeammate: boolean;
  }>;
  
  setCurrentScreen: (screen: 'main' | 'queue' | 'game') => void;
  setQueueMode: (mode: 'casual' | 'ranked') => void;
  setGameMode: (mode: '1v1' | '2v2' | '3v3') => void;
  setShowStatsModal: (show: boolean) => void;
  setOpponents: (opponents: Array<{ name: string; mmr: number; isTeammate: boolean }>) => void;
}

export const useGameState = create<GameState>((set) => ({
  currentScreen: 'main',
  queueMode: null,
  gameMode: null,
  showStatsModal: false,
  opponents: [],
  
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setQueueMode: (mode) => set({ queueMode: mode }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setShowStatsModal: (show) => set({ showStatsModal: show }),
  setOpponents: (opponents) => set({ opponents }),
}));
