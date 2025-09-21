// migration-utils.ts — Utilitários para migração de dados
// Migração do localStorage para IndexedDB

import { Task } from '@/types/task';
import { indexedDBRepository } from '@/lib/indexeddb-repo';
import { STORAGE_KEYS, loadTasksFromStorage } from '@/lib/storage';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  error?: string;
  backupCreated?: boolean;
}

export class DataMigrationService {
  private static instance: DataMigrationService;
  private migrationCompleted = false;

  static getInstance(): DataMigrationService {
    if (!this.instance) {
      this.instance = new DataMigrationService();
    }
    return this.instance;
  }

  /**
   * Verifica se a migração já foi realizada
   */
  async isMigrationCompleted(): Promise<boolean> {
    if (this.migrationCompleted) {
      return true;
    }

    try {
      // Verificar se existem dados no IndexedDB
      const dbInfo = await indexedDBRepository.getDatabaseInfo();
      this.migrationCompleted = dbInfo.taskCount > 0;
      return this.migrationCompleted;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Executa a migração completa do localStorage para IndexedDB
   */
  async migrateFromLocalStorage(): Promise<MigrationResult> {
    try {
      // Verificar se já foi migrado
      if (await this.isMigrationCompleted()) {
        return {
          success: true,
          migratedCount: 0,
          error: 'Migration already completed'
        };
      }

      // Carregar dados do localStorage
      const localStorageTasks = loadTasksFromStorage();
      
      if (localStorageTasks.length === 0) {
        this.migrationCompleted = true;
        return {
          success: true,
          migratedCount: 0,
          error: 'No data to migrate'
        };
      }

      // Criar backup dos dados originais
      const backupCreated = await this.createBackup(localStorageTasks);

      // Migrar dados para IndexedDB
      await indexedDBRepository.migrateFromLocalStorage(localStorageTasks);

      // Marcar migração como concluída
      this.migrationCompleted = true;

      // Opcional: Limpar localStorage após migração bem-sucedida
      // this.clearLocalStorageData();

      return {
        success: true,
        migratedCount: localStorageTasks.length,
        backupCreated
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        migratedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cria um backup dos dados antes da migração
   */
  private async createBackup(tasks: Task[]): Promise<boolean> {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tasks: tasks,
        metadata: {
          source: 'localStorage',
          count: tasks.length
        }
      };

      // Salvar backup no localStorage com chave específica
      const backupKey = `${STORAGE_KEYS.TASKS}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      return true;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return false;
    }
  }

  /**
   * Limpa os dados do localStorage após migração bem-sucedida
   */
  async clearLocalStorageData(): Promise<void> {
    try {
      // Remover dados principais
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.FILTER);
      
      // Remover backups antigos (manter apenas os últimos 3)
      this.cleanupOldBackups();
      
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Remove backups antigos, mantendo apenas os últimos 3
   */
  private cleanupOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_KEYS.TASKS}_backup_`))
        .sort()
        .reverse(); // Mais recentes primeiro

      // Manter apenas os 3 backups mais recentes
      const keysToRemove = backupKeys.slice(3);
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Restaura dados de um backup
   */
  async restoreFromBackup(backupKey: string): Promise<MigrationResult> {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        return {
          success: false,
          migratedCount: 0,
          error: 'Backup not found'
        };
      }

      const backup = JSON.parse(backupData);
      if (!backup.tasks || !Array.isArray(backup.tasks)) {
        return {
          success: false,
          migratedCount: 0,
          error: 'Invalid backup format'
        };
      }

      // Limpar dados atuais do IndexedDB
      await indexedDBRepository.clearAllData();

      // Restaurar dados do backup
      await indexedDBRepository.migrateFromLocalStorage(backup.tasks);

      return {
        success: true,
        migratedCount: backup.tasks.length
      };

    } catch (error) {
      console.error('Restore failed:', error);
      return {
        success: false,
        migratedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Lista todos os backups disponíveis
   */
  getAvailableBackups(): Array<{ key: string; timestamp: string; count: number }> {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_KEYS.TASKS}_backup_`));

      return backupKeys.map(key => {
        try {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            const backup = JSON.parse(backupData);
            return {
              key,
              timestamp: backup.timestamp,
              count: backup.tasks?.length || 0
            };
          }
        } catch (error) {
          console.error(`Error parsing backup ${key}:`, error);
        }
        return null;
      }).filter(Boolean) as Array<{ key: string; timestamp: string; count: number }>;

    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Verifica a integridade dos dados migrados
   */
  async verifyMigrationIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
    stats: {
      totalTasks: number;
      tasksWithIssues: number;
      syncStatus: {
        synced: number;
        pending: number;
      };
    };
  }> {
    try {
      const dbInfo = await indexedDBRepository.getDatabaseInfo();
      const allTasks = await indexedDBRepository.exportData();
      
      const issues: string[] = [];
      let tasksWithIssues = 0;

      // Verificações básicas
      allTasks.forEach(task => {
        if (!task.id) {
          issues.push(`Task without ID found`);
          tasksWithIssues++;
        }
        if (!task.titulo || task.titulo.trim() === '') {
          issues.push(`Task ${task.id} has empty title`);
          tasksWithIssues++;
        }
        if (!task.dataCadastro) {
          issues.push(`Task ${task.id} has no creation date`);
          tasksWithIssues++;
        }
      });

      return {
        isValid: issues.length === 0,
        issues,
        stats: {
          totalTasks: dbInfo.taskCount,
          tasksWithIssues,
          syncStatus: {
            synced: dbInfo.taskCount - dbInfo.unsyncedCount,
            pending: dbInfo.unsyncedCount
          }
        }
      };

    } catch (error) {
      console.error('Verification failed:', error);
      return {
        isValid: false,
        issues: [`Verification failed: ${error}`],
        stats: {
          totalTasks: 0,
          tasksWithIssues: 0,
          syncStatus: {
            synced: 0,
            pending: 0
          }
        }
      };
    }
  }

  /**
   * Força uma nova migração (útil para desenvolvimento/testes)
   */
  async forceMigration(): Promise<MigrationResult> {
    this.migrationCompleted = false;
    return await this.migrateFromLocalStorage();
  }
}

// Instância singleton
export const migrationService = DataMigrationService.getInstance();

// Hook para usar o serviço de migração em componentes React
export function useMigrationService() {
  return migrationService;
}
