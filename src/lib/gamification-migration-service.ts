// gamification-migration-service.ts — Serviço de migração de gamificação
// Migra dados do localStorage para IndexedDB com validação e rollback

import { 
  UserStats, 
  GamificationEvent, 
  Achievement, 
  PowerUp, 
  WeeklyChallenge 
} from '@/types/gamification';
import { gamificationRepository, IGamificationRepository } from './gamification-indexeddb-repo';

export interface MigrationResult {
  success: boolean;
  migratedStats: boolean;
  migratedEvents: boolean;
  migratedAchievements: boolean;
  migratedPowerUps: boolean;
  migratedWeeklyChallenges: boolean;
  statsCount: number;
  eventsCount: number;
  achievementsCount: number;
  powerUpsCount: number;
  weeklyChallengesCount: number;
  errors: string[];
  warnings: string[];
}

export interface LocalStorageData {
  stats?: UserStats;
  events?: GamificationEvent[];
}

export class GamificationMigrationService {
  private repository: IGamificationRepository;

  constructor(repository: IGamificationRepository = gamificationRepository) {
    this.repository = repository;
  }

  /**
   * Verifica se existem dados no localStorage para migração
   */
  async checkLocalStorageData(): Promise<{
    hasStats: boolean;
    hasEvents: boolean;
    statsSize: number;
    eventsSize: number;
    totalSize: number;
  }> {
    if (typeof window === 'undefined') {
      return {
        hasStats: false,
        hasEvents: false,
        statsSize: 0,
        eventsSize: 0,
        totalSize: 0
      };
    }

    const statsData = localStorage.getItem('gamification-stats');
    const eventsData = localStorage.getItem('gamification-events');

    const statsSize = statsData ? statsData.length : 0;
    const eventsSize = eventsData ? eventsData.length : 0;

    return {
      hasStats: !!statsData,
      hasEvents: !!eventsData,
      statsSize,
      eventsSize,
      totalSize: statsSize + eventsSize
    };
  }

  /**
   * Carrega dados do localStorage com validação
   */
  async loadLocalStorageData(): Promise<{
    data: LocalStorageData;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const data: LocalStorageData = {};

    if (typeof window === 'undefined') {
      errors.push('localStorage não está disponível (executando no servidor)');
      return { data, errors, warnings };
    }

    try {
      // Carregar e validar stats
      const statsData = localStorage.getItem('gamification-stats');
      if (statsData) {
        try {
          const parsedStats = JSON.parse(statsData);
          const validatedStats = this.validateUserStats(parsedStats);
          if (validatedStats) {
            data.stats = validatedStats;
          } else {
            errors.push('Dados de estatísticas inválidos no localStorage');
          }
        } catch (error) {
          errors.push(`Erro ao parsear gamification-stats: ${error}`);
        }
      }

      // Carregar e validar events
      const eventsData = localStorage.getItem('gamification-events');
      if (eventsData) {
        try {
          const parsedEvents = JSON.parse(eventsData);
          const validatedEvents = this.validateGamificationEvents(parsedEvents);
          if (validatedEvents) {
            data.events = validatedEvents;
          } else {
            errors.push('Dados de eventos inválidos no localStorage');
          }
        } catch (error) {
          errors.push(`Erro ao parsear gamification-events: ${error}`);
        }
      }

      // Verificar se há dados para migrar
      if (!data.stats && !data.events) {
        warnings.push('Nenhum dado de gamificação encontrado no localStorage');
      }

    } catch (error) {
      errors.push(`Erro geral ao carregar dados do localStorage: ${error}`);
    }

    return { data, errors, warnings };
  }

  /**
   * Executa a migração completa do localStorage para IndexedDB
   */
  async migrateFromLocalStorage(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedStats: false,
      migratedEvents: false,
      migratedAchievements: false,
      migratedPowerUps: false,
      migratedWeeklyChallenges: false,
      statsCount: 0,
      eventsCount: 0,
      achievementsCount: 0,
      powerUpsCount: 0,
      weeklyChallengesCount: 0,
      errors: [],
      warnings: []
    };

    try {
      // 1. Carregar dados do localStorage
      const { data, errors, warnings } = await this.loadLocalStorageData();
      result.errors.push(...errors);
      result.warnings.push(...warnings);

      if (result.errors.length > 0) {
        return result;
      }

      // 2. Verificar se há dados para migrar
      if (!data.stats && !data.events) {
        result.warnings.push('Nenhum dado encontrado para migração');
        result.success = true;
        return result;
      }

      // 3. Fazer backup dos dados atuais do IndexedDB
      const currentData = await this.repository.exportData();
      const backupKey = `gamification-backup-${Date.now()}`;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(backupKey, JSON.stringify(currentData));
        result.warnings.push(`Backup criado com chave: ${backupKey}`);
      }

      // 4. Executar migração
      await this.repository.migrateFromLocalStorage(data);

      // 5. Validar migração
      const migratedData = await this.repository.exportData();

      // Contar itens migrados
      result.statsCount = migratedData.stats ? 1 : 0;
      result.eventsCount = migratedData.events.length;
      result.achievementsCount = migratedData.achievements.length;
      result.powerUpsCount = migratedData.powerUps.length;
      result.weeklyChallengesCount = migratedData.weeklyChallenges.length;

      // Marcar sucessos
      result.migratedStats = !!migratedData.stats;
      result.migratedEvents = migratedData.events.length > 0;
      result.migratedAchievements = migratedData.achievements.length > 0;
      result.migratedPowerUps = migratedData.powerUps.length > 0;
      result.migratedWeeklyChallenges = migratedData.weeklyChallenges.length > 0;

      // 6. Validar integridade dos dados
      const validationErrors = await this.validateMigratedData(data, migratedData);
      result.errors.push(...validationErrors);

      if (result.errors.length === 0) {
        result.success = true;
        result.warnings.push('Migração concluída com sucesso');
      } else {
        result.warnings.push('Migração concluída com erros de validação');
      }

    } catch (error) {
      result.errors.push(`Erro durante a migração: ${error}`);
    }

    return result;
  }

  /**
   * Executa migração com rollback automático em caso de erro
   */
  async migrateWithRollback(): Promise<MigrationResult> {
    const result = await this.migrateFromLocalStorage();

    if (!result.success && result.errors.length > 0) {
      try {
        // Tentar fazer rollback
        await this.rollbackMigration();
        result.warnings.push('Rollback executado devido a erros na migração');
      } catch (rollbackError) {
        result.errors.push(`Erro no rollback: ${rollbackError}`);
      }
    }

    return result;
  }

  /**
   * Executa rollback da migração (restaura dados do backup)
   */
  async rollbackMigration(): Promise<void> {
    // Buscar o backup mais recente
    const backupKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('gamification-backup-')
    );

    if (backupKeys.length === 0) {
      throw new Error('Nenhum backup encontrado para rollback');
    }

    // Pegar o backup mais recente
    const latestBackupKey = backupKeys.sort().pop()!;
    const backupData = localStorage.getItem(latestBackupKey);

    if (!backupData) {
      throw new Error('Dados de backup corrompidos');
    }

    try {
      const parsedBackup = JSON.parse(backupData);
      await this.repository.importData(parsedBackup);
    } catch (error) {
      throw new Error(`Erro ao restaurar backup: ${error}`);
    }
  }

  /**
   * Limpa dados do localStorage após migração bem-sucedida
   */
  async cleanupLocalStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('gamification-stats');
      localStorage.removeItem('gamification-events');
      
      // Limpar backups antigos (manter apenas os 3 mais recentes)
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('gamification-backup-'))
        .sort()
        .reverse();

      if (backupKeys.length > 3) {
        const keysToRemove = backupKeys.slice(3);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Valida dados de UserStats
   */
  private validateUserStats(data: any): UserStats | null {
    try {
      // Validações básicas
      if (!data || typeof data !== 'object') return null;

      const requiredFields = [
        'totalXP', 'totalQP', 'currentLevel', 'currentRank', 
        'levelProgress', 'weeklyStreak', 'longestStreak',
        'achievements', 'powerUps', 'weeklyChallenges',
        'totalTasksCompleted', 'averageAccuracy', 'averageCompletionTime',
        'impedimentFreeWeeks'
      ];

      for (const field of requiredFields) {
        if (!(field in data)) {
          return null;
        }
      }

      // Validar tipos
      if (typeof data.totalXP !== 'number' || data.totalXP < 0) return null;
      if (typeof data.totalQP !== 'number' || data.totalQP < 0) return null;
      if (!['novato', 'desenvolvedor', 'especialista', 'mestre', 'lenda'].includes(data.currentLevel)) return null;
      if (!['bug_hunter', 'documentador', 'speed_demon', 'estimador', 'defensor', 'none'].includes(data.currentRank)) return null;
      if (typeof data.levelProgress !== 'number' || data.levelProgress < 0 || data.levelProgress > 100) return null;
      if (!Array.isArray(data.achievements)) return null;
      if (!Array.isArray(data.powerUps)) return null;
      if (!Array.isArray(data.weeklyChallenges)) return null;

      // Converter datas se necessário
      if (data.lastActivityDate && typeof data.lastActivityDate === 'string') {
        data.lastActivityDate = new Date(data.lastActivityDate);
      }

      // Converter datas dos achievements
      if (data.achievements) {
        data.achievements.forEach((achievement: any) => {
          if (achievement.unlockedAt && typeof achievement.unlockedAt === 'string') {
            achievement.unlockedAt = new Date(achievement.unlockedAt);
          }
        });
      }

      // Converter datas dos powerUps
      if (data.powerUps) {
        data.powerUps.forEach((powerUp: any) => {
          if (powerUp.activeUntil && typeof powerUp.activeUntil === 'string') {
            powerUp.activeUntil = new Date(powerUp.activeUntil);
          }
        });
      }

      // Converter datas dos weeklyChallenges
      if (data.weeklyChallenges) {
        data.weeklyChallenges.forEach((challenge: any) => {
          if (challenge.expiresAt && typeof challenge.expiresAt === 'string') {
            challenge.expiresAt = new Date(challenge.expiresAt);
          }
        });
      }

      return data as UserStats;

    } catch (error) {
      return null;
    }
  }

  /**
   * Valida dados de GamificationEvent[]
   */
  private validateGamificationEvents(data: any): GamificationEvent[] | null {
    try {
      if (!Array.isArray(data)) return null;

      const validEvents: GamificationEvent[] = [];

      for (const event of data) {
        if (!event || typeof event !== 'object') continue;

        const requiredFields = ['id', 'type', 'message', 'icon', 'timestamp', 'dismissed'];
        const hasRequiredFields = requiredFields.every(field => field in event);

        if (!hasRequiredFields) continue;

        // Validar tipos
        if (typeof event.id !== 'number') continue;
        if (!['xp_gain', 'qp_gain', 'level_up', 'achievement_unlock', 'challenge_complete', 'power_up_activate'].includes(event.type)) continue;
        if (typeof event.message !== 'string') continue;
        if (typeof event.icon !== 'string') continue;
        if (typeof event.dismissed !== 'boolean') continue;

        // Converter timestamp se necessário
        if (typeof event.timestamp === 'string') {
          event.timestamp = new Date(event.timestamp);
        }

        // Validar se timestamp é uma data válida
        if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) continue;

        validEvents.push(event as GamificationEvent);
      }

      return validEvents.length > 0 ? validEvents : null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Valida dados migrados comparando com origem
   */
  private async validateMigratedData(
    originalData: LocalStorageData, 
    migratedData: any
  ): Promise<string[]> {
    const errors: string[] = [];

    try {
      // Validar stats
      if (originalData.stats && migratedData.stats) {
        const originalStats = originalData.stats;
        const migratedStats = migratedData.stats;

        if (originalStats.totalXP !== migratedStats.totalXP) {
          errors.push(`XP não confere: original=${originalStats.totalXP}, migrado=${migratedStats.totalXP}`);
        }

        if (originalStats.totalQP !== migratedStats.totalQP) {
          errors.push(`QP não confere: original=${originalStats.totalQP}, migrado=${migratedStats.totalQP}`);
        }

        if (originalStats.currentLevel !== migratedStats.currentLevel) {
          errors.push(`Nível não confere: original=${originalStats.currentLevel}, migrado=${migratedStats.currentLevel}`);
        }

        if (originalStats.achievements.length !== migratedData.achievements.length) {
          errors.push(`Número de conquistas não confere: original=${originalStats.achievements.length}, migrado=${migratedData.achievements.length}`);
        }

        if (originalStats.powerUps.length !== migratedData.powerUps.length) {
          errors.push(`Número de power-ups não confere: original=${originalStats.powerUps.length}, migrado=${migratedData.powerUps.length}`);
        }

        if (originalStats.weeklyChallenges.length !== migratedData.weeklyChallenges.length) {
          errors.push(`Número de desafios não confere: original=${originalStats.weeklyChallenges.length}, migrado=${migratedData.weeklyChallenges.length}`);
        }
      }

      // Validar events
      if (originalData.events && migratedData.events) {
        if (originalData.events.length !== migratedData.events.length) {
          errors.push(`Número de eventos não confere: original=${originalData.events.length}, migrado=${migratedData.events.length}`);
        }

        // Validar alguns eventos específicos
        const originalEventIds = originalData.events.map(e => e.id).sort();
        const migratedEventIds = migratedData.events.map((e: any) => e.id).sort();
        
        if (JSON.stringify(originalEventIds) !== JSON.stringify(migratedEventIds)) {
          errors.push('IDs dos eventos não conferem');
        }
      }

    } catch (error) {
      errors.push(`Erro na validação: ${error}`);
    }

    return errors;
  }

  /**
   * Obtém estatísticas da migração
   */
  async getMigrationStats(): Promise<{
    localStorageSize: number;
    indexedDBSize: number;
    migrationDate?: Date;
    itemsMigrated: {
      stats: number;
      events: number;
      achievements: number;
      powerUps: number;
      weeklyChallenges: number;
    };
  }> {
    const localStorageInfo = await this.checkLocalStorageData();
    const indexedDBInfo = await this.repository.getDatabaseInfo();
    const indexedDBData = await this.repository.exportData();

    return {
      localStorageSize: localStorageInfo.totalSize,
      indexedDBSize: indexedDBInfo.databaseSize,
      itemsMigrated: {
        stats: indexedDBData.stats ? 1 : 0,
        events: indexedDBData.events.length,
        achievements: indexedDBData.achievements.length,
        powerUps: indexedDBData.powerUps.length,
        weeklyChallenges: indexedDBData.weeklyChallenges.length
      }
    };
  }
}

// Instância singleton do serviço de migração
export const gamificationMigrationService = new GamificationMigrationService();
