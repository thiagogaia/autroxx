// service-worker.ts — Service Worker para sincronização offline com SQLite OPFS

import { Task } from '@/types/domain';

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: Task | { id: number };
  timestamp: number;
  retryCount: number;
}

interface SyncConfig {
  serverUrl: string;
  apiKey: string;
  syncInterval: number; // em ms
  maxRetries: number;
}

class TaskSyncService {
  private syncQueue: SyncQueueItem[] = [];
  private config: SyncConfig;
  private isOnline = navigator.onLine;
  private syncTimer: number | null = null;

  constructor(config: SyncConfig) {
    this.config = config;
    this.setupEventListeners();
    this.loadSyncQueue();
  }

  private setupEventListeners(): void {
    // Monitorar status de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Processar fila periodicamente
    this.syncTimer = window.setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, this.config.syncInterval);
  }

  /**
   * Adiciona operação à fila de sincronização
   */
  async queueOperation(operation: 'create' | 'update' | 'delete', data: Task | { id: number }): Promise<void> {
    const item: SyncQueueItem = {
      id: `${operation}_${Date.now()}_${Math.random()}`,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(item);
    await this.saveSyncQueue();

    // Tentar sincronizar imediatamente se online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Processa a fila de sincronização
   */
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const itemsToProcess = [...this.syncQueue];
    const processedItems: string[] = [];

    for (const item of itemsToProcess) {
      try {
        await this.syncItem(item);
        processedItems.push(item.id);
      } catch (error) {
        console.error(`Erro ao sincronizar item ${item.id}:`, error);
        
        item.retryCount++;
        if (item.retryCount >= this.config.maxRetries) {
          console.error(`Item ${item.id} excedeu número máximo de tentativas`);
          processedItems.push(item.id);
        }
      }
    }

    // Remover itens processados com sucesso
    this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item.id));
    await this.saveSyncQueue();
  }

  /**
   * Sincroniza um item individual
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const url = `${this.config.serverUrl}/api/tasks`;
    
    switch (item.operation) {
      case 'create':
        await this.syncCreate(url, item.data as Task);
        break;
      case 'update':
        await this.syncUpdate(url, item.data as Task);
        break;
      case 'delete':
        await this.syncDelete(url, item.data as { id: number });
        break;
    }
  }

  private async syncCreate(url: string, task: Task): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(task)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar tarefa: ${response.statusText}`);
    }
  }

  private async syncUpdate(url: string, task: Task): Promise<void> {
    const response = await fetch(`${url}/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(task)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar tarefa: ${response.statusText}`);
    }
  }

  private async syncDelete(url: string, data: { id: number }): Promise<void> {
    const response = await fetch(`${url}/${data.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar tarefa: ${response.statusText}`);
    }
  }

  /**
   * Sincroniza dados do servidor para o cliente
   */
  async syncFromServer(): Promise<Task[]> {
    if (!this.isOnline) {
      throw new Error('Sem conexão com a internet');
    }

    const url = `${this.config.serverUrl}/api/tasks`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar tarefas do servidor: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Salva a fila de sincronização no IndexedDB
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      // Limpar store existente
      await store.clear();
      
      // Adicionar todos os itens
      for (const item of this.syncQueue) {
        await store.add(item);
      }
    } catch (error) {
      console.error('Erro ao salvar fila de sincronização:', error);
    }
  }

  /**
   * Carrega a fila de sincronização do IndexedDB
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        this.syncQueue = request.result || [];
      };
    } catch (error) {
      console.error('Erro ao carregar fila de sincronização:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Abre conexão com IndexedDB
   */
  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TaskManagerSync', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Criar store para fila de sincronização
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Limpa a fila de sincronização
   */
  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
  }

  /**
   * Retorna status da sincronização
   */
  getSyncStatus(): {
    isOnline: boolean;
    queueLength: number;
    lastSync: Date | null;
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSync: this.syncQueue.length > 0 ? 
        new Date(Math.min(...this.syncQueue.map(item => item.timestamp))) : 
        null
    };
  }

  /**
   * Destrói o serviço de sincronização
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

// Instância global do serviço de sincronização
let syncService: TaskSyncService | null = null;

/**
 * Inicializa o serviço de sincronização
 */
export function initializeSyncService(config: SyncConfig): TaskSyncService {
  if (syncService) {
    syncService.destroy();
  }
  
  syncService = new TaskSyncService(config);
  return syncService;
}

/**
 * Retorna a instância do serviço de sincronização
 */
export function getSyncService(): TaskSyncService | null {
  return syncService;
}

/**
 * Adiciona operação à fila de sincronização
 */
export async function queueSyncOperation(
  operation: 'create' | 'update' | 'delete', 
  data: Task | { id: number }
): Promise<void> {
  if (syncService) {
    await syncService.queueOperation(operation, data);
  }
}

/**
 * Sincroniza dados do servidor
 */
export async function syncFromServer(): Promise<Task[]> {
  if (!syncService) {
    throw new Error('Serviço de sincronização não inicializado');
  }
  return await syncService.syncFromServer();
}

/**
 * Retorna status da sincronização
 */
export function getSyncStatus(): {
  isOnline: boolean;
  queueLength: number;
  lastSync: Date | null;
} {
  if (!syncService) {
    return {
      isOnline: navigator.onLine,
      queueLength: 0,
      lastSync: null
    };
  }
  return syncService.getSyncStatus();
}

// Configuração padrão
const defaultConfig: SyncConfig = {
  serverUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  syncInterval: 30000, // 30 segundos
  maxRetries: 3
};

// Auto-inicializar se estiver no browser
if (typeof window !== 'undefined') {
  initializeSyncService(defaultConfig);
}
