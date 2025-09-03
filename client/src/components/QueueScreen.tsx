import React, { useState, useEffect } from 'react';
import { useGameState } from '../stores/useGameState';
import { usePlayerData } from '../stores/usePlayerData';
import { getOnlinePlayerCount, estimateQueueTime } from '../utils/gameLogic';
import { getRankInfo } from '../utils/rankingSystem';
import { setPageTitle, resetPageTitle, showMatchFoundNotification } from '../utils/pageTitle';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Users, Clock, Loader2, Star } from 'lucide-react';

export function QueueScreen() {
  const { queueMode, setCurrentScreen, setGameMode, setOpponents } = useGameState();
  const { playerData } = usePlayerData();
  const [selectedPlaylist, setSelectedPlaylist] = useState<'1v1' | '2v2' | '3v3' | null>(null);
  const [isQueuing, setIsQueuing] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Update online player count every few seconds
    const updateOnlineCount = () => {
      setOnlineCount(getOnlinePlayerCount());
    };
    
    updateOnlineCount();
    const interval = setInterval(updateOnlineCount, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      const estimated = estimateQueueTime(selectedPlaylist, playerData.mmr[selectedPlaylist]);
      setEstimatedTime(estimated);
    }
  }, [selectedPlaylist, playerData.mmr]);

  useEffect(() => {
    let queueInterval: NodeJS.Timeout;
    
    if (isQueuing) {
      // Set page title when starting queue
      setPageTitle('Searching For Match... - Ranked Clicker');
      
      queueInterval = setInterval(() => {
        setQueueTime(prev => prev + 1);
        
        // Simulate finding a match based on estimated time with some randomness
        const shouldFindMatch = queueTime >= estimatedTime - 5 && Math.random() < 0.1;
        
        if (shouldFindMatch) {
          // Match found!
          showMatchFoundNotification();
          
          setTimeout(() => {
            setGameMode(selectedPlaylist!);
            setCurrentScreen('game');
          }, 2000); // Small delay to show the match found state
        }
      }, 1000);
    } else {
      // Reset page title when not queuing
      resetPageTitle();
    }

    return () => {
      if (queueInterval) clearInterval(queueInterval);
    };
  }, [isQueuing, queueTime, estimatedTime, selectedPlaylist, setGameMode, setCurrentScreen, setOpponents]);

  const handleStartQueue = (playlist: '1v1' | '2v2' | '3v3') => {
    setSelectedPlaylist(playlist);
    setIsQueuing(true);
    setQueueTime(0);
  };

  const handleCancelQueue = () => {
    setIsQueuing(false);
    setQueueTime(0);
    setSelectedPlaylist(null);
    resetPageTitle();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  if (isQueuing) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <CardTitle className="text-2xl text-white">Searching for Match</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-lg font-semibold text-blue-400">
                {queueMode === 'ranked' ? 'Ranked' : 'Casual'} {selectedPlaylist}
              </div>
              <div className="text-sm text-gray-400">
                MMR: {playerData.mmr[selectedPlaylist!]}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">
                {formatTime(queueTime)}
              </div>
              <div className="text-sm text-gray-400">
                Estimated: {formatTime(estimatedTime)}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {onlineCount} players online
            </div>

            <Button
              onClick={handleCancelQueue}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel Queue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setCurrentScreen('main')}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-3xl font-bold text-white">
          {queueMode === 'ranked' ? 'Ranked' : 'Casual'} Queue
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {(['1v1', '2v2', '3v3'] as const).map((playlist) => {
          const mmr = playerData.mmr[playlist];
          const estimated = estimateQueueTime(playlist, mmr);
          
          return (
            <Card
              key={playlist}
              className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
              onClick={() => handleStartQueue(playlist)}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white group-hover:text-blue-400 transition-colors">
                  {playlist}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                {(() => {
                  const rankInfo = getRankInfo(mmr);
                  const seasonWins = playerData.seasonWins?.[playlist] || 0;
                  const totalSeasonWins = playerData.seasonWins['1v1'] + playerData.seasonWins['2v2'] + playerData.seasonWins['3v3'];
                  const baseRank = rankInfo.name.split(' ')[0];
                  const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion'];
                  const currentRankIndex = rankOrder.indexOf(baseRank);
                  const nextRewardWins = currentRankIndex >= 0 ? (currentRankIndex + 1) * 10 : 10;
                  
                  return (
                    <>
                      {/* Rank Info */}
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                        <div className="font-bold text-lg mb-1" style={{ color: rankInfo.color }}>
                          {rankInfo.name}
                        </div>
                        {rankInfo.division && (
                          <div className="text-sm text-gray-300 mb-1">Division {rankInfo.division}</div>
                        )}
                        <div className="text-sm text-gray-400">{mmr} MMR</div>
                      </div>
                      
                      {/* Season Progress */}
                      <div className="bg-gray-900/30 rounded-lg p-2 border border-gray-700">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-400">Season Progress</span>
                        </div>
                        <div className="text-sm text-white">
                          {totalSeasonWins} total wins
                        </div>
                        {currentRankIndex >= 0 && (
                          <div className="text-xs text-orange-400 mt-1">
                            {totalSeasonWins >= nextRewardWins 
                              ? `${baseRank} Reward Unlocked!` 
                              : `${nextRewardWins - totalSeasonWins} wins to ${baseRank} reward`}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  ~{formatTime(estimated)} queue
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25">
                  Queue {playlist}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          <Users className="w-4 h-4 text-green-500" />
          {onlineCount} players online
          <span className="text-gray-600">•</span>
          Peak hours: 6PM-11PM (shorter queues)
        </div>
      </div>
    </div>
  );
}
