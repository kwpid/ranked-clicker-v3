// AI opponent generation and behavior simulation
import { 
  ELITE_RANKED_AI, 
  CASUAL_AI_NAMES, 
  getRankedAIInRange, 
  shouldUseRankedAI, 
  type RankedAI 
} from './rankedAI';

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
  rankedId?: string; // ID for persistent ranked AI
}

export function generateAIOpponents(gameMode: '1v1' | '2v2' | '3v3', playerMMR: number, currentSeason: number = 1): AIOpponent[] {
  const opponents: AIOpponent[] = [];
  
  // Determine team sizes
  const totalPlayers = parseInt(gameMode.charAt(0)) * 2; // 1v1 = 2, 2v2 = 4, 3v3 = 6
  const teamSize = parseInt(gameMode.charAt(0)); // 1, 2, or 3
  
  // Check if we should use ranked AI (for high MMR players)
  const useRankedAI = shouldUseRankedAI(playerMMR, gameMode);
  const availableRankedAI = useRankedAI ? getRankedAIInRange(playerMMR, gameMode) : [];
  
  // Generate teammates (if any)
  for (let i = 1; i < teamSize; i++) {
    if (useRankedAI && availableRankedAI.length > 0 && Math.random() < 0.7) {
      // 70% chance to use ranked AI for teammates
      const rankedAI = availableRankedAI[Math.floor(Math.random() * availableRankedAI.length)];
      opponents.push({
        name: rankedAI.name,
        score: 0,
        isAI: true,
        isTeammate: true,
        title: rankedAI.title,
        mmr: rankedAI.currentMMR[gameMode],
        rankedId: rankedAI.id,
      });
      // Remove from available pool to avoid duplicates
      availableRankedAI.splice(availableRankedAI.indexOf(rankedAI), 1);
    } else {
      // Use traditional AI generation
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
  }
  
  // Generate enemy team
  for (let i = 0; i < teamSize; i++) {
    if (useRankedAI && availableRankedAI.length > 0 && Math.random() < 0.8) {
      // 80% chance to use ranked AI for enemies (slightly higher than teammates)
      const rankedAI = availableRankedAI[Math.floor(Math.random() * availableRankedAI.length)];
      opponents.push({
        name: rankedAI.name,
        score: 0,
        isAI: true,
        isTeammate: false,
        title: rankedAI.title,
        mmr: rankedAI.currentMMR[gameMode],
        rankedId: rankedAI.id,
      });
      // Remove from available pool to avoid duplicates
      availableRankedAI.splice(availableRankedAI.indexOf(rankedAI), 1);
    } else {
      // Use traditional AI generation
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

  // RCCS titles for Grand Champion+ based on MMR and current season
  const RCCS_TITLES: string[] = [];
  if (aiRankIndex >= 6) { // Grand Champion or higher
    // Some Grand Champions don't use RCCS titles (30% chance to skip)
    const usesRCCSTitle = Math.random() > 0.3;
    
    if (usesRCCSTitle) {
      for (let season = 1; season <= currentSeason; season++) {
        if (aiMMR >= 2950) {
          // Elite MMR - World Champion level titles (3k max) - weighted heavily
          RCCS_TITLES.push(`RCCS S${season} WORLD CHAMPION`);
          RCCS_TITLES.push(`RCCS S${season} WORLD CHAMPION`);
          RCCS_TITLES.push(`RCCS S${season} WORLDS FINALIST`);
        } else if (aiMMR >= 2850) {
          // High MMR - Major Champion level titles - good weighting
          RCCS_TITLES.push(`RCCS S${season} MAJOR CHAMPION`);
          RCCS_TITLES.push(`RCCS S${season} MAJOR CHAMPION`);
          RCCS_TITLES.push(`RCCS S${season} WORLD CHALLENGER`);
          RCCS_TITLES.push(`RCCS S${season} MAJOR CONTENDER`);
        } else if (aiMMR >= 2700) {
          // Good MMR - Regional Champion level titles
          RCCS_TITLES.push(`RCCS S${season} REGIONAL CHAMPION`);
          RCCS_TITLES.push(`RCCS S${season} REGIONAL ELITE`);
          RCCS_TITLES.push(`RCCS S${season} REGIONAL FINALIST`);
        } else if (aiMMR >= 2400) {
          // Mid Grand Champion MMR - Qualifier titles  
          RCCS_TITLES.push(`RCCS S${season} CONTENDER`);
          RCCS_TITLES.push(`RCCS S${season} CHALLENGER`);
        } else {
          // Lower Grand Champion MMR - Basic participant titles
          RCCS_TITLES.push(`RCCS S${season} PARTICIPANT`);
          RCCS_TITLES.push(`RCCS S${season} QUALIFIER`);
        }
      }
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
    // Champion/Grand Champion - prefer prestigious titles (10% level, 30% season, 20% tournament, 40% RCCS)
    for (let i = 0; i < 1; i++) {
      titleCategories.push(...LEVEL_TITLES);
    }
    if (SEASON_TITLES.length > 0) {
      for (let i = 0; i < 3; i++) {
        titleCategories.push(...SEASON_TITLES);
      }
    }
    if (TOURNAMENT_TITLES.length > 0) {
      for (let i = 0; i < 2; i++) {
        titleCategories.push(...TOURNAMENT_TITLES);
      }
    }
    // RCCS titles get high priority for Grand Champion+ AI opponents
    if (RCCS_TITLES.length > 0) {
      for (let i = 0; i < 4; i++) {
        titleCategories.push(...RCCS_TITLES);
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
  // AI clicking rate - Champion+ adapts to player CPS to keep games competitive
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
    // Champion level - Adapts to player CPS ±2 to keep games competitive
    if (playerCPS > 0) {
      const adaptiveMin = Math.max(6, playerCPS - 2); // Minimum 6 CPS, player CPS - 2
      const adaptiveMax = playerCPS + 2; // Player CPS + 2
      baseCPS = adaptiveMin + Math.random() * (adaptiveMax - adaptiveMin);
    } else {
      // Fallback if no player CPS data
      baseCPS = 8 + Math.random() * 2;
    }
  } else {
    // Grand Champion - Adapts to player CPS ±3 but with 10-25 CPS range
    if (playerCPS > 0) {
      const adaptiveMin = Math.max(10, playerCPS - 3); // Minimum 10 CPS, player CPS - 3
      const adaptiveMax = Math.min(25, Math.max(15, playerCPS + 3)); // Maximum 25 CPS, minimum 15 CPS max
      baseCPS = adaptiveMin + Math.random() * (adaptiveMax - adaptiveMin);
    } else {
      // Fallback if no player CPS data
      baseCPS = 10 + Math.random() * 15; // 10-25 CPS range
    }
  }
  
  // Add slight natural variation to make AI feel more human
  baseCPS *= (0.95 + Math.random() * 0.1);
  
  // Convert CPS to clicks per 100ms interval
  const clicksPerInterval = (baseCPS / 10);
  
  // Return integer clicks with slight randomness
  return Math.floor(clicksPerInterval + (Math.random() > 0.7 ? 1 : 0));
}
