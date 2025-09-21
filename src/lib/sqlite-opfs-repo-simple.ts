// sqlite-opfs-repo-simple.ts — Implementação SQLite OPFS simplificada (fallback)

import { ITaskRepository, Task, Query, Page, ID } from '@/types/domain';
import { TaskStatus, TaskPriority, TaskCategory, TaskComplexity } from '@/types/domain';

/**
 * Implementação SQLite OPFS simplificada usando IndexedDB como fallback
 * Esta implementação simula SQLite usando IndexedDB para evitar problemas de build
 * Em produção, você usaria wa-sqlite real
 */
export class SQLiteOPFSTaskRepository implements ITaskRepository {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private readonly dbName = 'TaskManagerSQLite';
  private readonly version = 1;

  /**
   * Inicializa o "SQLite" usando IndexedDB
   */
  private async initializeSQLite(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await this.openIndexedDB();
      await this.createSchema();
      this.isInitialized = true;
      console.log('SQLite OPFS (IndexedDB) inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar SQLite OPFS:', error);
      throw new Error('Falha ao inicializar SQLite OPFS');
    }
  }

  /**
   * Abre conexão com IndexedDB
   */
  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Store principal de tarefas
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('status_atual', 'status_atual', { unique: false });
          taskStore.createIndex('prioridade', 'prioridade', { unique: false });
          taskStore.createIndex('impedimento', 'impedimento', { unique: false });
          taskStore.createIndex('data_cadastro', 'data_cadastro', { unique: false });
          taskStore.createIndex('ordem', 'ordem', { unique: false });
          taskStore.createIndex('categoria', 'categoria', { unique: false });
          taskStore.createIndex('complexidade', 'complexidade', { unique: false });
          taskStore.createIndex('is_active', 'is_active', { unique: false });
        }
        
        // Store de histórico de status
        if (!db.objectStoreNames.contains('status_history')) {
          const statusStore = db.createObjectStore('status_history', { keyPath: 'id', autoIncrement: true });
          statusStore.createIndex('task_id', 'task_id', { unique: false });
        }
        
        // Store de histórico de impedimentos
        if (!db.objectStoreNames.contains('impediment_history')) {
          const impedimentStore = db.createObjectStore('impediment_history', { keyPath: 'id' });
          impedimentStore.createIndex('task_id', 'task_id', { unique: false });
        }
      };
    });
  }

  /**
   * Cria o schema (já criado no onupgradeneeded)
   */
  private async createSchema(): Promise<void> {
    // Schema já é criado no onupgradeneeded do IndexedDB
    console.log('Schema criado com sucesso');
  }

  /**
   * Garante que o banco está inicializado
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeSQLite();
    }
  }

  /**
   * Busca uma tarefa por ID
   */
  async get(id: ID): Promise<Task | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks', 'status_history', 'impediment_history'], 'readonly');
      const taskStore = transaction.objectStore('tasks');
      const statusStore = transaction.objectStore('status_history');
      const impedimentStore = transaction.objectStore('impediment_history');
      
      const taskRequest = taskStore.get(id);
      
      taskRequest.onsuccess = () => {
        const task = taskRequest.result;
        if (!task) {
          resolve(null);
          return;
        }
        
        // Buscar histórico de status
        const statusIndex = statusStore.index('task_id');
        const statusRequest = statusIndex.getAll(id);
        
        statusRequest.onsuccess = () => {
          const statusHistory = statusRequest.result.map((entry: any) => ({
            status: entry.status,
            timestamp: new Date(entry.timestamp)
          }));
          
          // Buscar histórico de impedimentos
          const impedimentIndex = impedimentStore.index('task_id');
          const impedimentRequest = impedimentIndex.getAll(id);
          
          impedimentRequest.onsuccess = () => {
            const impedimentHistory = impedimentRequest.result.map((entry: any) => ({
              id: entry.id,
              impedimento: entry.impedimento,
              motivo: entry.motivo,
              timestamp: new Date(entry.timestamp)
            }));
            
            const fullTask = this.mapRowToTask(task, statusHistory, impedimentHistory);
            resolve(fullTask);
          };
          
          impedimentRequest.onerror = () => reject(impedimentRequest.error);
        };
        
        statusRequest.onerror = () => reject(statusRequest.error);
      };
      
      taskRequest.onerror = () => reject(taskRequest.error);
    });
  }

  /**
   * Busca tarefas com filtros, ordenação e paginação
   */
  async search(query?: Query<Task>): Promise<Page<Task>> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks', 'status_history', 'impediment_history'], 'readonly');
      const taskStore = transaction.objectStore('tasks');
      const statusStore = transaction.objectStore('status_history');
      const impedimentStore = transaction.objectStore('impediment_history');
      
      const taskRequest = taskStore.getAll();
      
      taskRequest.onsuccess = async () => {
        try {
          const allTasks = taskRequest.result;
          
          // Aplicar filtros
          let filteredTasks = allTasks.filter(task => this.matchesTask(task, query?.spec));
          
          // Aplicar ordenação
          if (query?.page?.sort && query.page.sort.length > 0) {
            filteredTasks = this.sortTasks(filteredTasks, query.page.sort);
          } else {
            filteredTasks = this.sortTasks(filteredTasks, [{ field: 'data_cadastro', dir: 'desc' }]);
          }
          
          // Aplicar paginação
          const page = query?.page?.page || 1;
          const size = query?.page?.size || 10;
          const start = (page - 1) * size;
          const end = start + size;
          
          const paginatedTasks = filteredTasks.slice(start, end);
          
          // Buscar histórico para cada tarefa
          const tasksWithHistory = await Promise.all(
            paginatedTasks.map(async (task) => {
              const statusHistory = await this.getStatusHistory(task.id, statusStore);
              const impedimentHistory = await this.getImpedimentHistory(task.id, impedimentStore);
              return this.mapRowToTask(task, statusHistory, impedimentHistory);
            })
          );
          
          resolve({
            items: tasksWithHistory,
            total: filteredTasks.length,
            page,
            size
          });
        } catch (error) {
          reject(error);
        }
      };
      
      taskRequest.onerror = () => reject(taskRequest.error);
    });
  }

  /**
   * Busca histórico de status para uma tarefa
   */
  private async getStatusHistory(taskId: ID, statusStore: IDBObjectStore): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const statusIndex = statusStore.index('task_id');
      const statusRequest = statusIndex.getAll(taskId);
      
      statusRequest.onsuccess = () => {
        const statusHistory = statusRequest.result.map((entry: any) => ({
          status: entry.status,
          timestamp: new Date(entry.timestamp)
        }));
        resolve(statusHistory);
      };
      
      statusRequest.onerror = () => reject(statusRequest.error);
    });
  }

  /**
   * Busca histórico de impedimentos para uma tarefa
   */
  private async getImpedimentHistory(taskId: ID, impedimentStore: IDBObjectStore): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const impedimentIndex = impedimentStore.index('task_id');
      const impedimentRequest = impedimentIndex.getAll(taskId);
      
      impedimentRequest.onsuccess = () => {
        const impedimentHistory = impedimentRequest.result.map((entry: any) => ({
          id: entry.id,
          impedimento: entry.impedimento,
          motivo: entry.motivo,
          timestamp: new Date(entry.timestamp)
        }));
        resolve(impedimentHistory);
      };
      
      impedimentRequest.onerror = () => reject(impedimentRequest.error);
    });
  }

  /**
   * Salva uma nova tarefa
   */
  async save(entity: Task): Promise<Task> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks', 'status_history', 'impediment_history'], 'readwrite');
      const taskStore = transaction.objectStore('tasks');
      const statusStore = transaction.objectStore('status_history');
      const impedimentStore = transaction.objectStore('impediment_history');
      
      // Converter Task para formato do banco
      const dbTask = this.mapTaskToDb(entity);
      
      // Verificar se já existe
      const checkRequest = taskStore.get(entity.id);
      
      checkRequest.onsuccess = () => {
        const existingTask = checkRequest.result;
        
        if (existingTask) {
          // Tarefa já existe - usar update
          const updateRequest = taskStore.put(dbTask);
          updateRequest.onsuccess = () => {
            this.saveHistory(entity, statusStore, impedimentStore);
            resolve(entity);
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // Tarefa não existe - usar add
          const addRequest = taskStore.add(dbTask);
          addRequest.onsuccess = () => {
            this.saveHistory(entity, statusStore, impedimentStore);
            resolve(entity);
          };
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      
      checkRequest.onerror = () => reject(checkRequest.error);
    });
  }

  /**
   * Salva histórico de status e impedimentos
   */
  private saveHistory(entity: Task, statusStore: IDBObjectStore, impedimentStore: IDBObjectStore): void {
    // Limpar histórico anterior de status
    const statusIndex = statusStore.index('task_id');
    const statusRequest = statusIndex.getAll(entity.id);
    statusRequest.onsuccess = () => {
      statusRequest.result.forEach(entry => {
        statusStore.delete(entry.id || entry.key);
      });
      
      // Salvar novo histórico de status
      if (entity.statusHistorico && entity.statusHistorico.length > 0) {
        entity.statusHistorico.forEach(entry => {
          statusStore.add({
            task_id: entity.id,
            status: entry.status,
            timestamp: (entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp)).toISOString()
          });
        });
      }
    };
    
    // Limpar histórico anterior de impedimentos
    const impedimentIndex = impedimentStore.index('task_id');
    const impedimentRequest = impedimentIndex.getAll(entity.id);
    impedimentRequest.onsuccess = () => {
      impedimentRequest.result.forEach(entry => {
        impedimentStore.delete(entry.id);
      });
      
      // Salvar novo histórico de impedimentos
      if (entity.impedimentoHistorico && entity.impedimentoHistorico.length > 0) {
        entity.impedimentoHistorico.forEach(entry => {
          impedimentStore.add({
            id: entry.id,
            task_id: entity.id,
            impedimento: entry.impedimento,
            motivo: entry.motivo,
            timestamp: (entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp)).toISOString()
          });
        });
      }
    };
  }

  /**
   * Atualiza uma tarefa existente
   */
  async update(id: ID, patch: Partial<Task>): Promise<Task> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existingTask = getRequest.result;
        if (!existingTask) {
          reject(new Error(`Tarefa com ID ${id} não encontrada`));
          return;
        }
        
        const updatedTask = { ...existingTask, ...this.mapTaskToDb(patch as Task) };
        
        const putRequest = store.put(updatedTask);
        
        putRequest.onsuccess = () => {
          const fullTask = this.mapRowToTask(updatedTask, [], []);
          resolve(fullTask);
        };
        
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Remove uma tarefa
   */
  async delete(id: ID): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existingTask = getRequest.result;
        if (!existingTask) {
          reject(new Error(`Tarefa com ID ${id} não encontrada`));
          return;
        }
        
        // Soft delete - marcar como inativo
        existingTask.is_active = false;
        
        const putRequest = store.put(existingTask);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Conta o número de tarefas que correspondem à query
   */
  async count(query?: Query<Task>): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allTasks = request.result;
        const filteredTasks = allTasks.filter(task => this.matchesTask(task, query?.spec));
        resolve(filteredTasks.length);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Busca tarefas por status
   */
  async findByStatus(status: string): Promise<Task[]> {
    const result = await this.search({
      spec: {
        where: [{ field: 'statusAtual', op: 'eq', value: status }]
      }
    });
    return result.items;
  }

  /**
   * Busca tarefas por prioridade
   */
  async findByPriority(priority: string): Promise<Task[]> {
    const result = await this.search({
      spec: {
        where: [{ field: 'prioridade', op: 'eq', value: priority }]
      }
    });
    return result.items;
  }

  /**
   * Busca tarefas com impedimentos
   */
  async findWithImpediments(): Promise<Task[]> {
    const result = await this.search({
      spec: {
        where: [{ field: 'impedimento', op: 'eq', value: true }]
      }
    });
    return result.items;
  }

  /**
   * Verifica se uma tarefa corresponde aos filtros
   */
  private matchesTask(task: any, spec?: any): boolean {
    if (!spec || !spec.where || spec.where.length === 0) {
      return task.is_active !== false;
    }
    
    return spec.where.every((rule: any) => {
      const field = this.mapFieldToDbColumn(rule.field);
      const value = task[field];
      
      switch (rule.op) {
        case 'eq': return value === rule.value;
        case 'neq': return value !== rule.value;
        case 'gt': return value > rule.value;
        case 'lt': return value < rule.value;
        case 'gte': return value >= rule.value;
        case 'lte': return value <= rule.value;
        case 'contains': 
          return typeof value === 'string' && 
                 value.toLowerCase().includes(String(rule.value).toLowerCase());
        case 'in': return Array.isArray(rule.value) && rule.value.includes(value);
        case 'between': 
          return Array.isArray(rule.value) && 
                 value >= rule.value[0] && value <= rule.value[1];
        case 'is_null': return value === null || value === undefined;
        case 'is_not_null': return value !== null && value !== undefined;
        default: return true;
      }
    });
  }

  /**
   * Ordena tarefas
   */
  private sortTasks(tasks: any[], sort: any[]): any[] {
    return tasks.sort((a, b) => {
      for (const s of sort) {
        const field = this.mapFieldToDbColumn(s.field);
        const aValue = a[field];
        const bValue = b[field];
        
        if (aValue < bValue) return s.dir === 'asc' ? -1 : 1;
        if (aValue > bValue) return s.dir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Mapeia campos da entidade para colunas do banco
   */
  private mapFieldToDbColumn(field: keyof Task): string {
    const mapping: Record<string, string> = {
      'statusAtual': 'status_atual',
      'impedimentoMotivo': 'impedimento_motivo',
      'dataImpedimento': 'data_impedimento',
      'dataCadastro': 'data_cadastro',
      'dataInicio': 'data_inicio',
      'dataFim': 'data_fim',
      'estimativaTempo': 'estimativa_tempo',
      'numeroMudancasPrioridade': 'numero_mudancas_prioridade',
      'tempoTotalImpedimento': 'tempo_total_impedimento',
      'foiRetrabalho': 'foi_retrabalho',
      'referenced_task_id': 'referenced_task_id',
      'parent_id': 'parent_id',
      'is_active': 'is_active',
      'id_rsync': 'id_rsync'
    };
    
    return mapping[field] || field;
  }

  /**
   * Mapeia Task para formato do banco
   */
  private mapTaskToDb(task: Task): any {
    return {
      id: task.id,
      titulo: task.titulo,
      descricao: task.descricao,
      status_atual: task.statusAtual,
      prioridade: task.prioridade,
      impedimento: task.impedimento,
      impedimento_motivo: task.impedimentoMotivo,
      data_impedimento: task.dataImpedimento?.toISOString() || null,
      data_cadastro: task.dataCadastro.toISOString(),
      data_inicio: task.dataInicio?.toISOString() || null,
      data_fim: task.dataFim?.toISOString() || null,
      ordem: task.ordem || 0,
      tags: JSON.stringify(task.tags || []),
      categoria: task.categoria || null,
      estimativa_tempo: task.estimativaTempo || null,
      complexidade: task.complexidade || null,
      numero_mudancas_prioridade: task.numeroMudancasPrioridade || 0,
      tempo_total_impedimento: task.tempoTotalImpedimento || 0,
      foi_retrabalho: task.foiRetrabalho || false,
      referenced_task_id: task.referenced_task_id || null,
      parent_id: task.parent_id || null,
      is_active: task.is_active !== false,
      rsync: task.rsync || false,
      id_rsync: task.id_rsync || null
    };
  }

  /**
   * Mapeia linha do banco para entidade Task
   */
  private mapRowToTask(
    row: any, 
    statusHistory: any[] = [], 
    impedimentHistory: any[] = []
  ): Task {
    return {
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      statusAtual: row.status_atual,
      prioridade: row.prioridade,
      impedimento: Boolean(row.impedimento),
      impedimentoMotivo: row.impedimento_motivo,
      dataImpedimento: row.data_impedimento ? new Date(row.data_impedimento) : null,
      dataCadastro: new Date(row.data_cadastro),
      dataInicio: row.data_inicio ? new Date(row.data_inicio) : null,
      dataFim: row.data_fim ? new Date(row.data_fim) : null,
      ordem: row.ordem,
      tags: row.tags ? JSON.parse(row.tags) : [],
      categoria: row.categoria,
      estimativaTempo: row.estimativa_tempo,
      complexidade: row.complexidade,
      numeroMudancasPrioridade: row.numero_mudancas_prioridade,
      tempoTotalImpedimento: row.tempo_total_impedimento,
      foiRetrabalho: Boolean(row.foi_retrabalho),
      referenced_task_id: row.referenced_task_id,
      parent_id: row.parent_id,
      is_active: Boolean(row.is_active),
      rsync: Boolean(row.rsync),
      id_rsync: row.id_rsync,
      statusHistorico: statusHistory,
      impedimentoHistorico: impedimentHistory
    };
  }

  /**
   * Fecha a conexão com o banco
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Migra dados do LocalStorage para SQLite
   */
  async migrateFromLocalStorage(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Carregar dados do LocalStorage
      const { loadTasksFromStorage } = await import('@/lib/storage');
      const tasks = loadTasksFromStorage();
      
      if (tasks.length === 0) {
        console.log('Nenhuma tarefa encontrada no LocalStorage para migrar');
        return;
      }

      console.log(`Migrando ${tasks.length} tarefas do LocalStorage para SQLite...`);
      
      // Inserir cada tarefa
      for (const task of tasks) {
        try {
          await this.save(task);
        } catch (error) {
          console.warn(`Erro ao migrar tarefa ${task.id}:`, error);
        }
      }
      
      console.log('Migração concluída com sucesso!');
      
    } catch (error) {
      console.error('Erro durante a migração:', error);
      throw error;
    }
  }
}
