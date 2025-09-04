import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getRankInfo } from '../utils/rankingSystem';
import { useTournament } from './useTournament';

// RCCS Tournament System - Ranked Clicker Championship Series
// Format: 3v3 RLCS-style tournament with Qualifiers → Regionals → Majors → Worlds

interface RCCSTeam {
  id: string;
  playerName: string;
  playerMMR: number;
  teammate1: { name: string; mmr: number };
  teammate2: { name: string; mmr: number };
  averageMMR: number;
  eliminated: boolean;
  placement?: number;
}

interface RCCSTournament {
  id: string;
  season: number;
  stage: 'qualifiers' | 'regionals' | 'majors' | 'worlds';
  stageNumber?: number; // For multiple regionals/majors
  teams: RCCSTeam[];
  matches: RCCSMatch[];
  status: 'upcoming' | 'registration' | 'active' | 'completed';
  startDate: Date;
  endDate?: Date;
  maxTeams: number;
  rewards: RCCSTournamentReward[];
}

interface RCCSMatch {
  id: string;
  team1: RCCSTeam;
  team2: RCCSTeam;
  winner?: RCCSTeam;
  round: string;
  bestOf: number;
  team1Score: number;
  team2Score: number;
  status: 'pending' | 'in-progress' | 'completed';
}

interface RCCSTournamentReward {
  placement: number;
  title: string;
  color: string;
  hasGlow: boolean;
  minPlacement: number;
  maxPlacement: number;
}

interface RCCSNotification {
  id: string;
  type: 'tournament-signup';
  season: number;
  message: string;
  persistent: boolean;
  dismissed: boolean;
  actions: { label: string; action: 'signup' | 'decline' }[];
}

interface RCCSTournamentStore {
  // Tournament state
  currentTournament: RCCSTournament | null;
  playerRegistered: boolean;
  playerTeam: RCCSTeam | null;
  tournamentHistory: RCCSTournament[];
  notifications: RCCSNotification[];
  
  // Season management
  currentSeason: number;
  seasonEndDate: Date | null;
  
  // Actions
  initializeTournamentSystem: () => void;
  startNewSeason: () => void;
  checkTournamentEligibility: (playerMMR: number) => boolean;
  registerPlayerForTournament: (playerName: string, playerMMR: number) => void;
  declineTournamentSignup: () => void;
  generateAITeams: (count: number, averageMMR: number) => RCCSTeam[];
  simulateMatch: (team1: RCCSTeam, team2: RCCSTeam) => RCCSMatch;
  advanceTournament: () => void;
  calculateRewards: (tournament: RCCSTournament) => void;
  awardRCCSTitle: (titleName: string, placement: number, stage: string, titleColor?: string) => void;
  getCascadingTitles: (stage: string, earnedReward: RCCSTournamentReward) => RCCSTournamentReward[];
  dismissNotification: (notificationId: string) => void;
  
  // Debug/Testing
  forceStartTournament: (stage: 'qualifiers' | 'regionals' | 'majors' | 'worlds') => void;
}

// Tournament reward definitions
const RCCS_REWARDS: Record<string, RCCSTournamentReward[]> = {
  qualifiers: [
    { placement: 60, title: 'RCCS S{season} CHALLENGER', color: '#00FFFF', hasGlow: true, minPlacement: 33, maxPlacement: 60 },
    { placement: 32, title: 'RCCS S{season} CONTENDER', color: '#00FFFF', hasGlow: true, minPlacement: 1, maxPlacement: 32 },
  ],
  regionals: [
    { placement: 16, title: 'RCCS S{season} REGIONAL FINALIST', color: '#00FFFF', hasGlow: true, minPlacement: 9, maxPlacement: 16 },
    { placement: 8, title: 'RCCS S{season} REGIONAL ELITE', color: '#00FFFF', hasGlow: true, minPlacement: 3, maxPlacement: 8 },
    { placement: 1, title: 'RCCS S{season} REGIONAL CHAMPION', color: '#00FFFF', hasGlow: true, minPlacement: 1, maxPlacement: 1 },
  ],
  majors: [
    { placement: 12, title: 'RCCS S{season} MAJOR CONTENDER', color: '#00FFFF', hasGlow: true, minPlacement: 7, maxPlacement: 12 },
    { placement: 6, title: 'RCCS S{season} WORLD CHALLENGER', color: '#00FFFF', hasGlow: true, minPlacement: 2, maxPlacement: 6 },
    { placement: 1, title: 'RCCS S{season} MAJOR CHAMPION', color: '#00FFFF', hasGlow: true, minPlacement: 1, maxPlacement: 1 },
  ],
  worlds: [
    { placement: 4, title: 'RCCS S{season} WORLDS FINALIST', color: '#00FFFF', hasGlow: true, minPlacement: 2, maxPlacement: 4 },
    { placement: 1, title: 'RCCS S{season} WORLD CHAMPION', color: '#00FFFF', hasGlow: true, minPlacement: 1, maxPlacement: 1 },
  ],
};

// Generate AI teammate names
const generateAITeammateName = (mmr: number): string => {
  const prefixes = ['Pro', 'Elite', 'Master', 'Ace', 'Turbo', 'Speed', 'Click', 'Storm', 'Blitz', 'Flash'];
  const suffixes = ['Clicker', 'Master', 'Pro', 'Legend', 'Storm', 'Strike', 'Rush', 'Force', 'Ace', 'King'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${prefix}${suffix}${number}`;
};

// Calculate team success probability based on MMR
const calculateTeamWinProbability = (team1MMR: number, team2MMR: number): number => {
  const mmrDiff = team1MMR - team2MMR;
  // Sigmoid function for win probability
  return 1 / (1 + Math.exp(-mmrDiff / 200));
};

export const useRCCSTournament = create<RCCSTournamentStore>()(
  persist(
    (set, get) => ({
      currentTournament: null,
      playerRegistered: false,
      playerTeam: null,
      tournamentHistory: [],
      notifications: [],
      currentSeason: 1,
      seasonEndDate: null,

      initializeTournamentSystem: () => {
        const now = new Date();
        // Season lasts 4 weeks, tournament starts 1 week before end
        const seasonEnd = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000); // 4 weeks from now
        const tournamentStart = new Date(seasonEnd.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before season end
        
        set({ 
          seasonEndDate: seasonEnd,
        });
        
        // Check if we should show tournament notification
        const daysUntilTournament = Math.ceil((tournamentStart.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysUntilTournament <= 7 && daysUntilTournament >= 0) {
          const { notifications } = get();
          const existingNotification = notifications.find(n => n.type === 'tournament-signup' && n.season === get().currentSeason);
          
          if (!existingNotification) {
            const newNotification: RCCSNotification = {
              id: `tournament-signup-s${get().currentSeason}`,
              type: 'tournament-signup',
              season: get().currentSeason,
              message: `RCCS Season ${get().currentSeason} Tournament begins in ${daysUntilTournament} days! Sign up now (Champion III+ only)`,
              persistent: true,
              dismissed: false,
              actions: [
                { label: 'Sign Up', action: 'signup' },
                { label: 'Decline', action: 'decline' }
              ]
            };
            
            set({ notifications: [...notifications, newNotification] });
          }
        }
      },

      checkTournamentEligibility: (playerMMR: number) => {
        // Champion III threshold = 2350 MMR
        return playerMMR >= 2350;
      },

      registerPlayerForTournament: (playerName: string, playerMMR: number) => {
        if (!get().checkTournamentEligibility(playerMMR)) {
          console.log('Player not eligible for RCCS tournament (need Champion III+)');
          return;
        }

        // Generate AI teammates with MMR similar to player (more reasonable range)
        const teammate1MMR = Math.max(2200, playerMMR + (Math.random() - 0.5) * 300);
        const teammate2MMR = Math.max(2200, playerMMR + (Math.random() - 0.5) * 300);

        const playerTeam: RCCSTeam = {
          id: `team-${playerName}`,
          playerName,
          playerMMR,
          teammate1: { name: generateAITeammateName(teammate1MMR), mmr: teammate1MMR },
          teammate2: { name: generateAITeammateName(teammate2MMR), mmr: teammate2MMR },
          averageMMR: Math.floor((playerMMR + teammate1MMR + teammate2MMR) / 3),
          eliminated: false,
        };

        // Start qualifiers tournament
        const qualifiersTournament: RCCSTournament = {
          id: `rccs-s${get().currentSeason}-qualifiers`,
          season: get().currentSeason,
          stage: 'qualifiers',
          teams: [playerTeam],
          matches: [],
          status: 'registration',
          startDate: new Date(),
          maxTeams: 160, // 128 AI + player + others
          rewards: RCCS_REWARDS.qualifiers.map(r => ({
            ...r,
            title: r.title.replace('{season}', get().currentSeason.toString())
          })),
        };

        // Generate 127 AI teams for qualifiers
        const aiTeams = get().generateAITeams(127, playerTeam.averageMMR);
        qualifiersTournament.teams.push(...aiTeams);

        set({
          currentTournament: qualifiersTournament,
          playerRegistered: true,
          playerTeam,
        });

        // Dismiss signup notification
        get().dismissNotification(`tournament-signup-s${get().currentSeason}`);
      },

      declineTournamentSignup: () => {
        get().dismissNotification(`tournament-signup-s${get().currentSeason}`);
      },

      generateAITeams: (count: number, playerAvgMMR: number) => {
        const aiTeams: RCCSTeam[] = [];
        
        // Create a realistic MMR distribution for tournament teams
        // Top tier: 3700-3800 (5% of teams, typically make worlds)
        // High tier: 3400-3699 (15% of teams)
        // Mid-high tier: 3100-3399 (25% of teams)
        // Mid tier: 2900-3099 (30% of teams)
        // Lower tier: 2700-2899 (25% of teams)
        
        for (let i = 0; i < count; i++) {
          let targetAvgMMR: number;
          const rand = Math.random();
          
          if (rand < 0.05) {
            // Top 5% - Elite teams (3700-3800)
            targetAvgMMR = 3700 + Math.random() * 100;
          } else if (rand < 0.20) {
            // Next 15% - High tier (3400-3699)
            targetAvgMMR = 3400 + Math.random() * 299;
          } else if (rand < 0.45) {
            // Next 25% - Mid-high tier (3100-3399)
            targetAvgMMR = 3100 + Math.random() * 299;
          } else if (rand < 0.75) {
            // Next 30% - Mid tier (2900-3099)
            targetAvgMMR = 2900 + Math.random() * 199;
          } else {
            // Bottom 25% - Lower tier (2700-2899)
            targetAvgMMR = 2700 + Math.random() * 199;
          }
          
          // Generate individual player MMRs around the target average
          const variation = 150; // Reduced variation for more realistic teams
          const player1MMR = Math.max(2400, targetAvgMMR + (Math.random() - 0.5) * variation);
          const player2MMR = Math.max(2400, targetAvgMMR + (Math.random() - 0.5) * variation);
          const player3MMR = Math.max(2400, targetAvgMMR + (Math.random() - 0.5) * variation);
          
          const team: RCCSTeam = {
            id: `ai-team-${i + 1}`,
            playerName: generateAITeammateName(player1MMR),
            playerMMR: player1MMR,
            teammate1: { name: generateAITeammateName(player2MMR), mmr: player2MMR },
            teammate2: { name: generateAITeammateName(player3MMR), mmr: player3MMR },
            averageMMR: Math.floor((player1MMR + player2MMR + player3MMR) / 3),
            eliminated: false,
          };
          
          aiTeams.push(team);
        }
        
        // Sort teams by average MMR (higher MMR teams are "stronger")
        return aiTeams.sort((a, b) => b.averageMMR - a.averageMMR);
      },

      simulateMatch: (team1: RCCSTeam, team2: RCCSTeam) => {
        const winProbability = calculateTeamWinProbability(team1.averageMMR, team2.averageMMR);
        
        // Best of 5 match simulation
        let team1Score = 0;
        let team2Score = 0;
        
        while (team1Score < 3 && team2Score < 3) {
          if (Math.random() < winProbability) {
            team1Score++;
          } else {
            team2Score++;
          }
        }
        
        const winner = team1Score > team2Score ? team1 : team2;
        
        const match: RCCSMatch = {
          id: `match-${team1.id}-${team2.id}`,
          team1,
          team2,
          winner,
          round: 'simulated',
          bestOf: 5,
          team1Score,
          team2Score,
          status: 'completed',
        };
        
        return match;
      },

      advanceTournament: () => {
        const { currentTournament } = get();
        if (!currentTournament || currentTournament.status === 'completed') return;

        const tournament = { ...currentTournament };
        
        // If tournament is in registration, move it to active for simulation
        if (tournament.status === 'registration') {
          tournament.status = 'active';
          console.log(`🏆 Starting ${tournament.stage} simulation with ${tournament.teams.length} teams`);
        }
        
        if (tournament.stage === 'qualifiers') {
          // Simulate qualifiers - top 32 teams advance
          const sortedTeams = [...tournament.teams].sort((a, b) => {
            // Higher MMR teams have better chances, but with more randomness for upsets
            const mmrDiff = b.averageMMR - a.averageMMR;
            const randomFactor = (Math.random() - 0.5) * 400; // Increased randomness for upsets
            const skillBonus = mmrDiff * 0.7; // Reduced skill advantage
            return skillBonus + randomFactor;
          });
          
          // Set placements
          sortedTeams.forEach((team, index) => {
            team.placement = index + 1;
            team.eliminated = index >= 32;
          });
          
          // Update the tournament state with results first
          const updatedTournament = { ...tournament, teams: sortedTeams, status: 'completed' as const };
          set({ currentTournament: updatedTournament });
          
          // Award qualifiers rewards
          get().calculateRewards(updatedTournament);
          
          // Log results
          console.log(`🎯 Qualifiers Results: Player placed #${sortedTeams.find(t => t.id === get().playerTeam?.id)?.placement || 'Unknown'}`);
          console.log(`✅ Top 32 teams advance to Regionals`);
          
          // Advance to regionals if player qualified
          const playerTeam = sortedTeams.find(t => t.id === get().playerTeam?.id);
          if (playerTeam && !playerTeam.eliminated) {
            // Create first regional tournament
            const regionalTournament: RCCSTournament = {
              id: `rccs-s${tournament.season}-regionals-1`,
              season: tournament.season,
              stage: 'regionals',
              stageNumber: 1,
              teams: sortedTeams.slice(0, 32), // Top 32 teams
              matches: [],
              status: 'active',
              startDate: new Date(),
              maxTeams: 32,
              rewards: RCCS_REWARDS.regionals.map(r => ({
                ...r,
                title: r.title.replace('{season}', tournament.season.toString())
              })),
            };
            
            // Wait a moment to show results, then advance
            setTimeout(() => {
              set({ currentTournament: regionalTournament });
              console.log(`🚀 Advanced to Regionals with ${regionalTournament.teams.length} teams`);
            }, 2000);
          } else {
            // Player eliminated, tournament over for them
            console.log(`❌ Player eliminated at position #${playerTeam?.placement}. Tournament over.`);
            setTimeout(() => {
              set({ 
                currentTournament: updatedTournament, // Keep showing final results
                playerRegistered: false,
              });
            }, 3000);
          }
        } else if (tournament.stage === 'regionals') {
          // Simulate regional tournament - top 6 advance to majors
          const sortedTeams = [...tournament.teams].sort((a, b) => {
            const mmrDiff = b.averageMMR - a.averageMMR;
            const randomFactor = (Math.random() - 0.5) * 350;
            const skillBonus = mmrDiff * 0.8;
            return skillBonus + randomFactor;
          });
          
          sortedTeams.forEach((team, index) => {
            team.placement = index + 1;
            team.eliminated = index >= 6;
          });
          
          get().calculateRewards(tournament);
          
          // Check if player advances to majors
          const playerTeam = sortedTeams.find(t => t.id === get().playerTeam?.id);
          if (playerTeam && !playerTeam.eliminated) {
            // Create major tournament (simplified - combining both majors)
            const majorTournament: RCCSTournament = {
              id: `rccs-s${tournament.season}-majors`,
              season: tournament.season,
              stage: 'majors',
              teams: sortedTeams.slice(0, 12), // Top 6 from each of 2 regionals
              matches: [],
              status: 'active',
              startDate: new Date(),
              maxTeams: 12,
              rewards: RCCS_REWARDS.majors.map(r => ({
                ...r,
                title: r.title.replace('{season}', tournament.season.toString())
              })),
            };
            
            set({ currentTournament: majorTournament });
          } else {
            set({ 
              currentTournament: null,
              playerRegistered: false,
            });
          }
        } else if (tournament.stage === 'majors') {
          // Simulate major tournament - top 6 advance to worlds
          const sortedTeams = [...tournament.teams].sort((a, b) => {
            const mmrDiff = b.averageMMR - a.averageMMR;
            const randomFactor = (Math.random() - 0.5) * 300;
            const skillBonus = mmrDiff * 0.9; // Slightly higher skill factor for majors
            return skillBonus + randomFactor;
          });
          
          sortedTeams.forEach((team, index) => {
            team.placement = index + 1;
            team.eliminated = index >= 6;
          });
          
          get().calculateRewards(tournament);
          
          const playerTeam = sortedTeams.find(t => t.id === get().playerTeam?.id);
          if (playerTeam && !playerTeam.eliminated) {
            // Create worlds tournament
            const worldsTournament: RCCSTournament = {
              id: `rccs-s${tournament.season}-worlds`,
              season: tournament.season,
              stage: 'worlds',
              teams: sortedTeams.slice(0, 12), // Top 6 from each major
              matches: [],
              status: 'active',
              startDate: new Date(),
              maxTeams: 12,
              rewards: RCCS_REWARDS.worlds.map(r => ({
                ...r,
                title: r.title.replace('{season}', tournament.season.toString())
              })),
            };
            
            set({ currentTournament: worldsTournament });
          } else {
            set({ 
              currentTournament: null,
              playerRegistered: false,
            });
          }
        } else if (tournament.stage === 'worlds') {
          // Final tournament simulation
          const sortedTeams = [...tournament.teams].sort((a, b) => {
            const mmrDiff = b.averageMMR - a.averageMMR;
            const randomFactor = (Math.random() - 0.5) * 250; // Less randomness at worlds
            const skillBonus = mmrDiff * 1.0; // Full skill factor for worlds
            return skillBonus + randomFactor;
          });
          
          sortedTeams.forEach((team, index) => {
            team.placement = index + 1;
          });
          
          get().calculateRewards(tournament);
          
          // Tournament complete
          set({ 
            currentTournament: { ...tournament, status: 'completed', endDate: new Date() },
            playerRegistered: false,
            tournamentHistory: [...get().tournamentHistory, tournament],
          });
        }
      },

      calculateRewards: (tournament: RCCSTournament) => {
        // Award titles to players based on their placement
        tournament.teams.forEach(team => {
          if (team.placement && team.id === get().playerTeam?.id) {
            // This is the player's team, award them the title(s)
            const earnedTitles: RCCSTournamentReward[] = [];
            
            // Determine the highest tier title earned
            let highestTierReward: RCCSTournamentReward | null = null;
            for (const reward of tournament.rewards) {
              if (team.placement >= reward.minPlacement && team.placement <= reward.maxPlacement) {
                highestTierReward = reward;
                break;
              }
            }
            
            if (highestTierReward) {
              // Award the earned title
              earnedTitles.push(highestTierReward);
              
              // Award cascading titles based on tournament stage
              const cascadingTitles = get().getCascadingTitles(tournament.stage, highestTierReward);
              earnedTitles.push(...cascadingTitles);
              
              // Award all earned titles
              earnedTitles.forEach(titleReward => {
                get().awardRCCSTitle(titleReward.title, team.placement!, tournament.stage, titleReward.color);
                console.log(`🏆 Player earned RCCS title: ${titleReward.title} (Placement: ${team.placement})`);
              });
            }
          }
        });
      },

      awardRCCSTitle: (titleName: string, placement: number, stage: string, titleColor?: string) => {
        // Get the tournament store to award the title
        const tournamentStore = useTournament.getState();
        
        // Create a unique title ID for RCCS titles
        const normalizedTitleName = titleName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const titleId = `rccs-s${get().currentSeason}-${normalizedTitleName}`;
        
        // Check if title already exists
        const existingTitle = tournamentStore.tournamentTitles.find(t => t.id === titleId);
        if (existingTitle) {
          console.log(`RCCS title already exists: ${titleName}`);
          return;
        }

        // Create the RCCS title with aqua color and glow
        const rccsTitle = {
          id: titleId,
          name: titleName.toUpperCase(), // Ensure ALL CAPS
          season: get().currentSeason,
          rank: 'RCCS',
          wins: 1,
          color: 'aqua' as const, // All RCCS titles are aqua with glow
          dateAwarded: new Date().toISOString()
        };

        // Add title to tournament store
        useTournament.setState(state => ({
          tournamentTitles: [...state.tournamentTitles, rccsTitle]
        }));

        console.log(`✅ Successfully awarded RCCS title: ${titleName}`);
      },

      getCascadingTitles: (stage: string, earnedReward: RCCSTournamentReward) => {
        const cascadingTitles: RCCSTournamentReward[] = [];
        const currentSeason = get().currentSeason;
        
        // Define the hierarchy of tournament stages and their rewards
        const stageHierarchy = ['qualifiers', 'regionals', 'majors', 'worlds'];
        const currentStageIndex = stageHierarchy.indexOf(stage);
        
        if (currentStageIndex === -1) return cascadingTitles;
        
        // Award all lower tier titles based on what was earned
        for (let i = 0; i < currentStageIndex; i++) {
          const lowerStage = stageHierarchy[i];
          const lowerStageRewards = RCCS_REWARDS[lowerStage];
          
          if (lowerStageRewards) {
            // For each lower stage, award the highest tier title from that stage
            const highestReward = lowerStageRewards[lowerStageRewards.length - 1]; // Last reward is usually highest
            if (highestReward) {
              const cascadingReward = {
                ...highestReward,
                title: highestReward.title.replace('{season}', currentSeason.toString())
              };
              cascadingTitles.push(cascadingReward);
            }
          }
        }
        
        // Special cascading logic for specific achievements
        if (stage === 'regionals') {
          // If you make regionals, you get contender status
          const contenderTitle = RCCS_REWARDS.qualifiers.find(r => r.title.includes('CONTENDER'));
          if (contenderTitle) {
            const cascadingContender = {
              ...contenderTitle,
              title: contenderTitle.title.replace('{season}', currentSeason.toString())
            };
            cascadingTitles.push(cascadingContender);
          }
        } else if (stage === 'majors') {
          // If you make majors, you get regional finalist status
          const regionalsFinalist = RCCS_REWARDS.regionals.find(r => r.title.includes('FINALIST'));
          if (regionalsFinalist) {
            const cascadingFinalist = {
              ...regionalsFinalist,
              title: regionalsFinalist.title.replace('{season}', currentSeason.toString())
            };
            cascadingTitles.push(cascadingFinalist);
          }
        } else if (stage === 'worlds') {
          // If you make worlds, you get major contender status
          const majorContender = RCCS_REWARDS.majors.find(r => r.title.includes('CONTENDER'));
          if (majorContender) {
            const cascadingMajor = {
              ...majorContender,
              title: majorContender.title.replace('{season}', currentSeason.toString())
            };
            cascadingTitles.push(cascadingMajor);
          }
        }
        
        return cascadingTitles;
      },

      dismissNotification: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, dismissed: true } : n
          ),
        }));
      },

      startNewSeason: () => {
        set(state => ({
          currentSeason: state.currentSeason + 1,
          currentTournament: null,
          playerRegistered: false,
          playerTeam: null,
          notifications: [],
          seasonEndDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        }));
        
        // Initialize new season's tournament system
        setTimeout(() => get().initializeTournamentSystem(), 100);
      },

      forceStartTournament: (stage: 'qualifiers' | 'regionals' | 'majors' | 'worlds') => {
        // Debug function to force start any tournament stage
        console.log(`Force starting RCCS tournament: ${stage}`);
        
        // Reset notifications to show signup
        const signupNotification: RCCSNotification = {
          id: `tournament-signup-s${get().currentSeason}`,
          type: 'tournament-signup',
          season: get().currentSeason,
          message: `RCCS Season ${get().currentSeason} Tournament is starting! Sign up now (Champion III+ only)`,
          persistent: true,
          dismissed: false,
          actions: [
            { label: 'Sign Up', action: 'signup' },
            { label: 'Decline', action: 'decline' }
          ]
        };
        
        set({ notifications: [signupNotification] });
      },
    }),
    {
      name: 'rccs-tournament-store',
      partialize: (state) => ({
        currentSeason: state.currentSeason,
        tournamentHistory: state.tournamentHistory,
        notifications: state.notifications.filter(n => n.persistent),
        seasonEndDate: state.seasonEndDate,
      }),
    }
  )
);