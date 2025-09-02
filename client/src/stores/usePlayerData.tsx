import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerStats {
  wins: number;
  losses: number;
  bestMMR: number;
}

interface PlayerData {
  username: string;
  currentSeason: number;
  mmr: {
    '1v1': number;
    '2v2': number;
    '3v3': number;
  };
  stats: {
    '1v1': PlayerStats;
    '2v2': PlayerStats;
    '3v3': PlayerStats;
  };
  placementMatches: {
    '1v1': number;
    '2v2': number;
    '3v3': number;
  };
}

interface PlayerDataStore {
  playerData: PlayerData;
  initializePlayer: () => void;
  updateUsername: (username: string) => void;
  updateMMR: (playlist: '1v1' | '2v2' | '3v3', change: number) => void;
  updateStats: (playlist: '1v1' | '2v2' | '3v3', isWin: boolean) => void;
  resetSeason: () => void;
}

const defaultPlayerData: PlayerData = {
  username: 'Player',
  currentSeason: 1,
  mmr: {
    '1v1': 500,
    '2v2': 500,
    '3v3': 500,
  },
  stats: {
    '1v1': { wins: 0, losses: 0, bestMMR: 500 },
    '2v2': { wins: 0, losses: 0, bestMMR: 500 },
    '3v3': { wins: 0, losses: 0, bestMMR: 500 },
  },
  placementMatches: {
    '1v1': 5,
    '2v2': 5,
    '3v3': 5,
  },
};

export const usePlayerData = create<PlayerDataStore>()(
  persist(
    (set, get) => ({
      playerData: defaultPlayerData,
      
      initializePlayer: () => {
        const { playerData } = get();
        if (!playerData.username || playerData.username === 'Player') {
          // First time initialization - ensure fresh save
          set({ playerData: { ...defaultPlayerData } });
        }
      },
      
      updateUsername: (username: string) => {
        set((state) => ({
          playerData: {
            ...state.playerData,
            username: username.slice(0, 20),
          },
        }));
      },
      
      updateMMR: (playlist: '1v1' | '2v2' | '3v3', change: number) => {
        set((state) => {
          const newMMR = Math.max(0, state.playerData.mmr[playlist] + change);
          const currentBest = state.playerData.stats[playlist].bestMMR;
          
          return {
            playerData: {
              ...state.playerData,
              mmr: {
                ...state.playerData.mmr,
                [playlist]: newMMR,
              },
              stats: {
                ...state.playerData.stats,
                [playlist]: {
                  ...state.playerData.stats[playlist],
                  bestMMR: Math.max(currentBest, newMMR),
                },
              },
            },
          };
        });
      },
      
      updateStats: (playlist: '1v1' | '2v2' | '3v3', isWin: boolean) => {
        set((state) => {
          const currentPlacement = state.playerData.placementMatches[playlist];
          const newPlacement = Math.max(0, currentPlacement - 1);
          
          return {
            playerData: {
              ...state.playerData,
              stats: {
                ...state.playerData.stats,
                [playlist]: {
                  ...state.playerData.stats[playlist],
                  wins: state.playerData.stats[playlist].wins + (isWin ? 1 : 0),
                  losses: state.playerData.stats[playlist].losses + (isWin ? 0 : 1),
                },
              },
              placementMatches: {
                ...state.playerData.placementMatches,
                [playlist]: newPlacement,
              },
            },
          };
        });
      },
      
      resetSeason: () => {
        set((state) => ({
          playerData: {
            ...state.playerData,
            currentSeason: state.playerData.currentSeason + 1,
            // Soft reset MMR (similar to Rocket League)
            mmr: {
              '1v1': Math.max(100, Math.floor(state.playerData.mmr['1v1'] * 0.8)),
              '2v2': Math.max(100, Math.floor(state.playerData.mmr['2v2'] * 0.8)),
              '3v3': Math.max(100, Math.floor(state.playerData.mmr['3v3'] * 0.8)),
            },
            placementMatches: {
              '1v1': 5,
              '2v2': 5,
              '3v3': 5,
            },
          },
        }));
      },
    }),
    {
      name: 'ranked-clicker-player-data',
    }
  )
);
