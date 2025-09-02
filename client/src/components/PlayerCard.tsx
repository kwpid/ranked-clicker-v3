import React, { useState } from 'react';
import { usePlayerData } from '../stores/usePlayerData';
import { useGameState } from '../stores/useGameState';
import { getRankInfo } from '../utils/rankingSystem';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Edit2, Save, X, Crown } from 'lucide-react';

export function PlayerCard() {
  const { playerData, updateUsername, getAvailableTitles, equipTitle } = usePlayerData();
  const { setShowStatsModal } = useGameState();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(playerData.username);
  const [showTitleSelector, setShowTitleSelector] = useState(false);

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
    const seasonWins = playerData.seasonWins?.[playlist] || 0;
    const baseRank = rankInfo.name.split(' ')[0];
    const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion'];
    const currentRankIndex = rankOrder.indexOf(baseRank);
    const nextRewardWins = currentRankIndex >= 0 ? (currentRankIndex + 1) * 10 : 10;
    
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
        {/* Season Rewards Progress */}
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-1">
            Season Wins: {seasonWins}
          </div>
          {currentRankIndex >= 0 && (
            <div className="text-xs text-orange-400">
              {seasonWins >= nextRewardWins 
                ? `${baseRank} Reward Unlocked!` 
                : `${nextRewardWins - seasonWins} wins to ${baseRank} reward`}
            </div>
          )}
        </div>
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
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{playerData.username}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingUsername(true)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
                {/* Title and Level */}
                <div className="flex items-center gap-4 mt-1">
                  {playerData.equippedTitle && (
                    <Dialog open={showTitleSelector} onOpenChange={setShowTitleSelector}>
                      <DialogTrigger asChild>
                        <button 
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border border-gray-600 hover:border-gray-500 transition-all duration-200 hover:bg-gray-700/50 cursor-pointer group"
                          style={{ 
                            color: getAvailableTitles().find(t => t.id === playerData.equippedTitle)?.color,
                            textShadow: getAvailableTitles().find(t => t.id === playerData.equippedTitle)?.glow ? '0 0 8px currentColor' : 'none'
                          }}
                        >
                          <Crown className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                          {getAvailableTitles().find(t => t.id === playerData.equippedTitle)?.name}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-white flex items-center gap-2">
                            <Crown className="w-5 h-5" />
                            Select Title
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                          {getAvailableTitles().map((title) => (
                            <button
                              key={title.id}
                              onClick={() => {
                                equipTitle(title.id);
                                setShowTitleSelector(false);
                              }}
                              className={`p-3 rounded-lg text-left hover:bg-gray-700 transition-all duration-200 border ${
                                playerData.equippedTitle === title.id 
                                  ? 'bg-gray-700 border-gray-500' 
                                  : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                              }`}
                              style={{ 
                                color: title.color,
                                textShadow: title.glow ? '0 0 8px currentColor' : 'none'
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 opacity-70" />
                                <span className="font-medium">{title.name}</span>
                                {playerData.equippedTitle === title.id && (
                                  <span className="ml-auto text-xs text-green-400">Equipped</span>
                                )}
                              </div>
                              {title.type === 'level' && title.requirement && (
                                <div className="text-xs text-gray-400 mt-1 ml-6">
                                  Unlocked at Level {title.requirement}
                                </div>
                              )}
                              {title.type === 'season' && (
                                <div className="text-xs text-gray-400 mt-1 ml-6">
                                  Season Reward
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <div className="text-sm text-blue-400">
                    Level {playerData.level || 1}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Season {playerData.currentSeason}</div>
            {/* XP Progress */}
            {playerData.level && (
              <div className="mt-2 mb-2">
                <div className="text-xs text-gray-400 mb-1">
                  XP: {playerData.xp || 0} / {playerData.xpToNext || 100}
                </div>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${((playerData.xp || 0) / (playerData.xpToNext || 100)) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <Button
              onClick={() => setShowStatsModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
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
