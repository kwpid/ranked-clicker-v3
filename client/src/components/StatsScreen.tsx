import React from 'react';
import { useGameState } from '../stores/useGameState';
import { usePlayerData } from '../stores/usePlayerData';
import { getRankInfo } from '../utils/rankingSystem';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';

export function StatsScreen() {
  const { showStatsModal, setShowStatsModal } = useGameState();
  const { playerData } = usePlayerData();

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  };

  const getTotalGames = () => {
    return Object.values(playerData.stats).reduce((total, playlist) => 
      total + playlist.wins + playlist.losses, 0
    );
  };

  const getTotalWins = () => {
    return Object.values(playerData.stats).reduce((total, playlist) => 
      total + playlist.wins, 0
    );
  };

  const getTotalLosses = () => {
    return Object.values(playerData.stats).reduce((total, playlist) => 
      total + playlist.losses, 0
    );
  };

  const renderPlaylistStats = (playlist: '1v1' | '2v2' | '3v3') => {
    const stats = playerData.stats[playlist];
    const currentRank = getRankInfo(playerData.mmr[playlist]);
    const bestRank = getRankInfo(stats.bestMMR);
    const winRate = calculateWinRate(stats.wins, stats.losses);

    return (
      <Card key={playlist} className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">{playlist}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Current Rank</div>
              <div className="flex items-center gap-2 mb-1">
                {currentRank.imagePath && (
                  <img 
                    src={currentRank.imagePath} 
                    alt={`${currentRank.name} rank icon`}
                    className="w-6 h-6 object-contain"
                  />
                )}
                <div className="font-semibold text-lg" style={{ color: currentRank.color }}>
                  {currentRank.name}
                </div>
              </div>
              {currentRank.division && (
                <div className="text-sm text-gray-300">Division {currentRank.division}</div>
              )}
              <div className="text-xs text-gray-500">{playerData.mmr[playlist]} MMR</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Best Rank</div>
              <div className="flex items-center gap-2 mb-1">
                {bestRank.imagePath && (
                  <img 
                    src={bestRank.imagePath} 
                    alt={`${bestRank.name} rank icon`}
                    className="w-6 h-6 object-contain"
                  />
                )}
                <div className="font-semibold text-lg" style={{ color: bestRank.color }}>
                  {bestRank.name}
                </div>
              </div>
              {bestRank.division && (
                <div className="text-sm text-gray-300">Division {bestRank.division}</div>
              )}
              <div className="text-xs text-gray-500">{stats.bestMMR} MMR</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-700 rounded p-2">
              <div className="text-lg font-bold text-green-400">{stats.wins}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-lg font-bold text-red-400">{stats.losses}</div>
              <div className="text-xs text-gray-400">Losses</div>
            </div>
            <div className="bg-gray-700 rounded p-2">
              <div className="text-lg font-bold text-blue-400">{winRate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold text-white">Player Statistics</DialogTitle>
            <Button
              onClick={() => setShowStatsModal(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{getTotalGames()}</div>
            <div className="text-sm text-gray-400">Total Games</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{getTotalWins()}</div>
            <div className="text-sm text-gray-400">Total Wins</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{getTotalLosses()}</div>
            <div className="text-sm text-gray-400">Total Losses</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">
              {calculateWinRate(getTotalWins(), getTotalLosses())}%
            </div>
            <div className="text-sm text-gray-400">Overall Win Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Season Info */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5" />
            Season Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-lg font-semibold text-white mb-2">Current Season</div>
              <div className="text-3xl font-bold text-blue-400 mb-1">Season {playerData.currentSeason}</div>
              <div className="text-sm text-gray-400">
                Seasons reset monthly with placement matches
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white mb-2">Placement Status</div>
              <div className="space-y-1">
                {(['1v1', '2v2', '3v3'] as const).map(playlist => {
                  const remaining = playerData.placementMatches[playlist];
                  const completed = 5 - remaining;
                  return (
                    <div key={playlist} className="flex justify-between items-center">
                      <span className="text-gray-300">{playlist}:</span>
                      <span className={remaining > 0 ? 'text-yellow-400' : 'text-green-400'}>
                        {remaining > 0 ? `${remaining} remaining` : 'Complete'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playlist Stats */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-4">Playlist Statistics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderPlaylistStats('1v1')}
          {renderPlaylistStats('2v2')}
          {renderPlaylistStats('3v3')}
        </div>
      </div>

      {/* Additional Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Achievement Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Games Played</span>
                <span className="text-white">{getTotalGames()}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (getTotalGames() / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Wins Achieved</span>
                <span className="text-white">{getTotalWins()}/50</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (getTotalWins() / 50) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
