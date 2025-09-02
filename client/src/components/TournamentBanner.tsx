import React, { useState, useEffect } from 'react';
import { useTournament } from '../stores/useTournament';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Trophy, Clock, Users, X } from 'lucide-react';

export function TournamentBanner() {
  const { 
    isQueued, 
    queuedTournamentType, 
    queuePosition, 
    nextTournamentTime,
    leaveTournamentQueue 
  } = useTournament();

  const [timeUntilTournament, setTimeUntilTournament] = useState('');

  useEffect(() => {
    if (!isQueued || !nextTournamentTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = nextTournamentTime - now;

      if (timeLeft <= 0) {
        setTimeUntilTournament('Starting soon...');
        return;
      }

      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      if (minutes > 0) {
        setTimeUntilTournament(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilTournament(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isQueued, nextTournamentTime]);

  if (!isQueued) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-900/90 to-orange-900/90 border-yellow-500/50 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <span className="text-lg font-bold text-white">
                  Tournament Queue
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-300" />
                  <span className="text-gray-300">{queuedTournamentType}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-300" />
                  <span className="text-gray-300">{timeUntilTournament}</span>
                </div>
                
                <div className="text-gray-300">
                  Position: #{queuePosition}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={leaveTournamentQueue}
              className="bg-red-900/50 border-red-500/50 text-red-200 hover:bg-red-800/50 hover:text-red-100"
            >
              <X className="h-4 w-4 mr-1" />
              Leave Queue
            </Button>
          </div>
          
          <div className="mt-3 bg-black/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${Math.max(10, Math.min(100, ((Date.now() - (nextTournamentTime - 600000)) / 600000) * 100))}%` 
              }}
            />
          </div>
          
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-400">
              All game modes are locked while in tournament queue
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}