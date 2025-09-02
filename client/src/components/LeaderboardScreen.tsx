import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Trophy, Medal, Award, Crown } from 'lucide-react';
import { useLeaderboard } from '../stores/useLeaderboard';
import { usePlayerData } from '../stores/usePlayerData';
import { getRankInfo } from '../utils/rankingSystem';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<'1v1' | '2v2' | '3v3'>('2v2');
  const { leaderboards, initializeLeaderboards, updatePlayerInLeaderboards, simulateMMRFluctuation, getPlayerRank } = useLeaderboard();
  const { playerData, getAvailableTitles } = usePlayerData();
  
  useEffect(() => {
    // Initialize leaderboards on first load
    initializeLeaderboards();
    updatePlayerInLeaderboards(playerData);
    
    // Set up MMR fluctuation simulation
    const interval = setInterval(() => {
      simulateMMRFluctuation();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [initializeLeaderboards, updatePlayerInLeaderboards, simulateMMRFluctuation, playerData]);
  
  const currentLeaderboard = leaderboards[selectedPlaylist];
  const playerRank = getPlayerRank(selectedPlaylist, playerData.mmr[selectedPlaylist]);
  
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 text-center font-bold text-gray-400">#{position}</span>;
    }
  };
  
  const getPlayerTitle = (player: any) => {
    if (player.isPlayer) {
      return getAvailableTitles().find(t => t.id === player.title)?.name || player.title;
    }
    return player.title;
  };
  
  const formatWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return '0%';
    return `${Math.round((wins / total) * 100)}%`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white">Competitive Leaderboards</h1>
      </div>

      {/* Playlist Selector */}
      <div className="flex gap-2 mb-6">
        {(['1v1', '2v2', '3v3'] as const).map((playlist) => (
          <Button
            key={playlist}
            variant={selectedPlaylist === playlist ? 'default' : 'outline'}
            onClick={() => setSelectedPlaylist(playlist)}
            className={selectedPlaylist === playlist 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }
          >
            {playlist} Ranked
          </Button>
        ))}
      </div>

      {/* Player Status */}
      {playerRank <= 25 ? (
        <Card className="mb-6 bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-500/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400" />
                <div>
                  <span className="text-lg font-bold text-white">You are rank #{playerRank}</span>
                  <div className="text-sm text-blue-300">
                    {playerData.mmr[selectedPlaylist]} MMR • {getRankInfo(playerData.mmr[selectedPlaylist]).name}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-300">
                <div>{formatWinRate(playerData.stats[selectedPlaylist].wins, playerData.stats[selectedPlaylist].losses)} Win Rate</div>
                <div>{playerData.stats[selectedPlaylist].wins}W - {playerData.stats[selectedPlaylist].losses}L</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-gray-800/50 border-gray-600">
          <CardContent className="py-4">
            <div className="text-center text-gray-400">
              <div className="text-lg">You need {Math.max(...currentLeaderboard.map(p => p.mmr)) - playerData.mmr[selectedPlaylist] + 1} more MMR to reach the leaderboard</div>
              <div className="text-sm">Current: {playerData.mmr[selectedPlaylist]} MMR • {getRankInfo(playerData.mmr[selectedPlaylist]).name}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {selectedPlaylist} Top 25 - Grand Champions
            <span className="text-sm text-gray-400 ml-auto">
              {selectedPlaylist === '2v2' && 'Most Competitive'}
              {selectedPlaylist === '1v1' && 'Pure Skill'}  
              {selectedPlaylist === '3v3' && 'Team Coordination'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentLeaderboard.map((player, index) => {
              const position = index + 1;
              const rankInfo = getRankInfo(player.mmr);
              const title = getPlayerTitle(player);
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    player.isPlayer 
                      ? 'bg-blue-900/30 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                      : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(position)}
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${player.isPlayer ? 'text-blue-400' : 'text-white'}`}>
                          {player.name}
                          {player.isPlayer && ' (You)'}
                        </span>
                        {title && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-300">
                            {title}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span style={{ color: rankInfo.color }}>
                          {rankInfo.name}
                        </span>
                        <span>
                          {formatWinRate(player.wins, player.losses)} WR
                        </span>
                        <span>
                          {player.wins}W - {player.losses}L
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {player.mmr}
                    </div>
                    <div className="text-xs text-gray-400">
                      MMR
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <div>Leaderboards update in real-time as players compete</div>
            <div className="mt-1">
              {selectedPlaylist === '2v2' && '2v2 is the most grinded playlist with the highest level of competition'}
              {selectedPlaylist === '1v1' && 'Many pros compete in both 1v1 and 2v2, but 1v1 shows pure mechanical skill'}
              {selectedPlaylist === '3v3' && '3v3 has some pros but mainly consists of dedicated grinders and team players'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}