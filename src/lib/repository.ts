// repository.ts — Interface Repository genérica

import { Repository, Task, Query, Page, ID } from '@/types/domain';

/**
 * Interface Repository genérica para entidades com ID
 */
export interface IRepository<T extends { id: ID }> extends Repository<T> {
  get(id: ID): Promise<T | null>;
  search(query?: Query<T>): Promise<Page<T>>;
  save(entity: T): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
  count(query?: Query<T>): Promise<number>;
}

/**
 * Interface específica para Task Repository
 */
export interface ITaskRepository extends IRepository<Task> {
  // Métodos específicos para Task se necessário
  findByStatus(status: string): Promise<Task[]>;
  findByPriority(priority: string): Promise<Task[]>;
  findWithImpediments(): Promise<Task[]>;
}

/**
 * Factory para criar instâncias de Repository
 */
export class RepositoryFactory {
  private static instance: ITaskRepository | null = null;
  private static migrationCompleted = false;
  
  static async getTaskRepository(): Promise<ITaskRepository> {
    if (!this.instance) {
      // Usar SQLite OPFS (versão simplificada com IndexedDB)
      const { SQLiteOPFSTaskRepository } = await import('./sqlite-opfs-repo-simple');
      this.instance = new SQLiteOPFSTaskRepository();
    }
    return this.instance;
  }
  
  static setTaskRepository(repository: ITaskRepository): void {
    this.instance = repository;
  }
  
  /**
   * Força o uso do LocalStorage (útil para testes ou fallback)
   * @deprecated Use apenas SQLite
   */
  static async useLocalStorage(): Promise<ITaskRepository> {
    console.warn('useLocalStorage está deprecated. Use apenas SQLite.');
    const { LocalStorageTaskRepository } = await import('./localstorage-repo');
    this.instance = new LocalStorageTaskRepository();
    return this.instance;
  }
  
  /**
   * Força o uso do SQLite OPFS
   * @deprecated Migração automática removida - use apenas getTaskRepository()
   */
  static async useSQLite(): Promise<ITaskRepository> {
    console.warn('useSQLite está deprecated. Use getTaskRepository() que já usa SQLite por padrão.');
    const { SQLiteOPFSTaskRepository } = await import('./sqlite-opfs-repo-simple');
    this.instance = new SQLiteOPFSTaskRepository();
    return this.instance;
  }
  
  /**
   * Verifica se está usando SQLite
   */
  static isUsingSQLite(): boolean {
    return this.instance?.constructor.name === 'SQLiteOPFSTaskRepository';
  }
}

// Imports serão feitos dinamicamente para evitar dependência circular
