// indexeddb-repo.ts — Repositório IndexedDB usando Dexie.js
// Implementação offline-first com sincronização posterior e queries paginadas

import Dexie, { Table } from 'dexie';
import { Task, TaskStatus, TaskPriority, TaskCategory, TaskComplexity, PaginationParams, PaginationResult, TaskFilters } from '@/types/task';
import { ID } from '@/types/domain';

// Interface para sincronização
interface SyncMetadata {
  id: string;
  lastModified: Date;
  isSynced: boolean;
  syncVersion: number;
  conflictResolution?: 'local' | 'remote' | 'manual';
}

// Extensão da Task para incluir metadados de sincronização
interface TaskWithSync extends Task {
  syncMetadata: SyncMetadata;
}

// Configuração do banco de dados Dexie
class TaskDatabase extends Dexie {
  tasks!: Table<TaskWithSync>;
  syncQueue!: Table<{
    id: string;
    operation: 'create' | 'update' | 'delete';
    data: Task | Partial<Task>;
    timestamp: Date;
    retryCount: number;
  }>;

  constructor() {
    super('TaskManagerDB');
    
    this.version(1).stores({
      tasks: '++id, titulo, statusAtual, prioridade, categoria, dataCadastro, dataInicio, dataFim, impedimento, syncMetadata.lastModified, syncMetadata.isSynced',
      syncQueue: '++id, operation, timestamp, retryCount'
    });

    // Índices compostos para queries otimizadas
    this.version(2).stores({
      tasks: '++id, titulo, statusAtual, prioridade, categoria, dataCadastro, dataInicio, dataFim, impedimento, syncMetadata.lastModified, syncMetadata.isSynced, [statusAtual+prioridade], [categoria+statusAtual]',
      syncQueue: '++id, operation, timestamp, retryCount'
    });

    // Índices para filtros avançados
    this.version(3).stores({
      tasks: '++id, titulo, statusAtual, prioridade, categoria, dataCadastro, dataInicio, dataFim, impedimento, syncMetadata.lastModified, syncMetadata.isSynced, [statusAtual+prioridade], [categoria+statusAtual], [dataCadastro+statusAtual], [impedimento+statusAtual]',
      syncQueue: '++id, operation, timestamp, retryCount'
    });
  }
}

// Instância global do banco
const db = new TaskDatabase();

export class IndexedDBTaskRepository {
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

  // Métodos básicos CRUD
  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const now = new Date();
    const taskWithSync: TaskWithSync = {
      ...task,
      id: await this.generateId(),
      syncMetadata: {
        id: `sync_${Date.now()}_${Math.random()}`,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: 1
      }
    };

    await db.tasks.add(taskWithSync);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('create', taskWithSync);
    }

    return taskWithSync;
  }

  async getById(id: number): Promise<Task | null> {
    const task = await db.tasks.get(id);
    return task ? this.removeSyncMetadata(task) : null;
  }

  async update(id: number, updates: Partial<Task>): Promise<Task> {
    const existingTask = await db.tasks.get(id);
    if (!existingTask) {
      throw new Error(`Task with id ${id} not found`);
    }

    const now = new Date();
    const updatedTask: TaskWithSync = {
      ...existingTask,
      ...updates,
      syncMetadata: {
        ...existingTask.syncMetadata,
        lastModified: now,
        isSynced: this.isOnline,
        syncVersion: existingTask.syncMetadata.syncVersion + 1
      }
    };

    await db.tasks.update(id, updatedTask);

    if (!this.isOnline) {
      await this.addToSyncQueue('update', { id, ...updates });
    }

    return this.removeSyncMetadata(updatedTask);
  }

  async delete(id: number): Promise<void> {
    const task = await db.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }

    await db.tasks.delete(id);

    if (!this.isOnline) {
      await this.addToSyncQueue('delete', { id });
    }
  }

  // Queries paginadas e filtradas
  async search(filters: TaskFilters = {}, pagination: PaginationParams = { page: 1, limit: 10, offset: 0 }): Promise<PaginationResult<Task>> {
    // Buscar todos os dados primeiro
    let data = await db.tasks.toArray();

    // Aplicar filtros manualmente
    data = this.applyFiltersToArray(data, filters);

    // Contar total de registros após filtros
    const total = data.length;

    // Aplicar ordenação decrescente se necessário
    if (filters.sortOrder === 'desc' && filters.sortBy) {
      data = this.sortTasksDescending(data, filters.sortBy);
    }

    // Aplicar paginação manualmente após ordenação
    const start = pagination.offset;
    const end = start + pagination.limit;
    const paginatedData = data.slice(start, end);

    // Remover metadados de sincronização dos resultados
    const tasks = paginatedData.map(task => this.removeSyncMetadata(task));

    return {
      data: tasks,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page * pagination.limit < total,
        hasPrev: pagination.page > 1
      }
    };
  }

  private applyFilters(query: Dexie.Collection<TaskWithSync, number>, filters: TaskFilters): Dexie.Collection<TaskWithSync, number> {
    // Filtro por status usando índice
    if (filters.statusFilter && filters.statusFilter !== 'tudo') {
      if (['a_fazer', 'fazendo', 'concluido'].includes(filters.statusFilter)) {
        query = query.filter(task => task.statusAtual === filters.statusFilter);
      } else if (filters.statusFilter === 'normal') {
        query = query.filter(task => task.prioridade === 'normal' && task.statusAtual !== 'concluido');
      } else if (filters.statusFilter === 'urgente') {
        query = query.filter(task => task.prioridade === 'alta' && task.statusAtual !== 'concluido');
      }
    }

    // Filtro por título (busca textual)
    if (filters.titleSearch) {
      const searchTerm = filters.titleSearch.toLowerCase();
      query = query.filter(task => 
        task.titulo.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por data usando índice
    if (filters.dateRange?.start || filters.dateRange?.end) {
      query = query.filter(task => {
        const taskDate = new Date(task.dataCadastro);
        if (filters.dateRange?.start && taskDate < filters.dateRange.start) return false;
        if (filters.dateRange?.end && taskDate > filters.dateRange.end) return false;
        return true;
      });
    }

    // Filtro por prioridade
    if (filters.priorityFilter && filters.priorityFilter.length > 0) {
      query = query.filter(task => 
        filters.priorityFilter!.includes(task.prioridade)
      );
    }

    // Filtro por categoria usando índice
    if (filters.categoryFilter && filters.categoryFilter.length > 0) {
      query = query.filter(task => 
        task.categoria && filters.categoryFilter!.includes(task.categoria)
      );
    }

    // Filtro por tags
    if (filters.tagsFilter && filters.tagsFilter.length > 0) {
      query = query.filter(task => 
        task.tags && task.tags.some(tag => filters.tagsFilter!.includes(tag))
      );
    }

    // Filtro por impedimento usando índice
    if (filters.impedimentFilter !== null) {
      query = query.filter(task => 
        task.impedimento === filters.impedimentFilter
      );
    }

    // Filtro por complexidade
    if (filters.complexityFilter && filters.complexityFilter.length > 0) {
      query = query.filter(task => 
        task.complexidade && filters.complexityFilter!.includes(task.complexidade)
      );
    }

    // Ordenação
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'titulo':
          query = query.sortBy('titulo');
          break;
        case 'prioridade':
          query = query.sortBy('prioridade');
          break;
        case 'dataCadastro':
          query = query.sortBy('dataCadastro');
          break;
        case 'dataInicio':
          query = query.sortBy('dataInicio');
          break;
        case 'dataFim':
          query = query.sortBy('dataFim');
          break;
      }

      // Para ordem decrescente, vamos ordenar os resultados após buscar
      // O Dexie não tem método reverse() direto
    }

    return query;
  }

  private applyFiltersToArray(tasks: TaskWithSync[], filters: TaskFilters): TaskWithSync[] {
    let filteredTasks = [...tasks];

    // Filtro por status usando índice
    if (filters.statusFilter && filters.statusFilter !== 'tudo') {
      if (['a_fazer', 'fazendo', 'concluido'].includes(filters.statusFilter)) {
        filteredTasks = filteredTasks.filter(task => task.statusAtual === filters.statusFilter);
      } else if (filters.statusFilter === 'normal') {
        filteredTasks = filteredTasks.filter(task => task.prioridade === 'normal' && task.statusAtual !== 'concluido');
      } else if (filters.statusFilter === 'urgente') {
        filteredTasks = filteredTasks.filter(task => task.prioridade === 'alta' && task.statusAtual !== 'concluido');
      }
    }

    // Filtro por título (busca textual)
    if (filters.titleSearch) {
      const searchTerm = filters.titleSearch.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.titulo.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por data usando índice
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.dataCadastro);
        if (filters.dateRange?.start && taskDate < filters.dateRange.start) return false;
        if (filters.dateRange?.end && taskDate > filters.dateRange.end) return false;
        return true;
      });
    }

    // Filtro por prioridade
    if (filters.priorityFilter && filters.priorityFilter.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.priorityFilter!.includes(task.prioridade)
      );
    }

    // Filtro por categoria usando índice
    if (filters.categoryFilter && filters.categoryFilter.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        task.categoria && filters.categoryFilter!.includes(task.categoria)
      );
    }

    // Filtro por tags
    if (filters.tagsFilter && filters.tagsFilter.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        task.tags && task.tags.some(tag => filters.tagsFilter!.includes(tag))
      );
    }

    // Filtro por impedimento usando índice
    if (filters.impedimentFilter !== null) {
      filteredTasks = filteredTasks.filter(task => 
        task.impedimento === filters.impedimentFilter
      );
    }

    // Filtro por complexidade
    if (filters.complexityFilter && filters.complexityFilter.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        task.complexidade && filters.complexityFilter!.includes(task.complexidade)
      );
    }

    // Aplicar ordenação básica se especificada
    if (filters.sortBy && filters.sortOrder !== 'desc') {
      filteredTasks = this.sortTasksAscending(filteredTasks, filters.sortBy);
    }

    return filteredTasks;
  }

  private sortTasksAscending(tasks: TaskWithSync[], sortBy: string): TaskWithSync[] {
    return tasks.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'titulo':
          aValue = a.titulo.toLowerCase();
          bValue = b.titulo.toLowerCase();
          break;
        case 'prioridade':
          const priorityOrder = { 'baixa': 1, 'normal': 2, 'media': 3, 'alta': 4 };
          aValue = priorityOrder[a.prioridade];
          bValue = priorityOrder[b.prioridade];
          break;
        case 'dataCadastro':
          aValue = new Date(a.dataCadastro).getTime();
          bValue = new Date(b.dataCadastro).getTime();
          break;
        case 'dataInicio':
          aValue = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;
          bValue = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;
          break;
        case 'dataFim':
          aValue = a.dataFim ? new Date(a.dataFim).getTime() : 0;
          bValue = b.dataFim ? new Date(b.dataFim).getTime() : 0;
          break;
        default:
          return 0;
      }

      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });
  }

  private sortTasksDescending(tasks: TaskWithSync[], sortBy: string): TaskWithSync[] {
    return tasks.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'titulo':
          aValue = a.titulo.toLowerCase();
          bValue = b.titulo.toLowerCase();
          break;
        case 'prioridade':
          const priorityOrder = { 'baixa': 1, 'normal': 2, 'media': 3, 'alta': 4 };
          aValue = priorityOrder[a.prioridade];
          bValue = priorityOrder[b.prioridade];
          break;
        case 'dataCadastro':
          aValue = new Date(a.dataCadastro).getTime();
          bValue = new Date(b.dataCadastro).getTime();
          break;
        case 'dataInicio':
          aValue = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;
          bValue = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;
          break;
        case 'dataFim':
          aValue = a.dataFim ? new Date(a.dataFim).getTime() : 0;
          bValue = b.dataFim ? new Date(b.dataFim).getTime() : 0;
          break;
        default:
          return 0;
      }

      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    });
  }

  // Métodos específicos para Task
  async findByStatus(status: TaskStatus): Promise<Task[]> {
    const tasks = await db.tasks
      .where('statusAtual')
      .equals(status)
      .toArray();
    
    return tasks.map(task => this.removeSyncMetadata(task));
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    const tasks = await db.tasks
      .where('prioridade')
      .equals(priority)
      .toArray();
    
    return tasks.map(task => this.removeSyncMetadata(task));
  }

  async findWithImpediments(): Promise<Task[]> {
    const tasks = await db.tasks
      .where('impedimento')
      .equals(true)
      .toArray();
    
    return tasks.map(task => this.removeSyncMetadata(task));
  }

  async count(filters: TaskFilters = {}): Promise<number> {
    const allTasks = await db.tasks.toArray();
    const filteredTasks = this.applyFiltersToArray(allTasks, filters);
    return filteredTasks.length;
  }

  // Funcionalidades de sincronização
  private async addToSyncQueue(operation: 'create' | 'update' | 'delete', data: Task | Partial<Task>): Promise<void> {
    await db.syncQueue.add({
      id: `queue_${Date.now()}_${Math.random()}`,
      operation,
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
      // Sincronizar tarefas pendentes
      const allTasks = await db.tasks.toArray();
      const pendingTasks = allTasks.filter(task => !task.syncMetadata.isSynced);

      for (const task of pendingTasks) {
        try {
          await this.syncTaskToServer(task);
          await db.tasks.update(task.id, {
            syncMetadata: {
              ...task.syncMetadata,
              isSynced: true
            }
          });
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
        }
      }

      // Processar fila de sincronização
      const syncQueue = await db.syncQueue.toArray();
      for (const item of syncQueue) {
        try {
          await this.processSyncQueueItem(item);
          await db.syncQueue.delete(item.id);
        } catch (error) {
          console.error(`Failed to process sync queue item ${item.id}:`, error);
          // Incrementar contador de tentativas
          await db.syncQueue.update(item.id, {
            retryCount: item.retryCount + 1
          });
        }
      }

    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncTaskToServer(task: TaskWithSync): Promise<void> {
    // Implementar chamada para API do servidor
    // Por enquanto, simular sucesso
    console.log(`Syncing task ${task.id} to server`);
    
    // Aqui você implementaria a chamada real para sua API:
    // const response = await fetch('/api/tasks', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(this.removeSyncMetadata(task))
    // });
    // if (!response.ok) throw new Error('Sync failed');
  }

  private async processSyncQueueItem(item: {
    id: string;
    operation: 'create' | 'update' | 'delete';
    data: Task | Partial<Task>;
    timestamp: Date;
    retryCount: number;
  }): Promise<void> {
    // Implementar processamento da fila de sincronização
    console.log(`Processing sync queue item: ${item.operation}`, item.data);
    
    // Aqui você implementaria as chamadas para sua API baseadas na operação:
    // switch (item.operation) {
    //   case 'create':
    //     await fetch('/api/tasks', { method: 'POST', ... });
    //     break;
    //   case 'update':
    //     await fetch(`/api/tasks/${item.data.id}`, { method: 'PUT', ... });
    //     break;
    //   case 'delete':
    //     await fetch(`/api/tasks/${item.data.id}`, { method: 'DELETE' });
    //     break;
    // }
  }

  // Utilitários
  private async generateId(): Promise<number> {
    const maxId = await db.tasks.orderBy('id').last();
    return (maxId?.id || 0) + 1;
  }

  private removeSyncMetadata(task: TaskWithSync): Task {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { syncMetadata, ...taskWithoutSync } = task;
    return taskWithoutSync;
  }

  // Métodos para migração de dados existentes
  async migrateFromLocalStorage(localStorageTasks: Task[]): Promise<void> {
    const tasksWithSync: TaskWithSync[] = localStorageTasks.map(task => ({
      ...task,
      syncMetadata: {
        id: `sync_${Date.now()}_${Math.random()}`,
        lastModified: new Date(),
        isSynced: false, // Marcar como não sincronizado para forçar sync
        syncVersion: 1
      }
    }));

    await db.tasks.bulkAdd(tasksWithSync);
  }

  // Métodos para backup e restore
  async exportData(): Promise<Task[]> {
    const tasks = await db.tasks.toArray();
    return tasks.map(task => this.removeSyncMetadata(task));
  }

  async importData(tasks: Task[]): Promise<void> {
    await db.tasks.clear();
    await this.migrateFromLocalStorage(tasks);
  }

  // Métodos para limpeza e manutenção
  async clearAllData(): Promise<void> {
    await db.tasks.clear();
    await db.syncQueue.clear();
  }

  async getDatabaseInfo(): Promise<{
    taskCount: number;
    syncQueueCount: number;
    unsyncedCount: number;
    databaseSize: number;
  }> {
    const taskCount = await db.tasks.count();
    const syncQueueCount = await db.syncQueue.count();
    
    // Contar tarefas não sincronizadas usando filtro manual
    const allTasks = await db.tasks.toArray();
    const unsyncedCount = allTasks.filter(task => !task.syncMetadata.isSynced).length;

    // Estimativa do tamanho do banco (aproximada)
    const databaseSize = await this.estimateDatabaseSize();

    return {
      taskCount,
      syncQueueCount,
      unsyncedCount,
      databaseSize
    };
  }

  private async estimateDatabaseSize(): Promise<number> {
    // Implementação simplificada para estimar tamanho
    const tasks = await db.tasks.toArray();
    const syncQueue = await db.syncQueue.toArray();
    
    const tasksSize = JSON.stringify(tasks).length;
    const syncQueueSize = JSON.stringify(syncQueue).length;
    
    return tasksSize + syncQueueSize;
  }
}

// Instância singleton do repositório
export const indexedDBRepository = new IndexedDBTaskRepository();

// Hook para usar o repositório em componentes React
export function useIndexedDBRepository() {
  return indexedDBRepository;
}
