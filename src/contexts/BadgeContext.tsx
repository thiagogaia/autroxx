'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task } from '@/types/task';
import { 
  BadgeConfig, 
  BadgeCollection, 
  BadgeNotification, 
  BadgeStats,
  BadgeType,
  BadgeRarity,
  BadgeCategory,
  BADGE_THEMES,
  BADGE_RARITY_CONFIG,
  BADGE_CATEGORY_CONFIG
} from '@/types/badge';

interface BadgeContextType {
  badgeCollection: BadgeCollection;
  notifications: BadgeNotification[];
  stats: BadgeStats;
  checkBadgeProgress: (task: Task, allTasks: Task[]) => void;
  unlockBadge: (badgeId: string) => boolean;
  dismissNotification: (notificationId: string) => void;
  getBadgesByCategory: (category: BadgeCategory) => BadgeConfig[];
  getBadgesByRarity: (rarity: BadgeRarity) => BadgeConfig[];
  getBadgesByType: (type: BadgeType) => BadgeConfig[];
  refreshBadgeStats: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

// Badges pré-definidos
const DEFAULT_BADGES: BadgeConfig[] = [
  {
    id: 'first_task',
    type: 'elite',
    rarity: 'common',
    category: 'milestone',
    title: 'Primeira Tarefa',
    description: 'Complete sua primeira tarefa',
    unlockConditions: [
      {
        type: 'task_completed',
        value: 1,
        description: 'Complete 1 tarefa',
        currentValue: 0
      }
    ],
    rewards: [
      {
        type: 'xp',
        value: 50,
        description: '+50 XP'
      }
    ],
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    theme: BADGE_THEMES.elite
  },
  {
    id: 'task_master',
    type: 'royal',
    rarity: 'rare',
    category: 'achievement',
    title: 'Mestre das Tarefas',
    description: 'Complete 100 tarefas',
    unlockConditions: [
      {
        type: 'task_completed',
        value: 100,
        description: 'Complete 100 tarefas',
        currentValue: 0
      }
    ],
    rewards: [
      {
        type: 'xp',
        value: 500,
        description: '+500 XP'
      },
      {
        type: 'qp',
        value: 50,
        description: '+50 QP'
      }
    ],
    isUnlocked: false,
    progress: 0,
    maxProgress: 100,
    theme: BADGE_THEMES.royal
  },
  {
    id: 'speed_demon',
    type: 'mystic',
    rarity: 'epic',
    category: 'achievement',
    title: 'Demônio da Velocidade',
    description: 'Complete 10 tarefas em menos de 30 minutos cada',
    unlockConditions: [
      {
        type: 'speed_bonus',
        value: 10,
        description: 'Complete 10 tarefas rapidamente',
        currentValue: 0
      }
    ],
    rewards: [
      {
        type: 'xp',
        value: 1000,
        description: '+1000 XP'
      },
      {
        type: 'power_up',
        value: 1,
        description: 'Power-up de velocidade'
      }
    ],
    isUnlocked: false,
    progress: 0,
    maxProgress: 10,
    theme: BADGE_THEMES.mystic
  },
  {
    id: 'accuracy_master',
    type: 'cosmic',
    rarity: 'legendary',
    category: 'achievement',
    title: 'Mestre da Precisão',
    description: 'Mantenha 95% de precisão em 50 tarefas',
    unlockConditions: [
      {
        type: 'accuracy_rate',
        value: 95,
        description: '95% de precisão',
        currentValue: 0
      }
    ],
    rewards: [
      {
        type: 'xp',
        value: 2000,
        description: '+2000 XP'
      },
      {
        type: 'qp',
        value: 200,
        description: '+200 QP'
      },
      {
        type: 'title',
        value: 1,
        description: 'Título: Mestre da Precisão'
      }
    ],
    isUnlocked: false,
    progress: 0,
    maxProgress: 50,
    theme: BADGE_THEMES.cosmic
  },
  {
    id: 'streak_legend',
    type: 'legendary',
    rarity: 'mythic',
    category: 'milestone',
    title: 'Lenda da Sequência',
    description: 'Mantenha uma sequência de 30 dias',
    unlockConditions: [
      {
        type: 'streak_days',
        value: 30,
        description: '30 dias consecutivos',
        currentValue: 0
      }
    ],
    rewards: [
      {
        type: 'xp',
        value: 5000,
        description: '+5000 XP'
      },
      {
        type: 'qp',
        value: 500,
        description: '+500 QP'
      },
      {
        type: 'cosmetic',
        value: 1,
        description: 'Skin especial'
      }
    ],
    isUnlocked: false,
    progress: 0,
    maxProgress: 30,
    theme: BADGE_THEMES.legendary
  },
  {
    id: 'discord_elite',
    type: 'discord',
    rarity: 'epic',
    category: 'special',
    title: 'Elite Guardian',
    description: 'Guardião Elite do Discord',
    unlockConditions: [
      {
        type: 'task_completed',
        value: 50,
        description: 'Complete 50 tarefas',
        currentValue: 0
      }
    ],
    rewards: [
      {
        type: 'xp',
        value: 1500,
        description: '+1500 XP'
      },
      {
        type: 'qp',
        value: 150,
        description: '+150 QP'
      },
      {
        type: 'title',
        value: 1,
        description: 'Título: Elite Guardian'
      }
    ],
    isUnlocked: false,
    progress: 0,
    maxProgress: 50,
    theme: BADGE_THEMES.discord
  }
];

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<BadgeConfig[]>(DEFAULT_BADGES);
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedBadges = localStorage.getItem('badge-collection');
    if (savedBadges) {
      try {
        const parsedBadges = JSON.parse(savedBadges);
        // Converter strings de data de volta para objetos Date
        parsedBadges.forEach((badge: BadgeConfig) => {
          if (badge.unlockedAt) {
            badge.unlockedAt = new Date(badge.unlockedAt);
          }
        });
        setBadges(parsedBadges);
      } catch (error) {
        console.error('Erro ao carregar coleção de badges:', error);
      }
    }

    const savedNotifications = localStorage.getItem('badge-notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        parsedNotifications.forEach((notification: BadgeNotification) => {
          notification.timestamp = new Date(notification.timestamp);
        });
        setNotifications(parsedNotifications);
      } catch (error) {
        console.error('Erro ao carregar notificações de badges:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('badge-collection', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('badge-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Calcular estatísticas da coleção
  const badgeCollection: BadgeCollection = {
    badges,
    totalBadges: badges.length,
    unlockedBadges: badges.filter(badge => badge.isUnlocked).length,
    completionPercentage: badges.length > 0 ? (badges.filter(badge => badge.isUnlocked).length / badges.length) * 100 : 0,
    categories: badges.reduce((acc, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {} as Record<BadgeCategory, number>),
    rarities: badges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {} as Record<BadgeRarity, number>)
  };

  // Calcular estatísticas gerais
  const stats: BadgeStats = {
    totalBadgesUnlocked: badges.filter(badge => badge.isUnlocked).length,
    totalXPFromBadges: badges
      .filter(badge => badge.isUnlocked)
      .reduce((total, badge) => {
        const xpReward = badge.rewards.find(reward => reward.type === 'xp');
        return total + (xpReward?.value || 0);
      }, 0),
    totalQPFromBadges: badges
      .filter(badge => badge.isUnlocked)
      .reduce((total, badge) => {
        const qpReward = badge.rewards.find(reward => reward.type === 'qp');
        return total + (qpReward?.value || 0);
      }, 0),
    favoriteBadgeType: badges
      .filter(badge => badge.isUnlocked)
      .reduce((acc, badge) => {
        acc[badge.type] = (acc[badge.type] || 0) + 1;
        return acc;
      }, {} as Record<BadgeType, number>) as BadgeType,
    mostCommonRarity: badges
      .filter(badge => badge.isUnlocked)
      .reduce((acc, badge) => {
        acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
        return acc;
      }, {} as Record<BadgeRarity, number>) as BadgeRarity,
    averageUnlockTime: 0, // TODO: Implementar cálculo baseado em datas
    badgesByMonth: {}, // TODO: Implementar agrupamento por mês
    recentUnlocks: badges
      .filter(badge => badge.isUnlocked && badge.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 5)
  };

  // Verificar progresso dos badges
  const checkBadgeProgress = useCallback((task: Task, allTasks: Task[]) => {
    const updatedBadges = badges.map(badge => {
      if (badge.isUnlocked) return badge;

      const updatedBadge = { ...badge };
      let progressUpdated = false;

      badge.unlockConditions.forEach(condition => {
        switch (condition.type) {
          case 'task_completed':
            const completedTasks = allTasks.filter(t => t.status === 'completed').length;
            updatedBadge.progress = Math.min(completedTasks, badge.maxProgress);
            condition.currentValue = completedTasks;
            progressUpdated = true;
            break;
          
          case 'streak_days':
            // TODO: Implementar cálculo de sequência
            break;
          
          case 'xp_threshold':
            // TODO: Implementar cálculo de XP
            break;
          
          case 'accuracy_rate':
            // TODO: Implementar cálculo de precisão
            break;
          
          case 'speed_bonus':
            // TODO: Implementar cálculo de velocidade
            break;
        }
      });

      // Verificar se o badge foi desbloqueado
      const isUnlocked = updatedBadge.unlockConditions.every(condition => 
        (condition.currentValue || 0) >= condition.value
      );

      if (isUnlocked && !badge.isUnlocked) {
        updatedBadge.isUnlocked = true;
        updatedBadge.unlockedAt = new Date();
        
        // Criar notificação
        const notification: BadgeNotification = {
          id: `badge-${badge.id}-${Date.now()}`,
          badgeId: badge.id,
          title: 'Badge Desbloqueado!',
          message: `Você desbloqueou o badge "${badge.title}"!`,
          type: 'unlock',
          timestamp: new Date(),
          dismissed: false,
          badgeConfig: updatedBadge
        };
        
        setNotifications(prev => [notification, ...prev]);
      }

      return updatedBadge;
    });

    setBadges(updatedBadges);
  }, [badges]);

  // Desbloquear badge manualmente
  const unlockBadge = useCallback((badgeId: string): boolean => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge || badge.isUnlocked) return false;

    const updatedBadge = {
      ...badge,
      isUnlocked: true,
      unlockedAt: new Date(),
      progress: badge.maxProgress
    };

    setBadges(prev => prev.map(b => b.id === badgeId ? updatedBadge : b));

    // Criar notificação
    const notification: BadgeNotification = {
      id: `badge-${badgeId}-${Date.now()}`,
      badgeId,
      title: 'Badge Desbloqueado!',
      message: `Você desbloqueou o badge "${badge.title}"!`,
      type: 'unlock',
      timestamp: new Date(),
      dismissed: false,
      badgeConfig: updatedBadge
    };

    setNotifications(prev => [notification, ...prev]);
    return true;
  }, [badges]);

  // Dispensar notificação
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId ? { ...notification, dismissed: true } : notification
    ));
  }, []);

  // Filtrar badges por categoria
  const getBadgesByCategory = useCallback((category: BadgeCategory): BadgeConfig[] => {
    return badges.filter(badge => badge.category === category);
  }, [badges]);

  // Filtrar badges por raridade
  const getBadgesByRarity = useCallback((rarity: BadgeRarity): BadgeConfig[] => {
    return badges.filter(badge => badge.rarity === rarity);
  }, [badges]);

  // Filtrar badges por tipo
  const getBadgesByType = useCallback((type: BadgeType): BadgeConfig[] => {
    return badges.filter(badge => badge.type === type);
  }, [badges]);

  // Atualizar estatísticas
  const refreshBadgeStats = useCallback(() => {
    // As estatísticas são calculadas automaticamente baseadas no estado atual
    // Esta função pode ser expandida para cálculos mais complexos
  }, []);

  return (
    <BadgeContext.Provider value={{
      badgeCollection,
      notifications,
      stats,
      checkBadgeProgress,
      unlockBadge,
      dismissNotification,
      getBadgesByCategory,
      getBadgesByRarity,
      getBadgesByType,
      refreshBadgeStats
    }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadge() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadge deve ser usado dentro de um BadgeProvider');
  }
  return context;
}
