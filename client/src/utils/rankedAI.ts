// Centralized system for elite ranked AI opponents with persistent MMR
// These 30 AI represent the top-tier competitive players that appear on leaderboards

export interface RankedAI {
  id: string;
  name: string;
  currentMMR: {
    '1v1': number;
    '2v2': number;
    '3v3': number;
  };
  title: string;
  gamesPlayed: number;
  winRate: number;
  isElite: boolean; // Marks them as persistent leaderboard AI
}

// Elite AI opponents - these are the 30 top-tier AI that appear on leaderboards
export const ELITE_RANKED_AI: RankedAI[] = [
  // Top 10 - World Champion tier (2900-3000 MMR)
  {
    id: "elite_01",
    name: "L",
    currentMMR: { '1v1': 2987, '2v2': 2945, '3v3': 2923 },
    title: "RCCS S1 WORLD CHAMPION",
    gamesPlayed: 2847,
    winRate: 0.89,
    isElite: true
  },
  {
    id: "elite_02", 
    name: "kupid",
    currentMMR: { '1v1': 2965, '2v2': 2978, '3v3': 2901 },
    title: "RCCS S1 WORLDS FINALIST",
    gamesPlayed: 3124,
    winRate: 0.87,
    isElite: true
  },
  {
    id: "elite_03",
    name: "l0st", 
    currentMMR: { '1v1': 2943, '2v2': 2934, '3v3': 2956 },
    title: "RCCS S1 WORLD CHAMPION",
    gamesPlayed: 2653,
    winRate: 0.91,
    isElite: true
  },
  {
    id: "elite_04",
    name: "jayleng",
    currentMMR: { '1v1': 2932, '2v2': 2967, '3v3': 2912 },
    title: "RCCS S1 MAJOR CHAMPION", 
    gamesPlayed: 2789,
    winRate: 0.86,
    isElite: true
  },
  {
    id: "elite_05",
    name: "weweewew",
    currentMMR: { '1v1': 2919, '2v2': 2898, '3v3': 2943 },
    title: "RCCS S1 WORLDS FINALIST",
    gamesPlayed: 3456,
    winRate: 0.88,
    isElite: true
  },
  {
    id: "elite_06",
    name: "RisingPhoinex87",
    currentMMR: { '1v1': 2907, '2v2': 2923, '3v3': 2889 },
    title: "RCCS S1 MAJOR CHAMPION",
    gamesPlayed: 2234,
    winRate: 0.85,
    isElite: true
  },
  {
    id: "elite_07",
    name: "dr.1",
    currentMMR: { '1v1': 2901, '2v2': 2887, '3v3': 2934 },
    title: "RCCS S1 WORLD CHALLENGER",
    gamesPlayed: 2967,
    winRate: 0.87,
    isElite: true
  },
  {
    id: "elite_08",
    name: "prot",
    currentMMR: { '1v1': 2889, '2v2': 2945, '3v3': 2876 },
    title: "RCCS S1 MAJOR CHAMPION",
    gamesPlayed: 3089,
    winRate: 0.84,
    isElite: true
  },
  {
    id: "elite_09",
    name: "hunt",
    currentMMR: { '1v1': 2876, '2v2': 2901, '3v3': 2923 },
    title: "RCCS S1 WORLDS FINALIST",
    gamesPlayed: 2567,
    winRate: 0.89,
    isElite: true
  },
  {
    id: "elite_10",
    name: "kif",
    currentMMR: { '1v1': 2867, '2v2': 2834, '3v3': 2898 },
    title: "RCCS S1 MAJOR CHAMPION",
    gamesPlayed: 2123,
    winRate: 0.86,
    isElite: true
  },
  
  // Next 10 - Major/Regional Champion tier (2700-2900 MMR)
  {
    id: "elite_11",
    name: "rivverott",
    currentMMR: { '1v1': 2834, '2v2': 2867, '3v3': 2823 },
    title: "RCCS S1 REGIONAL CHAMPION",
    gamesPlayed: 2345,
    winRate: 0.83,
    isElite: true
  },
  {
    id: "elite_12", 
    name: "1x Dark",
    currentMMR: { '1v1': 2823, '2v2': 2798, '3v3': 2845 },
    title: "RCCS S1 REGIONAL ELITE",
    gamesPlayed: 2789,
    winRate: 0.82,
    isElite: true
  },
  {
    id: "elite_13",
    name: "Moxxy!",
    currentMMR: { '1v1': 2798, '2v2': 2823, '3v3': 2812 },
    title: "RCCS S1 MAJOR CONTENDER",
    gamesPlayed: 2456,
    winRate: 0.81,
    isElite: true
  },
  {
    id: "elite_14",
    name: "dark!",
    currentMMR: { '1v1': 2789, '2v2': 2756, '3v3': 2834 },
    title: "RCCS S1 REGIONAL CHAMPION",
    gamesPlayed: 2678,
    winRate: 0.80,
    isElite: true
  },
  {
    id: "elite_15",
    name: "Vortex",
    currentMMR: { '1v1': 2767, '2v2': 2789, '3v3': 2745 },
    title: "S1 GRAND CHAMPION",
    gamesPlayed: 2234,
    winRate: 0.78,
    isElite: true
  },
  {
    id: "elite_16",
    name: "FlickMaster17",
    currentMMR: { '1v1': 2745, '2v2': 2734, '3v3': 2778 },
    title: "RCCS S1 REGIONAL FINALIST",
    gamesPlayed: 2567,
    winRate: 0.79,
    isElite: true
  },
  {
    id: "elite_17",
    name: "Skywave!",
    currentMMR: { '1v1': 2734, '2v2': 2767, '3v3': 2723 },
    title: "RCCS S1 REGIONAL ELITE",
    gamesPlayed: 2890,
    winRate: 0.77,
    isElite: true
  },
  {
    id: "elite_18",
    name: "R3tr0", 
    currentMMR: { '1v1': 2723, '2v2': 2712, '3v3': 2756 },
    title: "RCCS S1 CONTENDER",
    gamesPlayed: 2123,
    winRate: 0.76,
    isElite: true
  },
  {
    id: "elite_19",
    name: "TurboClash893",
    currentMMR: { '1v1': 2712, '2v2': 2745, '3v3': 2701 },
    title: "S1 GRAND CHAMPION",
    gamesPlayed: 2345,
    winRate: 0.75,
    isElite: true
  },
  {
    id: "elite_20",
    name: "Zynk",
    currentMMR: { '1v1': 2701, '2v2': 2689, '3v3': 2734 },
    title: "RCCS S1 CHALLENGER",
    gamesPlayed: 2456,
    winRate: 0.74,
    isElite: true
  },

  // Final 10 - High Grand Champion tier (2400-2700 MMR)
  {
    id: "elite_21",
    name: "Null_Force",
    currentMMR: { '1v1': 2689, '2v2': 2701, '3v3': 2678 },
    title: "RCCS S1 PARTICIPANT",
    gamesPlayed: 2234,
    winRate: 0.73,
    isElite: true
  },
  {
    id: "elite_22",
    name: "Orbital",
    currentMMR: { '1v1': 2678, '2v2': 2656, '3v3': 2689 },
    title: "S1 GRAND CHAMPION",
    gamesPlayed: 2567,
    winRate: 0.72,
    isElite: true
  },
  {
    id: "elite_23",
    name: "Boosted",
    currentMMR: { '1v1': 2656, '2v2': 2678, '3v3': 2645 },
    title: "RCCS S1 QUALIFIER",
    gamesPlayed: 2789,
    winRate: 0.71,
    isElite: true
  },
  {
    id: "elite_24",
    name: "GravyTrain",
    currentMMR: { '1v1': 2645, '2v2': 2634, '3v3': 2667 },
    title: "S1 GRAND CHAMPION", 
    gamesPlayed: 2123,
    winRate: 0.70,
    isElite: true
  },
  {
    id: "elite_25",
    name: "NitroNinja",
    currentMMR: { '1v1': 2634, '2v2': 2645, '3v3': 2623 },
    title: "MASTER",
    gamesPlayed: 2345,
    winRate: 0.69,
    isElite: true
  },
  {
    id: "elite_26",
    name: "PixelPlay",
    currentMMR: { '1v1': 2623, '2v2': 2612, '3v3': 2634 },
    title: "S1 GRAND CHAMPION",
    gamesPlayed: 2456,
    winRate: 0.68,
    isElite: true
  },
  {
    id: "elite_27",
    name: "PhantomX",
    currentMMR: { '1v1': 2612, '2v2': 2623, '3v3': 2601 },
    title: "GRANDMASTER",
    gamesPlayed: 2567,
    winRate: 0.67,
    isElite: true
  },
  {
    id: "elite_28", 
    name: "Fury",
    currentMMR: { '1v1': 2601, '2v2': 2589, '3v3': 2612 },
    title: "S1 GRAND CHAMPION",
    gamesPlayed: 2678,
    winRate: 0.66,
    isElite: true
  },
  {
    id: "elite_29",
    name: "Zero!",
    currentMMR: { '1v1': 2589, '2v2': 2601, '3v3': 2578 },
    title: "LEGEND",
    gamesPlayed: 2789,
    winRate: 0.65,
    isElite: true
  },
  {
    id: "elite_30",
    name: "Moonlight",
    currentMMR: { '1v1': 2578, '2v2': 2567, '3v3': 2589 },
    title: "S1 GRAND CHAMPION",
    gamesPlayed: 2890,
    winRate: 0.64,
    isElite: true
  }
];

// Additional AI names pool for non-elite opponents (preserving original list)
export const CASUAL_AI_NAMES = [
  "QuickTap", "v1per", "Slugger", "MetaDrift", "Hydra", "Neo!", "ShadowDart", "SlipStream", "F1ick", "Karma", "Sparkz", "Glitch", "Dash7", "Ignite", "Cyclone", "Nova", "Opt1c", "Viral", "Stormz", "PyroBlast", "Bl1tz", "Echo", "Hover", "PulseRider", "yumi", "drali", "wez", "brickbybrick", "Rw9", "dark", "mawykzy!", "Speed", ".", "koto", "dani", "Qwert (OG)", "dr.k", "Void", "moon.", "Lru", "Kha0s", "rising.", "?", "dynamo", "f", "Hawk!", "newpo", "zen", "v", "a7md", "sieko", "Mino", "dyinq", "toxin", "Bez", "velocity", "Chronic", "Flinch", "vatsi", "Xyzle", "ca$h", "Darkmode", "nu3.", "LetsG0Brand0n", "VAWQK.", "helu30", "wizz", "Sczribbles.", "7up", "unkown", "t0es", "Jynx.", "Zapz", "Aur0", "Knight", "Cliqz", "Pyro.", "dash!", "ven", "flow.", "zenith", "volty", "Aqua!", "Styx", "cheeseboi", "Heat.", "Slyde", "fl1p", "Otto", "jetz", "Crisp", "snailracer", "Flickz", "tempo", "Blaze.", "skyfall", "steam", "storm", "rek:3", "vyna1", "deltairlines", "ph", "trace", "avidic", "tekk!", "fluwo", "climp?", "zark", "diza", "O", "Snooze", "gode", "cola", "hush(!)", "sh4oud", "vvv", "critt", "darkandlost2009", "pulse jubbo", "pl havicic", "ryft.", "Lyric", "dryft.", "horiz", "zeno", "octane", "wavetidess", "loster", "mamba", "Jack", "innadeze", "s", "offtenlost", "bivo", "Trace", "Talon", ".", "{?}", "rraze", "Dark{?}", "zenhj", "rinshoros bf", "Cipher", "nova", "juzz", "officer", "strike", "Titan", "comp", "pahnton", "Mirage", "space", "boltt", "reeper", "piza", "cheese.", "frostbite", "warthunderisbest", "eecipe", "quantum", "vexz", "zylo", "frzno", "blurr", "scythe!", "wvr", "nxt", "griz", "jolt", "sift", "kryo", "wvn", "brixx"
];

// Get a ranked AI by ID
export function getRankedAI(id: string): RankedAI | undefined {
  return ELITE_RANKED_AI.find(ai => ai.id === id);
}

// Get all ranked AI in MMR range for matchmaking
export function getRankedAIInRange(playerMMR: number, gameMode: '1v1' | '2v2' | '3v3', range: number = 150): RankedAI[] {
  return ELITE_RANKED_AI.filter(ai => {
    const aiMMR = ai.currentMMR[gameMode];
    return Math.abs(aiMMR - playerMMR) <= range;
  });
}

// Update AI MMR after a match
export function updateAIMMR(aiId: string, gameMode: '1v1' | '2v2' | '3v3', mmrChange: number): void {
  const ai = getRankedAI(aiId);
  if (ai) {
    ai.currentMMR[gameMode] = Math.max(100, ai.currentMMR[gameMode] + mmrChange);
    // Update games played and win rate
    ai.gamesPlayed++;
    if (mmrChange > 0) {
      // AI won - update win rate
      const wins = Math.round(ai.winRate * (ai.gamesPlayed - 1)) + 1;
      ai.winRate = wins / ai.gamesPlayed;
    } else {
      // AI lost - update win rate 
      const wins = Math.round(ai.winRate * (ai.gamesPlayed - 1));
      ai.winRate = wins / ai.gamesPlayed;
    }
  }
}

// Process MMR changes for all AI opponents after a match
export function processAIMMRChanges(
  opponents: { name: string, isAI: boolean, isTeammate: boolean, score: number, rankedId?: string }[],
  playerWon: boolean,
  gameMode: '1v1' | '2v2' | '3v3'
): void {
  opponents.forEach(opponent => {
    if (opponent.isAI && opponent.rankedId) {
      // Determine if this AI "won" based on team performance
      const aiWon = opponent.isTeammate ? playerWon : !playerWon;
      
      // Calculate MMR change for AI (use same logic as player)
      const mmrChange = aiWon ? 
        (10 + Math.floor(Math.random() * 11)) : // AI wins: 10-20 MMR
        -(10 + Math.floor(Math.random() * 11)); // AI loses: -10 to -20 MMR
      
      updateAIMMR(opponent.rankedId, gameMode, mmrChange);
      
      console.log(`🤖 AI ${opponent.name} (${opponent.rankedId}) ${aiWon ? 'gained' : 'lost'} ${Math.abs(mmrChange)} MMR in ${gameMode}`);
    }
  });
}

// Get leaderboard data (top AI by MMR in each game mode)
export function getLeaderboard(gameMode: '1v1' | '2v2' | '3v3', limit: number = 10): RankedAI[] {
  return [...ELITE_RANKED_AI]
    .sort((a, b) => b.currentMMR[gameMode] - a.currentMMR[gameMode])
    .slice(0, limit);
}

// Check if an AI should be used for matchmaking based on MMR proximity  
export function shouldUseRankedAI(playerMMR: number, gameMode: '1v1' | '2v2' | '3v3'): boolean {
  // Use ranked AI for players above Champion rank (1900+ MMR)
  return playerMMR >= 1900 && getRankedAIInRange(playerMMR, gameMode).length > 0;
}