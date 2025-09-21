import { 
  UserStats, 
  Achievement, 
  PowerUp, 
  WeeklyChallenge, 
  GamificationEvent, 
  LeaderboardEntry,
  UserLevel,
  UserRank,
  AchievementType,
  GamificationConfig
} from '@/types/gamification';
import { Task, TaskComplexity, TaskCategory } from '@/types/task';

export const GAMIFICATION_CONFIG: GamificationConfig = {
  xpPerTask: 100,
  xpBonusComplexity: {
    'simples': 0,
    'media': 50,
    'complexa': 100
  },
  xpBonusCategory: {
    'desenvolvimento': 25,
    'bug': 75,
    'documentacao': 50,
    'reuniao': 30,
    'sem_categoria': 10
  },
  xpBonusEfficiency: {
    'perfect': 150, // Dentro de 90-110% da estimativa
    'good': 100,   // Dentro de 70-130% da estimativa
    'average': 50, // Dentro de 50-150% da estimativa
    'poor': 0      // Fora de 50-150% da estimativa
  },
  xpStreakBonus: 25,
  qpImpedimentFree: 200,
  qpAccuracyBonus: 100,
  qpNoPriorityChanges: 50,
  qpQuickQueue: 75,
  levelThresholds: {
    'novato': 0,
    'desenvolvedor': 1000,
    'especialista': 5000,
    'mestre': 15000,
    'lenda': 30000
  },
  rankRequirements: {
    'bug_hunter': {
      'bugTasksCompleted': 20,
      'bugAccuracy': 85
    },
    'documentador': {
      'docTasksCompleted': 15,
      'docTimeSpent': 40 // horas
    },
    'speed_demon': {
      'avgCompletionTime': 120, // minutos
      'fastTasksCompleted': 30
    },
    'estimador': {
      'accuracyRate': 90,
      'tasksWithEstimates': 25
    },
    'defensor': {
      'impedimentFreeWeeks': 4,
      'impedimentRate': 5 // máximo 5%
    },
    'none': {}
  }
};

export const ACHIEVEMENTS: Achievement[] = [
  // Produtividade
  {
    id: 'first_task',
    name: 'Primeira Missão',
    description: 'Complete sua primeira tarefa',
    icon: '🚀',
    type: 'produtividade',
    xpReward: 100,
    qpReward: 0,
    progress: 0,
    maxProgress: 1,
    unlocked: false
  },
  {
    id: 'speed_of_light',
    name: 'Velocidade da Luz',
    description: 'Complete 10 tarefas em um único dia',
    icon: '⚡',
    type: 'produtividade',
    xpReward: 500,
    qpReward: 100,
    progress: 0,
    maxProgress: 10,
    unlocked: false
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Complete tarefas por 30 dias consecutivos',
    icon: '🔥',
    type: 'consistencia',
    xpReward: 1000,
    qpReward: 200,
    progress: 0,
    maxProgress: 30,
    unlocked: false
  },
  {
    id: 'task_master',
    name: 'Mestre das Tarefas',
    description: 'Complete 100 tarefas',
    icon: '🏆',
    type: 'produtividade',
    xpReward: 2000,
    qpReward: 500,
    progress: 0,
    maxProgress: 100,
    unlocked: false
  },

  // Qualidade
  {
    id: 'impediment_zero',
    name: 'Impedimento Zero',
    description: 'Fique 2 semanas sem impedimentos',
    icon: '🛡️',
    type: 'qualidade',
    xpReward: 800,
    qpReward: 300,
    progress: 0,
    maxProgress: 14,
    unlocked: false
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Mantenha 100% de precisão em estimativas por 1 mês',
    icon: '🎯',
    type: 'qualidade',
    xpReward: 1500,
    qpReward: 400,
    progress: 0,
    maxProgress: 30,
    unlocked: false
  },
  {
    id: 'organizer',
    name: 'Organizador',
    description: 'Categorize todas as suas tarefas',
    icon: '🧹',
    type: 'qualidade',
    xpReward: 300,
    qpReward: 100,
    progress: 0,
    maxProgress: 1,
    unlocked: false
  },

  // Eficiência
  {
    id: 'efficiency_master',
    name: 'Mestre da Eficiência',
    description: 'Reduza seu tempo médio de conclusão em 20%',
    icon: '📈',
    type: 'eficiencia',
    xpReward: 1200,
    qpReward: 250,
    progress: 0,
    maxProgress: 20,
    unlocked: false
  },
  {
    id: 'quick_draw',
    name: 'Quick Draw',
    description: 'Complete 20 tarefas em menos de 2 horas cada',
    icon: '⚡',
    type: 'eficiencia',
    xpReward: 1000,
    qpReward: 200,
    progress: 0,
    maxProgress: 20,
    unlocked: false
  },

  // Especialização
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Complete 20 tarefas de correção de bugs',
    icon: '🐛',
    type: 'especializacao',
    xpReward: 800,
    qpReward: 150,
    progress: 0,
    maxProgress: 20,
    unlocked: false
  },
  {
    id: 'documentation_guru',
    name: 'Guru da Documentação',
    description: 'Complete 15 tarefas de documentação',
    icon: '📚',
    type: 'especializacao',
    xpReward: 600,
    qpReward: 120,
    progress: 0,
    maxProgress: 15,
    unlocked: false
  },
  {
    id: 'development_wizard',
    name: 'Mago do Desenvolvimento',
    description: 'Complete 50 tarefas de desenvolvimento',
    icon: '🧙‍♂️',
    type: 'especializacao',
    xpReward: 1500,
    qpReward: 300,
    progress: 0,
    maxProgress: 50,
    unlocked: false
  }
];

export const POWER_UPS: PowerUp[] = [
  {
    id: 'deep_focus',
    name: 'Foco Profundo',
    description: '+50% XP por 2 horas',
    icon: '⏰',
    duration: 120,
    effect: 'xp_boost',
    unlocked: false
  },
  {
    id: 'estimator_plus',
    name: 'Estimador Plus',
    description: 'Estimativas automáticas baseadas em histórico',
    icon: '🎯',
    duration: 480,
    effect: 'auto_estimate',
    unlocked: false
  },
  {
    id: 'impediment_shield',
    name: 'Escudo Anti-Impedimento',
    description: 'Alertas preventivos de impedimentos',
    icon: '🛡️',
    duration: 1440,
    effect: 'impediment_prevention',
    unlocked: false
  },
  {
    id: 'insight_pro',
    name: 'Insight Pro',
    description: 'Análises avançadas desbloqueadas',
    icon: '📊',
    duration: 2880,
    effect: 'advanced_analytics',
    unlocked: false
  },
  {
    id: 'speed_boost',
    name: 'Impulso de Velocidade',
    description: '+25% XP por completar tarefas rapidamente',
    icon: '🚀',
    duration: 180,
    effect: 'speed_bonus',
    unlocked: false
  }
];

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'weekly_goal',
    name: 'Meta Semanal',
    description: 'Complete 10 tarefas esta semana',
    icon: '🎯',
    target: 10,
    current: 0,
    xpReward: 500,
    qpReward: 100,
    completed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'efficiency_challenge',
    name: 'Desafio de Eficiência',
    description: 'Mantenha tempo médio < 4h por tarefa',
    icon: '⚡',
    target: 4,
    current: 0,
    xpReward: 400,
    qpReward: 80,
    completed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'quality_challenge',
    name: 'Desafio de Qualidade',
    description: 'Zero impedimentos esta semana',
    icon: '🛡️',
    target: 0,
    current: 0,
    xpReward: 600,
    qpReward: 150,
    completed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'balance_challenge',
    name: 'Desafio de Balanceamento',
    description: '25% do tempo em documentação',
    icon: '📚',
    target: 25,
    current: 0,
    xpReward: 350,
    qpReward: 70,
    completed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
];

export class GamificationEngine {
  private userStats: UserStats;
  public events: GamificationEvent[] = []; // ✅ Changed to public
  private nextEventId: number = 1; // ✅ Contador para IDs numéricos

  constructor(initialStats?: Partial<UserStats>) {
    this.userStats = {
      totalXP: 0,
      totalQP: 0,
      currentLevel: 'novato',
      currentRank: 'none',
      levelProgress: 0,
      weeklyStreak: 0,
      longestStreak: 0,
      achievements: [...ACHIEVEMENTS],
      powerUps: [...POWER_UPS],
      weeklyChallenges: [...WEEKLY_CHALLENGES],
      totalTasksCompleted: 0,
      averageAccuracy: 0,
      averageCompletionTime: 0,
      impedimentFreeWeeks: 0,
      ...initialStats
    };
  }

  // Calcular XP baseado na tarefa completada
  calculateTaskXP(task: Task): number {
    let xp = GAMIFICATION_CONFIG.xpPerTask;

    // Bônus por complexidade
    if (task.complexidade) {
      xp += GAMIFICATION_CONFIG.xpBonusComplexity[task.complexidade] || 0;
    }

    // Bônus por categoria
    if (task.categoria) {
      xp += GAMIFICATION_CONFIG.xpBonusCategory[task.categoria] || 0;
    }

    // Bônus por eficiência (se tem estimativa)
    if (task.estimativaTempo && task.dataInicio && task.dataFim) {
      const actualTime = Math.round(
        (new Date(task.dataFim).getTime() - new Date(task.dataInicio).getTime()) / (1000 * 60)
      );
      const estimatedTime = task.estimativaTempo;
      const accuracy = Math.round((actualTime / estimatedTime) * 100);

      if (accuracy >= 90 && accuracy <= 110) {
        xp += GAMIFICATION_CONFIG.xpBonusEfficiency.perfect;
      } else if (accuracy >= 70 && accuracy <= 130) {
        xp += GAMIFICATION_CONFIG.xpBonusEfficiency.good;
      } else if (accuracy >= 50 && accuracy <= 150) {
        xp += GAMIFICATION_CONFIG.xpBonusEfficiency.average;
      }
    }

    return xp;
  }

  // Calcular QP baseado em métricas de qualidade
  calculateQualityPoints(tasks: Task[]): number {
    let qp = 0;

    // Verificar semana sem impedimentos
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTasks = tasks.filter(task => 
      task.dataCadastro >= oneWeekAgo
    );
    
    const hasImpediments = recentTasks.some(task => task.impedimento);
    if (!hasImpediments && recentTasks.length > 0) {
      qp += GAMIFICATION_CONFIG.qpImpedimentFree;
    }

    // Verificar precisão de estimativas
    const tasksWithEstimates = tasks.filter(task => 
      task.estimativaTempo && 
      task.dataInicio && 
      task.dataFim &&
      task.statusAtual === 'concluido'
    );

    if (tasksWithEstimates.length > 0) {
      const accurateEstimates = tasksWithEstimates.filter(task => {
        const actualTime = Math.round(
          (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
        );
        const estimatedTime = task.estimativaTempo!;
        const accuracy = Math.round((actualTime / estimatedTime) * 100);
        return accuracy >= 90 && accuracy <= 110;
      });

      const accuracyRate = (accurateEstimates.length / tasksWithEstimates.length) * 100;
      if (accuracyRate >= 80) {
        qp += GAMIFICATION_CONFIG.qpAccuracyBonus;
      }
    }

    // Verificar mudanças de prioridade
    const tasksWithoutPriorityChanges = tasks.filter(task => 
      !task.numeroMudancasPrioridade || task.numeroMudancasPrioridade === 0
    );
    
    if (tasksWithoutPriorityChanges.length === tasks.length && tasks.length > 0) {
      qp += GAMIFICATION_CONFIG.qpNoPriorityChanges;
    }

    // Verificar tempo de fila rápido
    const tasksWithQuickQueue = tasks.filter(task => {
      if (!task.dataInicio) return false;
      const queueTime = Math.round(
        (new Date(task.dataInicio).getTime() - new Date(task.dataCadastro).getTime()) / (1000 * 60 * 60 * 24)
      );
      return queueTime <= 1;
    });

    if (tasksWithQuickQueue.length >= tasks.length * 0.8 && tasks.length > 0) {
      qp += GAMIFICATION_CONFIG.qpQuickQueue;
    }

    return qp;
  }

  // Atualizar nível do usuário
  updateLevel(): boolean {
    const oldLevel = this.userStats.currentLevel;
    
    for (const [level, threshold] of Object.entries(GAMIFICATION_CONFIG.levelThresholds)) {
      if (this.userStats.totalXP >= threshold) {
        this.userStats.currentLevel = level as UserLevel;
      }
    }

    this.userStats.levelProgress = this.calculateLevelProgress();

    if (oldLevel !== this.userStats.currentLevel) {
      this.addEvent({
        id: this.nextEventId++,
        type: 'level_up',
        message: `Parabéns! Você subiu para o nível ${this.userStats.currentLevel}!`,
        icon: '🎉',
        timestamp: new Date(),
        dismissed: false
      });
      return true;
    }

    return false;
  }

  // Calcular progresso do nível atual
  calculateLevelProgress(): number {
    const levels = Object.keys(GAMIFICATION_CONFIG.levelThresholds) as UserLevel[];
    const currentIndex = levels.indexOf(this.userStats.currentLevel);
    
    if (currentIndex === levels.length - 1) {
      return 100; // Nível máximo
    }

    const currentThreshold = GAMIFICATION_CONFIG.levelThresholds[this.userStats.currentLevel];
    const nextThreshold = GAMIFICATION_CONFIG.levelThresholds[levels[currentIndex + 1]];
    
    const progress = ((this.userStats.totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  // Verificar e desbloquear conquistas
  checkAchievements(tasks: Task[]): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    this.userStats.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let progress = 0;
      let unlocked = false;

      switch (achievement.id) {
        case 'first_task':
          progress = Math.min(tasks.filter(t => t.statusAtual === 'concluido').length, 1);
          unlocked = progress >= 1;
          break;

        case 'speed_of_light':
          // Verificar se completou 10 tarefas em um dia
          const today = new Date();
          const todayTasks = tasks.filter(task => {
            if (!task.dataFim) return false;
            const taskDate = new Date(task.dataFim);
            return taskDate.toDateString() === today.toDateString() && task.statusAtual === 'concluido';
          });
          progress = Math.min(todayTasks.length, 10);
          unlocked = progress >= 10;
          break;

        case 'streak_master':
          // Calcular streak atual
          const streak = this.calculateStreak(tasks);
          progress = Math.min(streak, 30);
          unlocked = streak >= 30;
          break;

        case 'task_master':
          progress = Math.min(tasks.filter(t => t.statusAtual === 'concluido').length, 100);
          unlocked = progress >= 100;
          break;

        case 'impediment_zero':
          // Verificar semanas sem impedimentos
          const impedimentFreeWeeks = this.calculateImpedimentFreeWeeks(tasks);
          progress = Math.min(impedimentFreeWeeks * 7, 14);
          unlocked = impedimentFreeWeeks >= 2;
          break;

        case 'perfectionist':
          // Verificar precisão de estimativas
          const accuracyStreak = this.calculateAccuracyStreak(tasks);
          progress = Math.min(accuracyStreak, 30);
          unlocked = accuracyStreak >= 30;
          break;

        case 'organizer':
          const categorizedTasks = tasks.filter(t => t.categoria && t.categoria !== 'sem_categoria');
          progress = categorizedTasks.length === tasks.length && tasks.length > 0 ? 1 : 0;
          unlocked = progress >= 1;
          break;

        case 'efficiency_master':
          // Calcular melhoria de eficiência
          const efficiencyImprovement = this.calculateEfficiencyImprovement(tasks);
          progress = Math.min(efficiencyImprovement, 20);
          unlocked = efficiencyImprovement >= 20;
          break;

        case 'quick_draw':
          const quickTasks = tasks.filter(task => {
            if (!task.dataInicio || !task.dataFim) return false;
            const duration = Math.round(
              (new Date(task.dataFim).getTime() - new Date(task.dataInicio).getTime()) / (1000 * 60)
            );
            return duration <= 120 && task.statusAtual === 'concluido';
          });
          progress = Math.min(quickTasks.length, 20);
          unlocked = progress >= 20;
          break;

        case 'bug_hunter':
          const bugTasks = tasks.filter(t => t.categoria === 'bug' && t.statusAtual === 'concluido');
          progress = Math.min(bugTasks.length, 20);
          unlocked = progress >= 20;
          break;

        case 'documentation_guru':
          const docTasks = tasks.filter(t => t.categoria === 'documentacao' && t.statusAtual === 'concluido');
          progress = Math.min(docTasks.length, 15);
          unlocked = progress >= 15;
          break;

        case 'development_wizard':
          const devTasks = tasks.filter(t => t.categoria === 'desenvolvimento' && t.statusAtual === 'concluido');
          progress = Math.min(devTasks.length, 50);
          unlocked = progress >= 50;
          break;
      }

      achievement.progress = progress;
      
      if (unlocked && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        this.userStats.totalXP += achievement.xpReward;
        this.userStats.totalQP += achievement.qpReward;
        
        unlockedAchievements.push(achievement);
        
        this.addEvent({
          id: this.nextEventId++,
          type: 'achievement_unlock',
          message: `Conquista desbloqueada: ${achievement.name}!`,
          value: achievement.xpReward,
          icon: achievement.icon,
          timestamp: new Date(),
          dismissed: false
        });
      }
    });

    return unlockedAchievements;
  }

  // Calcular streak atual
  calculateStreak(tasks: Task[]): number {
    const completedTasks = tasks
      .filter(t => t.statusAtual === 'concluido' && t.dataFim)
      .sort((a, b) => new Date(b.dataFim!).getTime() - new Date(a.dataFim!).getTime());

    if (completedTasks.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    for (const task of completedTasks) {
      const taskDate = new Date(task.dataFim!);
      const daysDiff = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(taskDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  // Calcular semanas sem impedimentos
  calculateImpedimentFreeWeeks(tasks: Task[]): number {
    const weeks = [];
    const now = new Date();
    
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks.filter(task => 
        task.dataCadastro >= weekStart && task.dataCadastro < weekEnd
      );
      
      const hasImpediments = weekTasks.some(task => task.impedimento);
      weeks.push(!hasImpediments && weekTasks.length > 0);
    }

    let consecutiveWeeks = 0;
    for (const week of weeks) {
      if (week) {
        consecutiveWeeks++;
      } else {
        break;
      }
    }

    return consecutiveWeeks;
  }

  // Calcular streak de precisão
  calculateAccuracyStreak(tasks: Task[]): number {
    const tasksWithEstimates = tasks
      .filter(t => t.estimativaTempo && t.dataInicio && t.dataFim && t.statusAtual === 'concluido')
      .sort((a, b) => new Date(b.dataFim!).getTime() - new Date(a.dataFim!).getTime());

    let streak = 0;
    for (const task of tasksWithEstimates) {
      const actualTime = Math.round(
        (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
      );
      const estimatedTime = task.estimativaTempo!;
      const accuracy = Math.round((actualTime / estimatedTime) * 100);
      
      if (accuracy >= 90 && accuracy <= 110) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Calcular melhoria de eficiência
  calculateEfficiencyImprovement(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => 
      t.statusAtual === 'concluido' && t.dataInicio && t.dataFim
    );

    if (completedTasks.length < 10) return 0;

    const sortedTasks = completedTasks.sort((a, b) => 
      new Date(a.dataFim!).getTime() - new Date(b.dataFim!).getTime()
    );

    const firstHalf = sortedTasks.slice(0, Math.floor(sortedTasks.length / 2));
    const secondHalf = sortedTasks.slice(Math.floor(sortedTasks.length / 2));

    const avgTimeFirst = firstHalf.reduce((acc, task) => {
      const duration = Math.round(
        (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
      );
      return acc + duration;
    }, 0) / firstHalf.length;

    const avgTimeSecond = secondHalf.reduce((acc, task) => {
      const duration = Math.round(
        (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
      );
      return acc + duration;
    }, 0) / secondHalf.length;

    const improvement = ((avgTimeFirst - avgTimeSecond) / avgTimeFirst) * 100;
    return Math.max(0, improvement);
  }

  // Verificar e atualizar desafios semanais
  updateWeeklyChallenges(tasks: Task[]): WeeklyChallenge[] {
    const completedChallenges: WeeklyChallenge[] = [];

    this.userStats.weeklyChallenges.forEach(challenge => {
      if (challenge.completed) return;

      let current = 0;
      let completed = false;

      switch (challenge.id) {
        case 'weekly_goal':
          const thisWeekTasks = tasks.filter(task => {
            if (!task.dataFim) return false;
            const taskDate = new Date(task.dataFim);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return taskDate >= weekAgo && task.statusAtual === 'concluido';
          });
          current = Math.min(thisWeekTasks.length, challenge.target);
          completed = current >= challenge.target;
          break;

        case 'efficiency_challenge':
          const recentTasks = tasks.filter(task => 
            task.statusAtual === 'concluido' && 
            task.dataInicio && 
            task.dataFim &&
            new Date(task.dataFim) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          );
          
          if (recentTasks.length > 0) {
            const avgTime = recentTasks.reduce((acc, task) => {
              const duration = Math.round(
                (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
              );
              return acc + duration;
            }, 0) / recentTasks.length;
            
            current = Math.round(avgTime / 60); // converter para horas
            completed = avgTime <= challenge.target * 60; // converter horas para minutos
          }
          break;

        case 'quality_challenge':
          const weekTasks = tasks.filter(task => 
            task.dataCadastro >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          );
          const impediments = weekTasks.filter(task => task.impedimento).length;
          current = impediments;
          completed = impediments === 0;
          break;

        case 'balance_challenge':
          const docTime = this.calculateCategoryTime(tasks, 'documentacao');
          const totalTime = this.calculateTotalTime(tasks);
          const percentage = totalTime > 0 ? (docTime / totalTime) * 100 : 0;
          current = Math.round(percentage);
          completed = percentage >= challenge.target;
          break;
      }

      challenge.current = current;
      
      if (completed && !challenge.completed) {
        challenge.completed = true;
        this.userStats.totalXP += challenge.xpReward;
        this.userStats.totalQP += challenge.qpReward;
        
        completedChallenges.push(challenge);
        
        this.addEvent({
          id: this.nextEventId++,
          type: 'challenge_complete',
          message: `Desafio concluído: ${challenge.name}!`,
          value: challenge.xpReward,
          icon: challenge.icon,
          timestamp: new Date(),
          dismissed: false
        });
      }
    });

    return completedChallenges;
  }

  // Calcular tempo gasto em uma categoria
  calculateCategoryTime(tasks: Task[], category: TaskCategory): number {
    return tasks
      .filter(task => 
        task.categoria === category && 
        task.statusAtual === 'concluido' && 
        task.dataInicio && 
        task.dataFim
      )
      .reduce((acc, task) => {
        const duration = Math.round(
          (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
        );
        return acc + duration;
      }, 0);
  }

  // Calcular tempo total gasto
  calculateTotalTime(tasks: Task[]): number {
    return tasks
      .filter(task => 
        task.statusAtual === 'concluido' && 
        task.dataInicio && 
        task.dataFim
      )
      .reduce((acc, task) => {
        const duration = Math.round(
          (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
        );
        return acc + duration;
      }, 0);
  }

  // Atualizar estatísticas do usuário
  updateUserStats(tasks: Task[]): void {
    const completedTasks = tasks.filter(t => t.statusAtual === 'concluido');
    
    this.userStats.totalTasksCompleted = completedTasks.length;
    this.userStats.weeklyStreak = this.calculateStreak(tasks);
    this.userStats.longestStreak = Math.max(this.userStats.longestStreak, this.userStats.weeklyStreak);
    
    // Calcular precisão média
    const tasksWithEstimates = completedTasks.filter(t => 
      t.estimativaTempo && t.dataInicio && t.dataFim
    );
    
    if (tasksWithEstimates.length > 0) {
      const totalAccuracy = tasksWithEstimates.reduce((acc, task) => {
        const actualTime = Math.round(
          (new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime()) / (1000 * 60)
        );
        const estimatedTime = task.estimativaTempo!;
        const accuracy = Math.round((actualTime / estimatedTime) * 100);
        return acc + accuracy;
      }, 0);
      
      this.userStats.averageAccuracy = totalAccuracy / tasksWithEstimates.length;
    }

    // Calcular tempo médio de conclusão
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((acc, task) => {
        if (!task.dataInicio || !task.dataFim) return acc;
        const duration = Math.round(
          (new Date(task.dataFim).getTime() - new Date(task.dataInicio).getTime()) / (1000 * 60)
        );
        return acc + duration;
      }, 0);
      
      this.userStats.averageCompletionTime = totalTime / completedTasks.length;
    }

    // Calcular semanas sem impedimentos
    this.userStats.impedimentFreeWeeks = this.calculateImpedimentFreeWeeks(tasks);
  }

  // Adicionar evento de gamificação
  addEvent(event: GamificationEvent): void {
    this.events.unshift(event);
    // Manter apenas os últimos 50 eventos
    if (this.events.length > 50) {
      this.events = this.events.slice(0, 50);
    }
  }

  // Processar tarefa completada
  processTaskCompletion(task: Task, allTasks: Task[]): {
    xpGained: number;
    qpGained: number;
    achievements: Achievement[];
    challenges: WeeklyChallenge[];
    levelUp: boolean;
  } {
    // ✅ Verificar se a tarefa já foi pontuada (apenas eventos relacionados a tarefas)
    const existingXPEvent = this.events.find(event => 
      event.taskId === task.id && event.type === 'xp_gain'
    );
    
    const existingQPEvent = this.events.find(event => 
      event.taskId === task.id && event.type === 'qp_gain'
    );
    
    // Se já existe evento de XP para esta tarefa, não processar novamente
    if (existingXPEvent) {
      console.log(`Tarefa ${task.id} já foi pontuada com XP anteriormente`);
      return {
        xpGained: 0,
        qpGained: 0,
        achievements: [],
        challenges: [],
        levelUp: false
      };
    }

    // Se já existe evento de QP para esta tarefa, não processar novamente
    if (existingQPEvent) {
      console.log(`Tarefa ${task.id} já foi pontuada com QP anteriormente`);
      return {
        xpGained: 0,
        qpGained: 0,
        achievements: [],
        challenges: [],
        levelUp: false
      };
    }

    const xpGained = this.calculateTaskXP(task);
    const qpGained = this.calculateQualityPoints(allTasks);
    
    this.userStats.totalXP += xpGained;
    this.userStats.totalQP += qpGained;
    
    const levelUp = this.updateLevel();
    const achievements = this.checkAchievements(allTasks);
    const challenges = this.updateWeeklyChallenges(allTasks);
    
    this.updateUserStats(allTasks);
    
    // Adicionar evento de ganho de XP
    this.addEvent({
      id: this.nextEventId++,
      type: 'xp_gain',
      message: `+${xpGained} XP por completar "${task.titulo}"`,
      value: xpGained,
      icon: '⭐',
      timestamp: new Date(),
      dismissed: false,
      taskId: task.id
    });

    // Adicionar evento de ganho de QP se houver
    if (qpGained > 0) {
      this.addEvent({
        id: this.nextEventId++,
        type: 'qp_gain',
        message: `+${qpGained} QP por qualidade`,
        value: qpGained,
        icon: '💎',
        timestamp: new Date(),
        dismissed: false,
        taskId: task.id
      });
    }

    return {
      xpGained,
      qpGained,
      achievements,
      challenges,
      levelUp
    };
  }

  // Recalcular estatísticas baseado em eventos existentes
  recalculateStatsFromEvents(): void {
    // Resetar estatísticas
    this.userStats.totalXP = 0;
    this.userStats.totalQP = 0;
    
    // Somar XP e QP dos eventos válidos
    this.events.forEach(event => {
      if (event.type === 'xp_gain' && event.value) {
        this.userStats.totalXP += event.value;
      } else if (event.type === 'qp_gain' && event.value) {
        this.userStats.totalQP += event.value;
      }
    });
    
    // Atualizar nível baseado no XP recalculado
    this.updateLevel();
  }

  // Inicializar nextEventId baseado nos eventos existentes
  initializeEventId(): void {
    if (this.events.length > 0) {
      const maxId = Math.max(...this.events.map(event => event.id));
      this.nextEventId = maxId + 1;
    } else {
      this.nextEventId = 1;
    }
  }

  // Obter estatísticas do usuário
  getUserStats(): UserStats {
    return { ...this.userStats };
  }

  // Obter eventos recentes
  getRecentEvents(limit: number = 10): GamificationEvent[] {
    return this.events.slice(0, limit);
  }

  // Desbloquear power-up
  unlockPowerUp(powerUpId: string): boolean {
    const powerUp = this.userStats.powerUps.find(p => p.id === powerUpId);
    if (powerUp && !powerUp.unlocked) {
      powerUp.unlocked = true;
      return true;
    }
    return false;
  }

  // Ativar power-up
  activatePowerUp(powerUpId: string): boolean {
    const powerUp = this.userStats.powerUps.find(p => p.id === powerUpId);
    if (powerUp && powerUp.unlocked && !powerUp.activeUntil) {
      powerUp.activeUntil = new Date(Date.now() + powerUp.duration * 60 * 1000);
      
      this.addEvent({
        id: this.nextEventId++,
        type: 'power_up_activate',
        message: `Power-up ativado: ${powerUp.name}`,
        icon: powerUp.icon,
        timestamp: new Date(),
        dismissed: false
      });
      
      return true;
    }
    return false;
  }

  // Verificar se power-up está ativo
  isPowerUpActive(powerUpId: string): boolean {
    const powerUp = this.userStats.powerUps.find(p => p.id === powerUpId);
    if (!powerUp || !powerUp.activeUntil) return false;
    
    return new Date() < powerUp.activeUntil;
  }

  // Obter leaderboard simulado (para demonstração)
  getLeaderboard(type: 'xp' | 'accuracy' | 'speed' | 'quality'): LeaderboardEntry[] {
    // Em uma implementação real, isso viria de um backend
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        name: 'Você',
        value: type === 'xp' ? this.userStats.totalXP : 
               type === 'accuracy' ? this.userStats.averageAccuracy :
               type === 'speed' ? this.userStats.averageCompletionTime :
               this.userStats.impedimentFreeWeeks,
        level: this.userStats.currentLevel,
        userRank: this.userStats.currentRank
      },
      {
        rank: 2,
        name: 'Alice Dev',
        value: type === 'xp' ? 25000 : 
               type === 'accuracy' ? 95 :
               type === 'speed' ? 180 :
               3,
        level: 'mestre',
        userRank: 'estimador'
      },
      {
        rank: 3,
        name: 'Bob Coder',
        value: type === 'xp' ? 18000 : 
               type === 'accuracy' ? 88 :
               type === 'speed' ? 240 :
               2,
        level: 'especialista',
        userRank: 'speed_demon'
      }
    ];

    return mockData.sort((a, b) => b.value - a.value);
  }
}
