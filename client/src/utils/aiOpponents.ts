// AI opponent generation and behavior simulation

const AI_NAMES = [
  "L", "kupid", "l0st", "jayleng", "weweewew", "RisingPhoinex87", "dr.1", "prot", "hunt", "kif", "?", "rivverott", "1x Dark", "Moxxy!", "ä", "شغثغخ", "dark!", "Vortex", "FlickMaster17", "r", "Skywave!", "R3tr0", "TurboClash893", "Zynk", "Null_Force", "Orbital", "Boosted", "GravyTrain", "NitroNinja", "PixelPlay", "PhantomX", "Fury", "Zero!", "Moonlight", "QuickTap", "v1per", "Slugger", "MetaDrift", "Hydra", "Neo!", "ShadowDart", "SlipStream", "F1ick", "Karma", "Sparkz", "Glitch", "Dash7", "Ignite", "Cyclone", "Nova", "Opt1c", "Viral", "Stormz", "PyroBlast", "Bl1tz", "Echo", "Hover", "PulseRider", "yumi", "drali", "wez", "brickbybrick", "Rw9", "dark", "mawykzy!", "Speed", ".", "koto", "dani", "Qwert (OG)", "dr.k", "Void", "moon.", "Lru", "Kha0s", "rising.", "?", "dynamo", "f", "Hawk!", "newpo", "zen", "v", "a7md", "sieko", "Mino", "dyinq", "toxin", "Bez", "velocity", "Chronic", "Flinch", "vatsi", "Xyzle", "ca$h", "Darkmode", "nu3.", "LetsG0Brand0n", "VAWQK.", "helu30", "wizz", "Sczribbles.", "7up", "unkown", "t0es", "Jynx.", "Zapz", "Aur0", "Knight", "Cliqz", "Pyro.", "dash!", "ven", "flow.", "zenith", "volty", "Aqua!", "Styx", "cheeseboi", "Heat.", "Slyde", "fl1p", "Otto", "jetz", "Crisp", "snailracer", "Flickz", "tempo", "Blaze.", "skyfall", "steam", "storm", "rek:3", "vyna1", "deltairlines", "ph", "trace", "avidic", "tekk!", "fluwo", "climp?", "zark", "diza", "O", "Snooze", "gode", "cola", "hush(!)", "sh4oud", "vvv", "critt", "darkandlost2009", "pulse jubbo", "pl havicic", "ryft.", "Lyric", "dryft.", "horiz", "zeno", "octane", "wavetidess", "loster", "mamba", "Jack", "innadeze", "s", "offtenlost", "bivo", "Trace", "Talon", ".", "{?}", "rraze", "Dark{?}", "zenhj", "rinshoros bf", "Cipher", "nova", "juzz", "officer", "strike", "Titan", "comp", "pahnton", "Mirage", "space", "boltt", "reeper", "piza", "cheese.", "frostbite", "warthunderisbest", "eecipe", "quantum", "vexz", "zylo", "frzno", "blurr", "scythe!", "wvr", "nxt", "griz", "jolt", "sift", "kryo", "wvn", "brixx", "twixt", "nyx", "slyth", "drex", "qwi", "voxx", "triz", "jynx", "plyx", "kryp", "zex", "brix", "twixz", "vyn", "sypher", "jyn", "qry", "neoo", "kwpid",
];

export interface AIOpponent {
  name: string;
  score: number;
  isAI: boolean;
  isTeammate: boolean;
  title?: string;
  mmr?: number;
}

export function generateAIOpponents(gameMode: '1v1' | '2v2' | '3v3', playerMMR: number, currentSeason: number = 1): AIOpponent[] {
  const opponents: AIOpponent[] = [];
  
  // Determine team sizes
  const totalPlayers = parseInt(gameMode.charAt(0)) * 2; // 1v1 = 2, 2v2 = 4, 3v3 = 6
  const teamSize = parseInt(gameMode.charAt(0)); // 1, 2, or 3
  
  // Generate teammates (if any)
  for (let i = 1; i < teamSize; i++) {
    const teammateMMR = generateOpponentMMR(playerMMR, true);
    opponents.push({
      name: getRandomAIName(opponents),
      score: 0,
      isAI: true,
      isTeammate: true,
      title: getRandomAITitle(teammateMMR, currentSeason),
      mmr: teammateMMR,
    });
  }
  
  // Generate enemy team
  for (let i = 0; i < teamSize; i++) {
    const enemyMMR = generateOpponentMMR(playerMMR, false);
    opponents.push({
      name: getRandomAIName(opponents),
      score: 0,
      isAI: true,
      isTeammate: false,
      title: getRandomAITitle(enemyMMR, currentSeason),
      mmr: enemyMMR,
    });
  }
  
  return opponents;
}

function getRandomAIName(existingOpponents: AIOpponent[]): string {
  const usedNames = existingOpponents.map(o => o.name);
  const availableNames = AI_NAMES.filter(name => !usedNames.includes(name));
  
  if (availableNames.length === 0) {
    // Fallback if all names are used
    return `Bot${Math.floor(Math.random() * 1000)}`;
  }
  
  return availableNames[Math.floor(Math.random() * availableNames.length)];
}

function getRandomAITitle(aiMMR: number, currentSeason: number = 1): string {
  // Use passed current season parameter
  
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
  
  // Level-based titles (always available) - simulate different XP levels
  const LEVEL_TITLES = [
    'ROOKIE', 'NOVICE', 'APPRENTICE', 'JOURNEYMAN', 'EXPERT', 'MASTER', 'GRANDMASTER', 'LEGEND'
  ];
  
  // Season reward titles (limited by rank - AI can only have rewards from ranks they could achieve)
  const SEASON_TITLES: string[] = [];
  // Only generate season rewards for ranks at or below AI's current rank
  for (let i = 0; i <= aiRankIndex; i++) {
    const rank = rankOrder[i];
    // Generate titles from current season or previous seasons
    for (let season = 1; season <= currentSeason; season++) {
      SEASON_TITLES.push(`S${season} ${rank.toUpperCase()}`);
    }
  }
  
  // Tournament titles (limited by rank - same constraint as season rewards)
  const TOURNAMENT_TITLES: string[] = [];
  for (let i = 0; i <= aiRankIndex; i++) {
    const rank = rankOrder[i];
    // Generate tournament titles from current season or previous seasons
    for (let season = 1; season <= currentSeason; season++) {
      TOURNAMENT_TITLES.push(`S${season} ${rank.toUpperCase()} TOURNAMENT WINNER`);
    }
  }
  
  // Weight the probabilities based on rank - higher ranks prefer season/tournament titles
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
    
    // Higher tier champions can occasionally have Grand Champion rewards
    if (aiRankIndex === 5 && Math.random() < 0.2) { // Champion with 20% chance
      for (let season = 1; season <= currentSeason; season++) {
        titleCategories.push(`S${season} GRAND CHAMPION`);
      }
    }
  }
  
  // AI must always have a title (like players)
  if (titleCategories.length === 0) {
    // Fallback to a level title if no other titles available
    return LEVEL_TITLES[Math.floor(Math.random() * LEVEL_TITLES.length)];
  }
  
  return titleCategories[Math.floor(Math.random() * titleCategories.length)];
}

function generateOpponentMMR(playerMMR: number, isTeammate: boolean): number {
  // Generate MMR close to player's MMR with some variation
  const variation = isTeammate ? 100 : 150; // Teammates closer in skill
  const minMMR = Math.max(100, playerMMR - variation);
  const maxMMR = playerMMR + variation;
  
  return Math.floor(Math.random() * (maxMMR - minMMR + 1)) + minMMR;
}

export function simulateAIClicks(aiMMR: number, playerCPS: number): number {
  // AI clicking rate based on fixed ranges per rank with some variation
  let baseCPS = 0;
  
  if (aiMMR < 400) {
    // Bronze level - 3-5 CPS
    baseCPS = 3 + Math.random() * 2;
  } else if (aiMMR < 700) {
    // Silver level - 4-6 CPS
    baseCPS = 4 + Math.random() * 2;
  } else if (aiMMR < 1000) {
    // Gold level - 5-7 CPS
    baseCPS = 5 + Math.random() * 2;
  } else if (aiMMR < 1300) {
    // Platinum level - 6-8 CPS
    baseCPS = 6 + Math.random() * 2;
  } else if (aiMMR < 1600) {
    // Diamond level - 7-9 CPS
    baseCPS = 7 + Math.random() * 2;
  } else if (aiMMR < 1900) {
    // Champion level - 8-10 CPS
    baseCPS = 8 + Math.random() * 2;
  } else {
    // Grand Champion - 9-12 CPS (switch between max and min as requested)
    baseCPS = Math.random() < 0.5 ? 9 : 12; // 50/50 chance between min and max
    baseCPS += (Math.random() - 0.5) * 0.5; // Small variation around the chosen value
  }
  
  // Add slight natural variation
  baseCPS *= (0.95 + Math.random() * 0.1);
  
  // Convert CPS to clicks per 100ms interval
  const clicksPerInterval = (baseCPS / 10);
  
  // Return integer clicks with slight randomness
  return Math.floor(clicksPerInterval + (Math.random() > 0.7 ? 1 : 0));
}
