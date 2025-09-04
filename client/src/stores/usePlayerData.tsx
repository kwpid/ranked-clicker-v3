import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getRankInfo } from '../utils/rankingSystem';
import { useTournament, type TournamentTitle } from './useTournament';

interface PlayerStats {
  wins: number;
  losses: number;
  bestMMR: number;
}

interface SeasonReward {
  rank: string;
  season: number;
  unlocked: boolean;
}

interface Title {
  id: string;
  name: string;
  color: string;
  glow?: boolean;
  type: 'level' | 'season' | 'tournament';
  requirement?: number;
}

interface PlayerData {
  username: string;
  currentSeason: number;
  level: number;
  xp: number;
  xpToNext: number;
  equippedTitle?: string;
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
  seasonRewards: SeasonReward[];
  unlockedTitles: string[];
  seasonWins: {
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
  addXP: (amount: number) => void;
  equipTitle: (titleId: string) => void;
  getAvailableTitles: () => Title[];
  checkSeasonRewards: () => void;
}

// Calculate XP needed for a level (1.25x scaling)
const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.25, level - 1));
};

// Helper function to get rank from MMR
const getRankFromMMR = (mmr: number): string => {
  const rankInfo = getRankInfo(mmr);
  return rankInfo.name.split(' ')[0]; // Get base rank name (Bronze, Silver, etc.)
};

// Helper function to get rank color
const getRankColor = (rank: string): string => {
  const RANK_COLORS = {
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0', 
    'Gold': '#FFD700',
    'Platinum': '#E5E4E2',
    'Diamond': '#B9F2FF',
    'Champion': '#9966CC',
    'Grand Champion': '#FFD700', // Gold for Grand Champion
  };
  return RANK_COLORS[rank as keyof typeof RANK_COLORS] || '#9CA3AF';
};

// Title definitions
const ALL_TITLES: Title[] = [
  // Level-based titles (gray)
  { id: 'rookie', name: 'ROOKIE', color: '#9CA3AF', type: 'level', requirement: 1 },
  { id: 'novice', name: 'NOVICE', color: '#9CA3AF', type: 'level', requirement: 5 },
  { id: 'apprentice', name: 'APPRENTICE', color: '#9CA3AF', type: 'level', requirement: 10 },
  { id: 'journeyman', name: 'JOURNEYMAN', color: '#9CA3AF', type: 'level', requirement: 20 },
  { id: 'expert', name: 'EXPERT', color: '#9CA3AF', type: 'level', requirement: 35 },
  { id: 'master', name: 'MASTER', color: '#9CA3AF', type: 'level', requirement: 50 },
  { id: 'grandmaster', name: 'GRANDMASTER', color: '#9CA3AF', type: 'level', requirement: 75 },
  { id: 'legend', name: 'LEGEND', color: '#9CA3AF', type: 'level', requirement: 100 },
];

const defaultPlayerData: PlayerData = {
  username: 'Player',
  currentSeason: 1,
  level: 1,
  xp: 0,
  xpToNext: calculateXPForLevel(2),
  equippedTitle: 'rookie',
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
  seasonRewards: [],
  unlockedTitles: ['rookie'],
  seasonWins: {
    '1v1': 0,
    '2v2': 0,
    '3v3': 0,
  },
};

export const usePlayerData = create<PlayerDataStore>()(
  persist(
    (set, get) => ({
      playerData: defaultPlayerData,
      
      initializePlayer: () => {
        const { playerData } = get();
        if (!playerData.username || playerData.username === 'Player' || !playerData.seasonWins) {
          // Initialize or migrate player data - ensure all fields exist
          set({ playerData: { 
            ...defaultPlayerData,
            ...playerData, // Preserve existing data
            // Ensure new fields exist
            level: playerData.level || 1,
            xp: playerData.xp || 0,
            xpToNext: playerData.xpToNext || calculateXPForLevel(2),
            equippedTitle: playerData.equippedTitle || 'rookie',
            seasonRewards: playerData.seasonRewards || [],
            unlockedTitles: playerData.unlockedTitles || ['rookie'],
            seasonWins: playerData.seasonWins || { '1v1': 0, '2v2': 0, '3v3': 0 },
          } });
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
        // XP calculation: 25 for win, 10 for loss
        const xpGain = isWin ? 25 : 10;
        
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
              seasonWins: {
                ...state.playerData.seasonWins,
                [playlist]: state.playerData.seasonWins[playlist] + (isWin ? 1 : 0),
              },
            },
          };
        });
        
        // Add XP after updating stats
        get().addXP(xpGain);
        get().checkSeasonRewards();
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
            seasonWins: {
              '1v1': 0,
              '2v2': 0,
              '3v3': 0,
            },
            seasonRewards: [], // Reset season rewards
          },
        }));
      },
      
      addXP: (amount: number) => {
        set((state) => {
          let newXP = state.playerData.xp + amount;
          let newLevel = state.playerData.level;
          let newXPToNext = state.playerData.xpToNext;
          let newUnlockedTitles = [...state.playerData.unlockedTitles];
          
          // Check for level ups
          while (newXP >= newXPToNext) {
            newXP -= newXPToNext;
            newLevel++;
            newXPToNext = calculateXPForLevel(newLevel + 1);
            
            // Check for new title unlocks
            const newTitles = ALL_TITLES.filter(
              title => title.type === 'level' && 
              title.requirement === newLevel && 
              !newUnlockedTitles.includes(title.id)
            );
            newUnlockedTitles.push(...newTitles.map(t => t.id));
          }
          
          return {
            playerData: {
              ...state.playerData,
              xp: newXP,
              level: newLevel,
              xpToNext: newXPToNext,
              unlockedTitles: newUnlockedTitles,
            },
          };
        });
      },
      
      equipTitle: (titleId: string) => {
        set((state) => ({
          playerData: {
            ...state.playerData,
            equippedTitle: titleId,
          },
        }));
      },
      
      getAvailableTitles: () => {
        const { playerData } = get();
        
        // Get tournament titles from the tournament store
        const tournamentStore = useTournament.getState();
        
        return ALL_TITLES.filter(title => 
          playerData.unlockedTitles.includes(title.id)
        ).concat(
          // Add season reward titles
          playerData.seasonRewards
            .filter(reward => reward.unlocked)
            .map(reward => ({
              id: `s${reward.season}-${reward.rank}`,
              name: `S${reward.season} ${reward.rank.toUpperCase()}`,
              color: reward.rank.includes('Grand Champion') ? '#FFD700' : getRankColor(reward.rank.split(' ')[0]),
              glow: reward.rank.includes('Grand Champion'),
              type: 'season' as const,
            }))
        ).concat(
          // Add tournament titles (including RCCS titles)
          tournamentStore.tournamentTitles.map((tournamentTitle: TournamentTitle) => ({
            id: tournamentTitle.id,
            name: tournamentTitle.name,
            color: tournamentTitle.color === 'golden' ? '#FFD700' : 
                   tournamentTitle.color === 'green' ? '#10B981' :
                   tournamentTitle.color === 'aqua' ? '#00FFFF' : '#9CA3AF',
            glow: tournamentTitle.color === 'golden' || tournamentTitle.color === 'aqua',
            type: 'tournament' as const,
          }))
        );
      },
      
      checkSeasonRewards: () => {
        set((state) => {
          const { playerData } = state;
          const newRewards = [...playerData.seasonRewards];
          
          // Calculate total season wins across all playlists
          const totalSeasonWins = playerData.seasonWins['1v1'] + playerData.seasonWins['2v2'] + playerData.seasonWins['3v3'];
          
          // Get highest rank across all playlists
          const highestMMR = Math.max(playerData.mmr['1v1'], playerData.mmr['2v2'], playerData.mmr['3v3']);
          const highestRank = getRankFromMMR(highestMMR);
          const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion'];
          const highestRankIndex = rankOrder.indexOf(highestRank);
          
          // Check rewards for each rank up to highest rank (based on combined wins)
          for (let i = 0; i <= highestRankIndex; i++) {
            const rewardRank = rankOrder[i];
            const winsNeeded = (i + 1) * 10; // 10, 20, 30, 40, 50, 60, 70
            
            const existingReward = newRewards.find(r => 
              r.rank === rewardRank && r.season === playerData.currentSeason
            );
            
            if (!existingReward) {
              newRewards.push({
                rank: rewardRank,
                season: playerData.currentSeason,
                unlocked: totalSeasonWins >= winsNeeded,
              });
            } else if (!existingReward.unlocked && totalSeasonWins >= winsNeeded) {
              existingReward.unlocked = true;
            }
          }
          
          return {
            playerData: {
              ...playerData,
              seasonRewards: newRewards,
            },
          };
        });
      },
    }),
    {
      name: 'ranked-clicker-player-data',
    }
  )
);
