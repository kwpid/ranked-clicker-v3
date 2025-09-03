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
  checkAndStartTournament: () => void;
  joinTournamentQueue: (type: TournamentType) => void;
  leaveTournamentQueue: () => void;
  startTournamentForTesting: (type: TournamentType) => void;
  generateTournamentBracket: (players: TournamentPlayer[], type: TournamentType) => void;
  simulateAIMatches: () => void;
  checkRoundCompletion: () => void;
  completeMatch: (matchId: string, winner: string, gameResults: any[]) => void;
  awardTournamentTitle: (tournamentType: TournamentType, playerRank: string) => void;
  updateTournamentPhase: (phase: TournamentPhase) => void;
  isGameModeBlocked: () => boolean;
  playTournamentMatch: (matchId: string) => void;
  completeTournamentGame: (matchId: string, playerWon: boolean, playerScore: number, opponentScores: { [id: string]: number }) => void;
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
        
        // Check if current tournament should start
        get().checkAndStartTournament();
      },

      checkAndStartTournament: () => {
        const state = get();
        if (!state.isQueued || !state.nextTournamentTime) return;
        
        const now = Date.now();
        if (now >= state.nextTournamentTime && state.queuedTournamentType) {
          // Start the tournament
          state.startTournamentForTesting(state.queuedTournamentType);
          // Navigate to bracket screen for regular tournaments too
          import('../stores/useGameState').then(({ useGameState }) => {
            useGameState.getState().setCurrentScreen('tournament-bracket');
          });
        }
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

      startTournamentForTesting: async (type: TournamentType) => {
        const tournamentId = `test-${Date.now()}`;
        
        // Generate AI opponents based on tournament type
        const playerCount = type === '1v1' ? 8 : type === '2v2' ? 8 : 12; // Teams for 2v2/3v3
        const players: TournamentPlayer[] = [];
        
        // Add the real player with their actual data
        const playerData = await import('../stores/usePlayerData').then(({ usePlayerData }) => 
          usePlayerData.getState().playerData
        );
        const highestMMR = Math.max(playerData.mmr['1v1'], playerData.mmr['2v2'], playerData.mmr['3v3']);
        const rankInfo = await import('../utils/rankingSystem').then(({ getRankInfo }) => 
          getRankInfo(highestMMR)
        );
        
        players.push({
          id: 'player',
          name: 'You',
          rank: rankInfo.name,
          mmr: highestMMR,
          isPlayer: true,
          eliminated: false
        });
        
        // Add AI players
        // Use AI names from the proper file
        const aiNames = [
          "L", "kupid", "l0st", "jayleng", "weweewew", "RisingPhoinex87", "dr.1", "prot", "hunt", "kif", "?", "rivverott", "1x Dark", "Moxxy!", "ä", "شغثغخ", "dark!", "Vortex", "FlickMaster17", "r", "Skywave!", "R3tr0", "TurboClash893", "Zynk", "Null_Force", "Orbital", "Boosted", "GravyTrain", "NitroNinja", "PixelPlay", "PhantomX", "Fury", "Zero!", "Moonlight", "QuickTap", "v1per", "Slugger", "MetaDrift", "Hydra", "Neo!", "ShadowDart", "SlipStream", "F1ick", "Karma", "Sparkz", "Glitch", "Dash7", "Ignite", "Cyclone", "Nova", "Opt1c", "Viral", "Stormz", "PyroBlast", "Bl1tz", "Echo", "Hover", "PulseRider"
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
              bestOf: 1 // All tournament matches are best of 1
            });
          }
        }
        
        set(state => ({
          currentTournament: state.currentTournament ? {
            ...state.currentTournament,
            matches
          } : null
        }));
        
        // Auto-simulate AI matches after a short delay
        setTimeout(() => {
          get().simulateAIMatches();
        }, 2000);
      },

      simulateAIMatches: () => {
        const state = get();
        if (!state.currentTournament) return;
        
        const updatedMatches = state.currentTournament.matches.map(match => {
          if (!match.isComplete && !match.players.some(p => p.isPlayer)) {
            // AI vs AI match - simulate result
            const winner = Math.random() < 0.5 ? match.players[0] : match.players[1];
            const gameResult = {
              gameNumber: 1,
              winner: winner.id,
              scores: {
                [match.players[0].id]: Math.floor(Math.random() * 50) + 30,
                [match.players[1].id]: Math.floor(Math.random() * 50) + 30
              }
            };
            
            return {
              ...match,
              isComplete: true,
              winner: winner.id,
              games: [gameResult]
            };
          }
          return match;
        });
        
        set(state => ({
          currentTournament: state.currentTournament ? {
            ...state.currentTournament,
            matches: updatedMatches
          } : null
        }));
        
        // Check if we need to advance to next round
        setTimeout(() => {
          get().checkRoundCompletion();
        }, 1000);
      },

      checkRoundCompletion: () => {
        const state = get();
        if (!state.currentTournament) return;
        
        const currentRoundMatches = state.currentTournament.matches.filter(
          m => m.round === state.currentTournament?.currentRound
        );
        
        const allComplete = currentRoundMatches.every(m => m.isComplete);
        if (!allComplete) return;
        
        // Advance to next round
        const winners = currentRoundMatches.map(match => {
          const winnerId = match.winner;
          return match.players.find(p => p.id === winnerId)!;
        });
        
        if (winners.length === 1) {
          // Tournament finished
          const winner = winners[0];
          if (winner.isPlayer) {
            // Player won the tournament! Award title based on actual rank
            // The title will be awarded in completeTournamentGame when the final match completes
          }
          
          set(state => ({
            currentTournament: state.currentTournament ? {
              ...state.currentTournament,
              phase: 'finished' as TournamentPhase
            } : null
          }));
          return;
        }
        
        // Create next round
        // Dynamic round progression based on remaining players
        let nextRound: BracketRound;
        if (winners.length === 4) {
          nextRound = 'semifinal';
        } else if (winners.length === 2) {
          nextRound = 'final';
        } else if (winners.length > 4) {
          nextRound = 'round2';
        } else if (winners.length > 2) {
          nextRound = 'round3';
        } else {
          return; // Tournament should be finished
        }
        
        if (!nextRound) return;
        
        const nextMatches: TournamentMatch[] = [];
        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            const bestOf = 1; // Simplified: All tournament matches are best of 1
            nextMatches.push({
              id: `${nextRound}-${i / 2}`,
              round: nextRound,
              players: [winners[i], winners[i + 1]],
              games: [],
              isComplete: false,
              winner: null,
              bestOf
            });
          }
        }
        
        set(state => ({
          currentTournament: state.currentTournament ? {
            ...state.currentTournament,
            currentRound: nextRound,
            matches: [...state.currentTournament.matches, ...nextMatches]
          } : null
        }));
        
        // Auto-simulate AI matches in next round
        setTimeout(() => {
          get().simulateAIMatches();
        }, 3000);
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
        // Handle Grand Champion specially since it's two words
        const baseRank = playerRank.startsWith('Grand Champion') ? 'Grand Champion' : playerRank.split(' ')[0]; // Get "Silver", "Gold", etc.
        
        // Count current season wins for this tournament type (not per rank)
        const seasonKey = `s${season}-${tournamentType}`;
        const currentWins = (state.seasonTournamentWins[seasonKey] || 0) + 1;
        
        // Check if this exact title already exists for this season and tournament type
        const existingTitleIndex = state.tournamentTitles.findIndex(
          title => title.season === season && 
                   title.rank === baseRank && 
                   title.name.includes(`${season} ${baseRank.toUpperCase()} TOURNAMENT WINNER`)
        );
        
        if (existingTitleIndex !== -1) {
          // Title already exists, just update the color and win count
          let color: 'default' | 'green' | 'golden' = 'default';
          if (baseRank === 'Grand Champion') {
            color = currentWins >= 3 ? 'golden' : 'golden'; // Grand Champion always golden, red after 3 wins
          } else if (currentWins >= 3) {
            color = 'green';
          }
          
          // Update existing title
          set(state => {
            const updatedTitles = [...state.tournamentTitles];
            updatedTitles[existingTitleIndex] = {
              ...updatedTitles[existingTitleIndex],
              wins: currentWins,
              color: currentWins >= 3 ? (baseRank === 'Grand Champion' ? 'golden' : 'green') : updatedTitles[existingTitleIndex].color
            };
            
            return {
              tournamentTitles: updatedTitles,
              seasonTournamentWins: {
                ...state.seasonTournamentWins,
                [seasonKey]: currentWins
              }
            };
          });
          
          return; // Don't create a new title
        }
        
        // Create new title since it doesn't exist
        const titleId = `s${season}-${tournamentType}-${baseRank.toLowerCase().replace(' ', '-')}`;
        
        // Determine title color
        let color: 'default' | 'green' | 'golden' = 'default';
        if (baseRank === 'Grand Champion') {
          color = 'golden'; // Grand Champion titles are always golden
        } else if (currentWins >= 3) {
          color = 'green';
        }
        
        const newTitle: TournamentTitle = {
          id: titleId,
          name: `S${season} ${baseRank.toUpperCase()} TOURNAMENT WINNER`,
          season,
          rank: baseRank,
          wins: currentWins,
          color,
          dateAwarded: new Date().toISOString()
        };
        
        // Store tournament title in tournament store
        set(state => ({
          tournamentTitles: [...state.tournamentTitles, newTitle],
          seasonTournamentWins: {
            ...state.seasonTournamentWins,
            [seasonKey]: currentWins
          }
        }));
        
        // Also add the title to player data so it shows up in their title collection
        import('../stores/usePlayerData').then(({ usePlayerData }) => {
          const playerDataStore = usePlayerData.getState();
          
          // Check if this season reward already exists
          const existingRewardIndex = playerDataStore.playerData.seasonRewards.findIndex(
            reward => reward.season === season && reward.rank === `${baseRank} Tournament Winner`
          );
          
          if (existingRewardIndex === -1) {
            // Add season reward to player data only if it doesn't exist
            const seasonReward = {
              rank: `${baseRank} Tournament Winner`,
              season,
              unlocked: true
            };
            
            usePlayerData.setState(state => ({
              playerData: {
                ...state.playerData,
                seasonRewards: [...state.playerData.seasonRewards, seasonReward],
                unlockedTitles: [...state.playerData.unlockedTitles, titleId]
              }
            }));
          }
        });
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
      },

      playTournamentMatch: (matchId: string) => {
        const state = get();
        if (!state.currentTournament) return;
        
        const match = state.currentTournament.matches.find(m => m.id === matchId);
        if (!match || match.isComplete || !match.players.some(p => p.isPlayer)) return;
        
        // Convert tournament players to game opponents format
        const gameMode = state.currentTournament.type;
        let opponents: Array<{ name: string; mmr: number; isTeammate: boolean }> = [];
        
        if (gameMode === '1v1') {
          // 1v1: just the opponent - use exact name from bracket
          const opponent = match.players.find(p => !p.isPlayer)!;
          opponents = [{ name: opponent.name, mmr: opponent.mmr, isTeammate: false }];
        } else if (gameMode === '2v2') {
          // 2v2: player + AI teammate vs 2 AI opponents - use exact names from bracket
          const opponentTeam = match.players.filter(p => !p.isPlayer);
          opponents = [
            { name: 'Teammate AI', mmr: 2500, isTeammate: true },
            ...opponentTeam.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: false }))
          ];
        } else if (gameMode === '3v3') {
          // 3v3: player + 2 AI teammates vs 3 AI opponents - use exact names from bracket
          const opponentTeam = match.players.filter(p => !p.isPlayer);
          opponents = [
            { name: 'Teammate AI 1', mmr: 2500, isTeammate: true },
            { name: 'Teammate AI 2', mmr: 2500, isTeammate: true },
            ...opponentTeam.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: false }))
          ];
        }
        
        // Import the game state store
        import('../stores/useGameState').then(({ useGameState }) => {
          useGameState.getState().startTournamentMatch(matchId, match.bestOf, opponents);
        });
      },

      completeTournamentGame: (matchId: string, playerWon: boolean, playerScore: number, opponentScores: { [id: string]: number }) => {
        const state = get();
        if (!state.currentTournament) return;
        
        const match = state.currentTournament.matches.find(m => m.id === matchId);
        if (!match) return;
        
        const opponent = match.players.find(p => !p.isPlayer)!;
        const gameNumber = match.games.length + 1;
        
        // Use the first opponent score from the scores object
        const opponentScore = Object.values(opponentScores)[0] || 0;
        
        const gameResult = {
          gameNumber,
          winner: playerWon ? 'player' : opponent.id,
          scores: {
            'player': playerScore,
            [opponent.id]: opponentScore
          }
        };
        
        const updatedGames = [...match.games, gameResult];
        const gamesNeededToWin = Math.ceil(match.bestOf / 2);
        
        // Count wins for each player
        const playerWins = updatedGames.filter(g => g.winner === 'player').length;
        const opponentWins = updatedGames.filter(g => g.winner === opponent.id).length;
        
        // Check if match is complete
        const isMatchComplete = playerWins >= gamesNeededToWin || opponentWins >= gamesNeededToWin;
        const matchWinner = isMatchComplete ? (playerWins > opponentWins ? 'player' : opponent.id) : null;
        
        
        // Update the match
        const updatedMatches = state.currentTournament.matches.map(m => {
          if (m.id === matchId) {
            return {
              ...m,
              games: updatedGames,
              isComplete: isMatchComplete,
              winner: matchWinner
            };
          }
          return m;
        });
        
        set(state => ({
          currentTournament: state.currentTournament ? {
            ...state.currentTournament,
            matches: updatedMatches
          } : null
        }));
        
        if (isMatchComplete) {
          // Award tournament title if player won the entire tournament
          const currentRound = state.currentTournament?.currentRound;
          if (currentRound === 'final' && matchWinner === 'player' && state.currentTournament) {
            // Player won the tournament! Get their current rank to award proper title
            import('../stores/usePlayerData').then(({ usePlayerData }) => {
              const playerData = usePlayerData.getState().playerData;
              // Get highest MMR across all playlists to determine overall rank
              const highestMMR = Math.max(playerData.mmr['1v1'], playerData.mmr['2v2'], playerData.mmr['3v3']);
              
              import('../utils/rankingSystem').then(({ getRankInfo }) => {
                const rankInfo = getRankInfo(highestMMR);
                const baseRank = rankInfo.name.includes('Grand Champion') ? 'Grand Champion' : rankInfo.name.split(' ')[0];
                
                get().awardTournamentTitle(state.currentTournament!.type, baseRank);
              });
            });
          }
          
          // Check for round completion
          setTimeout(() => {
            get().checkRoundCompletion();
          }, 1000);
        }
      }
    }),
    {
      name: 'tournament-storage'
    }
  )
);

// Initialize tournament timing and reset queue state on refresh
setTimeout(() => {
  const state = useTournament.getState();
  
  // Reset queue state on page load/refresh to prevent stuck states
  if (state.isQueued && (!state.currentTournament || state.currentTournament.phase !== 'in-progress')) {
    state.leaveTournamentQueue();
  }
  
  state.calculateNextTournamentTime();
}, 100);

// Update tournament timing every minute
setInterval(() => {
  useTournament.getState().calculateNextTournamentTime();
}, 60000);

// Check for tournament starts every 5 seconds
setInterval(() => {
  useTournament.getState().checkAndStartTournament();
}, 5000);

// Handle page visibility changes and beforeunload to prevent stuck queue states
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    const state = useTournament.getState();
    // If in queue but not in an active tournament, leave queue when page becomes hidden
    if (state.isQueued && (!state.currentTournament || state.currentTournament.phase !== 'in-progress')) {
      state.leaveTournamentQueue();
    }
  }
});

// Clear queue on page unload (refresh/close)
window.addEventListener('beforeunload', () => {
  const state = useTournament.getState();
  if (state.isQueued && (!state.currentTournament || state.currentTournament.phase !== 'in-progress')) {
    state.leaveTournamentQueue();
  }
});