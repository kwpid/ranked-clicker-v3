import React from 'react';
import { useRCCSTournament } from '../stores/useRCCSTournament';
import { usePlayerData } from '../stores/usePlayerData';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { X, Trophy, Users, Clock } from 'lucide-react';

export function RCCSNotification() {
  const { playerData } = usePlayerData();
  const { 
    notifications, 
    registerPlayerForTournament, 
    declineTournamentSignup, 
    dismissNotification,
    checkTournamentEligibility 
  } = useRCCSTournament();

  // Get the highest MMR across all playlists for eligibility check
  const highestMMR = Math.max(playerData.mmr['1v1'], playerData.mmr['2v2'], playerData.mmr['3v3']);
  const isEligible = checkTournamentEligibility(highestMMR);

  // Filter to active, non-dismissed notifications
  const activeNotifications = notifications.filter(n => !n.dismissed && n.persistent);

  if (activeNotifications.length === 0) {
    return null;
  }

  const handleAction = (notification: any, action: 'signup' | 'decline') => {
    if (action === 'signup') {
      if (isEligible) {
        registerPlayerForTournament(playerData.username, highestMMR);
      } else {
        // Show eligibility message but don't dismiss - let them try to improve rank
        return;
      }
    } else if (action === 'decline') {
      declineTournamentSignup();
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      {activeNotifications.map(notification => (
        <Card 
          key={notification.id}
          className="bg-gradient-to-r from-cyan-900/90 to-purple-900/90 border-cyan-500/70 backdrop-blur-sm shadow-2xl"
        >
          <CardContent className="py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex items-center gap-2 mt-1">
                  <Trophy className="h-6 w-6 text-cyan-400 animate-pulse" />
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                    RCCS Season {notification.season}
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <div className="text-white font-bold text-lg mb-2">
                    🏆 RCCS Tournament Sign-Up
                  </div>
                  <div className="text-gray-200 mb-3">
                    {notification.message}
                  </div>
                  
                  {/* Tournament Details */}
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-cyan-300" />
                      <span className="text-cyan-300">3v3 Teams</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-300" />
                      <span className="text-yellow-300">Championship Series</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-300" />
                      <span className="text-gray-300">Multi-Stage</span>
                    </div>
                  </div>

                  {/* Eligibility Check */}
                  {!isEligible && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded p-3 mb-4">
                      <div className="text-red-300 text-sm">
                        <div className="font-bold">Champion III Required</div>
                        <div>You need 2350+ MMR to participate. Current: {highestMMR} MMR</div>
                        <div className="text-xs mt-1 text-gray-400">
                          Keep playing ranked to improve your rank!
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {notification.actions.map((action) => (
                      <Button
                        key={action.action}
                        onClick={() => handleAction(notification, action.action)}
                        className={`${
                          action.action === 'signup'
                            ? isEligible 
                              ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                              : 'bg-gray-600 hover:bg-gray-700 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        } font-medium`}
                        disabled={action.action === 'signup' && !isEligible}
                      >
                        {action.action === 'signup' && <Trophy className="h-4 w-4 mr-2" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tournament Pipeline Visualization */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Tournament Pipeline:</div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300">Qualifiers</span>
                </div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300">Regionals</span>
                </div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-300">Majors</span>
                </div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-300">Worlds</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}