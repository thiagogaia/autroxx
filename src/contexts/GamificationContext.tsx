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

interface GamificationContextType {
  userStats: UserStats;
  events: GamificationEvent[];
  processTaskCompletion: (task: Task, allTasks: Task[]) => void;
  unlockPowerUp: (powerUpId: string) => boolean;
  activatePowerUp: (powerUpId: string) => boolean;
  isPowerUpActive: (powerUpId: string) => boolean;
  dismissEvent: (eventId: number) => void;
  getLeaderboard: (type: 'xp' | 'accuracy' | 'speed' | 'quality') => LeaderboardEntry[];
  refreshStats: (tasks: Task[]) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [engine] = useState(() => new GamificationEngine());
  const [userStats, setUserStats] = useState<UserStats>(engine.getUserStats());
  const [events, setEvents] = useState<GamificationEvent[]>([]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('gamification-stats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        // Converter strings de data de volta para objetos Date
        if (parsedStats.achievements) {
          parsedStats.achievements.forEach((achievement: Achievement) => {
            if (achievement.unlockedAt) {
              achievement.unlockedAt = new Date(achievement.unlockedAt);
            }
          });
        }
        if (parsedStats.powerUps) {
          parsedStats.powerUps.forEach((powerUp: PowerUp) => {
            if (powerUp.activeUntil) {
              powerUp.activeUntil = new Date(powerUp.activeUntil);
            }
          });
        }
        if (parsedStats.weeklyChallenges) {
          parsedStats.weeklyChallenges.forEach((challenge: WeeklyChallenge) => {
            challenge.expiresAt = new Date(challenge.expiresAt);
          });
        }
        if (parsedStats.lastActivityDate) {
          parsedStats.lastActivityDate = new Date(parsedStats.lastActivityDate);
        }
        
        setUserStats(parsedStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas de gamificação:', error);
      }
    }

    const savedEvents = localStorage.getItem('gamification-events');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        parsedEvents.forEach((event: GamificationEvent) => {
          event.timestamp = new Date(event.timestamp);
        });
        setEvents(parsedEvents);
        
        // Recalcular estatísticas baseado nos eventos carregados
        engine.events = parsedEvents;
        engine.initializeEventId(); // ✅ Inicializar nextEventId
        engine.recalculateStatsFromEvents();
        setUserStats(engine.getUserStats());
      } catch (error) {
        console.error('Erro ao carregar eventos de gamificação:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('gamification-stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('gamification-events', JSON.stringify(events));
  }, [events]);

  const processTaskCompletion = useCallback((task: Task, allTasks: Task[]) => {
    const result = engine.processTaskCompletion(task, allTasks);
    
    setUserStats(engine.getUserStats());
    setEvents(engine.getRecentEvents(20));
    
    // Mostrar notificação de conquista se houver
    if (result.achievements.length > 0) {
      result.achievements.forEach(achievement => {
        // Aqui você pode adicionar uma notificação toast
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
      console.log(`Level up! Novo nível: ${engine.getUserStats().currentLevel}`);
    }
  }, [engine]);

  const unlockPowerUp = (powerUpId: string): boolean => {
    const success = engine.unlockPowerUp(powerUpId);
    if (success) {
      setUserStats(engine.getUserStats());
    }
    return success;
  };

  const activatePowerUp = (powerUpId: string): boolean => {
    const success = engine.activatePowerUp(powerUpId);
    if (success) {
      setUserStats(engine.getUserStats());
      setEvents(engine.getRecentEvents(20));
    }
    return success;
  };

  const isPowerUpActive = (powerUpId: string): boolean => {
    return engine.isPowerUpActive(powerUpId);
  };

  const dismissEvent = useCallback((eventId: number) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, dismissed: true } : event
    ));
  }, []);

  const getLeaderboard = (type: 'xp' | 'accuracy' | 'speed' | 'quality'): LeaderboardEntry[] => {
    return engine.getLeaderboard(type);
  };

  const refreshStats = useCallback((tasks: Task[]) => {
    engine.updateUserStats(tasks);
    setUserStats(engine.getUserStats());
  }, [engine]);

  return (
    <GamificationContext.Provider value={{
      userStats,
      events,
      processTaskCompletion,
      unlockPowerUp,
      activatePowerUp,
      isPowerUpActive,
      dismissEvent,
      getLeaderboard,
      refreshStats
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
