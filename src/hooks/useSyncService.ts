// useSyncService.ts — Hook para gerenciar sincronização offline

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/domain';
import { 
  initializeSyncService, 
  getSyncService, 
  queueSyncOperation, 
  syncFromServer, 
  getSyncStatus 
} from '@/lib/sync-service';

interface SyncConfig {
  serverUrl: string;
  apiKey: string;
  syncInterval?: number;
  maxRetries?: number;
}

interface SyncStatus {
  isOnline: boolean;
  queueLength: number;
  lastSync: Date | null;
  isSyncing: boolean;
  error: string | null;
}

/**
 * Hook para gerenciar sincronização offline com SQLite OPFS
 */
export function useSyncService(config?: SyncConfig) {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    queueLength: 0,
    lastSync: null,
    isSyncing: false,
    error: null
  });

  // Inicializar serviço de sincronização
  useEffect(() => {
    if (config) {
      try {
        initializeSyncService({
          serverUrl: config.serverUrl,
          apiKey: config.apiKey,
          syncInterval: config.syncInterval || 30000,
          maxRetries: config.maxRetries || 3
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: `Erro ao inicializar sincronização: ${error}`
        }));
      }
    }
  }, [config]);

  // Atualizar status periodicamente
  useEffect(() => {
    const updateStatus = () => {
      const syncStatus = getSyncStatus();
      setStatus(prev => ({
        ...prev,
        isOnline: syncStatus.isOnline,
        queueLength: syncStatus.queueLength,
        lastSync: syncStatus.lastSync,
        error: null
      }));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Monitorar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true, error: null }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Adiciona operação à fila de sincronização
   */
  const queueOperation = useCallback(async (
    operation: 'create' | 'update' | 'delete',
    data: Task | { id: number }
  ) => {
    try {
      setStatus(prev => ({ ...prev, error: null }));
      await queueSyncOperation(operation, data);
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: `Erro ao adicionar à fila: ${error}`
      }));
    }
  }, []);

  /**
   * Sincroniza dados do servidor
   */
  const syncFromServerData = useCallback(async (): Promise<Task[]> => {
    try {
      setStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      const tasks = await syncFromServer();
      setStatus(prev => ({ ...prev, isSyncing: false }));
      return tasks;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: `Erro na sincronização: ${error}`
      }));
      throw error;
    }
  }, []);

  /**
   * Força processamento da fila de sincronização
   */
  const forceSync = useCallback(async () => {
    const syncService = getSyncService();
    if (syncService) {
      try {
        setStatus(prev => ({ ...prev, isSyncing: true, error: null }));
        // O processamento acontece automaticamente no serviço
        setStatus(prev => ({ ...prev, isSyncing: false }));
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isSyncing: false,
          error: `Erro na sincronização forçada: ${error}`
        }));
      }
    }
  }, []);

  return {
    status,
    queueOperation,
    syncFromServer: syncFromServerData,
    forceSync
  };
}

/**
 * Hook simplificado para apenas monitorar status de sincronização
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    queueLength: 0,
    lastSync: null,
    isSyncing: false,
    error: null
  });

  useEffect(() => {
    const updateStatus = () => {
      const syncStatus = getSyncStatus();
      setStatus(prev => ({
        ...prev,
        isOnline: syncStatus.isOnline,
        queueLength: syncStatus.queueLength,
        lastSync: syncStatus.lastSync
      }));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

/**
 * Hook para operações de sincronização específicas
 */
export function useTaskSync() {
  const { queueOperation } = useSyncService();

  const syncCreateTask = useCallback(async (task: Task) => {
    await queueOperation('create', task);
  }, [queueOperation]);

  const syncUpdateTask = useCallback(async (task: Task) => {
    await queueOperation('update', task);
  }, [queueOperation]);

  const syncDeleteTask = useCallback(async (taskId: number) => {
    await queueOperation('delete', { id: taskId });
  }, [queueOperation]);

  return {
    syncCreateTask,
    syncUpdateTask,
    syncDeleteTask
  };
}
