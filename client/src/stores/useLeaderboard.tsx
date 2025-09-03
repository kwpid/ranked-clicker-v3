import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getRankInfo } from '../utils/rankingSystem';

export interface LeaderboardPlayer {
  id: string;
  name: string;
  mmr: number;
  wins: number;
  losses: number;
  title?: string;
  isPlayer?: boolean;
  lastUpdated: number;
}

export interface LeaderboardStore {
  leaderboards: {
    '1v1': LeaderboardPlayer[];
    '2v2': LeaderboardPlayer[];
    '3v3': LeaderboardPlayer[];
  };
  lastFluctuation: number;
  initializeLeaderboards: () => void;
  updatePlayerInLeaderboards: (playerData: any) => void;
  simulateMMRFluctuation: () => void;
  getPlayerRank: (playlist: '1v1' | '2v2' | '3v3', playerMMR: number) => number;
}

// Realistic pro player names for different regions/types
const PRO_NAMES = [
  // Top tier pros (likely on multiple leaderboards)
  "Atomic", "jstn.", "GarrettG", "Chicago", "Kaydop", "Turbopolsa", "Fairy Peak!", "RV.", "joreuz", "ahmad", "MonkeyMoon", "M0nkey M00n", "Extra", "joyo", "Zen", "trk511", "Vatira", "rise.", "ApparentlyJack", "Archie", "Rezears", "Seikoo", "Relatingwave", "Kassio", "Itachi", "AztraL", "oKhaliD", "Rw9", "Senzo", "Yanxnz",
  
  // High level but more specialized players
  "Wonder", "Firstkiller", "Daniel", "Beastmode", "Dreaz", "Ayyjayy", "Sypical", "Retals", "Allushin", "Arsenal", "Memory", "Gyro.", "Taroco.", "Scrub Killa", "Speed", "Flame", "Flakes", "CJCJ", "Eekso", "Chausette45", "Alpha54", "Kuxir97", "Paschy90", "Mognus", "Mikeboy", "Bluey", "Tigreee", "Ferra", "Acronik", "Polar",
  
  // Grinder tier (strong but not necessarily world class)
  "Chronic", "Shock", "Hockser", "Comm", "Bmode", "Noly", "Kv1", "Lion", "Aqua", "Radoko", "Nwpo", "LCT", "Oscillon", "Dmentza", "Catalysm", "Stake", "Godsmilla", "VorteX", "Breezi", "Arju", "SiN.exe", "Kinseh", "Maxeew", "Sniper", "Oaly", "Crisp", "Lethamyr", "Musty", "JZR", "Pulse Fire"
];

// Additional names for variety (mix of recognizable and fictional)
const ADDITIONAL_NAMES = [
  "fl1p", "echo", "nova", "storm", "blaze", "dash", "pulse", "zero", "volt", "frost", "viper", "ghost", "rage", "swift", "flame", "spark", "vapor", "shift", "flux", "drift", "neon", "cyber", "omega", "alpha", "prime", "nexus", "zenith", "vertex", "matrix", "vector", "prism", "surge", "titan", "quake", "wraith"
];

const ALL_LEADERBOARD_NAMES = [...PRO_NAMES, ...ADDITIONAL_NAMES];

// Generate MMR based on position (higher positions have higher MMR)
// Range: 2800 (minimum) to 3500 (maximum)
const generateMMRForPosition = (position: number, playlist: '1v1' | '2v2' | '3v3'): number => {
  // Top MMR for #1 player varies by playlist
  const topMMR = {
    '1v1': 3400, // 1v1 slightly lower top end
    '2v2': 3500, // Most competitive playlist gets highest MMR
    '3v3': 3450  // Balanced
  }[playlist];
  
  const minMMR = 2800; // Minimum Grand Champion MMR
  
  // Linear distribution from top to bottom (position 1-25)
  const mmrRange = topMMR - minMMR;
  const mmrDecrement = mmrRange / 24; // 24 steps from position 1 to 25
  
  const mmr = Math.floor(topMMR - ((position - 1) * mmrDecrement));
  
  // Ensure within bounds
  return Math.max(minMMR, Math.min(topMMR, mmr));
};

// Generate wins/losses based on MMR and position
const generateStats = (mmr: number, position: number) => {
  const baseWins = Math.floor(200 + (mmr / 10) + Math.random() * 300);
  const winRate = 0.65 + (25 - position) * 0.01; // Higher ranked players have better win rates
  const losses = Math.floor(baseWins / winRate - baseWins);
  
  return { wins: baseWins, losses: Math.max(losses, 10) };
};

// Generate title based on MMR
const generateTitleForMMR = (mmr: number): string | undefined => {
  const rankInfo = getRankInfo(mmr);
  const baseRank = rankInfo.name.split(' ')[0];
  
  if (mmr >= 1900) return 'Legend';
  if (mmr >= 1700) return 'Grandmaster';
  if (baseRank === 'Grand Champion') return 'Grand Champion';
  
  // Some players might have season titles
  if (Math.random() < 0.3) {
    const season = Math.floor(Math.random() * 5) + 1;
    return `S${season} ${baseRank}`;
  }
  
  return undefined;
};

const generateLeaderboardForPlaylist = (playlist: '1v1' | '2v2' | '3v3'): LeaderboardPlayer[] => {
  const players: LeaderboardPlayer[] = [];
  const usedNames = new Set<string>();
  
  // Determine distribution: 2v2 is most competitive, has most pros
  const proPlayerCount = playlist === '2v2' ? 18 : playlist === '1v1' ? 15 : 12;
  
  for (let i = 1; i <= 25; i++) {
    let name: string;
    
    // First positions get pro names, later positions get mix
    if (i <= proPlayerCount && PRO_NAMES.length > 0) {
      do {
        name = PRO_NAMES[Math.floor(Math.random() * PRO_NAMES.length)];
      } while (usedNames.has(name));
    } else {
      do {
        name = ALL_LEADERBOARD_NAMES[Math.floor(Math.random() * ALL_LEADERBOARD_NAMES.length)];
      } while (usedNames.has(name));
    }
    
    usedNames.add(name);
    
    const mmr = generateMMRForPosition(i, playlist);
    const stats = generateStats(mmr, i);
    const title = generateTitleForMMR(mmr);
    
    players.push({
      id: `ai_${playlist}_${i}`,
      name,
      mmr,
      wins: stats.wins,
      losses: stats.losses,
      title,
      isPlayer: false,
      lastUpdated: Date.now()
    });
  }
  
  return players;
};

export const useLeaderboard = create<LeaderboardStore>()(
  persist(
    (set, get) => ({
      leaderboards: {
        '1v1': [],
        '2v2': [],
        '3v3': []
      },
      lastFluctuation: 0,
      
      initializeLeaderboards: () => {
        const { leaderboards } = get();
        
        // Only initialize if leaderboards are empty
        if (leaderboards['1v1'].length === 0 || leaderboards['2v2'].length === 0 || leaderboards['3v3'].length === 0) {
          set({
            leaderboards: {
              '1v1': generateLeaderboardForPlaylist('1v1'),
              '2v2': generateLeaderboardForPlaylist('2v2'),
              '3v3': generateLeaderboardForPlaylist('3v3')
            },
            lastFluctuation: Date.now()
          });
        }
      },
      
      updatePlayerInLeaderboards: (playerData) => {
        const { leaderboards } = get();
        const newLeaderboards = { ...leaderboards };
        
        (['1v1', '2v2', '3v3'] as const).forEach(playlist => {
          const playerMMR = playerData.mmr[playlist];
          
          // Only show player if they have Grand Champion MMR (2800+)
          if (playerMMR < 2800) return;
          
          const playerEntry: LeaderboardPlayer = {
            id: 'player',
            name: playerData.username,
            mmr: playerMMR,
            wins: playerData.stats[playlist].wins,
            losses: playerData.stats[playlist].losses,
            title: playerData.equippedTitle,
            isPlayer: true,
            lastUpdated: Date.now()
          };
          
          // Remove existing player entry
          let currentBoard = newLeaderboards[playlist].filter(p => !p.isPlayer);
          
          // Add player if MMR is high enough (top 25)
          const lowestMMR = Math.min(...currentBoard.slice(0, 25).map(p => p.mmr));
          if (playerMMR > lowestMMR || currentBoard.length < 25) {
            currentBoard.push(playerEntry);
            // Sort by MMR and take top 25
            currentBoard.sort((a, b) => b.mmr - a.mmr);
            currentBoard = currentBoard.slice(0, 25);
          }
          
          newLeaderboards[playlist] = currentBoard;
        });
        
        set({ leaderboards: newLeaderboards });
      },
      
      simulateMMRFluctuation: () => {
        const now = Date.now();
        const { lastFluctuation, leaderboards } = get();
        
        // Only fluctuate every 30 seconds to simulate active players
        if (now - lastFluctuation < 30000) return;
        
        const newLeaderboards = { ...leaderboards };
        
        (['1v1', '2v2', '3v3'] as const).forEach(playlist => {
          newLeaderboards[playlist] = newLeaderboards[playlist].map(player => {
            if (player.isPlayer) return player;
            
            // Random MMR fluctuation (-10 to +10)
            const change = Math.floor(Math.random() * 21) - 10;
            const newMMR = Math.max(2550, Math.min(3100, player.mmr + change)); // Keep within 2550-3100 range
            
            // Update stats if MMR changed significantly
            let newWins = player.wins;
            let newLosses = player.losses;
            
            if (change > 5) {
              newWins += Math.floor(Math.random() * 3) + 1;
            } else if (change < -5) {
              newLosses += Math.floor(Math.random() * 2) + 1;
            }
            
            return {
              ...player,
              mmr: newMMR,
              wins: newWins,
              losses: newLosses,
              lastUpdated: now
            };
          }).sort((a, b) => b.mmr - a.mmr); // Re-sort after changes
        });
        
        set({ 
          leaderboards: newLeaderboards,
          lastFluctuation: now
        });
      },
      
      getPlayerRank: (playlist: '1v1' | '2v2' | '3v3', playerMMR: number): number => {
        const { leaderboards } = get();
        const board = leaderboards[playlist];
        
        for (let i = 0; i < board.length; i++) {
          if (playerMMR >= board[i].mmr) {
            return i + 1;
          }
        }
        
        return board.length + 1; // Player would be below current leaderboard
      }
    }),
    {
      name: 'ranked-clicker-leaderboard',
    }
  )
);