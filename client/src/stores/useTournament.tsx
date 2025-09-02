import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TournamentType = '1v1' | '2v2' | '3v3';
export type TournamentPhase = 'waiting' | 'queued' | 'in-progress' | 'finished';
export type BracketRound = 'round1' | 'round2' | 'round3' | 'semifinal' | 'final';

export interface TournamentPlayer {
  id: string;
  name: string;
  rank: string;
  mmr: number;
  isPlayer: boolean;
  eliminated: boolean;
}

export interface TournamentMatch {
  id: string;
  round: BracketRound;
  players: TournamentPlayer[];
  games: Array<{
    gameNumber: number;
    winner: string | null;
    scores: { [playerId: string]: number };
  }>;
  isComplete: boolean;
  winner: string | null;
  bestOf: 1 | 3 | 5;
}

export interface TournamentTitle {
  id: string;
  name: string;
  season: number;
  rank: string;
  wins: number;
  color: 'default' | 'green' | 'golden';
  dateAwarded: string;
}

interface TournamentState {
  // Tournament scheduling
  nextTournamentTime: number;
  currentTournament: {
    id: string;
    type: TournamentType;
    phase: TournamentPhase;
    players: TournamentPlayer[];
    matches: TournamentMatch[];
    currentRound: BracketRound;
    startTime: number;
  } | null;
  
  // Queue state
  isQueued: boolean;
  queuedTournamentType: TournamentType | null;
  queuePosition: number;
  
  // Player tournament data
  tournamentTitles: TournamentTitle[];
  seasonTournamentWins: { [type: string]: number }; // Current season wins by tournament type
  currentSeason: number;
  
  // Actions
  calculateNextTournamentTime: () => void;
  joinTournamentQueue: (type: TournamentType) => void;
  leaveTournamentQueue: () => void;
  startTournamentForTesting: (type: TournamentType) => void;
  generateTournamentBracket: (players: TournamentPlayer[], type: TournamentType) => void;
  completeMatch: (matchId: string, winner: string, gameResults: any[]) => void;
  awardTournamentTitle: (tournamentType: TournamentType, playerRank: string) => void;
  updateTournamentPhase: (phase: TournamentPhase) => void;
  isGameModeBlocked: () => boolean;
}

export const useTournament = create<TournamentState>()(
  persist(
    (set, get) => ({
      nextTournamentTime: 0,
      currentTournament: null,
      isQueued: false,
      queuedTournamentType: null,
      queuePosition: 0,
      tournamentTitles: [],
      seasonTournamentWins: {},
      currentSeason: 1,

      calculateNextTournamentTime: () => {
        const now = Date.now();
        const currentTime = new Date(now);
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
        const milliseconds = currentTime.getMilliseconds();
        
        // Calculate next xx:x0 time (every 10 minutes)
        const nextMinute = Math.ceil(minutes / 10) * 10;
        const nextTournamentTime = new Date(currentTime);
        nextTournamentTime.setMinutes(nextMinute, 0, 0);
        
        // If we're past this hour's last tournament, go to next hour
        if (nextMinute >= 60) {
          nextTournamentTime.setHours(nextTournamentTime.getHours() + 1);
          nextTournamentTime.setMinutes(0, 0, 0);
        }
        
        set({ nextTournamentTime: nextTournamentTime.getTime() });
      },

      joinTournamentQueue: (type: TournamentType) => {
        // Generate queue position (simulate other players)
        const queuePosition = Math.floor(Math.random() * 8) + 1;
        set({ 
          isQueued: true, 
          queuedTournamentType: type,
          queuePosition 
        });
      },

      leaveTournamentQueue: () => {
        set({ 
          isQueued: false, 
          queuedTournamentType: null,
          queuePosition: 0 
        });
      },

      startTournamentForTesting: (type: TournamentType) => {
        const tournamentId = `test-${Date.now()}`;
        
        // Generate AI opponents based on tournament type
        const playerCount = type === '1v1' ? 8 : type === '2v2' ? 8 : 12; // Teams for 2v2/3v3
        const players: TournamentPlayer[] = [];
        
        // Add the real player
        players.push({
          id: 'player',
          name: 'You',
          rank: 'Grand Champion',
          mmr: 2800,
          isPlayer: true,
          eliminated: false
        });
        
        // Add AI players
        const aiNames = [
          'TournamentPro', 'ClickMaster', 'SpeedDemon', 'RapidFire', 
          'QuickDraw', 'FastFingers', 'LightningClick', 'SwiftStrike',
          'TurboTap', 'BlazingButtons', 'InstantImpact'
        ];
        
        for (let i = 0; i < playerCount - 1; i++) {
          players.push({
            id: `ai-${i}`,
            name: aiNames[i] || `Player${i + 1}`,
            rank: 'Grand Champion',
            mmr: 2550 + Math.floor(Math.random() * 550),
            isPlayer: false,
            eliminated: false
          });
        }
        
        const currentTournament = {
          id: tournamentId,
          type,
          phase: 'in-progress' as TournamentPhase,
          players: players.slice(0, playerCount),
          matches: [],
          currentRound: 'round1' as BracketRound,
          startTime: Date.now()
        };
        
        set({ 
          currentTournament,
          isQueued: false,
          queuedTournamentType: null 
        });
        
        // Generate initial bracket
        get().generateTournamentBracket(currentTournament.players, type);
      },

      generateTournamentBracket: (players: TournamentPlayer[], type: TournamentType) => {
        const matches: TournamentMatch[] = [];
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        
        // Round 1: All players (best of 1)
        for (let i = 0; i < shuffledPlayers.length; i += 2) {
          if (i + 1 < shuffledPlayers.length) {
            matches.push({
              id: `round1-${i / 2}`,
              round: 'round1',
              players: [shuffledPlayers[i], shuffledPlayers[i + 1]],
              games: [],
              isComplete: false,
              winner: null,
              bestOf: 1
            });
          }
        }
        
        set(state => ({
          currentTournament: state.currentTournament ? {
            ...state.currentTournament,
            matches
          } : null
        }));
      },

      completeMatch: (matchId: string, winner: string, gameResults: any[]) => {
        set(state => {
          if (!state.currentTournament) return state;
          
          const updatedMatches = state.currentTournament.matches.map(match => {
            if (match.id === matchId) {
              return {
                ...match,
                isComplete: true,
                winner,
                games: gameResults
              };
            }
            return match;
          });
          
          return {
            currentTournament: {
              ...state.currentTournament,
              matches: updatedMatches
            }
          };
        });
      },

      awardTournamentTitle: (tournamentType: TournamentType, playerRank: string) => {
        const state = get();
        const season = state.currentSeason;
        const titleId = `s${season}-${tournamentType}-${playerRank.toLowerCase().replace(' ', '-')}-${Date.now()}`;
        
        // Count current season wins for this tournament type
        const seasonKey = `s${season}-${tournamentType}`;
        const currentWins = (state.seasonTournamentWins[seasonKey] || 0) + 1;
        
        // Determine title color
        let color: 'default' | 'green' | 'golden' = 'default';
        if (currentWins >= 3) {
          color = playerRank === 'Grand Champion' ? 'golden' : 'green';
        }
        
        const newTitle: TournamentTitle = {
          id: titleId,
          name: `S${season} ${playerRank.toUpperCase()} TOURNAMENT WINNER`,
          season,
          rank: playerRank,
          wins: currentWins,
          color,
          dateAwarded: new Date().toISOString()
        };
        
        set(state => ({
          tournamentTitles: [...state.tournamentTitles, newTitle],
          seasonTournamentWins: {
            ...state.seasonTournamentWins,
            [seasonKey]: currentWins
          }
        }));
      },

      updateTournamentPhase: (phase: TournamentPhase) => {
        set(state => ({
          currentTournament: state.currentTournament ? {
            ...state.currentTournament,
            phase
          } : null
        }));
      },

      isGameModeBlocked: () => {
        const state = get();
        return state.isQueued || (state.currentTournament?.phase === 'in-progress');
      }
    }),
    {
      name: 'tournament-storage'
    }
  )
);

// Initialize tournament timing
setTimeout(() => {
  useTournament.getState().calculateNextTournamentTime();
}, 100);

// Update tournament timing every minute
setInterval(() => {
  useTournament.getState().calculateNextTournamentTime();
}, 60000);