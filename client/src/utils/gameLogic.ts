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
  let baseTime = 30; // 30 seconds base
  
  // Playlist popularity (1v1 most popular, 3v3 least)
  const playlistMultiplier = {
    '1v1': 1.0,
    '2v2': 1.3,
    '3v3': 1.8,
  };
  
  // MMR affects queue time (extreme ranks take longer)
  let mmrMultiplier = 1.0;
  if (mmr < 300 || mmr > 1500) {
    mmrMultiplier = 1.5;
  } else if (mmr < 200 || mmr > 1800) {
    mmrMultiplier = 2.0;
  }
  
  // Peak hours reduce queue time
  const peakMultiplier = isPeakHours ? 0.6 : 1.4;
  
  // Online count affects queue time
  const onlineMultiplier = Math.max(0.5, 800 / onlineCount);
  
  const estimatedTime = baseTime * playlistMultiplier[playlist] * mmrMultiplier * peakMultiplier * onlineMultiplier;
  
  // Add some randomness and ensure minimum/maximum bounds
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  const finalTime = Math.floor(estimatedTime * randomFactor);
  
  return Math.max(5, Math.min(300, finalTime)); // 5 seconds to 5 minutes
}
