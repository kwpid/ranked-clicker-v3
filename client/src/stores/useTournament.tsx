import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TournamentType = '1v1' | '2v2' | '3v3' | 'synergy-cup';
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
  nextSynergyCupTime: number;
  synergyCupNotificationShown: boolean;
  synergyCupPlacements: Array<{ season: number; placement: number; date: string }>;
  currentTournament: {
    id: string;
    type: TournamentType;
    phase: TournamentPhase;
    players: TournamentPlayer[];
    matches: TournamentMatch[];
    currentRound: BracketRound;
    startTime: number;
    isDoubleElimination?: boolean;
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
  calculateNextSynergyCupTime: () => void;
  checkAndStartTournament: () => void;
  checkAndStartSynergyCup: () => void;
  joinTournamentQueue: (type: TournamentType) => void;
  leaveTournamentQueue: () => void;
  startTournamentForTesting: (type: TournamentType) => void;
  forceSynergyCup: () => void;
  generateTournamentBracket: (players: TournamentPlayer[], type: TournamentType) => void;
  simulateAIMatches: () => void;
  checkRoundCompletion: () => void;
  completeMatch: (matchId: string, winner: string, gameResults: any[]) => void;
  awardTournamentTitle: (tournamentType: TournamentType, playerRank: string) => void;
  awardSynergyCupTitle: (placement: number) => void;
  updateTournamentPhase: (phase: TournamentPhase) => void;
  isGameModeBlocked: () => boolean;
  playTournamentMatch: (matchId: string) => void;
  completeTournamentGame: (matchId: string, playerWon: boolean, playerScore: number, opponentScores: { [id: string]: number }) => void;
  isEligibleForSynergyCup: () => boolean;
  showSynergyCupNotification: () => void;
}

export const useTournament = create<TournamentState>()(
  persist(
    (set, get) => ({
      nextTournamentTime: 0,
      nextSynergyCupTime: 0,
      synergyCupNotificationShown: false,
      synergyCupPlacements: [],
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

      calculateNextSynergyCupTime: () => {
        const now = new Date();
        const nextSaturday = new Date(now);
        
        // Find next Saturday
        const daysUntilSaturday = (6 - now.getDay()) % 7;
        if (daysUntilSaturday === 0 && (now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() > 0))) {
          // If it's Saturday after 7pm, go to next Saturday
          nextSaturday.setDate(now.getDate() + 7);
        } else {
          nextSaturday.setDate(now.getDate() + daysUntilSaturday);
        }
        
        // Set to 7pm (19:00)
        nextSaturday.setHours(19, 0, 0, 0);
        
        set({ nextSynergyCupTime: nextSaturday.getTime() });
        
        // Check if synergy cup should start
        get().checkAndStartSynergyCup();
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

      checkAndStartSynergyCup: () => {
        const state = get();
        const now = Date.now();
        
        // Check if it's Saturday 7pm and player is eligible
        if (now >= state.nextSynergyCupTime && state.isEligibleForSynergyCup() && state.queuedTournamentType === 'synergy-cup') {
          // Show notification if not shown yet
          if (!state.synergyCupNotificationShown) {
            state.showSynergyCupNotification();
          }
          
          // Start Synergy Cup
          state.startTournamentForTesting('synergy-cup');
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

      forceSynergyCup: () => {
        // Console command to force start Synergy Cup for testing
        get().startTournamentForTesting('synergy-cup');
        import('../stores/useGameState').then(({ useGameState }) => {
          useGameState.getState().setCurrentScreen('tournament-bracket');
        });
      },

      isEligibleForSynergyCup: () => {
        // Check if player is Grand Champion or higher in any mode (synchronous)
        try {
          const playerData = (globalThis as any).__playerData__;
          if (!playerData) return false;
          const highestMMR = Math.max(playerData.mmr['1v1'], playerData.mmr['2v2'], playerData.mmr['3v3']);
          return highestMMR >= 2550; // Grand Champion threshold
        } catch {
          return false;
        }
      },

      showSynergyCupNotification: () => {
        // Show notification that Synergy Cup is starting
        set({ synergyCupNotificationShown: true });
        
        // Could integrate with a toast notification system here
        console.log('🏆 SYNERGY CUP STARTING! 🏆 - The elite 2v2 tournament for Grand Champions begins now!');
      },

      awardSynergyCupTitle: (placement: number) => {
        const state = get();
        const season = state.currentSeason;
        
        // Record placement for ELITE title tracking
        const newPlacement = {
          season,
          placement,
          date: new Date().toISOString()
        };
        
        const updatedPlacements = [...state.synergyCupPlacements, newPlacement];
        
        // Determine title based on placement
        let titleName = '';
        if (placement === 1) {
          titleName = `SYNERGY CUP S${season} CHAMPION`;
        } else if (placement <= 3) {
          titleName = `SYNERGY CUP S${season} FINALIST`;
        }
        
        // Check for ELITE title eligibility (top 10 in 3+ seasons)
        const top10Seasons = updatedPlacements.filter(p => p.placement <= 10);
        const uniqueSeasons = Array.from(new Set(top10Seasons.map(p => p.season)));
        
        let eliteTitle: TournamentTitle | null = null;
        if (uniqueSeasons.length >= 3 && placement <= 10) {
          eliteTitle = {
            id: `synergy-cup-elite`,
            name: 'SYNERGY CUP ELITE',
            season: 0, // Special season value for persistent titles
            rank: 'Elite',
            wins: uniqueSeasons.length,
            color: 'golden' as const,
            dateAwarded: new Date().toISOString()
          };
        }
        
        const newTitles: TournamentTitle[] = [];
        
        // Add placement title if applicable
        if (titleName) {
          const placementTitle = {
            id: `synergy-cup-s${season}-p${placement}`,
            name: titleName,
            season,
            rank: 'Synergy Cup',
            wins: 1,
            color: 'golden' as const,
            dateAwarded: new Date().toISOString()
          };
          newTitles.push(placementTitle);
        }
        
        // Add elite title if earned
        if (eliteTitle && !state.tournamentTitles.some(t => t.id === 'synergy-cup-elite')) {
          newTitles.push(eliteTitle);
        }
        
        // Update state
        set(state => ({
          synergyCupPlacements: updatedPlacements,
          tournamentTitles: [...state.tournamentTitles, ...newTitles]
        }));
        
        // Add titles to player data
        import('../stores/usePlayerData').then(({ usePlayerData }) => {
          const playerDataStore = usePlayerData.getState();
          
          newTitles.forEach(title => {
            const existingRewardIndex = playerDataStore.playerData.seasonRewards.findIndex(
              reward => reward.rank === title.name && reward.season === title.season
            );
            
            if (existingRewardIndex === -1) {
              const seasonReward = {
                rank: title.name,
                season: title.season,
                unlocked: true
              };
              
              usePlayerData.setState(state => ({
                playerData: {
                  ...state.playerData,
                  seasonRewards: [...state.playerData.seasonRewards, seasonReward],
                  unlockedTitles: [...state.playerData.unlockedTitles, title.id]
                }
              }));
            }
          });
        });
      },

      startTournamentForTesting: async (type: TournamentType) => {
        const tournamentId = `test-${Date.now()}`;
        
        // Generate AI opponents based on tournament type
        let playerCount = type === '1v1' ? 8 : type === '2v2' ? 8 : type === '3v3' ? 12 : 48; // 48 teams for Synergy Cup
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
        
        // Extended AI names for Synergy Cup (48 teams)
        const aiNames = [
          "L", "kupid", "l0st", "jayleng", "weweewew", "RisingPhoinex87", "dr.1", "prot", "hunt", "kif", "?", "rivverott", "1x Dark", "Moxxy!", "ä", "شغثغخ", "dark!", "Vortex", "FlickMaster17", "r", "Skywave!", "R3tr0", "TurboClash893", "Zynk", "Null_Force", "Orbital", "Boosted", "GravyTrain", "NitroNinja", "PixelPlay", "PhantomX", "Fury", "Zero!", "Moonlight", "QuickTap", "v1per", "Slugger", "MetaDrift", "Hydra", "Neo!", "ShadowDart", "SlipStream", "F1ick", "Karma", "Sparkz", "Glitch", "Dash7", "Ignite", "Cyclone", "Nova", "Opt1c", "Viral", "Stormz", "PyroBlast", "Bl1tz", "Echo", "Hover", "PulseRider", "Phantom", "Rage", "Storm", "Elite", "Apex", "Titan", "Shadow", "Lightning", "Thunder", "Blaze", "Frost", "Magma", "Void", "Cosmic", "Nebula", "Galaxy", "Solar", "Lunar", "Eclipse", "Aurora", "Comet", "Meteor", "Quasar", "Pulsar", "Supernova", "Starfire", "Nightfall", "Dawn", "Twilight", "Horizon", "Zenith", "Velocity", "Momentum", "Energy", "Force", "Power", "Strength", "Dominance", "Victory", "Triumph", "Glory", "Honor", "Legend", "Myth", "Hero", "Champion", "Master", "Expert"
        ];
        
        // Set minimum MMR for tournament participants
        const minMMR = type === 'synergy-cup' ? 2550 : 1000; // Grand Champion+ for Synergy Cup
        const maxMMR = type === 'synergy-cup' ? 3500 : 3100;
        
        for (let i = 0; i < playerCount - 1; i++) {
          players.push({
            id: `ai-${i}`,
            name: aiNames[i] || `Player${i + 1}`,
            rank: type === 'synergy-cup' ? 'Grand Champion' : 'Grand Champion',
            mmr: minMMR + Math.floor(Math.random() * (maxMMR - minMMR)),
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
          startTime: Date.now(),
          isDoubleElimination: type === 'synergy-cup'
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
        
        // Determine players per match based on tournament type
        const playersPerMatch = type === '1v1' ? 2 : type === '2v2' ? 4 : 6; // 1v1=2, 2v2=4, 3v3=6
        
        // Round 1: Create matches with appropriate number of players
        for (let i = 0; i < shuffledPlayers.length; i += playersPerMatch) {
          if (i + playersPerMatch - 1 < shuffledPlayers.length) {
            const matchPlayers = shuffledPlayers.slice(i, i + playersPerMatch);
            matches.push({
              id: `round1-${i / playersPerMatch}`,
              round: 'round1',
              players: matchPlayers,
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
            // AI vs AI match - simulate result based on tournament type
            const gameMode = state.currentTournament!.type;
            let winningTeam: TournamentPlayer[];
            let scores: { [playerId: string]: number } = {};
            
            if (gameMode === '1v1') {
              // Original 1v1 logic
              const winner = Math.random() < 0.5 ? match.players[0] : match.players[1];
              winningTeam = [winner];
              scores = {
                [match.players[0].id]: Math.floor(Math.random() * 50) + 30,
                [match.players[1].id]: Math.floor(Math.random() * 50) + 30
              };
            } else {
              // Team-based tournaments (2v2 or 3v3)
              const teamSize = gameMode === '2v2' ? 2 : 3;
              const team1 = match.players.slice(0, teamSize);
              const team2 = match.players.slice(teamSize);
              
              // Determine winning team
              winningTeam = Math.random() < 0.5 ? team1 : team2;
              
              // Generate team scores (sum of individual scores)
              match.players.forEach(player => {
                scores[player.id] = Math.floor(Math.random() * 50) + 30;
              });
            }
            
            const gameResult = {
              gameNumber: 1,
              winner: winningTeam[0].id, // Use first player of winning team as representative
              scores
            };
            
            return {
              ...match,
              isComplete: true,
              winner: winningTeam[0].id,
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
        
        // Advance to next round - handle team tournaments correctly
        const winners: TournamentPlayer[] = [];
        const gameMode = state.currentTournament.type;
        
        currentRoundMatches.forEach(match => {
          if (gameMode === '1v1') {
            // 1v1: advance individual winner
            const winnerId = match.winner;
            const winner = match.players.find(p => p.id === winnerId)!;
            winners.push(winner);
          } else {
            // Team tournaments: advance entire winning team
            const teamSize = gameMode === '2v2' ? 2 : 3;
            const winnerId = match.winner;
            const winnerPlayer = match.players.find(p => p.id === winnerId)!;
            const winnerIndex = match.players.indexOf(winnerPlayer);
            const teamStartIndex = Math.floor(winnerIndex / teamSize) * teamSize;
            const winningTeam = match.players.slice(teamStartIndex, teamStartIndex + teamSize);
            winners.push(...winningTeam);
          }
        });
        
        // Check if tournament is finished based on game mode - handle all tournament types including Synergy Cup
        const teamSize = gameMode === '1v1' ? 1 : gameMode === '2v2' || gameMode === 'synergy-cup' ? 2 : 3;
        const teamsRemaining = winners.length / teamSize;
        const isFinished = teamsRemaining === 1;
        
        if (isFinished) {
          // Tournament finished - check if player's team won
          const playerWon = winners.some(w => w.isPlayer);
          if (playerWon) {
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
        
        // Create next round - improved logic for large tournaments like Synergy Cup
        let nextRound: BracketRound;
        const currentRound = state.currentTournament.currentRound;
        
        if (teamsRemaining === 1) {
          // Tournament should be finished - this is handled above
          return;
        } else if (teamsRemaining === 2) {
          nextRound = 'final';
        } else if (teamsRemaining === 4) {
          nextRound = 'semifinal';
        } else if (teamsRemaining === 6) {
          // Special case: 6 teams need to go to 4, then semifinal
          nextRound = 'round3';
        } else if (teamsRemaining <= 8) {
          nextRound = 'round3';
        } else if (teamsRemaining <= 16) {
          nextRound = 'round2';
        } else {
          // For very large tournaments, continue with sequential rounds
          if (currentRound === 'round1') {
            nextRound = 'round2';
          } else if (currentRound === 'round2') {
            nextRound = 'round3';
          } else if (currentRound === 'round3') {
            nextRound = 'semifinal';
          } else {
            nextRound = 'final';
          }
        }
        
        if (!nextRound) return;
        
        const nextMatches: TournamentMatch[] = [];
        const playersPerMatch = gameMode === '1v1' ? 2 : gameMode === '2v2' ? 4 : 6;
        
        for (let i = 0; i < winners.length; i += playersPerMatch) {
          if (i + playersPerMatch - 1 < winners.length) {
            const matchPlayers = winners.slice(i, i + playersPerMatch);
            const bestOf = 1; // Simplified: All tournament matches are best of 1
            nextMatches.push({
              id: `${nextRound}-${i / playersPerMatch}`,
              round: nextRound,
              players: matchPlayers,
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
        const tournamentType = state.currentTournament.type;
        let opponents: Array<{ name: string; mmr: number; isTeammate: boolean }> = [];
        
        if (tournamentType === '1v1') {
          // 1v1: just the opponent - use exact name from bracket
          const opponent = match.players.find(p => !p.isPlayer)!;
          opponents = [{ name: opponent.name, mmr: opponent.mmr, isTeammate: false }];
        } else if (tournamentType === '2v2' || tournamentType === 'synergy-cup') {
          // 2v2: For team games, we need to properly organize teams
          // Match should have 4 players: player + 1 teammate vs 2 opponents
          const playerIndex = match.players.findIndex(p => p.isPlayer);
          const teamSize = 2;
          const isPlayerInTeam1 = playerIndex < teamSize;
          
          if (isPlayerInTeam1) {
            // Player is in team 1 (first 2 players)
            const teammate = match.players[1]; // Teammate (2nd player in first team)
            const enemyTeam = match.players.slice(2, 4); // Enemy team (players 3-4)
            opponents = [
              { name: teammate.name, mmr: teammate.mmr, isTeammate: true },
              ...enemyTeam.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: false }))
            ];
          } else {
            // Player is in team 2 (last 2 players)
            const teammate = match.players[3]; // Teammate (2nd player in second team)
            const enemyTeam = match.players.slice(0, 2); // Enemy team (players 1-2)
            opponents = [
              { name: teammate.name, mmr: teammate.mmr, isTeammate: true },
              ...enemyTeam.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: false }))
            ];
          }
        } else if (tournamentType === '3v3') {
          // 3v3: For team games, we need to properly organize teams
          // Match should have 6 players: player + 2 teammates vs 3 opponents
          const playerIndex = match.players.findIndex(p => p.isPlayer);
          const teamSize = 3;
          const isPlayerInTeam1 = playerIndex < teamSize;
          
          if (isPlayerInTeam1) {
            // Player is in team 1 (first 3 players)
            const teammates = match.players.slice(0, 3).filter(p => !p.isPlayer);
            const enemyTeam = match.players.slice(3, 6); // Enemy team (players 4-6)
            opponents = [
              ...teammates.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: true })),
              ...enemyTeam.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: false }))
            ];
          } else {
            // Player is in team 2 (last 3 players)
            const teammates = match.players.slice(3, 6).filter(p => !p.isPlayer);
            const enemyTeam = match.players.slice(0, 3); // Enemy team (players 1-3)
            opponents = [
              ...teammates.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: true })),
              ...enemyTeam.map(p => ({ name: p.name, mmr: p.mmr, isTeammate: false }))
            ];
          }
        }
        
        // Debug log for Synergy Cup
        console.log('🏆 Tournament match setup:', { tournamentType, matchId, opponentsCount: opponents.length, opponents });
        
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

// Update Synergy Cup timing every hour
setInterval(() => {
  useTournament.getState().calculateNextSynergyCupTime();
}, 60 * 60 * 1000);

// Check for tournament starts every 5 seconds
setInterval(() => {
  useTournament.getState().checkAndStartTournament();
}, 5000);

// Check for Synergy Cup starts every 30 seconds
setInterval(() => {
  useTournament.getState().checkAndStartSynergyCup();
}, 30000);

// Initialize Synergy Cup timing
useTournament.getState().calculateNextSynergyCupTime();

// Add console command for testing Synergy Cup
if (typeof window !== 'undefined') {
  (window as any).forceSynergyCup = () => {
    console.log('🏆 Starting Synergy Cup for testing...');
    useTournament.getState().forceSynergyCup();
  };
}

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