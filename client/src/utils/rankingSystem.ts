// Ranking system and MMR calculations

export interface RankInfo {
  name: string;
  color: string;
  division?: string;
  tier: number;
}

const RANK_THRESHOLDS = {
  'Bronze I': 0,
  'Bronze II': 100,
  'Bronze III': 200,
  'Silver I': 300,
  'Silver II': 400,
  'Silver III': 500,
  'Gold I': 600,
  'Gold II': 750,
  'Gold III': 900,
  'Platinum I': 1050,
  'Platinum II': 1200,
  'Platinum III': 1350,
  'Diamond I': 1500,
  'Diamond II': 1650,
  'Diamond III': 1800,
  'Champion I': 1950,
  'Champion II': 2150,
  'Champion III': 2350,
  'Grand Champion': 2550,
};

const RANK_COLORS = {
  'Bronze': '#CD7F32',
  'Silver': '#C0C0C0',
  'Gold': '#FFD700',
  'Platinum': '#E5E4E2',
  'Diamond': '#B9F2FF',
  'Champion': '#9966CC',
  'Grand Champion': '#FFD700',
};

export function getRankInfo(mmr: number): RankInfo {
  const rankEntries = Object.entries(RANK_THRESHOLDS).reverse();
  
  for (const [rankName, threshold] of rankEntries) {
    if (mmr >= threshold) {
      const [tier, level] = rankName.split(' ');
      const color = RANK_COLORS[tier as keyof typeof RANK_COLORS];
      
      if (rankName === 'Grand Champion') {
        // Grand Champion has endless scaling
        const gcLevel = Math.floor((mmr - threshold) / 100) + 1;
        return {
          name: `Grand Champion ${gcLevel}`,
          color,
          tier: 8,
        };
      } else {
        // Calculate division within rank (I-V, where I is lowest, V is highest)
        const nextRankEntry = rankEntries.find(([name, thresh]) => thresh > threshold);
        const nextThreshold = nextRankEntry ? nextRankEntry[1] : threshold + 200;
        const mmrRange = nextThreshold - threshold;
        const divisionSize = mmrRange / 5;
        const divisionIndex = Math.min(4, Math.floor((mmr - threshold) / divisionSize));
        const divisions = ['I', 'II', 'III', 'IV', 'V'];
        
        return {
          name: rankName,
          color,
          division: divisions[divisionIndex],
          tier: Object.keys(RANK_THRESHOLDS).indexOf(rankName),
        };
      }
    }
  }
  
  // Fallback to Bronze I
  return {
    name: 'Bronze I',
    color: RANK_COLORS.Bronze,
    division: 'I',
    tier: 0,
  };
}

export function calculateMMRChange(
  currentMMR: number,
  isWin: boolean,
  opponentMMRs: number[]
): number {
  const averageOpponentMMR = opponentMMRs.reduce((sum, mmr) => sum + mmr, 0) / opponentMMRs.length;
  
  // ELO-style calculation
  const mmrDifference = averageOpponentMMR - currentMMR;
  
  // Calculate expected score (probability of winning)
  const expectedScore = 1 / (1 + Math.pow(10, mmrDifference / 400));
  
  // Actual score (1 for win, 0 for loss)
  const actualScore = isWin ? 1 : 0;
  
  // K-factor determines maximum MMR change (between 10-30)
  let kFactor = 30;
  
  // Reduce K-factor for higher MMR players (more stable at high ranks)
  if (currentMMR > 1900) {
    kFactor = 15; // Grand Champion
  } else if (currentMMR > 1600) {
    kFactor = 20; // Champion
  } else if (currentMMR > 1000) {
    kFactor = 25; // Diamond/Platinum
  }
  
  // Calculate MMR change
  const mmrChange = Math.round(kFactor * (actualScore - expectedScore));
  
  // Ensure minimum and maximum bounds (10-30)
  const clampedChange = Math.max(-30, Math.min(30, mmrChange));
  
  // Ensure minimum change of 10 for any game
  if (isWin && clampedChange < 10) {
    return 10;
  } else if (!isWin && clampedChange > -10) {
    return -10;
  }
  
  return clampedChange;
}

export function shouldStartNewSeason(): boolean {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Check if it's the first day of the month
  return now.getDate() === 1;
}
