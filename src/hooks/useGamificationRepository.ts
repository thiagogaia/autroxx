// useGamificationRepository.ts — Hook personalizado para repositório de gamificação
// Facilita o uso do repositório IndexedDB em componentes React

import { useState, useEffect, useCallback } from 'react';
import { gamificationRepository } from '@/lib/gamification-indexeddb-repo';
import { gamificationMigrationService } from '@/lib/gamification-migration-service';
import { 
  UserStats, 
  GamificationEvent, 
  Achievement, 
  PowerUp, 
  WeeklyChallenge 
} from '@/types/gamification';

export interface UseGamificationRepositoryReturn {
  // Estados
  isLoading: boolean;
  isOnline: boolean;
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'error';
  
  // Dados
  userStats: UserStats | null;
  events: GamificationEvent[];
  achievements: Achievement[];
  powerUps: PowerUp[];
  weeklyChallenges: WeeklyChallenge[];
  
  // Métodos de UserStats
  getUserStats: () => Promise<UserStats | null>;
  saveUserStats: (stats: UserStats) => Promise<UserStats>;
  updateUserStats: (updates: Partial<UserStats>) => Promise<UserStats>;
  
  // Métodos de Events
  getEvents: (limit?: number, offset?: number) => Promise<GamificationEvent[]>;
  addEvent: (event: Omit<GamificationEvent, 'id'>) => Promise<GamificationEvent>;
  dismissEvent: (id: number) => Promise<void>;
  clearOldEvents: (daysToKeep?: number) => Promise<number>;
  
  // Métodos de Achievements
  getAchievements: () => Promise<Achievement[]>;
  updateAchievement: (id: string, updates: Partial<Achievement>) => Promise<Achievement>;
  unlockAchievement: (id: string) => Promise<Achievement>;
  
  // Métodos de PowerUps
  getPowerUps: () => Promise<PowerUp[]>;
  updatePowerUp: (id: string, updates: Partial<PowerUp>) => Promise<PowerUp>;
  activatePowerUp: (id: string, duration: number) => Promise<PowerUp>;
  
  // Métodos de WeeklyChallenges
  getWeeklyChallenges: () => Promise<WeeklyChallenge[]>;
  updateWeeklyChallenge: (id: string, updates: Partial<WeeklyChallenge>) => Promise<WeeklyChallenge>;
  completeWeeklyChallenge: (id: string) => Promise<WeeklyChallenge>;
  
  // Métodos de migração
  migrateFromLocalStorage: () => Promise<void>;
  checkLocalStorageData: () => Promise<any>;
  
  // Métodos de sincronização
  syncWithServer: () => Promise<void>;
  getSyncStatus: () => Promise<any>;
  
  // Métodos de manutenção
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<void>;
  clearAllData: () => Promise<void>;
  getDatabaseInfo: () => Promise<any>;
  
  // Utilitários
  refresh: () => Promise<void>;
}

export function useGamificationRepository(): UseGamificationRepositoryReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'in_progress' | 'completed' | 'error'>('pending');
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);

  // Configurar listeners de online/offline
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        // Verificar migração
        const localStorageInfo = await gamificationMigrationService.checkLocalStorageData();
        if (localStorageInfo.hasStats || localStorageInfo.hasEvents) {
          setMigrationStatus('in_progress');
          try {
            await gamificationMigrationService.migrateWithRollback();
            setMigrationStatus('completed');
          } catch (error) {
            console.error('Erro na migração:', error);
            setMigrationStatus('error');
          }
        } else {
          setMigrationStatus('completed');
        }

        // Carregar dados do IndexedDB
        await refresh();
        
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        setMigrationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Método para recarregar todos os dados
  const refresh = useCallback(async () => {
    try {
      const [stats, eventsData, achievementsData, powerUpsData, challengesData] = await Promise.all([
        gamificationRepository.getUserStats(),
        gamificationRepository.getRecentEvents(50),
        gamificationRepository.getAchievements(),
        gamificationRepository.getPowerUps(),
        gamificationRepository.getWeeklyChallenges()
      ]);

      setUserStats(stats);
      setEvents(eventsData);
      setAchievements(achievementsData);
      setPowerUps(powerUpsData);
      setWeeklyChallenges(challengesData);
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  }, []);

  // Métodos de UserStats
  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    try {
      const stats = await gamificationRepository.getUserStats();
      setUserStats(stats);
      return stats;
    } catch (error) {
      console.error('Erro ao obter userStats:', error);
      return null;
    }
  }, []);

  const saveUserStats = useCallback(async (stats: UserStats): Promise<UserStats> => {
    try {
      const savedStats = await gamificationRepository.saveUserStats(stats);
      setUserStats(savedStats);
      return savedStats;
    } catch (error) {
      console.error('Erro ao salvar userStats:', error);
      throw error;
    }
  }, []);

  const updateUserStats = useCallback(async (updates: Partial<UserStats>): Promise<UserStats> => {
    try {
      const updatedStats = await gamificationRepository.updateUserStats(updates);
      setUserStats(updatedStats);
      return updatedStats;
    } catch (error) {
      console.error('Erro ao atualizar userStats:', error);
      throw error;
    }
  }, []);

  // Métodos de Events
  const getEvents = useCallback(async (limit: number = 50, offset: number = 0): Promise<GamificationEvent[]> => {
    try {
      const eventsData = await gamificationRepository.getEvents(limit, offset);
      setEvents(eventsData);
      return eventsData;
    } catch (error) {
      console.error('Erro ao obter events:', error);
      return [];
    }
  }, []);

  const addEvent = useCallback(async (event: Omit<GamificationEvent, 'id'>): Promise<GamificationEvent> => {
    try {
      const newEvent = await gamificationRepository.addEvent(event);
      setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Manter apenas os 50 mais recentes
      return newEvent;
    } catch (error) {
      console.error('Erro ao adicionar event:', error);
      throw error;
    }
  }, []);

  const dismissEvent = useCallback(async (id: number): Promise<void> => {
    try {
      await gamificationRepository.dismissEvent(id);
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, dismissed: true } : event
      ));
    } catch (error) {
      console.error('Erro ao dispensar event:', error);
      throw error;
    }
  }, []);

  const clearOldEvents = useCallback(async (daysToKeep: number = 30): Promise<number> => {
    try {
      const clearedCount = await gamificationRepository.clearOldEvents(daysToKeep);
      await refresh(); // Recarregar eventos após limpeza
      return clearedCount;
    } catch (error) {
      console.error('Erro ao limpar eventos antigos:', error);
      throw error;
    }
  }, [refresh]);

  // Métodos de Achievements
  const getAchievements = useCallback(async (): Promise<Achievement[]> => {
    try {
      const achievementsData = await gamificationRepository.getAchievements();
      setAchievements(achievementsData);
      return achievementsData;
    } catch (error) {
      console.error('Erro ao obter achievements:', error);
      return [];
    }
  }, []);

  const updateAchievement = useCallback(async (id: string, updates: Partial<Achievement>): Promise<Achievement> => {
    try {
      const updatedAchievement = await gamificationRepository.updateAchievement(id, updates);
      setAchievements(prev => prev.map(achievement => 
        achievement.id === id ? updatedAchievement : achievement
      ));
      return updatedAchievement;
    } catch (error) {
      console.error('Erro ao atualizar achievement:', error);
      throw error;
    }
  }, []);

  const unlockAchievement = useCallback(async (id: string): Promise<Achievement> => {
    try {
      const unlockedAchievement = await gamificationRepository.unlockAchievement(id);
      setAchievements(prev => prev.map(achievement => 
        achievement.id === id ? unlockedAchievement : achievement
      ));
      return unlockedAchievement;
    } catch (error) {
      console.error('Erro ao desbloquear achievement:', error);
      throw error;
    }
  }, []);

  // Métodos de PowerUps
  const getPowerUps = useCallback(async (): Promise<PowerUp[]> => {
    try {
      const powerUpsData = await gamificationRepository.getPowerUps();
      setPowerUps(powerUpsData);
      return powerUpsData;
    } catch (error) {
      console.error('Erro ao obter powerUps:', error);
      return [];
    }
  }, []);

  const updatePowerUp = useCallback(async (id: string, updates: Partial<PowerUp>): Promise<PowerUp> => {
    try {
      const updatedPowerUp = await gamificationRepository.updatePowerUp(id, updates);
      setPowerUps(prev => prev.map(powerUp => 
        powerUp.id === id ? updatedPowerUp : powerUp
      ));
      return updatedPowerUp;
    } catch (error) {
      console.error('Erro ao atualizar powerUp:', error);
      throw error;
    }
  }, []);

  const activatePowerUp = useCallback(async (id: string, duration: number): Promise<PowerUp> => {
    try {
      const activatedPowerUp = await gamificationRepository.activatePowerUp(id, duration);
      setPowerUps(prev => prev.map(powerUp => 
        powerUp.id === id ? activatedPowerUp : powerUp
      ));
      return activatedPowerUp;
    } catch (error) {
      console.error('Erro ao ativar powerUp:', error);
      throw error;
    }
  }, []);

  // Métodos de WeeklyChallenges
  const getWeeklyChallenges = useCallback(async (): Promise<WeeklyChallenge[]> => {
    try {
      const challengesData = await gamificationRepository.getWeeklyChallenges();
      setWeeklyChallenges(challengesData);
      return challengesData;
    } catch (error) {
      console.error('Erro ao obter weeklyChallenges:', error);
      return [];
    }
  }, []);

  const updateWeeklyChallenge = useCallback(async (id: string, updates: Partial<WeeklyChallenge>): Promise<WeeklyChallenge> => {
    try {
      const updatedChallenge = await gamificationRepository.updateWeeklyChallenge(id, updates);
      setWeeklyChallenges(prev => prev.map(challenge => 
        challenge.id === id ? updatedChallenge : challenge
      ));
      return updatedChallenge;
    } catch (error) {
      console.error('Erro ao atualizar weeklyChallenge:', error);
      throw error;
    }
  }, []);

  const completeWeeklyChallenge = useCallback(async (id: string): Promise<WeeklyChallenge> => {
    try {
      const completedChallenge = await gamificationRepository.completeWeeklyChallenge(id);
      setWeeklyChallenges(prev => prev.map(challenge => 
        challenge.id === id ? completedChallenge : challenge
      ));
      return completedChallenge;
    } catch (error) {
      console.error('Erro ao completar weeklyChallenge:', error);
      throw error;
    }
  }, []);

  // Métodos de migração
  const migrateFromLocalStorage = useCallback(async (): Promise<void> => {
    try {
      setMigrationStatus('in_progress');
      await gamificationMigrationService.migrateWithRollback();
      setMigrationStatus('completed');
      await refresh();
    } catch (error) {
      console.error('Erro na migração:', error);
      setMigrationStatus('error');
      throw error;
    }
  }, [refresh]);

  const checkLocalStorageData = useCallback(async () => {
    try {
      return await gamificationMigrationService.checkLocalStorageData();
    } catch (error) {
      console.error('Erro ao verificar localStorage:', error);
      throw error;
    }
  }, []);

  // Métodos de sincronização
  const syncWithServer = useCallback(async (): Promise<void> => {
    try {
      await gamificationRepository.syncWithServer();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }, []);

  const getSyncStatus = useCallback(async () => {
    try {
      return await gamificationRepository.getSyncStatus();
    } catch (error) {
      console.error('Erro ao obter status de sincronização:', error);
      throw error;
    }
  }, []);

  // Métodos de manutenção
  const exportData = useCallback(async () => {
    try {
      return await gamificationRepository.exportData();
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(async (data: any) => {
    try {
      await gamificationRepository.importData(data);
      await refresh();
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  }, [refresh]);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await gamificationRepository.clearAllData();
      await refresh();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }, [refresh]);

  const getDatabaseInfo = useCallback(async () => {
    try {
      return await gamificationRepository.getDatabaseInfo();
    } catch (error) {
      console.error('Erro ao obter informações do banco:', error);
      throw error;
    }
  }, []);

  return {
    // Estados
    isLoading,
    isOnline,
    migrationStatus,
    
    // Dados
    userStats,
    events,
    achievements,
    powerUps,
    weeklyChallenges,
    
    // Métodos de UserStats
    getUserStats,
    saveUserStats,
    updateUserStats,
    
    // Métodos de Events
    getEvents,
    addEvent,
    dismissEvent,
    clearOldEvents,
    
    // Métodos de Achievements
    getAchievements,
    updateAchievement,
    unlockAchievement,
    
    // Métodos de PowerUps
    getPowerUps,
    updatePowerUp,
    activatePowerUp,
    
    // Métodos de WeeklyChallenges
    getWeeklyChallenges,
    updateWeeklyChallenge,
    completeWeeklyChallenge,
    
    // Métodos de migração
    migrateFromLocalStorage,
    checkLocalStorageData,
    
    // Métodos de sincronização
    syncWithServer,
    getSyncStatus,
    
    // Métodos de manutenção
    exportData,
    importData,
    clearAllData,
    getDatabaseInfo,
    
    // Utilitários
    refresh
  };
}
