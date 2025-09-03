// Simulate realistic online player counts and queue times

export function getOnlinePlayerCount(): number {
  const now = new Date();
  const hour = now.getHours();
  
  // Peak hours: 6PM-11PM (18-23)
  const isPeakHours = hour >= 18 && hour <= 23;
  
  // Base player count with some randomness
  const baseCount = isPeakHours ? 1200 : 400;
  const randomVariation = Math.floor(Math.random() * 200) - 100;
  
  return Math.max(100, baseCount + randomVariation);
}

export function estimateQueueTime(playlist: '1v1' | '2v2' | '3v3', mmr: number): number {
  const onlineCount = getOnlinePlayerCount();
  const now = new Date();
  const hour = now.getHours();
  const isPeakHours = hour >= 18 && hour <= 23;
  
  // Base queue time factors
  let baseTime = 8; // 8 seconds base (reduced from 15)
  
  // Playlist popularity (1v1 most popular, 3v3 least)
  const playlistMultiplier = {
    '1v1': 1.0,
    '2v2': 1.3,
    '3v3': 1.8,
  };
  
  // MMR affects queue time - lower ranks get shorter queues, higher ranks get longer queues
  let mmrMultiplier = 1.0;
  if (mmr < 400) {
    // Bronze - very fast queues
    mmrMultiplier = 0.3;
  } else if (mmr < 700) {
    // Silver - fast queues
    mmrMultiplier = 0.4;
  } else if (mmr < 1000) {
    // Gold - normal queues
    mmrMultiplier = 0.7;
  } else if (mmr < 1300) {
    // Platinum - slightly longer queues
    mmrMultiplier = 1.0;
  } else if (mmr < 1600) {
    // Diamond - longer queues
    mmrMultiplier = 1.4;
  } else if (mmr < 1900) {
    // Champion - much longer queues
    mmrMultiplier = 1.8;
  } else {
    // Grand Champion - very long queues
    mmrMultiplier = 2.5;
  }
  
  // Peak hours reduce queue time
  const peakMultiplier = isPeakHours ? 0.6 : 1.4;
  
  // Online count affects queue time
  const onlineMultiplier = Math.max(0.5, 800 / onlineCount);
  
  const estimatedTime = baseTime * playlistMultiplier[playlist] * mmrMultiplier * peakMultiplier * onlineMultiplier;
  
  // Add some randomness and ensure minimum/maximum bounds
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  const finalTime = Math.floor(estimatedTime * randomFactor);
  
  return Math.max(3, Math.min(420, finalTime)); // 3 seconds to 7 minutes
}
