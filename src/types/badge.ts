export type BadgeType = 'elite' | 'royal' | 'mystic' | 'cosmic' | 'legendary' | 'discord';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type BadgeCategory = 'achievement' | 'milestone' | 'special' | 'seasonal' | 'event';

export interface BadgeTheme {
  name: string;
  description: string;
  colors: {
    main: string[];
    facet1: string[];
    facet2: string[];
    glow: string;
    rays: string;
  };
}

export interface BadgeConfig {
  id: string;
  type: BadgeType;
  rarity: BadgeRarity;
  category: BadgeCategory;
  title: string;
  description: string;
  icon?: string;
  unlockConditions: BadgeUnlockCondition[];
  rewards: BadgeReward[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  theme: BadgeTheme;
}

export interface BadgeUnlockCondition {
  type: 'task_completed' | 'streak_days' | 'xp_threshold' | 'accuracy_rate' | 'speed_bonus' | 'custom';
  value: number;
  description: string;
  currentValue?: number;
}

export interface BadgeReward {
  type: 'xp' | 'qp' | 'power_up' | 'title' | 'cosmetic';
  value: number;
  description: string;
}

export interface BadgeCollection {
  badges: BadgeConfig[];
  totalBadges: number;
  unlockedBadges: number;
  completionPercentage: number;
  categories: Record<BadgeCategory, number>;
  rarities: Record<BadgeRarity, number>;
}

export interface BadgeNotification {
  id: string;
  badgeId: string;
  title: string;
  message: string;
  type: 'unlock' | 'progress' | 'milestone';
  timestamp: Date;
  dismissed: boolean;
  badgeConfig: BadgeConfig;
}

export interface BadgeStats {
  totalBadgesUnlocked: number;
  totalXPFromBadges: number;
  totalQPFromBadges: number;
  favoriteBadgeType: BadgeType;
  mostCommonRarity: BadgeRarity;
  averageUnlockTime: number; // em dias
  badgesByMonth: Record<string, number>;
  recentUnlocks: BadgeConfig[];
}

// Configurações padrão dos temas de insígnias
export const BADGE_THEMES: Record<BadgeType, BadgeTheme> = {
  elite: {
    name: 'DIAMOND ELITE',
    description: 'Elite Cristalino',
    colors: {
      main: ['rgba(255,255,255,0.9)', 'rgba(230,240,255,0.8)', 'rgba(200,220,255,0.7)', 'rgba(255,255,255,0.8)', 'rgba(240,248,255,0.9)'],
      facet1: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)'],
      facet2: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)'],
      glow: 'rgba(255,255,255,0.4)',
      rays: 'rgba(200,220,255,0.6)'
    }
  },
  royal: {
    name: 'ROYAL CROWN',
    description: 'Coroa Real',
    colors: {
      main: ['rgba(255,215,0,0.9)', 'rgba(255,235,130,0.8)', 'rgba(255,200,50,0.7)', 'rgba(255,215,0,0.8)', 'rgba(255,240,150,0.9)'],
      facet1: ['rgba(255,255,100,0.6)', 'rgba(255,215,0,0.1)'],
      facet2: ['rgba(255,235,130,0.4)', 'rgba(255,215,0,0.1)'],
      glow: 'rgba(255,215,0,0.4)',
      rays: 'rgba(255,165,0,0.6)'
    }
  },
  mystic: {
    name: 'MYSTIC CRYSTAL',
    description: 'Cristal Místico',
    colors: {
      main: ['rgba(255,100,255,0.9)', 'rgba(255,150,255,0.8)', 'rgba(200,50,255,0.7)', 'rgba(255,100,255,0.8)', 'rgba(255,180,255,0.9)'],
      facet1: ['rgba(255,150,255,0.6)', 'rgba(255,100,255,0.1)'],
      facet2: ['rgba(255,180,255,0.4)', 'rgba(255,100,255,0.1)'],
      glow: 'rgba(255,100,255,0.4)',
      rays: 'rgba(255,20,147,0.6)'
    }
  },
  cosmic: {
    name: 'COSMIC STONE',
    description: 'Pedra Cósmica',
    colors: {
      main: ['rgba(100,255,200,0.9)', 'rgba(150,255,220,0.8)', 'rgba(50,255,150,0.7)', 'rgba(100,255,200,0.8)', 'rgba(180,255,240,0.9)'],
      facet1: ['rgba(150,255,220,0.6)', 'rgba(100,255,200,0.1)'],
      facet2: ['rgba(180,255,240,0.4)', 'rgba(100,255,200,0.1)'],
      glow: 'rgba(100,255,200,0.4)',
      rays: 'rgba(0,255,255,0.6)'
    }
  },
  legendary: {
    name: 'LEGENDARY CORE',
    description: 'Núcleo Lendário',
    colors: {
      main: ['rgba(255,69,0,0.9)', 'rgba(255,140,0,0.8)', 'rgba(255,99,71,0.7)', 'rgba(255,69,0,0.8)', 'rgba(255,160,122,0.9)'],
      facet1: ['rgba(255,140,0,0.6)', 'rgba(255,69,0,0.1)'],
      facet2: ['rgba(255,160,122,0.4)', 'rgba(255,69,0,0.1)'],
      glow: 'rgba(255,69,0,0.4)',
      rays: 'rgba(255,20,147,0.6)'
    }
  },
  discord: {
    name: 'ELITE GUARDIAN',
    description: 'Guardião Elite',
    colors: {
      main: ['rgba(114,137,218,0.9)', 'rgba(88,101,242,0.8)', 'rgba(114,137,218,0.7)', 'rgba(88,101,242,0.8)', 'rgba(114,137,218,0.9)'],
      facet1: ['rgba(114,137,218,0.6)', 'rgba(88,101,242,0.1)'],
      facet2: ['rgba(88,101,242,0.4)', 'rgba(114,137,218,0.1)'],
      glow: 'rgba(114,137,218,0.4)',
      rays: 'rgba(88,101,242,0.6)'
    }
  }
};

// Configurações de raridade
export const BADGE_RARITY_CONFIG: Record<BadgeRarity, {
  color: string;
  glowIntensity: number;
  particleCount: number;
  unlockChance: number;
}> = {
  common: {
    color: '#9CA3AF',
    glowIntensity: 0.3,
    particleCount: 5,
    unlockChance: 0.8
  },
  rare: {
    color: '#3B82F6',
    glowIntensity: 0.5,
    particleCount: 8,
    unlockChance: 0.6
  },
  epic: {
    color: '#8B5CF6',
    glowIntensity: 0.7,
    particleCount: 12,
    unlockChance: 0.4
  },
  legendary: {
    color: '#F59E0B',
    glowIntensity: 0.9,
    particleCount: 16,
    unlockChance: 0.2
  },
  mythic: {
    color: '#EF4444',
    glowIntensity: 1.0,
    particleCount: 20,
    unlockChance: 0.05
  }
};

// Configurações de categoria
export const BADGE_CATEGORY_CONFIG: Record<BadgeCategory, {
  name: string;
  description: string;
  icon: string;
  color: string;
}> = {
  achievement: {
    name: 'Conquistas',
    description: 'Badges por completar objetivos específicos',
    icon: '🏆',
    color: '#F59E0B'
  },
  milestone: {
    name: 'Marcos',
    description: 'Badges por atingir marcos importantes',
    icon: '🎯',
    color: '#3B82F6'
  },
  special: {
    name: 'Especiais',
    description: 'Badges únicos e especiais',
    icon: '⭐',
    color: '#8B5CF6'
  },
  seasonal: {
    name: 'Sazonais',
    description: 'Badges disponíveis apenas em épocas específicas',
    icon: '🌸',
    color: '#10B981'
  },
  event: {
    name: 'Eventos',
    description: 'Badges de eventos especiais',
    icon: '🎉',
    color: '#EF4444'
  }
};
