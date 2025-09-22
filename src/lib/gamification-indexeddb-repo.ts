// gamification-indexeddb-repo.ts — Repositório IndexedDB para dados de gamificação
// Implementação offline-first com sincronização posterior seguindo padrão Repository

import Dexie, { Table } from 'dexie';
import { 
  UserStats, 
  GamificationEvent, 
  Achievement, 
  PowerUp, 
  WeeklyChallenge,
  UserLevel,
  UserRank,
  AchievementType 
} from '@/types/gamification';

// Interface para sincronização
interface SyncMetadata {
  id: string;
  lastModified: Date;
  isSynced: boolean;
  syncVersion: number;
  conflictResolution?: 'local' | 'remote' | 'manual';
}

// Extensões com metadados de sincronização
interface UserStatsWithSync extends UserStats {
  syncMetadata: SyncMetadata;
}

interface GamificationEventWithSync extends GamificationEvent {
  syncMetadata: SyncMetadata;
}

interface AchievementWithSync extends Achievement {
  syncMetadata: SyncMetadata;
}

interface PowerUpWithSync extends PowerUp {
  syncMetadata: SyncMetadata;
}

interface WeeklyChallengeWithSync extends WeeklyChallenge {
  syncMetadata: SyncMetadata;
}

// Item da fila de sincronização
interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: 'userStats' | 'events' | 'achievements' | 'powerUps' | 'weeklyChallenges';
  data: any;
  timestamp: Date;
  retryCount: number;
}

// Configuração do banco de dados Dexie para Gamificação
class GamificationDatabase extends Dexie {
  userStats!: Table<UserStatsWithSync>;
  events!: Table<GamificationEventWithSync>;
  achievements!: Table<AchievementWithSync>;
  powerUps!: Table<PowerUpWithSync>;
  weeklyChallenges!: Table<WeeklyChallengeWithSync>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('GamificationDB');
    
    // Versão 1: Schema inicial
    this.version(1).stores({
      userStats: '++id, totalXP, totalQP, currentLevel, currentRank, syncMetadata.lastModified, syncMetadata.isSynced',
      events: '++id, type, timestamp, dismissed, taskId, syncMetadata.lastModified, syncMetadata.isSynced',
      achievements: '++id, unlocked, type, syncMetadata.lastModified, syncMetadata.isSynced',
      powerUps: '++id, unlocked, syncMetadata.lastModified, syncMetadata.isSynced',
      weeklyChallenges: '++id, completed, expiresAt, syncMetadata.lastModified, syncMetadata.isSynced',
      syncQueue: '++id, operation, table, timestamp, retryCount'
    });

    // Versão 2: Índices compostos para queries otimizadas
    this.version(2).stores({
      userStats: '++id, totalXP, totalQP, currentLevel, currentRank, syncMetadata.lastModified, syncMetadata.isSynced, [currentLevel+totalXP]',
      events: '++id, type, timestamp, dismissed, taskId, syncMetadata.lastModified, syncMetadata.isSynced, [type+timestamp], [dismissed+timestamp]',
      achievements: '++id, unlocked, type, syncMetadata.lastModified, syncMetadata.isSynced, [unlocked+type]',
      powerUps: '++id, unlocked, syncMetadata.lastModified, syncMetadata.isSynced, [unlocked+duration]',
      weeklyChallenges: '++id, completed, expiresAt, syncMetadata.lastModified, syncMetadata.isSynced, [completed+expiresAt]',
      syncQueue: '++id, operation, table, timestamp, retryCount'
    });
  }
}

// Instância global do banco
export const gamificationDB = new GamificationDatabase();

// Interface do repositório de gamificação
export interface IGamificationRepository {
  // UserStats
  getUserStats(): Promise<UserStats | null>;
  saveUserStats(stats: UserStats): Promise<UserStats>;
  updateUserStats(updates: Partial<UserStats>): Promise<UserStats>;

  // Events
  getEvents(limit?: number, offset?: number): Promise<GamificationEvent[]>;
  addEvent(event: Omit<GamificationEvent, 'id'>): Promise<GamificationEvent>;
  updateEvent(id: number, updates: Partial<GamificationEvent>): Promise<GamificationEvent>;
  deleteEvent(id: number): Promise<void>;
  getEventsByType(type: GamificationEvent['type']): Promise<GamificationEvent[]>;
  getRecentEvents(limit: number): Promise<GamificationEvent[]>;
  dismissEvent(id: number): Promise<void>;
  clearOldEvents(daysToKeep: number): Promise<number>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement>;
  unlockAchievement(id: string): Promise<Achievement>;

  // PowerUps
  getPowerUps(): Promise<PowerUp[]>;
  updatePowerUp(id: string, updates: Partial<PowerUp>): Promise<PowerUp>;
  activatePowerUp(id: string, duration: number): Promise<PowerUp>;

  // Weekly Challenges
  getWeeklyChallenges(): Promise<WeeklyChallenge[]>;
  updateWeeklyChallenge(id: string, updates: Partial<WeeklyChallenge>): Promise<WeeklyChallenge>;
  completeWeeklyChallenge(id: string): Promise<WeeklyChallenge>;

  // Sync
  syncWithServer(): Promise<void>;
  getSyncStatus(): Promise<{
    totalItems: number;
    unsyncedItems: number;
    syncQueueSize: number;
  }>;

  // Migration
  migrateFromLocalStorage(localStorageData: {
    stats?: UserStats;
    events?: GamificationEvent[];
  }): Promise<void>;

  // Backup/Restore
  exportData(): Promise<{
    stats: UserStats | null;
    events: GamificationEvent[];
    achievements: Achievement[];
    powerUps: PowerUp[];
    weeklyChallenges: WeeklyChallenge[];
  }>;
  importData(data: {
    stats?: UserStats;
    events?: GamificationEvent[];
    achievements?: Achievement[];
    powerUps?: PowerUp[];
    weeklyChallenges?: WeeklyChallenge[];
  }): Promise<void>;

  // Maintenance
  clearAllData(): Promise<void>;
  getDatabaseInfo(): Promise<{
    statsCount: number;
    eventsCount: number;
    achievementsCount: number;
    powerUpsCount: number;
    weeklyChallengesCount: number;
    syncQueueCount: number;
    unsyncedCount: number;
    databaseSize: number;
  }>;
}

export class IndexedDBGamificationRepository implements IGamificationRepository {
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncInProgress: boolean = false;

  constructor() {
    // Só configurar listeners no lado do cliente
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupOnlineOfflineListeners();
    }
  }

  private setupOnlineOfflineListeners() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWithServer();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // ==================== USER STATS ====================

  async getUserStats(): Promise<UserStats | null> {
    const stats = await gamificationDB.userStats.orderBy('syncMetadata.lastModified').last();
    return stats ? this.removeSyncMetadata(stats) : null;
  }

  async saveUserStats(stats: UserStats): Promise<UserStats> {
    const now = new Date();
    const statsWithSync: UserStatsWithSync = {
      ...stats,
      syncMetadata: {
        id: `stats_${Date.now()}_${Math.random()}`,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: 1
      }
    };

    // Limpar stats antigas e adicionar nova
    await gamificationDB.userStats.clear();
    await gamificationDB.userStats.add(statsWithSync);

    if (!this.isOnline) {
      await this.addToSyncQueue('create', 'userStats', statsWithSync);
    }

    return stats;
  }

  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    const existingStats = await gamificationDB.userStats.orderBy('syncMetadata.lastModified').last();
    if (!existingStats) {
      throw new Error('User stats not found');
    }

    const now = new Date();
    const updatedStats: UserStatsWithSync = {
      ...existingStats,
      ...updates,
      syncMetadata: {
        ...existingStats.syncMetadata,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: existingStats.syncMetadata.syncVersion + 1
      }
    };

    await gamificationDB.userStats.update(existingStats.syncMetadata.id, {
      ...updates,
      syncMetadata: updatedStats.syncMetadata
    });

    if (!this.isOnline) {
      await this.addToSyncQueue('update', 'userStats', { id: existingStats.syncMetadata.id, ...updates });
    }

    return this.removeSyncMetadata(updatedStats);
  }

  // ==================== EVENTS ====================

  async getEvents(limit: number = 50, offset: number = 0): Promise<GamificationEvent[]> {
    const events = await gamificationDB.events
      .orderBy('timestamp')
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
    
    return events.map(event => this.removeSyncMetadata(event));
  }

  async addEvent(event: Omit<GamificationEvent, 'id'>): Promise<GamificationEvent> {
    const now = new Date();
    const eventWithSync: GamificationEventWithSync = {
      ...event,
      id: await this.generateEventId(),
      syncMetadata: {
        id: `event_${Date.now()}_${Math.random()}`,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: 1
      }
    };

    await gamificationDB.events.add(eventWithSync);

    if (!this.isOnline) {
      await this.addToSyncQueue('create', 'events', eventWithSync);
    }

    return this.removeSyncMetadata(eventWithSync);
  }

  async updateEvent(id: number, updates: Partial<GamificationEvent>): Promise<GamificationEvent> {
    const existingEvent = await gamificationDB.events.get(id);
    if (!existingEvent) {
      throw new Error(`Event with id ${id} not found`);
    }

    const now = new Date();
    const updatedEvent: GamificationEventWithSync = {
      ...existingEvent,
      ...updates,
      syncMetadata: {
        ...existingEvent.syncMetadata,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: existingEvent.syncMetadata.syncVersion + 1
      }
    };

    await gamificationDB.events.update(id, updatedEvent);

    if (!this.isOnline) {
      await this.addToSyncQueue('update', 'events', { id, ...updates });
    }

    return this.removeSyncMetadata(updatedEvent);
  }

  async deleteEvent(id: number): Promise<void> {
    const event = await gamificationDB.events.get(id);
    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }

    await gamificationDB.events.delete(id);

    if (!this.isOnline) {
      await this.addToSyncQueue('delete', 'events', { id });
    }
  }

  async getEventsByType(type: GamificationEvent['type']): Promise<GamificationEvent[]> {
    const events = await gamificationDB.events
      .where('type')
      .equals(type)
      .toArray();
    
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((event: GamificationEventWithSync) => this.removeSyncMetadata(event));
  }

  async getRecentEvents(limit: number): Promise<GamificationEvent[]> {
    return this.getEvents(limit, 0);
  }

  async dismissEvent(id: number): Promise<void> {
    await this.updateEvent(id, { dismissed: true });
  }

  async clearOldEvents(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldEvents = await gamificationDB.events
      .where('timestamp')
      .below(cutoffDate)
      .toArray();

    const count = oldEvents.length;
    await gamificationDB.events
      .where('timestamp')
      .below(cutoffDate)
      .delete();

    return count;
  }

  // ==================== ACHIEVEMENTS ====================

  async getAchievements(): Promise<Achievement[]> {
    const achievements = await gamificationDB.achievements.toArray();
    return achievements.map(achievement => this.removeSyncMetadata(achievement));
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement> {
    const existingAchievement = await gamificationDB.achievements.get(id);
    if (!existingAchievement) {
      throw new Error(`Achievement with id ${id} not found`);
    }

    const now = new Date();
    const updatedAchievement: AchievementWithSync = {
      ...existingAchievement,
      ...updates,
      syncMetadata: {
        ...existingAchievement.syncMetadata,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: existingAchievement.syncMetadata.syncVersion + 1
      }
    };

    await gamificationDB.achievements.update(id, updatedAchievement);

    if (!this.isOnline) {
      await this.addToSyncQueue('update', 'achievements', { id, ...updates });
    }

    return this.removeSyncMetadata(updatedAchievement);
  }

  async unlockAchievement(id: string): Promise<Achievement> {
    return this.updateAchievement(id, { 
      unlocked: true, 
      unlockedAt: new Date() 
    });
  }

  // ==================== POWER UPS ====================

  async getPowerUps(): Promise<PowerUp[]> {
    const powerUps = await gamificationDB.powerUps.toArray();
    return powerUps.map(powerUp => this.removeSyncMetadata(powerUp));
  }

  async updatePowerUp(id: string, updates: Partial<PowerUp>): Promise<PowerUp> {
    const existingPowerUp = await gamificationDB.powerUps.get(id);
    if (!existingPowerUp) {
      throw new Error(`PowerUp with id ${id} not found`);
    }

    const now = new Date();
    const updatedPowerUp: PowerUpWithSync = {
      ...existingPowerUp,
      ...updates,
      syncMetadata: {
        ...existingPowerUp.syncMetadata,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: existingPowerUp.syncMetadata.syncVersion + 1
      }
    };

    await gamificationDB.powerUps.update(id, updatedPowerUp);

    if (!this.isOnline) {
      await this.addToSyncQueue('update', 'powerUps', { id, ...updates });
    }

    return this.removeSyncMetadata(updatedPowerUp);
  }

  async activatePowerUp(id: string, duration: number): Promise<PowerUp> {
    const activeUntil = new Date();
    activeUntil.setMinutes(activeUntil.getMinutes() + duration);

    return this.updatePowerUp(id, { 
      unlocked: true,
      activeUntil 
    });
  }

  // ==================== WEEKLY CHALLENGES ====================

  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const challenges = await gamificationDB.weeklyChallenges.toArray();
    return challenges.map(challenge => this.removeSyncMetadata(challenge));
  }

  async updateWeeklyChallenge(id: string, updates: Partial<WeeklyChallenge>): Promise<WeeklyChallenge> {
    const existingChallenge = await gamificationDB.weeklyChallenges.get(id);
    if (!existingChallenge) {
      throw new Error(`WeeklyChallenge with id ${id} not found`);
    }

    const now = new Date();
    const updatedChallenge: WeeklyChallengeWithSync = {
      ...existingChallenge,
      ...updates,
      syncMetadata: {
        ...existingChallenge.syncMetadata,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: existingChallenge.syncMetadata.syncVersion + 1
      }
    };

    await gamificationDB.weeklyChallenges.update(id, updatedChallenge);

    if (!this.isOnline) {
      await this.addToSyncQueue('update', 'weeklyChallenges', { id, ...updates });
    }

    return this.removeSyncMetadata(updatedChallenge);
  }

  async completeWeeklyChallenge(id: string): Promise<WeeklyChallenge> {
    return this.updateWeeklyChallenge(id, { 
      completed: true 
    });
  }

  // ==================== SYNC ====================

  private async addToSyncQueue(
    operation: 'create' | 'update' | 'delete', 
    table: SyncQueueItem['table'], 
    data: any
  ): Promise<void> {
    await gamificationDB.syncQueue.add({
      id: `sync_${Date.now()}_${Math.random()}`,
      operation,
      table,
      data,
      timestamp: new Date(),
      retryCount: 0
    });
  }

  async syncWithServer(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Sincronizar dados pendentes de todas as tabelas
      const tables = ['userStats', 'events', 'achievements', 'powerUps', 'weeklyChallenges'] as const;
      
      for (const table of tables) {
        const unsyncedItems = await this.getUnsyncedItems(table);
        for (const item of unsyncedItems) {
          try {
            await this.syncItemToServer(table, item);
            await this.markAsSynced(table, item);
          } catch (error) {
            console.error(`Failed to sync ${table} item:`, error);
          }
        }
      }

      // Processar fila de sincronização
      const syncQueue = await gamificationDB.syncQueue.toArray();
      for (const item of syncQueue) {
        try {
          await this.processSyncQueueItem(item);
          await gamificationDB.syncQueue.delete(item.id);
        } catch (error) {
          console.error(`Failed to process sync queue item ${item.id}:`, error);
          await gamificationDB.syncQueue.update(item.id, {
            retryCount: item.retryCount + 1
          });
        }
      }

    } finally {
      this.syncInProgress = false;
    }
  }

  private async getUnsyncedItems(table: string): Promise<any[]> {
    // Implementação específica para cada tabela
    switch (table) {
      case 'userStats':
        return await gamificationDB.userStats.filter(item => !item.syncMetadata.isSynced).toArray();
      case 'events':
        return await gamificationDB.events.filter(item => !item.syncMetadata.isSynced).toArray();
      case 'achievements':
        return await gamificationDB.achievements.filter(item => !item.syncMetadata.isSynced).toArray();
      case 'powerUps':
        return await gamificationDB.powerUps.filter(item => !item.syncMetadata.isSynced).toArray();
      case 'weeklyChallenges':
        return await gamificationDB.weeklyChallenges.filter(item => !item.syncMetadata.isSynced).toArray();
      default:
        return [];
    }
  }

  private async markAsSynced(table: string, item: any): Promise<void> {
    const updates = {
      syncMetadata: {
        ...item.syncMetadata,
        isSynced: true
      }
    };

    switch (table) {
      case 'userStats':
        await gamificationDB.userStats.update(item.id, updates);
        break;
      case 'events':
        await gamificationDB.events.update(item.id, updates);
        break;
      case 'achievements':
        await gamificationDB.achievements.update(item.id, updates);
        break;
      case 'powerUps':
        await gamificationDB.powerUps.update(item.id, updates);
        break;
      case 'weeklyChallenges':
        await gamificationDB.weeklyChallenges.update(item.id, updates);
        break;
    }
  }

  private async syncItemToServer(table: string, item: any): Promise<void> {
    // Implementar chamada para API do servidor
    console.log(`Syncing ${table} item to server:`, item);
    
    // Aqui você implementaria a chamada real para sua API:
    // const response = await fetch(`/api/gamification/${table}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(this.removeSyncMetadata(item))
    // });
    // if (!response.ok) throw new Error('Sync failed');
  }

  private async processSyncQueueItem(item: SyncQueueItem): Promise<void> {
    // Implementar processamento da fila de sincronização
    console.log(`Processing sync queue item: ${item.operation} ${item.table}`, item.data);
    
    // Aqui você implementaria as chamadas para sua API baseadas na operação:
    // switch (item.operation) {
    //   case 'create':
    //     await fetch(`/api/gamification/${item.table}`, { method: 'POST', ... });
    //     break;
    //   case 'update':
    //     await fetch(`/api/gamification/${item.table}/${item.data.id}`, { method: 'PUT', ... });
    //     break;
    //   case 'delete':
    //     await fetch(`/api/gamification/${item.table}/${item.data.id}`, { method: 'DELETE' });
    //     break;
    // }
  }

  async getSyncStatus(): Promise<{
    totalItems: number;
    unsyncedItems: number;
    syncQueueSize: number;
  }> {
    const statsCount = await gamificationDB.userStats.count();
    const eventsCount = await gamificationDB.events.count();
    const achievementsCount = await gamificationDB.achievements.count();
    const powerUpsCount = await gamificationDB.powerUps.count();
    const weeklyChallengesCount = await gamificationDB.weeklyChallenges.count();
    const syncQueueCount = await gamificationDB.syncQueue.count();

    const totalItems = statsCount + eventsCount + achievementsCount + powerUpsCount + weeklyChallengesCount;

    // Contar itens não sincronizados
    const unsyncedStats = await gamificationDB.userStats.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedEvents = await gamificationDB.events.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedAchievements = await gamificationDB.achievements.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedPowerUps = await gamificationDB.powerUps.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedWeeklyChallenges = await gamificationDB.weeklyChallenges.filter(item => !item.syncMetadata.isSynced).count();

    const unsyncedItems = unsyncedStats + unsyncedEvents + unsyncedAchievements + unsyncedPowerUps + unsyncedWeeklyChallenges;

    return {
      totalItems,
      unsyncedItems,
      syncQueueSize: syncQueueCount
    };
  }

  // ==================== MIGRATION ====================

  async migrateFromLocalStorage(localStorageData: {
    stats?: UserStats;
    events?: GamificationEvent[];
  }): Promise<void> {
    const now = new Date();

    // Migrar UserStats
    if (localStorageData.stats) {
      const statsWithSync: UserStatsWithSync = {
        ...localStorageData.stats,
        syncMetadata: {
          id: `migrated_stats_${Date.now()}`,
          lastModified: now,
          isSynced: false, // Marcar como não sincronizado para forçar sync
          syncVersion: 1
        }
      };

      await gamificationDB.userStats.clear();
      await gamificationDB.userStats.add(statsWithSync);
    }

    // Migrar Events
    if (localStorageData.events && localStorageData.events.length > 0) {
      const eventsWithSync: GamificationEventWithSync[] = localStorageData.events.map(event => ({
        ...event,
        syncMetadata: {
          id: `migrated_event_${event.id}_${Date.now()}`,
          lastModified: now,
          isSynced: false,
          syncVersion: 1
        }
      }));

      await gamificationDB.events.clear();
      await gamificationDB.events.bulkAdd(eventsWithSync);
    }

    // Migrar Achievements (se existirem no stats)
    if (localStorageData.stats?.achievements) {
      const achievementsWithSync: AchievementWithSync[] = localStorageData.stats.achievements.map(achievement => ({
        ...achievement,
        syncMetadata: {
          id: `migrated_achievement_${achievement.id}_${Date.now()}`,
          lastModified: now,
          isSynced: false,
          syncVersion: 1
        }
      }));

      await gamificationDB.achievements.clear();
      await gamificationDB.achievements.bulkAdd(achievementsWithSync);
    }

    // Migrar PowerUps (se existirem no stats)
    if (localStorageData.stats?.powerUps) {
      const powerUpsWithSync: PowerUpWithSync[] = localStorageData.stats.powerUps.map(powerUp => ({
        ...powerUp,
        syncMetadata: {
          id: `migrated_powerup_${powerUp.id}_${Date.now()}`,
          lastModified: now,
          isSynced: false,
          syncVersion: 1
        }
      }));

      await gamificationDB.powerUps.clear();
      await gamificationDB.powerUps.bulkAdd(powerUpsWithSync);
    }

    // Migrar WeeklyChallenges (se existirem no stats)
    if (localStorageData.stats?.weeklyChallenges) {
      const challengesWithSync: WeeklyChallengeWithSync[] = localStorageData.stats.weeklyChallenges.map(challenge => ({
        ...challenge,
        syncMetadata: {
          id: `migrated_challenge_${challenge.id}_${Date.now()}`,
          lastModified: now,
          isSynced: false,
          syncVersion: 1
        }
      }));

      await gamificationDB.weeklyChallenges.clear();
      await gamificationDB.weeklyChallenges.bulkAdd(challengesWithSync);
    }
  }

  // ==================== BACKUP/RESTORE ====================

  async exportData(): Promise<{
    stats: UserStats | null;
    events: GamificationEvent[];
    achievements: Achievement[];
    powerUps: PowerUp[];
    weeklyChallenges: WeeklyChallenge[];
  }> {
    const stats = await this.getUserStats();
    const events = await this.getEvents(1000); // Exportar até 1000 eventos
    const achievements = await this.getAchievements();
    const powerUps = await this.getPowerUps();
    const weeklyChallenges = await this.getWeeklyChallenges();

    return {
      stats,
      events,
      achievements,
      powerUps,
      weeklyChallenges
    };
  }

  async importData(data: {
    stats?: UserStats;
    events?: GamificationEvent[];
    achievements?: Achievement[];
    powerUps?: PowerUp[];
    weeklyChallenges?: WeeklyChallenge[];
  }): Promise<void> {
    await this.clearAllData();
    await this.migrateFromLocalStorage(data);
  }

  // ==================== MAINTENANCE ====================

  async clearAllData(): Promise<void> {
    await gamificationDB.userStats.clear();
    await gamificationDB.events.clear();
    await gamificationDB.achievements.clear();
    await gamificationDB.powerUps.clear();
    await gamificationDB.weeklyChallenges.clear();
    await gamificationDB.syncQueue.clear();
  }

  async getDatabaseInfo(): Promise<{
    statsCount: number;
    eventsCount: number;
    achievementsCount: number;
    powerUpsCount: number;
    weeklyChallengesCount: number;
    syncQueueCount: number;
    unsyncedCount: number;
    databaseSize: number;
  }> {
    const statsCount = await gamificationDB.userStats.count();
    const eventsCount = await gamificationDB.events.count();
    const achievementsCount = await gamificationDB.achievements.count();
    const powerUpsCount = await gamificationDB.powerUps.count();
    const weeklyChallengesCount = await gamificationDB.weeklyChallenges.count();
    const syncQueueCount = await gamificationDB.syncQueue.count();

    // Contar itens não sincronizados
    const unsyncedStats = await gamificationDB.userStats.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedEvents = await gamificationDB.events.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedAchievements = await gamificationDB.achievements.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedPowerUps = await gamificationDB.powerUps.filter(item => !item.syncMetadata.isSynced).count();
    const unsyncedWeeklyChallenges = await gamificationDB.weeklyChallenges.filter(item => !item.syncMetadata.isSynced).count();

    const unsyncedCount = unsyncedStats + unsyncedEvents + unsyncedAchievements + unsyncedPowerUps + unsyncedWeeklyChallenges;

    // Estimativa do tamanho do banco
    const databaseSize = await this.estimateDatabaseSize();

    return {
      statsCount,
      eventsCount,
      achievementsCount,
      powerUpsCount,
      weeklyChallengesCount,
      syncQueueCount,
      unsyncedCount,
      databaseSize
    };
  }

  private async estimateDatabaseSize(): Promise<number> {
    const stats = await gamificationDB.userStats.toArray();
    const events = await gamificationDB.events.toArray();
    const achievements = await gamificationDB.achievements.toArray();
    const powerUps = await gamificationDB.powerUps.toArray();
    const weeklyChallenges = await gamificationDB.weeklyChallenges.toArray();
    const syncQueue = await gamificationDB.syncQueue.toArray();
    
    const statsSize = JSON.stringify(stats).length;
    const eventsSize = JSON.stringify(events).length;
    const achievementsSize = JSON.stringify(achievements).length;
    const powerUpsSize = JSON.stringify(powerUps).length;
    const weeklyChallengesSize = JSON.stringify(weeklyChallenges).length;
    const syncQueueSize = JSON.stringify(syncQueue).length;
    
    return statsSize + eventsSize + achievementsSize + powerUpsSize + weeklyChallengesSize + syncQueueSize;
  }

  // ==================== UTILITIES ====================

  private async generateEventId(): Promise<number> {
    const maxEvent = await gamificationDB.events.orderBy('id').last();
    return (maxEvent?.id || 0) + 1;
  }

  private removeSyncMetadata<T extends { syncMetadata: SyncMetadata }>(item: T): Omit<T, 'syncMetadata'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { syncMetadata, ...itemWithoutSync } = item;
    return itemWithoutSync;
  }
}

// Instância singleton do repositório
export const gamificationRepository = new IndexedDBGamificationRepository();

// Hook para usar o repositório em componentes React
export function useGamificationRepository() {
  return gamificationRepository;
}
