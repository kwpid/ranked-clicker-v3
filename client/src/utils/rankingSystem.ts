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
  'Grand Champion': '#FF6B6B',
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
        // Calculate division within rank (I-V)
        const nextRankEntry = rankEntries.find(([name, thresh]) => thresh > threshold);
        const nextThreshold = nextRankEntry ? nextRankEntry[1] : threshold + 200;
        const mmrRange = nextThreshold - threshold;
        const divisionSize = mmrRange / 5;
        const divisionIndex = Math.min(4, Math.floor((mmr - threshold) / divisionSize));
        const divisions = ['V', 'IV', 'III', 'II', 'I'];
        
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
    division: 'V',
    tier: 0,
  };
}

export function calculateMMRChange(
  currentMMR: number,
  isWin: boolean,
  opponentMMRs: number[]
): number {
  const averageOpponentMMR = opponentMMRs.reduce((sum, mmr) => sum + mmr, 0) / opponentMMRs.length;
  
  // Base MMR change
  let baseChange = isWin ? 25 : -25;
  
  // Adjust based on MMR difference
  const mmrDifference = averageOpponentMMR - currentMMR;
  const difficultyMultiplier = 1 + (mmrDifference / 1000); // +/- 100 MMR = +/- 10% change
  
  // Apply multiplier
  baseChange = Math.floor(baseChange * difficultyMultiplier);
  
  // Ensure minimum change
  if (isWin) {
    baseChange = Math.max(5, baseChange);
  } else {
    baseChange = Math.min(-5, baseChange);
  }
  
  // Cap maximum change
  baseChange = Math.max(-50, Math.min(50, baseChange));
  
  return baseChange;
}

export function shouldStartNewSeason(): boolean {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Check if it's the first day of the month
  return now.getDate() === 1;
}
