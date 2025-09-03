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
  currentScreen: 'main' | 'queue' | 'game' | 'leaderboard' | 'tournaments' | 'tournament-bracket' | 'news';
  queueMode: 'casual' | 'ranked' | 'tournament' | null;
  gameMode: '1v1' | '2v2' | '3v3' | null;
  showStatsModal: boolean;
  opponents: Array<{
    name: string;
    score: number;
    isAI: boolean;
    isTeammate: boolean;
    title?: string;
    mmr?: number;
  }>;
  tournamentContext: TournamentContext;
  
  setCurrentScreen: (screen: 'main' | 'queue' | 'game' | 'leaderboard' | 'tournaments' | 'tournament-bracket' | 'news') => void;
  setQueueMode: (mode: 'casual' | 'ranked' | 'tournament') => void;
  setGameMode: (mode: '1v1' | '2v2' | '3v3') => void;
  setShowStatsModal: (show: boolean) => void;
  setOpponents: (opponents: Array<{ name: string; score: number; isAI: boolean; isTeammate: boolean; title?: string; mmr?: number }>) => void;
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
    const gameOpponents = opponents.map(o => {
      // Import proper title generation for tournament opponents
      const getRandomAITitle = (aiMMR: number, currentSeason: number = 1): string => {
        // Get AI's rank based on MMR
        const getRankFromMMR = (mmr: number): string => {
          if (mmr < 400) return 'Bronze';
          if (mmr < 700) return 'Silver';
          if (mmr < 1000) return 'Gold';
          if (mmr < 1300) return 'Platinum';
          if (mmr < 1600) return 'Diamond';
          if (mmr < 1900) return 'Champion';
          return 'Grand Champion';
        };
        
        const aiRank = getRankFromMMR(aiMMR);
        const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion'];
        const aiRankIndex = rankOrder.indexOf(aiRank);
        
        // Level-based titles (always available)
        const LEVEL_TITLES = [
          'ROOKIE', 'NOVICE', 'APPRENTICE', 'JOURNEYMAN', 'EXPERT', 'MASTER', 'GRANDMASTER', 'LEGEND'
        ];
        
        // Season reward titles (limited by rank)
        const SEASON_TITLES: string[] = [];
        for (let i = 0; i <= aiRankIndex; i++) {
          const rank = rankOrder[i];
          for (let season = 1; season <= currentSeason; season++) {
            SEASON_TITLES.push(`S${season} ${rank.toUpperCase()}`);
          }
        }
        
        // Tournament titles (limited by rank)
        const TOURNAMENT_TITLES: string[] = [];
        for (let i = 0; i <= aiRankIndex; i++) {
          const rank = rankOrder[i];
          for (let season = 1; season <= currentSeason; season++) {
            TOURNAMENT_TITLES.push(`S${season} ${rank.toUpperCase()} TOURNAMENT WINNER`);
          }
        }
        
        // Weight the probabilities based on rank
        const titleCategories = [];
        
        if (aiRankIndex <= 2) {
          // Bronze/Silver/Gold - mostly level titles (80%), some season titles (20%)
          for (let i = 0; i < 8; i++) {
            titleCategories.push(...LEVEL_TITLES);
          }
          if (SEASON_TITLES.length > 0) {
            for (let i = 0; i < 2; i++) {
              titleCategories.push(...SEASON_TITLES);
            }
          }
        } else if (aiRankIndex <= 4) {
          // Platinum/Diamond - balanced (50% level, 40% season, 10% tournament)
          for (let i = 0; i < 5; i++) {
            titleCategories.push(...LEVEL_TITLES);
          }
          if (SEASON_TITLES.length > 0) {
            for (let i = 0; i < 4; i++) {
              titleCategories.push(...SEASON_TITLES);
            }
          }
          if (TOURNAMENT_TITLES.length > 0) {
            titleCategories.push(...TOURNAMENT_TITLES);
          }
        } else {
          // Champion/Grand Champion - prefer prestigious titles (20% level, 50% season, 30% tournament)
          for (let i = 0; i < 2; i++) {
            titleCategories.push(...LEVEL_TITLES);
          }
          if (SEASON_TITLES.length > 0) {
            for (let i = 0; i < 5; i++) {
              titleCategories.push(...SEASON_TITLES);
            }
          }
          if (TOURNAMENT_TITLES.length > 0) {
            for (let i = 0; i < 3; i++) {
              titleCategories.push(...TOURNAMENT_TITLES);
            }
          }
        }
        
        // Fallback to level title if no other titles available
        if (titleCategories.length === 0) {
          return LEVEL_TITLES[Math.floor(Math.random() * LEVEL_TITLES.length)];
        }
        
        return titleCategories[Math.floor(Math.random() * titleCategories.length)];
      };

      return {
        name: o.name,
        score: 0,
        isAI: true,
        isTeammate: o.isTeammate,
        title: getRandomAITitle(o.mmr, 1), // Use current season 1
        mmr: o.mmr
      };
    });
    
    
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
