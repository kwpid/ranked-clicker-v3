// Console commands for debugging and testing
import { useRCCSTournament } from '../stores/useRCCSTournament';
import { usePlayerData } from '../stores/usePlayerData';

// Make console commands available globally (hidden in production)
export const initializeConsoleCommands = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Define global console commands
  (window as any).rccs = {
    // Force start a new season
    newSeason: () => {
      const store = useRCCSTournament.getState();
      store.startNewSeason();
      console.log(`🏆 Started new RCCS Season ${store.currentSeason}`);
    },

    // Force start tournament at any stage
    startTournament: (stage: 'qualifiers' | 'regionals' | 'majors' | 'worlds' = 'qualifiers') => {
      const store = useRCCSTournament.getState();
      store.forceStartTournament(stage);
      console.log(`🏆 Force started RCCS tournament at stage: ${stage}`);
    },

    // Auto-register player if eligible
    register: () => {
      const rccStore = useRCCSTournament.getState();
      const playerStore = usePlayerData.getState();
      const highestMMR = Math.max(
        playerStore.playerData.mmr['1v1'], 
        playerStore.playerData.mmr['2v2'], 
        playerStore.playerData.mmr['3v3']
      );
      
      if (rccStore.checkTournamentEligibility(highestMMR)) {
        rccStore.registerPlayerForTournament(playerStore.playerData.username, highestMMR);
        console.log(`✅ Registered ${playerStore.playerData.username} for RCCS tournament`);
      } else {
        console.log(`❌ Player not eligible for RCCS (need Champion III+, current MMR: ${highestMMR})`);
      }
    },

    // Advance tournament to next stage
    advance: () => {
      const store = useRCCSTournament.getState();
      if (store.currentTournament) {
        store.advanceTournament();
        console.log(`⏭️ Advanced tournament to next stage`);
      } else {
        console.log('❌ No active tournament to advance');
      }
    },

    // Boost player MMR to Champion III for testing
    boostToChampion: () => {
      const store = usePlayerData.getState();
      const targetMMR = 2400; // Champion III level
      
      store.updateMMR('1v1', targetMMR - store.playerData.mmr['1v1']);
      store.updateMMR('2v2', targetMMR - store.playerData.mmr['2v2']);
      store.updateMMR('3v3', targetMMR - store.playerData.mmr['3v3']);
      
      console.log(`⬆️ Boosted all playlists to ${targetMMR} MMR (Champion III)`);
    },

    // Get current tournament status
    status: () => {
      const store = useRCCSTournament.getState();
      const playerStore = usePlayerData.getState();
      
      console.log('📊 RCCS Tournament Status:');
      console.log(`Season: ${store.currentSeason}`);
      console.log(`Current Tournament: ${store.currentTournament ? `${store.currentTournament.stage} (${store.currentTournament.status})` : 'None'}`);
      console.log(`Player Registered: ${store.playerRegistered}`);
      console.log(`Player Team: ${store.playerTeam ? store.playerTeam.playerName : 'None'}`);
      console.log(`Player MMR: ${Math.max(playerStore.playerData.mmr['1v1'], playerStore.playerData.mmr['2v2'], playerStore.playerData.mmr['3v3'])}`);
      console.log(`Eligible: ${store.checkTournamentEligibility(Math.max(playerStore.playerData.mmr['1v1'], playerStore.playerData.mmr['2v2'], playerStore.playerData.mmr['3v3']))}`);
      console.log(`Notifications: ${store.notifications.filter(n => !n.dismissed).length} active`);
    },

    // Show help
    help: () => {
      console.log(`🏆 RCCS Console Commands:
        
📋 Available Commands:
  rccs.help()              - Show this help
  rccs.status()            - Show current tournament status
  rccs.newSeason()         - Start a new season
  rccs.startTournament()   - Force start qualifiers
  rccs.startTournament('regionals') - Force start regionals
  rccs.startTournament('majors')    - Force start majors  
  rccs.startTournament('worlds')    - Force start worlds
  rccs.register()          - Register player for tournament
  rccs.advance()           - Advance to next tournament stage
  rccs.boostToChampion()   - Boost player to Champion III MMR

🎯 Quick Test Flow:
  1. rccs.boostToChampion()  // Get eligible rank
  2. rccs.startTournament()  // Start tournament
  3. rccs.register()         // Register for tournament
  4. rccs.advance()          // Simulate tournament stages`);
    }
  };

  // Also make commands available directly
  (window as any).rccsBuild = () => {
    console.log('🚀 RCCS Development Build - Console commands enabled');
    (window as any).rccs.help();
  };

  // Only show console logs in development mode
  if (isDevelopment) {
    console.log('🏆 RCCS Console commands loaded! Type "rccs.help()" for available commands');
    console.log('💡 Quick start: rccs.boostToChampion() then rccs.startTournament() then rccs.register()');
  }
};