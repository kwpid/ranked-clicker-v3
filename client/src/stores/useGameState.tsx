import { create } from 'zustand';

interface GameState {
  currentScreen: 'main' | 'queue' | 'game' | 'stats';
  queueMode: 'casual' | 'ranked' | null;
  gameMode: '1v1' | '2v2' | '3v3' | null;
  opponents: Array<{
    name: string;
    mmr: number;
    isTeammate: boolean;
  }>;
  
  setCurrentScreen: (screen: 'main' | 'queue' | 'game' | 'stats') => void;
  setQueueMode: (mode: 'casual' | 'ranked') => void;
  setGameMode: (mode: '1v1' | '2v2' | '3v3') => void;
  setOpponents: (opponents: Array<{ name: string; mmr: number; isTeammate: boolean }>) => void;
}

export const useGameState = create<GameState>((set) => ({
  currentScreen: 'main',
  queueMode: null,
  gameMode: null,
  opponents: [],
  
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setQueueMode: (mode) => set({ queueMode: mode }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setOpponents: (opponents) => set({ opponents }),
}));
