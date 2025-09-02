import React, { useState, useEffect } from 'react';
import { useTournament, TournamentType } from '../stores/useTournament';
import { usePlayerData } from '../stores/usePlayerData';
import { useGameState } from '../stores/useGameState';
import { getRankInfo } from '../utils/rankingSystem';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Trophy, Clock, Users, Zap, Crown, Medal } from 'lucide-react';

export function TournamentScreen() {
  const { setCurrentScreen } = useGameState();
  const { playerData } = usePlayerData();
  const { 
    nextTournamentTime, 
    joinTournamentQueue, 
    startTournamentForTesting, 
    calculateNextTournamentTime,
    isQueued,
    queuedTournamentType,
    tournamentTitles,
    seasonTournamentWins,
    currentSeason
  } = useTournament();

  const [timeUntilNext, setTimeUntilNext] = useState('');

  useEffect(() => {
    calculateNextTournamentTime();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      if (!nextTournamentTime) return;
      
      const now = Date.now();
      const timeLeft = nextTournamentTime - now;

      if (timeLeft <= 0) {
        setTimeUntilNext('Starting now!');
        return;
      }

      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      if (minutes > 0) {
        setTimeUntilNext(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilNext(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextTournamentTime]);

  const handleJoinQueue = (type: TournamentType) => {
    joinTournamentQueue(type);
  };

  const handleTestTournament = (type: TournamentType) => {
    startTournamentForTesting(type);
    setCurrentScreen('tournament-bracket');
  };

  const tournamentModes: Array<{
    type: TournamentType;
    title: string;
    description: string;
    icon: React.ReactNode;
    playerCount: string;
  }> = [
    {
      type: '1v1',
      title: '1v1 Tournament',
      description: 'Pure skill, head-to-head competition',
      icon: <Zap className="h-8 w-8 text-blue-400" />,
      playerCount: '8 players'
    },
    {
      type: '2v2',
      title: '2v2 Tournament', 
      description: 'Team coordination and strategy',
      icon: <Users className="h-8 w-8 text-green-400" />,
      playerCount: '8 teams (16 players)'
    },
    {
      type: '3v3',
      title: '3v3 Tournament',
      description: 'Large team battles and tactics',
      icon: <Crown className="h-8 w-8 text-purple-400" />,
      playerCount: '4 teams (12 players)'
    }
  ];

  // Get current season tournament wins
  const getCurrentSeasonWins = (type: TournamentType) => {
    return seasonTournamentWins[`s${currentSeason}-${type}`] || 0;
  };

  // Get player's current rank
  const playerRankInfo = getRankInfo(playerData.mmr['1v1']); // Use 1v1 MMR for overall rank
  const playerRank = playerRankInfo.name.includes('Grand Champion') ? 'Grand Champion' : playerRankInfo.name;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentScreen('main')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Tournaments</h1>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Next Tournament</div>
          <div className="flex items-center gap-1 text-lg font-bold text-white">
            <Clock className="h-5 w-5" />
            {timeUntilNext}
          </div>
        </div>
      </div>

      {/* Tournament Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Medal className="h-5 w-5 text-yellow-400" />
            Tournament Format
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-2">
          <p><strong className="text-white">5 Rounds Total:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-900/50 p-3 rounded">
              <div className="text-yellow-400 font-bold">Rounds 1-3</div>
              <div className="text-sm">Best of 1 (Elimination)</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded">
              <div className="text-orange-400 font-bold">Round 4</div>
              <div className="text-sm">Best of 3 (Semifinal)</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded">
              <div className="text-red-400 font-bold">Round 5</div>
              <div className="text-sm">Best of 5 (Final)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tournamentModes.map((mode) => (
          <Card 
            key={mode.type} 
            className={`bg-gray-800 border-gray-700 transition-all duration-200 hover:border-gray-600 ${
              isQueued && queuedTournamentType === mode.type ? 'ring-2 ring-yellow-500 border-yellow-500' : ''
            }`}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2">
                {mode.icon}
              </div>
              <CardTitle className="text-white">{mode.title}</CardTitle>
              <p className="text-sm text-gray-400">{mode.description}</p>
              <Badge variant="outline" className="mx-auto">
                {mode.playerCount}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Season Stats */}
              <div className="bg-gray-900/50 p-3 rounded">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {getCurrentSeasonWins(mode.type)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Season {currentSeason} Wins
                  </div>
                  {getCurrentSeasonWins(mode.type) >= 3 && (
                    <Badge 
                      variant="outline" 
                      className={`mt-1 ${
                        playerRank === 'Grand Champion' 
                          ? 'border-yellow-400 text-yellow-400' 
                          : 'border-green-400 text-green-400'
                      }`}
                    >
                      {playerRank === 'Grand Champion' ? 'Golden' : 'Green'} Titles
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleJoinQueue(mode.type)}
                  disabled={isQueued}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isQueued && queuedTournamentType === mode.type 
                    ? 'In Queue' 
                    : 'Join Queue'
                  }
                </Button>
                <Button
                  onClick={() => handleTestTournament(mode.type)}
                  variant="outline"
                  className="w-full text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  Start Test Tournament
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tournament Titles */}
      {tournamentTitles.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Tournament Titles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tournamentTitles.slice(-6).reverse().map((title) => (
                <div 
                  key={title.id} 
                  className="bg-gray-900/50 p-3 rounded flex items-center justify-between"
                >
                  <div>
                    <div className={`font-bold text-sm ${
                      title.color === 'golden' ? 'text-yellow-400' : 
                      title.color === 'green' ? 'text-green-400' : 'text-white'
                    }`}>
                      {title.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(title.dateAwarded).toLocaleDateString()}
                    </div>
                  </div>
                  <Trophy className={`h-4 w-4 ${
                    title.color === 'golden' ? 'text-yellow-400' : 
                    title.color === 'green' ? 'text-green-400' : 'text-gray-400'
                  }`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}