'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task } from '@/types/task';
import { 
  UserStats, 
  GamificationEvent, 
  Achievement, 
  PowerUp, 
  WeeklyChallenge,
  LeaderboardEntry 
} from '@/types/gamification';
import { GamificationEngine } from '@/lib/gamification';
import { gamificationRepository } from '@/lib/gamification-indexeddb-repo';
import { gamificationMigrationService } from '@/lib/gamification-migration-service';

interface GamificationContextType {
  userStats: UserStats;
  events: GamificationEvent[];
  isLoading: boolean;
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'error';
  processTaskCompletion: (task: Task, allTasks: Task[]) => Promise<void>;
  unlockPowerUp: (powerUpId: string) => Promise<boolean>;
  activatePowerUp: (powerUpId: string) => Promise<boolean>;
  isPowerUpActive: (powerUpId: string) => boolean;
  dismissEvent: (eventId: number) => Promise<void>;
  getLeaderboard: (type: 'xp' | 'accuracy' | 'speed' | 'quality') => LeaderboardEntry[];
  refreshStats: (tasks: Task[]) => Promise<void>;
  migrateFromLocalStorage: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [engine] = useState(() => new GamificationEngine());
  const [userStats, setUserStats] = useState<UserStats>(engine.getUserStats());
  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'in_progress' | 'completed' | 'error'>('pending');

  // Carregar dados do IndexedDB na inicialização
  useEffect(() => {
    const initializeGamification = async () => {
      try {
        setIsLoading(true);

        // 1. Verificar se há dados no localStorage para migrar
        const localStorageInfo = await gamificationMigrationService.checkLocalStorageData();
        
        if (localStorageInfo.hasStats || localStorageInfo.hasEvents) {
          console.log('Dados encontrados no localStorage, iniciando migração...');
          setMigrationStatus('in_progress');
          
          try {
            const migrationResult = await gamificationMigrationService.migrateWithRollback();
            
            if (migrationResult.success) {
              console.log('Migração concluída com sucesso:', migrationResult);
              setMigrationStatus('completed');
              
              // Limpar localStorage após migração bem-sucedida
              await gamificationMigrationService.cleanupLocalStorage();
            } else {
              console.error('Erro na migração:', migrationResult.errors);
              setMigrationStatus('error');
            }
          } catch (migrationError) {
            console.error('Erro durante a migração:', migrationError);
            setMigrationStatus('error');
          }
        } else {
          console.log('Nenhum dado encontrado no localStorage, carregando do IndexedDB...');
          setMigrationStatus('completed');
        }

        // 2. Carregar dados do IndexedDB
        const [loadedStats, loadedEvents] = await Promise.all([
          gamificationRepository.getUserStats(),
          gamificationRepository.getRecentEvents(50)
        ]);

        if (loadedStats) {
          setUserStats(loadedStats);
          
          // Sincronizar com o engine usando método público
          engine.updateUserStats([]); // Força atualização
        }

        if (loadedEvents && loadedEvents.length > 0) {
          setEvents(loadedEvents);
          
          // Sincronizar com o engine
          engine.events = loadedEvents;
          engine.initializeEventId();
        }

      } catch (error) {
        console.error('Erro ao inicializar gamificação:', error);
        setMigrationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGamification();
  }, [engine]);

  // Salvar dados no IndexedDB quando mudarem
  useEffect(() => {
    if (!isLoading && userStats) {
      gamificationRepository.saveUserStats(userStats).catch(error => {
        console.error('Erro ao salvar userStats no IndexedDB:', error);
      });
    }
  }, [userStats, isLoading]);

  useEffect(() => {
    if (!isLoading && events.length > 0) {
      // Não salvar todos os eventos de uma vez, apenas os novos
      // O repositório já gerencia isso internamente
    }
  }, [events, isLoading]);

  const processTaskCompletion = useCallback(async (task: Task, allTasks: Task[]) => {
    try {
      const result = engine.processTaskCompletion(task, allTasks);
      
      const newStats = engine.getUserStats();
      const newEvents = engine.getRecentEvents(20);
      
      // Salvar no IndexedDB
      await Promise.all([
        gamificationRepository.saveUserStats(newStats)
      ]);
      
      setUserStats(newStats);
      setEvents(newEvents);
      
      // Mostrar notificação de conquista se houver
      if (result.achievements.length > 0) {
        result.achievements.forEach(achievement => {
          console.log(`Conquista desbloqueada: ${achievement.name}`);
        });
      }
      
      // Mostrar notificação de desafio se houver
      if (result.challenges.length > 0) {
        result.challenges.forEach(challenge => {
          console.log(`Desafio concluído: ${challenge.name}`);
        });
      }
      
      // Mostrar notificação de level up se houver
      if (result.levelUp) {
        console.log(`Level up! Novo nível: ${newStats.currentLevel}`);
      }
    } catch (error) {
      console.error('Erro ao processar conclusão da tarefa:', error);
    }
  }, [engine]);

  const unlockPowerUp = useCallback(async (powerUpId: string): Promise<boolean> => {
    try {
      const success = engine.unlockPowerUp(powerUpId);
      if (success) {
        const newStats = engine.getUserStats();
        await gamificationRepository.saveUserStats(newStats);
        setUserStats(newStats);
      }
      return success;
    } catch (error) {
      console.error('Erro ao desbloquear power-up:', error);
      return false;
    }
  }, [engine]);

  const activatePowerUp = useCallback(async (powerUpId: string): Promise<boolean> => {
    try {
      const success = engine.activatePowerUp(powerUpId);
      if (success) {
        const newStats = engine.getUserStats();
        const newEvents = engine.getRecentEvents(20);
        
        await Promise.all([
          gamificationRepository.saveUserStats(newStats)
        ]);
        
        setUserStats(newStats);
        setEvents(newEvents);
      }
      return success;
    } catch (error) {
      console.error('Erro ao ativar power-up:', error);
      return false;
    }
  }, [engine]);

  const isPowerUpActive = (powerUpId: string): boolean => {
    return engine.isPowerUpActive(powerUpId);
  };

  const dismissEvent = useCallback(async (eventId: number) => {
    try {
      await gamificationRepository.dismissEvent(eventId);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, dismissed: true } : event
      ));
    } catch (error) {
      console.error('Erro ao dispensar evento:', error);
    }
  }, []);

  const getLeaderboard = (type: 'xp' | 'accuracy' | 'speed' | 'quality'): LeaderboardEntry[] => {
    return engine.getLeaderboard(type);
  };

  const refreshStats = useCallback(async (tasks: Task[]) => {
    try {
      engine.updateUserStats(tasks);
      const newStats = engine.getUserStats();
      await gamificationRepository.saveUserStats(newStats);
      setUserStats(newStats);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  }, [engine]);

  const migrateFromLocalStorage = useCallback(async () => {
    try {
      setMigrationStatus('in_progress');
      const result = await gamificationMigrationService.migrateWithRollback();
      
      if (result.success) {
        setMigrationStatus('completed');
        await gamificationMigrationService.cleanupLocalStorage();
        
        // Recarregar dados após migração
        const [loadedStats, loadedEvents] = await Promise.all([
          gamificationRepository.getUserStats(),
          gamificationRepository.getRecentEvents(50)
        ]);
        
        if (loadedStats) {
          setUserStats(loadedStats);
          engine.updateUserStats([]); // Força atualização
        }
        
        if (loadedEvents && loadedEvents.length > 0) {
          setEvents(loadedEvents);
          engine.events = loadedEvents;
          engine.initializeEventId();
        }
      } else {
        setMigrationStatus('error');
      }
    } catch (error) {
      console.error('Erro na migração manual:', error);
      setMigrationStatus('error');
    }
  }, [engine]);

  return (
    <GamificationContext.Provider value={{
      userStats,
      events,
      isLoading,
      migrationStatus,
      processTaskCompletion,
      unlockPowerUp,
      activatePowerUp,
      isPowerUpActive,
      dismissEvent,
      getLeaderboard,
      refreshStats,
      migrateFromLocalStorage
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification deve ser usado dentro de um GamificationProvider');
  }
  return context;
}
