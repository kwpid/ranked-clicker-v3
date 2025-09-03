import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../stores/useGameState';
import { usePlayerData } from '../stores/usePlayerData';
import { useTournament } from '../stores/useTournament';
import { generateAIOpponents, simulateAIClicks } from '../utils/aiOpponents';
import { calculateMMRChange } from '../utils/rankingSystem';
import { getTitleStyle, formatTitleStyle } from '../utils/titleUtils';
import { setPageTitle, resetPageTitle } from '../utils/pageTitle';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, Clock, Zap, Trophy } from 'lucide-react';

interface GameState {
  phase: 'countdown' | 'playing' | 'finished';
  timeLeft: number;
  playerScore: number;
  teamScore: number;
  opponentTeamScore: number;
  opponents: Array<{ name: string; score: number; isAI: boolean; isTeammate: boolean; hasForfeited?: boolean }>;
  dontClickMode: boolean;
  dontClickStartTime: number;
}

export function GameScreen() {
  const { gameMode, queueMode, setCurrentScreen, tournamentContext, setTournamentContext, opponents: globalOpponents } = useGameState();
  const { playerData, updateMMR, updateStats, getAvailableTitles } = usePlayerData();
  const { completeTournamentGame } = useTournament();
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'countdown',
    timeLeft: 3,
    playerScore: 0,
    teamScore: 0,
    opponentTeamScore: 0,
    opponents: [],
    dontClickMode: false,
    dontClickStartTime: 0
  });

  const [countdownTime, setCountdownTime] = useState(3);
  const [gameTime, setGameTime] = useState(() => {
    // Random game time between 30-50 seconds for realistic AI game completion
    return 30 + Math.floor(Math.random() * 21);
  });

  // Set page title when game starts
  useEffect(() => {
    if (gameState.phase === 'playing') {
      setPageTitle('In Game - Ranked Clicker');
    } else if (gameState.phase === 'finished') {
      setPageTitle('Game Complete - Ranked Clicker');
    }
    
    return () => {
      if (gameState.phase === 'finished') {
        resetPageTitle();
      }
    };
  }, [gameState.phase]);

  // Initialize opponents and game only once when component mounts
  useEffect(() => {
    console.log('👥 GameScreen opponent setup:', { gameMode, queueMode, globalOpponents, localOpponents: gameState.opponents });
    
    if (gameMode && queueMode !== 'tournament' && gameState.opponents.length === 0) {
      // Only generate AI opponents for non-tournament games
      console.log('🤖 Generating regular AI opponents');
      const currentMMR = playerData.mmr[gameMode];
      const opponents = generateAIOpponents(gameMode, currentMMR);
      setGameState(prev => ({ ...prev, opponents }));
    } else if (queueMode === 'tournament' && globalOpponents.length > 0) {
      // Use tournament opponents from global state
      console.log('🏆 Using tournament opponents from global state:', globalOpponents);
      const convertedOpponents = globalOpponents.map(o => ({
        name: o.name,
        score: 0,
        isAI: true,
        isTeammate: o.isTeammate,
        title: o.title || 'Tournament Opponent'
      }));
      console.log('✅ Converted opponents:', convertedOpponents);
      setGameState(prev => ({ ...prev, opponents: convertedOpponents }));
    }
  }, [gameMode, queueMode, globalOpponents]); // Depend on globalOpponents as well

  // Handle clicking/spacebar
  const handleClick = useCallback(() => {
    if (gameState.phase === 'playing') {
      if (gameState.dontClickMode) {
        // Player clicked during "don't click" mode - lose points
        setGameState(prev => ({
          ...prev,
          playerScore: Math.max(0, prev.playerScore - 2)
        }));
      } else {
        // Normal click - gain points
        setGameState(prev => ({
          ...prev,
          playerScore: prev.playerScore + 1
        }));
      }
    }
  }, [gameState.phase, gameState.dontClickMode]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick]);

  // Game timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState.phase === 'countdown') {
      interval = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            setGameState(current => ({ ...current, phase: 'playing' }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState.phase === 'playing') {
      interval = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            setGameState(current => ({ ...current, phase: 'finished' }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.phase]);

  // Don't click mode logic
  useEffect(() => {
    if (gameState.phase === 'playing') {
      const dontClickInterval = setInterval(() => {
        // Random chance to trigger "don't click" mode every 5-15 seconds
        if (!gameState.dontClickMode && Math.random() < 0.05) { // 5% chance per second
          setGameState(prev => ({
            ...prev,
            dontClickMode: true,
            dontClickStartTime: Date.now()
          }));
          
          // End don't click mode after 1-3 seconds
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              dontClickMode: false
            }));
          }, 1000 + Math.random() * 2000);
        }
      }, 1000);

      return () => clearInterval(dontClickInterval);
    }
  }, [gameState.phase, gameState.dontClickMode]);

  // AI simulation during game with forfeit logic
  useEffect(() => {
    if (gameState.phase === 'playing') {
      const interval = setInterval(() => {
        setGameState(prev => {
          const updatedOpponents = prev.opponents.map(opponent => {
            if (opponent.isAI && !opponent.hasForfeited) {
              // Check for forfeit conditions (too far behind with little time)
              const teamScore = prev.playerScore + prev.opponents
                .filter(o => o.isTeammate && !o.hasForfeited)
                .reduce((sum, o) => sum + o.score, 0);
              const enemyScore = prev.opponents
                .filter(o => !o.isTeammate && !o.hasForfeited)
                .reduce((sum, o) => sum + o.score, 0);
              
              const scoreDifference = opponent.isTeammate ? 
                (enemyScore - teamScore) : (teamScore - enemyScore);
              
              // Forfeit if more than 15 points behind with less than 20 seconds left
              if (scoreDifference > 15 && gameTime < 20 && Math.random() < 0.1) {
                return { ...opponent, hasForfeited: true };
              }
              
              // AI reaction time simulation for "don't click" mode
              let additionalClicks = 0;
              if (prev.dontClickMode) {
                const reactionTime = Date.now() - prev.dontClickStartTime;
                // AI has 200-800ms reaction time
                const aiReactionTime = 200 + Math.random() * 600;
                
                if (reactionTime < aiReactionTime) {
                  // AI clicked during "don't click" mode - lose points
                  additionalClicks = -2;
                }
              } else {
                // Normal AI clicking
                additionalClicks = simulateAIClicks(playerData.mmr[gameMode!]);
              }
              
              return { ...opponent, score: Math.max(0, opponent.score + additionalClicks) };
            }
            return opponent;
          });

          // Calculate team scores (excluding forfeited players)
          const playerTeamTotal = prev.playerScore + updatedOpponents
            .filter(o => o.isTeammate && !o.hasForfeited)
            .reduce((sum, o) => sum + o.score, 0);
          
          const opponentTeamTotal = updatedOpponents
            .filter(o => !o.isTeammate && !o.hasForfeited)
            .reduce((sum, o) => sum + o.score, 0);

          return {
            ...prev,
            opponents: updatedOpponents,
            teamScore: playerTeamTotal,
            opponentTeamScore: opponentTeamTotal
          };
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState.phase]);

  // Handle game end
  useEffect(() => {
    if (gameState.phase === 'finished') {
      const isWin = gameState.teamScore > gameState.opponentTeamScore;
      
      if (queueMode === 'tournament' && tournamentContext.isActive) {
        // Handle tournament game completion
        const opponentScores: { [id: string]: number } = {};
        
        // For tournament games, we need to calculate the enemy team's total score
        const enemyOpponents = gameState.opponents.filter(o => !o.isTeammate);
        const totalEnemyScore = enemyOpponents.reduce((sum, o) => sum + o.score, 0);
        
        // Use the first enemy opponent's name as the key with total enemy team score
        if (enemyOpponents.length > 0) {
          opponentScores[enemyOpponents[0].name] = totalEnemyScore;
        }
        
        completeTournamentGame(
          tournamentContext.matchId!,
          isWin,
          gameState.playerScore,
          opponentScores
        );
        
        // Update tournament context for next game
        const newGamesWon = isWin ? tournamentContext.gamesWon + 1 : tournamentContext.gamesWon;
        const newGamesLost = !isWin ? tournamentContext.gamesLost + 1 : tournamentContext.gamesLost;
        const gamesNeededToWin = Math.ceil(tournamentContext.bestOf / 2);
        
        if (newGamesWon >= gamesNeededToWin || newGamesLost >= gamesNeededToWin) {
          // Match is complete, return to bracket
          setTournamentContext({
            isActive: false,
            matchId: null,
            currentGame: 1,
            bestOf: 1,
            gamesWon: 0,
            gamesLost: 0
          });
          setTimeout(() => {
            setCurrentScreen('tournament-bracket');
          }, 3000);
        } else {
          // Continue to next game in the match
          setTournamentContext({
            ...tournamentContext,
            currentGame: tournamentContext.currentGame + 1,
            gamesWon: newGamesWon,
            gamesLost: newGamesLost
          });
          
          // Reset game state for next game
          setTimeout(() => {
            setGameState({
              phase: 'countdown',
              timeLeft: 3,
              playerScore: 0,
              teamScore: 0,
              opponentTeamScore: 0,
              opponents: gameState.opponents.map(o => ({ ...o, score: 0, hasForfeited: false })),
              dontClickMode: false,
              dontClickStartTime: 0
            });
            setCountdownTime(3);
            setGameTime(30 + Math.floor(Math.random() * 21));
          }, 3000);
        }
      } else {
        // Regular game (casual/ranked)
        if (queueMode === 'ranked') {
          const currentMMR = playerData.mmr[gameMode!];
          const mmrChange = calculateMMRChange(
            currentMMR,
            isWin,
            gameState.opponents.filter(o => !o.isTeammate).map(() => currentMMR)
          );
          updateMMR(gameMode!, mmrChange);
        }
        updateStats(gameMode!, isWin);
      }
    }
  }, [gameState.phase, gameState.teamScore, gameState.opponentTeamScore, queueMode, gameMode, updateMMR, updateStats, tournamentContext, completeTournamentGame, setTournamentContext, setCurrentScreen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReturnToMenu = () => {
    if (tournamentContext.isActive) {
      setCurrentScreen('tournament-bracket');
    } else {
      setCurrentScreen('main');
    }
  };

  const getTournamentStatusText = () => {
    if (!tournamentContext.isActive) return '';
    const gamesNeededToWin = Math.ceil(tournamentContext.bestOf / 2);
    return `Game ${tournamentContext.currentGame} of ${tournamentContext.bestOf} | Win ${gamesNeededToWin} to advance | Won: ${tournamentContext.gamesWon} Lost: ${tournamentContext.gamesLost}`;
  };

  if (gameState.phase === 'countdown') {
    return (
      <div className="max-w-md mx-auto text-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12">
            <div className="text-6xl font-bold text-white mb-4 animate-pulse">
              {countdownTime}
            </div>
            <div className="text-xl text-gray-400">Get ready to click!</div>
            <div className="text-sm text-gray-500 mt-4">
              {queueMode === 'tournament' ? 'Tournament' : queueMode === 'ranked' ? 'Ranked' : 'Casual'} {gameMode}
              {tournamentContext.isActive && (
                <div className="text-xs text-yellow-400 mt-1">
                  {getTournamentStatusText()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWin = gameState.teamScore > gameState.opponentTeamScore;
  
  // Get player's equipped title for display
  const playerTitle = getAvailableTitles().find(t => t.id === playerData.equippedTitle)?.name;
  
  const playerTeam = [
    { 
      name: playerData.username, 
      score: gameState.playerScore, 
      isPlayer: true, 
      isAI: false,
      isTeammate: true,
      hasForfeited: false,
      title: playerTitle
    },
    ...gameState.opponents.filter(o => o.isTeammate).map(opponent => ({
      ...opponent,
      isPlayer: false,
      hasForfeited: opponent.hasForfeited || false,
      title: undefined
    }))
  ];
  const opponentTeam = gameState.opponents.filter(o => !o.isTeammate).map(opponent => ({
    ...opponent,
    isPlayer: false,
    hasForfeited: opponent.hasForfeited || false,
    title: undefined
  }));

  return (
    <div className="max-w-4xl mx-auto">
      {gameState.phase === 'finished' && (
        <div className="mb-6">
          <Card className={`border-2 ${isWin ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
            <CardHeader className="text-center">
              <CardTitle className={`text-3xl ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {isWin ? 'Victory!' : 'Defeat!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {gameState.teamScore} - {gameState.opponentTeamScore}
              </div>
              {queueMode === 'ranked' && (
                <div className="text-sm text-gray-400">
                  MMR Change: {isWin ? '+' : ''}{calculateMMRChange(
                    playerData.mmr[gameMode!],
                    isWin,
                    gameState.opponents.filter(o => !o.isTeammate).map(() => playerData.mmr[gameMode!])
                  )}
                </div>
              )}
              <Button
                onClick={handleReturnToMenu}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Return to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Game Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5" />
              {gameState.phase === 'playing' ? 'Time Remaining' : 'Final Time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white text-center">
              {gameState.phase === 'playing' ? formatTime(gameTime) : '0:00'}
            </div>
            <div className="text-center mt-4">
              <Button
                onClick={handleClick}
                disabled={gameState.phase !== 'playing'}
                className={`text-white text-lg px-8 py-4 shadow-lg transition-all duration-200 ${
                  gameState.dontClickMode 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25 animate-pulse' 
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                }`}
              >
                <Zap className="w-5 h-5 mr-2" />
                {gameState.dontClickMode ? "DON'T CLICK!" : `CLICK (${gameState.playerScore})`}
              </Button>
              {gameState.dontClickMode && (
                <div className="text-red-400 text-sm mt-2 font-bold animate-bounce">
                  ⚠️ STOP CLICKING OR LOSE POINTS! ⚠️
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              Team Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-semibold">Your Team</span>
                <span className="text-2xl font-bold text-white">{gameState.teamScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-semibold">Enemy Team</span>
                <span className="text-2xl font-bold text-white">{gameState.opponentTeamScore}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Team */}
        <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-400">Your Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {playerTeam.map((player, index) => (
                <div key={index} className={`flex justify-between items-center p-2 bg-gray-700 rounded ${
                  player.hasForfeited ? 'opacity-50' : ''
                }`}>
                  <div className="flex flex-col">
                    <span className={player.isPlayer ? 'font-bold text-blue-400' : 'text-white'}>
                      {player.name}
                      {player.isPlayer && ' (You)'}
                      {player.hasForfeited && ' [FORFEITED]'}
                    </span>
                    {player.title && (
                      <span 
                        className="text-xs font-medium"
                        style={formatTitleStyle(getTitleStyle(player.title))}
                      >
                        {player.title}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-semibold">{player.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opponent Team */}
        <Card className="bg-gray-800 border-gray-700 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-red-400">Enemy Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {opponentTeam.map((opponent, index) => (
                <div key={index} className={`flex justify-between items-center p-2 bg-gray-700 rounded ${
                  opponent.hasForfeited ? 'opacity-50' : ''
                }`}>
                  <div className="flex flex-col">
                    <span className="text-white">
                      {opponent.name}
                      {opponent.hasForfeited && ' [FORFEITED]'}
                    </span>
                    {opponent.title && (
                      <span 
                        className="text-xs font-medium"
                        style={formatTitleStyle(getTitleStyle(opponent.title))}
                      >
                        {opponent.title}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-semibold">{opponent.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {gameState.phase === 'playing' && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-400">
            Click the button above or press <kbd className="bg-gray-700 px-2 py-1 rounded text-white">SPACE</kbd> to score points!
          </div>
        </div>
      )}
    </div>
  );
}
