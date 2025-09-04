import React, { useState, useEffect } from 'react';
import { useRCCSTournament } from '../stores/useRCCSTournament';
import { usePlayerData } from '../stores/usePlayerData';
import { useGameState } from '../stores/useGameState';
import { getRankInfo } from '../utils/rankingSystem';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Users, 
  Target, 
  Star, 
  Award, 
  Crown,
  Flame,
  Zap
} from 'lucide-react';

export function RCCSTournamentScreen() {
  const { setCurrentScreen } = useGameState();
  const { playerData } = usePlayerData();
  const { 
    currentTournament,
    playerRegistered,
    playerTeam,
    currentSeason,
    seasonEndDate,
    checkTournamentEligibility,
    registerPlayerForTournament,
    advanceTournament,
    forceStartTournament
  } = useRCCSTournament();

  const [timeUntilSeasonEnd, setTimeUntilSeasonEnd] = useState('');
  
  useEffect(() => {
    const updateCountdown = () => {
      if (!seasonEndDate) return;
      
      const now = Date.now();
      const timeLeft = seasonEndDate.getTime() - now;

      if (timeLeft <= 0) {
        setTimeUntilSeasonEnd('Season ended');
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeUntilSeasonEnd(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeUntilSeasonEnd(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilSeasonEnd(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [seasonEndDate]);

  // Get player's highest MMR to check eligibility
  const highestMMR = Math.max(playerData.mmr['1v1'], playerData.mmr['2v2'], playerData.mmr['3v3']);
  const isEligible = checkTournamentEligibility(highestMMR);
  const rankInfo = getRankInfo(highestMMR);

  const handleRegister = () => {
    if (isEligible) {
      registerPlayerForTournament(playerData.username, highestMMR);
    }
  };

  const handleAdvanceTournament = () => {
    if (currentTournament) {
      advanceTournament();
    }
  };

  // Tournament stage information
  const stageInfo = {
    qualifiers: {
      title: 'Qualifiers',
      description: 'Open to all Champion III+ players. Top 32 teams advance.',
      icon: <Target className="h-6 w-6 text-blue-400" />,
      maxTeams: 160,
      advanceCount: 32,
      color: 'blue'
    },
    regionals: {
      title: 'Regionals',
      description: 'Four regional tournaments. Top 6 from each advance to Majors.',
      icon: <Star className="h-6 w-6 text-green-400" />,
      maxTeams: 32,
      advanceCount: 6,
      color: 'green'
    },
    majors: {
      title: 'Majors',
      description: 'Two major tournaments. Top 6 from each advance to Worlds.',
      icon: <Award className="h-6 w-6 text-purple-400" />,
      maxTeams: 12,
      advanceCount: 6,
      color: 'purple'
    },
    worlds: {
      title: 'Worlds',
      description: 'The ultimate showdown. 12 best teams compete for the championship.',
      icon: <Crown className="h-6 w-6 text-yellow-400" />,
      maxTeams: 12,
      advanceCount: 1,
      color: 'yellow'
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentScreen('tournaments')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">RCCS Season {currentSeason}</h1>
          </div>
        </div>
        
        <div className="text-right space-y-2">
          <div>
            <div className="text-sm text-gray-400">Season Ends In</div>
            <div className="flex items-center gap-1 text-lg font-bold text-white">
              <Clock className="h-5 w-5" />
              {timeUntilSeasonEnd}
            </div>
          </div>
          <div>
            <div className="text-sm text-cyan-400">Your Rank</div>
            <div className="text-lg font-bold" style={{ color: rankInfo.color }}>
              {rankInfo.name} {rankInfo.division}
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Format Overview */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-cyan-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-cyan-400" />
            RCCS Tournament Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stageInfo).map(([stage, info]) => (
              <div 
                key={stage} 
                className={`bg-gray-900/50 p-4 rounded-lg border border-${info.color}-500/30`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {info.icon}
                  <div className={`font-bold text-${info.color}-400`}>{info.title}</div>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  {info.description}
                </div>
                <div className="text-xs text-gray-400">
                  {info.maxTeams} teams → {info.advanceCount} advance
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Check */}
      {!isEligible && (
        <Card className="bg-red-900/20 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Eligibility Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <div className="space-y-2">
              <p>You need Champion III or higher to participate in the RCCS tournament.</p>
              <p>Your current rank: <span style={{ color: rankInfo.color }}>{rankInfo.name} {rankInfo.division}</span></p>
              <p>Required: <span className="text-purple-400">Champion III</span> (2350+ MMR)</p>
              <div className="mt-3">
                <Progress 
                  value={(highestMMR / 2350) * 100} 
                  className="w-full"
                />
                <div className="text-sm text-gray-400 mt-1">
                  {highestMMR} / 2350 MMR ({Math.max(0, 2350 - highestMMR)} MMR needed)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tournament Registration */}
      {isEligible && !playerRegistered && !currentTournament && (
        <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              RCCS Tournament Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-white">
              <p>You're eligible to compete in the RCCS Season {currentSeason} tournament!</p>
              <p className="text-sm text-gray-300 mt-2">
                Format: 3v3 teams (you + 2 AI teammates) competing through Qualifiers, Regionals, Majors, and Worlds.
              </p>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="text-yellow-400 font-bold mb-2">Potential Rewards:</div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• <span className="text-cyan-400">RCCS S{currentSeason} Challenger</span> (Top 60 Qualifiers)</div>
                <div>• <span className="text-cyan-400">RCCS S{currentSeason} Contender</span> (Top 32 Qualifiers)</div>
                <div>• <span className="text-cyan-400">RCCS S{currentSeason} Regional Champion</span> (Regional Winners)</div>
                <div>• <span className="text-cyan-400">RCCS S{currentSeason} World Champion</span> (Ultimate Winner)</div>
              </div>
            </div>

            <Button 
              onClick={handleRegister}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg py-3"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Register for RCCS Tournament
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Tournament Status */}
      {currentTournament && playerTeam && (
        <div className="space-y-4">
          {/* Current Tournament Info */}
          <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-cyan-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {stageInfo[currentTournament.stage].icon}
                RCCS {stageInfo[currentTournament.stage].title}
                {currentTournament.stageNumber && ` ${currentTournament.stageNumber}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tournament Status */}
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Tournament Status</div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      currentTournament.status === 'completed' 
                        ? 'border-green-500 text-green-400' 
                        : currentTournament.status === 'active'
                        ? 'border-yellow-500 text-yellow-400'
                        : 'border-blue-500 text-blue-400'
                    }`}
                  >
                    {currentTournament.status.charAt(0).toUpperCase() + currentTournament.status.slice(1)}
                  </Badge>
                  <div className="text-white">
                    {currentTournament.teams.length} / {stageInfo[currentTournament.stage].maxTeams} teams
                  </div>
                </div>

                {/* Team Info */}
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Your Team</div>
                  <div className="text-white font-bold">{playerTeam.playerName}</div>
                  <div className="text-sm text-gray-300">
                    Average MMR: {playerTeam.averageMMR}
                  </div>
                  <div className="text-xs text-gray-400">
                    Teammates: {playerTeam.teammate1.name}, {playerTeam.teammate2.name}
                  </div>
                </div>

                {/* Current Standing */}
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Current Standing</div>
                  {playerTeam.placement ? (
                    <div className={`text-2xl font-bold ${
                      playerTeam.placement <= 6 ? 'text-green-400' :
                      playerTeam.placement <= 32 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      #{playerTeam.placement}
                    </div>
                  ) : (
                    <div className="text-white">TBD</div>
                  )}
                  {playerTeam.eliminated && (
                    <Badge variant="destructive">Eliminated</Badge>
                  )}
                </div>
              </div>

              {/* Tournament Progress */}
              {currentTournament.status === 'active' && !playerTeam.eliminated && (
                <div className="mt-6">
                  <Button 
                    onClick={handleAdvanceTournament}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Simulate Tournament Stage
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Standings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Team Standings - {stageInfo[currentTournament.stage].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentTournament.teams
                  .filter(team => team.placement)
                  .sort((a, b) => (a.placement || 999) - (b.placement || 999))
                  .slice(0, 20)
                  .map((team) => (
                    <div 
                      key={team.id} 
                      className={`flex items-center justify-between p-2 rounded ${
                        team.id === playerTeam?.id 
                          ? 'bg-blue-900/30 border border-blue-500' 
                          : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          team.placement === 1 ? 'bg-yellow-500 text-black' :
                          team.placement === 2 ? 'bg-gray-300 text-black' :
                          team.placement === 3 ? 'bg-amber-600 text-white' :
                          (team.placement || 999) <= stageInfo[currentTournament.stage].advanceCount 
                            ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          #{team.placement}
                        </div>
                        <div>
                          <div className={`font-medium ${
                            team.id === playerTeam?.id ? 'text-blue-400' : 'text-white'
                          }`}>
                            {team.playerName}
                            {team.id === playerTeam?.id && ' (You)'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Avg MMR: {team.averageMMR}
                          </div>
                        </div>
                      </div>
                      {(team.placement || 999) <= stageInfo[currentTournament.stage].advanceCount && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Qualified
                        </Badge>
                      )}
                      {team.eliminated && (
                        <Badge variant="destructive">
                          Eliminated
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Controls */}
      <Card className="bg-gray-900/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-gray-400 text-sm">Debug Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => forceStartTournament('qualifiers')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Force Qualifiers
            </Button>
            <Button 
              onClick={() => forceStartTournament('regionals')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Force Regionals
            </Button>
            <Button 
              onClick={() => forceStartTournament('majors')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Force Majors
            </Button>
            <Button 
              onClick={() => forceStartTournament('worlds')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Force Worlds
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}