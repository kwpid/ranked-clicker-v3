// Title styling utilities for consistent title display across components

export interface TitleStyle {
  color?: string;
  glow?: boolean;
}

export function getTitleStyle(title: string): TitleStyle {
  if (!title) return {};

  // Level-based titles (gray)
  const levelTitles = ['ROOKIE', 'NOVICE', 'APPRENTICE', 'JOURNEYMAN', 'EXPERT', 'MASTER', 'GRANDMASTER', 'LEGEND'];
  if (levelTitles.includes(title)) {
    return {
      color: '#9CA3AF',
      glow: title === 'LEGEND'
    };
  }

  // Season reward titles
  if (title.match(/^S\d+ /)) {
    const rank = title.split(' ').slice(1).join(' ');
    const isGrandChampion = rank.includes('GRAND CHAMPION');
    
    return {
      color: getRankColor(rank),
      glow: isGrandChampion
    };
  }

  // Tournament titles
  if (title.includes('TOURNAMENT WINNER')) {
    const rank = title.match(/S\d+ (.+?) TOURNAMENT/)?.[1] || '';
    const isGrandChampion = rank.includes('GRAND CHAMPION');
    
    return {
      color: getRankColor(rank),
      glow: isGrandChampion
    };
  }

  // Synergy Cup titles (all golden with glow)
  if (title.includes('SYNERGY CUP')) {
    return {
      color: '#FFD700', // Golden
      glow: true
    };
  }

  // RCCS titles (all aqua glow with cyan color)
  if (title.includes('RCCS S')) {
    return {
      color: '#00FFFF', // Cyan/aqua
      glow: true
    };
  }

  // Default styling
  return {
    color: '#9CA3AF',
    glow: false
  };
}

function getRankColor(rank: string): string {
  const RANK_COLORS = {
    'BRONZE': '#CD7F32',
    'SILVER': '#C0C0C0', 
    'GOLD': '#FFD700',
    'PLATINUM': '#E5E4E2',
    'DIAMOND': '#B9F2FF',
    'CHAMPION': '#9966CC',
    'GRAND CHAMPION': '#FFD700',
  };
  
  const upperRank = rank.toUpperCase();
  
  // Check for Grand Champion first to avoid matching "CHAMPION" instead
  if (upperRank.includes('GRAND CHAMPION')) {
    return RANK_COLORS['GRAND CHAMPION'];
  }
  
  for (const [rankName, color] of Object.entries(RANK_COLORS)) {
    if (upperRank.includes(rankName)) {
      return color;
    }
  }
  
  return '#9CA3AF'; // Default gray
}

export function formatTitleStyle(titleStyle: TitleStyle): React.CSSProperties {
  return {
    color: titleStyle.color,
    textShadow: titleStyle.glow ? `0 0 8px ${titleStyle.color}` : 'none'
  };
}