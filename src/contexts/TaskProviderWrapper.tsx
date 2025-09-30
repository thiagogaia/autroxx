// TaskProviderWrapper.tsx — Wrapper que gerencia a escolha entre localStorage e IndexedDB
// Permite alternar entre os dois tipos de armazenamento

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import { TaskProvider as TaskProviderIndexedDB } from '@/contexts/TaskContextV2';
import { TaskContextType } from '@/types/task';
import { useIsClient } from '@/hooks/useIsClient';

type StorageType = 'localStorage' | 'indexeddb';

interface StorageContextType {
  storageType: StorageType;
  setStorageType: (type: StorageType) => void;
  isMigrating: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface TaskProviderWrapperProps {
  children: ReactNode;
}

export function TaskProviderWrapper({ children }: TaskProviderWrapperProps) {
  const isClient = useIsClient();
  const [storageType, setStorageTypeState] = useState<StorageType>('localStorage');
  const [isMigrating, setIsMigrating] = useState(false);

  // Carregar preferência salva
  useEffect(() => {
    if (!isClient) return;
    
    const savedStorage = localStorage.getItem('task-manager-storage-type') as StorageType;
    if (savedStorage && ['localStorage', 'indexeddb'].includes(savedStorage)) {
      setStorageTypeState(savedStorage);
    }
  }, [isClient]);

  const setStorageType = (type: StorageType) => {
    setStorageTypeState(type);
    if (isClient) {
      localStorage.setItem('task-manager-storage-type', type);
    }
  };

  const contextValue: StorageContextType = {
    storageType,
    setStorageType,
    isMigrating
  };

  return (
    <StorageContext.Provider value={contextValue}>
      {storageType === 'localStorage' ? (
        <TaskProvider>
          {children}
        </TaskProvider>
      ) : (
        <TaskProviderIndexedDB>
          {children}
        </TaskProviderIndexedDB>
      )}
    </StorageContext.Provider>
  );
}

export function useStorageContext() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorageContext must be used within a TaskProviderWrapper');
  }
  return context;
}

// Hook que sempre retorna o contexto de tarefas, independente do storage
export function useTaskContext() {
  // Este hook será sobrescrito pelos providers específicos
  throw new Error('useTaskContext must be used within a TaskProvider or TaskProviderIndexedDB');
}
