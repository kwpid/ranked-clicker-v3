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
  'Platinum': '#B9F2FF',
  'Diamond': '#0080FF',
  'Champion': '#9966CC',
  'Grand Champion': '#FF0000',
};

// Generate rank image path based on rank and division
export function getRankImagePath(rankName: string, division?: string): string {
  // Extract tier name (Bronze, Silver, etc.)
  const [tier, level] = rankName.split(' ');
  
  if (tier === 'Grand' || rankName.startsWith('Grand Champion')) {
    // All Grand Champion ranks use the same image
    return '/ranks/grand-champion-div-i.png';
  }
  
  // Convert division to lowercase roman numeral
  const divisionMap: { [key: string]: string } = {
    'I': 'i',
    'II': 'ii', 
    'III': 'iii',
    'IV': 'iv',
    'V': 'v'
  };
  
  // Use the level from the rank name (e.g., "Silver II" -> "II")
  const actualDivision = level || 'I';
  const divisionSuffix = divisionMap[actualDivision] || 'i';
  const tierLower = tier.toLowerCase();
  
  return `/ranks/${tierLower}-div-${divisionSuffix}.png`;
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
        // Use the exact rank name from RANK_THRESHOLDS 
        // e.g., "Silver II" returns name="Silver II", division="II"
        return {
          name: rankName,
          color,
          division: level, // This is the actual division from the rank name
          tier: Object.keys(RANK_THRESHOLDS).indexOf(rankName),
          imagePath: getRankImagePath(rankName),
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
    imagePath: getRankImagePath('Bronze I'),
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

// Create rank ladder data for display
export function getRankLadder() {
  return [
    { name: 'Grand Champion', imagePath: '/ranks/grand-champion-div-i.png', color: '#FF0000', glow: true },
    { name: 'Champion III', imagePath: '/ranks/champion-div-iii.png', color: '#9966CC' },
    { name: 'Champion II', imagePath: '/ranks/champion-div-iii.png', color: '#9966CC' },
    { name: 'Champion I', imagePath: '/ranks/champion-div-iii.png', color: '#9966CC' },
    { name: 'Diamond III', imagePath: '/ranks/diamond-div-iii.png', color: '#0080FF' },
    { name: 'Diamond II', imagePath: '/ranks/diamond-div-iii.png', color: '#0080FF' },
    { name: 'Diamond I', imagePath: '/ranks/diamond-div-iii.png', color: '#0080FF' },
    { name: 'Platinum III', imagePath: '/ranks/platinum-div-iii.png', color: '#B9F2FF' },
    { name: 'Platinum II', imagePath: '/ranks/platinum-div-iii.png', color: '#B9F2FF' },
    { name: 'Platinum I', imagePath: '/ranks/platinum-div-iii.png', color: '#B9F2FF' },
    { name: 'Gold III', imagePath: '/ranks/gold-div-iii.png', color: '#FFD700' },
    { name: 'Gold II', imagePath: '/ranks/gold-div-iii.png', color: '#FFD700' },
    { name: 'Gold I', imagePath: '/ranks/gold-div-iii.png', color: '#FFD700' },
    { name: 'Silver III', imagePath: '/ranks/silver-div-iii.png', color: '#C0C0C0' },
    { name: 'Silver II', imagePath: '/ranks/silver-div-iii.png', color: '#C0C0C0' },
    { name: 'Silver I', imagePath: '/ranks/silver-div-iii.png', color: '#C0C0C0' },
    { name: 'Bronze III', imagePath: '/ranks/bronze-div-iii.png', color: '#CD7F32' },
    { name: 'Bronze II', imagePath: '/ranks/bronze-div-iii.png', color: '#CD7F32' },
    { name: 'Bronze I', imagePath: '/ranks/bronze-div-iii.png', color: '#CD7F32' },
    { name: 'Unranked', imagePath: null, color: '#6B7280' }
  ];
}
