import React from 'react';
import { useGameState } from '../stores/useGameState';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Users, Zap } from 'lucide-react';

export function MainMenu() {
  const { setQueueMode, setCurrentScreen } = useGameState();

  const handleQueueSelection = (mode: 'casual' | 'ranked') => {
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
        <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
              onClick={() => handleQueueSelection('casual')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Queue Casual</CardTitle>
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

        <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
              onClick={() => handleQueueSelection('ranked')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/25">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Queue Ranked</CardTitle>
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

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          <Zap className="w-4 h-4 text-yellow-500" />
          Click or press spacebar to score points during matches
        </div>
      </div>
    </div>
  );
}
