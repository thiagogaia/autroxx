// repository.ts — Interface Repository genérica

import { Repository, Task, Query, Page, ID } from '@/types/domain';
import { LocalStorageTaskRepository } from './localstorage-repo';

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
  
  static getTaskRepository(): ITaskRepository {
    if (!this.instance) {
      // Por enquanto, sempre usa LocalStorage
      // No futuro, pode ser configurado via environment ou DI
      this.instance = new LocalStorageTaskRepository();
    }
    return this.instance;
  }
  
  static setTaskRepository(repository: ITaskRepository): void {
    this.instance = repository;
  }
}

// Import será feito dinamicamente para evitar dependência circular
