// AI opponent generation and behavior simulation

const AI_NAMES = [
  'Bot Max', 'CyberSam', 'Clickertron', 'AutoTapper', 'DigitalDave',
  'BotBuster', 'ClickMaster', 'TurboTap', 'SpeedClicker', 'RoboRush',
  'FastFingers', 'ClickBot3000', 'TapTitan', 'RapidRobot', 'BinaryBash',
  'DataDasher', 'CodeClicker', 'PixelPuncher', 'ByteBuster', 'TechTapper'
];

export interface AIOpponent {
  name: string;
  score: number;
  isAI: boolean;
  isTeammate: boolean;
}

export function generateAIOpponents(gameMode: '1v1' | '2v2' | '3v3', playerMMR: number): AIOpponent[] {
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

function generateOpponentMMR(playerMMR: number, isTeammate: boolean): number {
  // Generate MMR close to player's MMR with some variation
  const variation = isTeammate ? 100 : 150; // Teammates closer in skill
  const minMMR = Math.max(100, playerMMR - variation);
  const maxMMR = playerMMR + variation;
  
  return Math.floor(Math.random() * (maxMMR - minMMR + 1)) + minMMR;
}

export function simulateAIClicks(playerMMR: number): number {
  // AI clicking rate based on MMR/difficulty
  let baseCPS = 0;
  
  if (playerMMR < 400) {
    // Bronze level - very low CPS
    baseCPS = 1.5 + Math.random() * 1.0; // 1.5-2.5 CPS
  } else if (playerMMR < 700) {
    // Silver level - low CPS
    baseCPS = 2.0 + Math.random() * 1.5; // 2.0-3.5 CPS
  } else if (playerMMR < 1000) {
    // Gold level - moderate CPS
    baseCPS = 2.5 + Math.random() * 2.0; // 2.5-4.5 CPS
  } else if (playerMMR < 1300) {
    // Platinum level - high CPS
    baseCPS = 3.0 + Math.random() * 2.5; // 3.0-5.5 CPS
  } else if (playerMMR < 1600) {
    // Diamond level - very high CPS
    baseCPS = 4.0 + Math.random() * 3.0; // 4.0-7.0 CPS
  } else if (playerMMR < 1900) {
    // Champion level - near-human patterns
    baseCPS = 5.0 + Math.random() * 4.0; // 5.0-9.0 CPS
  } else {
    // Grand Champion - human-like with bursts
    const isBurst = Math.random() < 0.1; // 10% chance of burst
    baseCPS = isBurst ? 8.0 + Math.random() * 7.0 : 4.0 + Math.random() * 5.0;
  }
  
  // Convert CPS to clicks per 100ms interval
  const clicksPerInterval = (baseCPS / 10) * (0.8 + Math.random() * 0.4); // Add some randomness
  
  // Return integer clicks (can be 0)
  return Math.floor(clicksPerInterval + Math.random());
}
