import React from 'react';
import { useGameState } from '../stores/useGameState';
import { useTournament } from '../stores/useTournament';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Users, Zap, Crown } from 'lucide-react';

export function MainMenu() {
  const { setQueueMode, setCurrentScreen } = useGameState();
  const { isGameModeBlocked } = useTournament();

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

      {/* Secondary Options */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
        <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer group flex-1 max-w-xs"
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

        <Card className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-600/30 hover:border-red-500/50 transition-all duration-300 cursor-pointer group flex-1 max-w-xs"
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
