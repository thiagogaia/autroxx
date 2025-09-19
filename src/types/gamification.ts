export type UserLevel = 'novato' | 'desenvolvedor' | 'especialista' | 'mestre' | 'lenda';
export type UserRank = 'bug_hunter' | 'documentador' | 'speed_demon' | 'estimador' | 'defensor' | 'none';
export type AchievementType = 'produtividade' | 'qualidade' | 'eficiencia' | 'consistencia' | 'especializacao';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  xpReward: number;
  qpReward: number;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // em minutos
  effect: string;
  unlocked: boolean;
  activeUntil?: Date;
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xpReward: number;
  qpReward: number;
  completed: boolean;
  expiresAt: Date;
}

export interface UserStats {
  totalXP: number;
  totalQP: number;
  currentLevel: UserLevel;
  currentRank: UserRank;
  levelProgress: number; // 0-100
  weeklyStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  achievements: Achievement[];
  powerUps: PowerUp[];
  weeklyChallenges: WeeklyChallenge[];
  totalTasksCompleted: number;
  averageAccuracy: number;
  averageCompletionTime: number;
  impedimentFreeWeeks: number;
}

export interface GamificationEvent {
  id: string;
  type: 'xp_gain' | 'qp_gain' | 'level_up' | 'achievement_unlock' | 'challenge_complete' | 'power_up_activate';
  message: string;
  value?: number;
  icon: string;
  timestamp: Date;
  dismissed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number;
  level: UserLevel;
  rank: UserRank;
}

export interface GamificationConfig {
  xpPerTask: number;
  xpBonusComplexity: Record<string, number>;
  xpBonusCategory: Record<string, number>;
  xpBonusEfficiency: Record<string, number>;
  xpStreakBonus: number;
  qpImpedimentFree: number;
  qpAccuracyBonus: number;
  qpNoPriorityChanges: number;
  qpQuickQueue: number;
  levelThresholds: Record<UserLevel, number>;
  rankRequirements: Record<UserRank, Record<string, number>>;
}
