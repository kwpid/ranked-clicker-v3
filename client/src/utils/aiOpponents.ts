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
      title: getRandomAITitle(),
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
      title: getRandomAITitle(),
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

function getRandomAITitle(): string {
  const AI_TITLES = [
    'Rookie', 'Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master', 'Grandmaster', 'Legend'
  ];
  return AI_TITLES[Math.floor(Math.random() * AI_TITLES.length)];
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
