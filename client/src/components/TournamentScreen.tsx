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
    nextSynergyCupTime,
    joinTournamentQueue, 
    startTournamentForTesting, 
    calculateNextTournamentTime,
    calculateNextSynergyCupTime,
    isQueued,
    queuedTournamentType,
    tournamentTitles,
    seasonTournamentWins,
    currentSeason,
    isEligibleForSynergyCup
  } = useTournament();

  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [timeUntilSynergyCup, setTimeUntilSynergyCup] = useState('');

  useEffect(() => {
    calculateNextTournamentTime();
    calculateNextSynergyCupTime();
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

  useEffect(() => {
    const updateSynergyCupCountdown = () => {
      if (!nextSynergyCupTime) return;
      
      const now = Date.now();
      const timeLeft = nextSynergyCupTime - now;

      if (timeLeft <= 0) {
        setTimeUntilSynergyCup('Starting soon!');
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeUntilSynergyCup(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeUntilSynergyCup(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilSynergyCup(`${minutes}m`);
      }
    };

    updateSynergyCupCountdown();
    const interval = setInterval(updateSynergyCupCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextSynergyCupTime]);

  const handleJoinQueue = (type: TournamentType) => {
    joinTournamentQueue(type);
  };

  const handleTestTournament = async (type: TournamentType) => {
    await startTournamentForTesting(type);
    setCurrentScreen('tournament-bracket');
  };

  const tournamentModes: Array<{
    type: TournamentType;
    title: string;
    description: string;
    icon: React.ReactNode;
    playerCount: string;
    special?: boolean;
    eligibilityRequired?: boolean;
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
    },
    {
      type: 'synergy-cup',
      title: '🏆 Synergy Cup',
      description: 'Elite 2v2 for Grand Champions only',
      icon: <Trophy className="h-8 w-8 text-yellow-400" />,
      playerCount: '48 teams (96 players)',
      special: true,
      eligibilityRequired: true
    }
  ];

  // Get current season tournament wins
  const getCurrentSeasonWins = (type: TournamentType) => {
    return seasonTournamentWins[`s${currentSeason}-${type}`] || 0;
  };

  // Get player's current rank and eligibility
  const playerRankInfo = getRankInfo(playerData.mmr['1v1']); // Use 1v1 MMR for overall rank
  const playerRank = playerRankInfo.name.includes('Grand Champion') ? 'Grand Champion' : playerRankInfo.name;
  const isGrandChampion = Math.max(playerData.mmr['1v1'], playerData.mmr['2v2'], playerData.mmr['3v3']) >= 2550;

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
        
        <div className="text-right space-y-2">
          <div>
            <div className="text-sm text-gray-400">Next Tournament</div>
            <div className="flex items-center gap-1 text-lg font-bold text-white">
              <Clock className="h-5 w-5" />
              {timeUntilNext}
            </div>
          </div>
          {isGrandChampion && (
            <div>
              <div className="text-sm text-yellow-400">🏆 Synergy Cup</div>
              <div className="flex items-center gap-1 text-lg font-bold text-yellow-400">
                <Clock className="h-5 w-5" />
                {timeUntilSynergyCup}
              </div>
            </div>
          )}
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

      {/* RCCS Championship Series */}
      <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-500/50 mb-6">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6" />
            🏆 RCCS - Ranked Clicker Championship Series
          </CardTitle>
          <p className="text-gray-300">
            The ultimate competitive tournament series. Qualify through multiple stages to become the World Champion.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <div>Format: 3v3 Teams • Stages: Qualifiers → Regionals → Majors → Worlds</div>
              <div>Eligibility: Champion III+ Required • Seasonal Championship</div>
            </div>
            <Button 
              onClick={() => setCurrentScreen('rccs')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
            >
              View RCCS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Modes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tournamentModes.map((mode) => {
          // Handle eligibility for special tournaments
          if (mode.eligibilityRequired && !isGrandChampion && mode.type === 'synergy-cup') {
            return (
              <Card 
                key={mode.type} 
                className="bg-gray-800 border-gray-700 opacity-50"
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
                  <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                    <div className="text-center text-red-400 text-sm">
                      <div className="font-bold">Locked</div>
                      <div>Requires Grand Champion rank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card 
              key={mode.type} 
              className={`transition-all duration-200 ${
                mode.special 
                  ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/50 hover:border-yellow-400' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              } ${isQueued && queuedTournamentType === mode.type ? 'ring-2 ring-yellow-500 border-yellow-500' : ''}`}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  {mode.icon}
                </div>
                <CardTitle className={mode.special ? "text-yellow-400" : "text-white"}>
                  {mode.title}
                </CardTitle>
                <p className="text-sm text-gray-400">{mode.description}</p>
                <Badge 
                  variant="outline" 
                  className={`mx-auto ${mode.special ? 'border-yellow-400 text-yellow-400' : ''}`}
                >
                  {mode.playerCount}
                </Badge>
                {mode.special && (
                  <Badge 
                    variant="outline" 
                    className="mx-auto mt-1 border-yellow-400 text-yellow-400"
                  >
                    Double Elimination
                  </Badge>
                )}
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
                    className={`w-full text-white ${
                      mode.special 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isQueued && queuedTournamentType === mode.type 
                      ? 'In Queue' 
                      : 'Join Queue'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                      title.color === 'green' ? 'text-green-400' : 
                      title.color === 'aqua' ? 'text-cyan-400' : 'text-white'
                    }`}>
                      {title.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(title.dateAwarded).toLocaleDateString()}
                    </div>
                  </div>
                  <Trophy className={`h-4 w-4 ${
                    title.color === 'golden' ? 'text-yellow-400' : 
                    title.color === 'green' ? 'text-green-400' : 
                    title.color === 'aqua' ? 'text-cyan-400' : 'text-gray-400'
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