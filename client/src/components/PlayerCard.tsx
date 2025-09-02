import React, { useState } from 'react';
import { usePlayerData } from '../stores/usePlayerData';
import { useGameState } from '../stores/useGameState';
import { getRankInfo } from '../utils/rankingSystem';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Edit2, Save, X } from 'lucide-react';

export function PlayerCard() {
  const { playerData, updateUsername } = usePlayerData();
  const { setCurrentScreen } = useGameState();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(playerData.username);

  const handleSaveUsername = () => {
    if (tempUsername.length >= 1 && tempUsername.length <= 20) {
      updateUsername(tempUsername);
      setIsEditingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setTempUsername(playerData.username);
    setIsEditingUsername(false);
  };

  const renderRankInfo = (playlist: '1v1' | '2v2' | '3v3') => {
    const mmr = playerData.mmr[playlist];
    const rankInfo = getRankInfo(mmr);
    
    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="text-sm text-gray-400 mb-1">{playlist}</div>
        <div className="font-semibold text-lg" style={{ color: rankInfo.color }}>
          {rankInfo.name}
        </div>
        {rankInfo.division && (
          <div className="text-sm text-gray-300">Division {rankInfo.division}</div>
        )}
        <div className="text-xs text-gray-500 mt-1">{mmr} MMR</div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditingUsername ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  maxLength={20}
                  placeholder="Username (1-20 chars)"
                />
                <Button
                  size="sm"
                  onClick={handleSaveUsername}
                  disabled={tempUsername.length < 1 || tempUsername.length > 20}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white">{playerData.username}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingUsername(true)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Season {playerData.currentSeason}</div>
            <Button
              onClick={() => setCurrentScreen('stats')}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
            >
              Stats
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {renderRankInfo('1v1')}
          {renderRankInfo('2v2')}
          {renderRankInfo('3v3')}
        </div>
      </CardContent>
    </Card>
  );
}
