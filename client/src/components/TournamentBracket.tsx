import React from 'react';
import { useTournament, TournamentMatch, BracketRound } from '../stores/useTournament';
import { useGameState } from '../stores/useGameState';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Trophy, Play, Clock, Crown, Users } from 'lucide-react';

export function TournamentBracket() {
  const { setCurrentScreen } = useGameState();
  const { currentTournament, playTournamentMatch } = useTournament();

  if (!currentTournament) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12">
            <div className="text-white text-xl">No active tournament</div>
            <Button 
              onClick={() => setCurrentScreen('tournaments')} 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rounds: BracketRound[] = ['round1', 'round2', 'round3', 'semifinal', 'final'];
  const roundNames = {
    round1: 'Round 1',
    round2: 'Round 2', 
    round3: 'Round 3',
    semifinal: 'Semifinal',
    final: 'Final'
  };

  const getBestOfText = (bestOf: number) => {
    return bestOf === 1 ? 'Best of 1' : `Best of ${bestOf}`;
  };

  const getMatchStatusColor = (match: TournamentMatch) => {
    if (match.isComplete) return 'border-green-500';
    if (match.players.some(p => p.isPlayer)) return 'border-yellow-500';
    return 'border-gray-600';
  };

  const getMatchStatusText = (match: TournamentMatch) => {
    if (match.isComplete) return 'Complete';
    if (match.players.some(p => p.isPlayer)) return 'Your Match';
    return 'AI Match';
  };

  const canPlayMatch = (match: TournamentMatch) => {
    return !match.isComplete && match.players.some(p => p.isPlayer);
  };

  const getPlayerName = (playerId: string | null, match: TournamentMatch) => {
    if (!playerId) return 'TBD';
    const player = match.players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  const isCurrentRound = (round: BracketRound) => {
    return round === currentTournament.currentRound;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-white">
              {currentTournament.type.toUpperCase()} Tournament
            </h1>
          </div>
        </div>
        
        <div className="text-right">
          <Badge 
            variant="outline" 
            className={`${
              currentTournament.phase === 'finished' 
                ? 'border-green-500 text-green-400' 
                : 'border-yellow-500 text-yellow-400'
            }`}
          >
            {currentTournament.phase === 'finished' ? 'Finished' : 'In Progress'}
          </Badge>
        </div>
      </div>

      {/* Tournament Progress */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {rounds.map((round, index) => (
              <div key={round} className="flex items-center">
                <div className={`text-center ${isCurrentRound(round) ? 'text-yellow-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    isCurrentRound(round) 
                      ? 'border-yellow-400 bg-yellow-400 text-black' 
                      : 'border-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xs mt-1">{roundNames[round]}</div>
                </div>
                {index < rounds.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-600 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tournament Bracket */}
      <div className="space-y-8">
        {rounds.map(round => {
          const roundMatches = currentTournament.matches.filter(m => m.round === round);
          if (roundMatches.length === 0) return null;

          return (
            <div key={round}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className={`text-2xl font-bold ${isCurrentRound(round) ? 'text-yellow-400' : 'text-white'}`}>
                  {roundNames[round]}
                </h2>
                {roundMatches.length > 0 && (
                  <Badge variant="outline" className="text-gray-400">
                    {getBestOfText(roundMatches[0].bestOf)}
                  </Badge>
                )}
                {isCurrentRound(round) && (
                  <Badge className="bg-yellow-600 text-black">
                    Current Round
                  </Badge>
                )}
              </div>
              
              <div className={`grid gap-4 ${
                roundMatches.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
                roundMatches.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              }`}>
                {roundMatches.map(match => (
                  <Card 
                    key={match.id} 
                    className={`bg-gray-800 border-2 ${getMatchStatusColor(match)} transition-all duration-200`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-gray-400">
                          Match {match.id.split('-')[1]}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            match.isComplete ? 'border-green-500 text-green-400' :
                            match.players.some(p => p.isPlayer) ? 'border-yellow-500 text-yellow-400' :
                            'border-gray-500 text-gray-400'
                          }`}
                        >
                          {getMatchStatusText(match)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Players */}
                      {match.players.map((player, playerIndex) => (
                        <div 
                          key={player.id} 
                          className={`flex items-center justify-between p-2 rounded ${
                            match.winner === player.id ? 'bg-green-900/30 border border-green-500' :
                            player.isPlayer ? 'bg-blue-900/30 border border-blue-500' :
                            'bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {player.isPlayer && <Crown className="h-4 w-4 text-yellow-400" />}
                            <span className={`font-medium ${
                              player.isPlayer ? 'text-blue-400' : 'text-white'
                            }`}>
                              {player.name}
                            </span>
                          </div>
                          {match.winner === player.id && (
                            <Trophy className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                      ))}

                      {/* Game Results */}
                      {match.games.length > 0 && (
                        <div className="text-xs text-gray-400 space-y-1">
                          {match.games.map((game, gameIndex) => (
                            <div key={gameIndex} className="flex justify-between">
                              <span>Game {game.gameNumber}:</span>
                              <span>
                                {Object.entries(game.scores).map(([playerId, score]) => (
                                  <span key={playerId} className="ml-2">
                                    {getPlayerName(playerId, match)}: {score}
                                  </span>
                                ))}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Button */}
                      {canPlayMatch(match) && (
                        <Button 
                          onClick={() => playTournamentMatch(match.id)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play Match
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tournament Winner */}
      {currentTournament.phase === 'finished' && (
        <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-center text-yellow-400 text-2xl flex items-center justify-center gap-2">
              <Crown className="h-8 w-8" />
              Tournament Champion
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {(() => {
              const finalMatch = currentTournament.matches.find(m => m.round === 'final');
              const winner = finalMatch && finalMatch.winner 
                ? finalMatch.players.find(p => p.id === finalMatch.winner)
                : null;
              
              return winner ? (
                <div>
                  <div className={`text-3xl font-bold mb-2 ${
                    winner.isPlayer ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {winner.name}
                    {winner.isPlayer && ' (You!)'}
                  </div>
                  {winner.isPlayer && (
                    <div className="text-green-400 text-lg">
                      🎉 Congratulations! You won the tournament! 🎉
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-white text-xl">Tournament Complete</div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}