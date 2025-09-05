// Ranking system and MMR calculations

export interface RankInfo {
  name: string;
  color: string;
  division?: string;
  tier: number;
  imagePath?: string;
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

// Generate rank image path based on rank and division
export function getRankImagePath(rankName: string, division?: string): string {
  // Extract tier name (Bronze, Silver, etc.)
  const [tier] = rankName.split(' ');
  
  if (tier === 'Grand' || rankName.startsWith('Grand Champion')) {
    // Grand Champion is special case
    return '/ranks/grand-champion-i.png';
  }
  
  // Convert division to lowercase roman numeral
  const divisionMap: { [key: string]: string } = {
    'I': 'i',
    'II': 'ii', 
    'III': 'iii',
    'IV': 'iv',
    'V': 'v'
  };
  
  const divisionSuffix = division ? divisionMap[division] || 'i' : 'i';
  const tierLower = tier.toLowerCase();
  
  return `/ranks/${tierLower}-${divisionSuffix}.png`;
}

export function getRankInfo(mmr: number): RankInfo {
  const rankEntries = Object.entries(RANK_THRESHOLDS).reverse();
  
  for (const [rankName, threshold] of rankEntries) {
    if (mmr >= threshold) {
      const [tier, level] = rankName.split(' ');
      const color = RANK_COLORS[tier as keyof typeof RANK_COLORS];
      
      if (rankName === 'Grand Champion') {
        // Grand Champion has endless scaling
        const gcLevel = Math.floor((mmr - threshold) / 100) + 1;
        const fullName = `Grand Champion ${gcLevel}`;
        return {
          name: fullName,
          color,
          tier: 8,
          imagePath: getRankImagePath(fullName),
        };
      } else {
        // Calculate division within rank (I-V, where I is lowest, V is highest)
        const nextRankEntry = rankEntries.find(([name, thresh]) => thresh > threshold);
        const nextThreshold = nextRankEntry ? nextRankEntry[1] : threshold + 200;
        const mmrRange = nextThreshold - threshold;
        const divisionSize = mmrRange / 5;
        const divisionIndex = Math.min(4, Math.floor((mmr - threshold) / divisionSize));
        const divisions = ['I', 'II', 'III', 'IV', 'V'];
        const division = divisions[divisionIndex];
        
        return {
          name: rankName,
          color,
          division,
          tier: Object.keys(RANK_THRESHOLDS).indexOf(rankName),
          imagePath: getRankImagePath(rankName, division),
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
    imagePath: getRankImagePath('Bronze I', 'I'),
  };
}

export function calculateMMRChange(
  currentMMR: number,
  isWin: boolean,
  opponentMMRs: number[]
): number {
  const averageOpponentMMR = opponentMMRs.reduce((sum, mmr) => sum + mmr, 0) / opponentMMRs.length;
  
  // Simple fixed MMR change system - no K-factors for fairness
  const mmrDifference = averageOpponentMMR - currentMMR;
  
  // Base MMR change for all players
  let baseChange = isWin ? 15 : -15;
  
  // Adjust slightly based on opponent strength difference
  const difficultyAdjustment = Math.floor(mmrDifference / 100); // ±1 MMR per 100 MMR difference
  
  // Apply adjustment
  baseChange += difficultyAdjustment;
  
  // Ensure reasonable bounds (10-20 MMR change)
  const clampedChange = Math.max(-20, Math.min(20, baseChange));
  
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
