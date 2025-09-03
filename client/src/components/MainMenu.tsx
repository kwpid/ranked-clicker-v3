import React, { useEffect } from 'react';
import { useGameState } from '../stores/useGameState';
import { useTournament } from '../stores/useTournament';
import { useNews } from '../stores/useNews';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Users, Zap, Crown, Newspaper, Bell } from 'lucide-react';

export function MainMenu() {
  const { setQueueMode, setCurrentScreen } = useGameState();
  const { isGameModeBlocked } = useTournament();
  const { getUnreadCount, versionInfo, checkForUpdates, dismissUpdate } = useNews();

  const unreadCount = getUnreadCount();

  useEffect(() => {
    // Check for updates when the main menu loads
    const checkInterval = 60 * 60 * 1000; // 1 hour
    const now = Date.now();
    
    if (now - versionInfo.lastChecked > checkInterval) {
      checkForUpdates();
    }
  }, [checkForUpdates, versionInfo.lastChecked]);

  const handleQueueSelection = (mode: 'casual' | 'ranked') => {
    if (isGameModeBlocked()) return; // Block if in tournament queue
    setQueueMode(mode);
    setCurrentScreen('queue');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Ranked Clicker
        </h1>
        <p className="text-gray-400 text-lg">
          Click your way to the top of the leaderboards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`bg-gray-800 border-gray-700 transition-all duration-300 cursor-pointer group ${
                isGameModeBlocked() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-blue-500'
              }`}
              onClick={() => handleQueueSelection('casual')}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors shadow-lg shadow-blue-500/25 ${
                !isGameModeBlocked() ? 'group-hover:bg-blue-500' : ''
              }`}>
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              Queue Casual {isGameModeBlocked() && <span className="text-red-400 text-sm">(Locked)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-4">
              Practice your clicking skills without affecting your rank
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• No MMR changes</li>
              <li>• Relaxed gameplay</li>
              <li>• Choose 1v1, 2v2, or 3v3</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={`bg-gray-800 border-gray-700 transition-all duration-300 cursor-pointer group ${
                isGameModeBlocked() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-purple-500'
              }`}
              onClick={() => handleQueueSelection('ranked')}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors shadow-lg shadow-purple-500/25 ${
                !isGameModeBlocked() ? 'group-hover:bg-purple-500' : ''
              }`}>
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              Queue Ranked {isGameModeBlocked() && <span className="text-red-400 text-sm">(Locked)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-4">
              Compete for rank and climb the competitive ladder
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Gain/lose MMR</li>
              <li>• Rank progression</li>
              <li>• Choose 1v1, 2v2, or 3v3</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Update Notification */}
      {versionInfo.hasUpdate && (
        <div className="mt-6">
          <Card className="bg-yellow-900/20 border-yellow-500/30">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-400 animate-bounce" />
                <div>
                  <p className="font-semibold text-yellow-400 text-sm">
                    Update Available: v{versionInfo.latestVersion}
                  </p>
                  <p className="text-xs text-yellow-300/80">
                    New features and improvements available
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open('https://github.com/user/ranked-clicker-game/releases', '_blank')}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-xs"
                >
                  Update
                </Button>
                <Button
                  onClick={dismissUpdate}
                  size="sm"
                  variant="ghost"
                  className="text-yellow-400 hover:bg-yellow-900/30 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Secondary Options */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-600/30 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setCurrentScreen('news')}>
          <CardHeader className="text-center pb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 relative">
              <Newspaper className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base text-blue-400">News</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <p className="text-gray-400 text-xs">
              {unreadCount > 0 ? `${unreadCount} new updates` : 'Latest updates'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setCurrentScreen('leaderboard')}>
          <CardHeader className="text-center pb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:from-yellow-500 group-hover:to-orange-500 transition-all shadow-lg shadow-yellow-500/25">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base text-yellow-400">Leaderboards</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <p className="text-gray-400 text-xs">
              Top Grand Champions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-600/30 hover:border-red-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setCurrentScreen('tournaments')}>
          <CardHeader className="text-center pb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:from-red-500 group-hover:to-pink-500 transition-all shadow-lg shadow-red-500/25">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base text-red-400">Tournaments</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <p className="text-gray-400 text-xs">
              Competitive brackets
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          <Zap className="w-4 h-4 text-yellow-500" />
          Click or press spacebar to score points during matches
        </div>
      </div>
    </div>
  );
}
