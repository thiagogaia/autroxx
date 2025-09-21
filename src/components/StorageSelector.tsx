// StorageSelector.tsx — Seletor de tipo de armazenamento
// Permite escolher entre localStorage e IndexedDB

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, HardDrive, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { migrationService } from '@/lib/migration-utils';
import { useIsClient } from '@/hooks/useIsClient';

type StorageType = 'localStorage' | 'indexeddb';

interface StorageInfo {
  type: StorageType;
  name: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
}

const storageOptions: StorageInfo[] = [
  {
    type: 'localStorage',
    name: 'LocalStorage',
    description: 'Armazenamento simples e rápido',
    features: [
      'Sincronização imediata',
      'Sem configuração',
      'Compatível com todos os navegadores',
      'Limite de ~5-10MB'
    ],
    icon: <HardDrive className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    type: 'indexeddb',
    name: 'IndexedDB',
    description: 'Banco de dados local avançado',
    features: [
      'Offline-first',
      'Queries paginadas',
      'Sincronização posterior',
      'Sem limite de tamanho',
      'Índices otimizados'
    ],
    icon: <Database className="w-6 h-6" />,
    color: 'bg-green-500'
  }
];

interface StorageSelectorProps {
  currentStorage: StorageType;
  onStorageChange: (storage: StorageType) => void;
}

export function StorageSelector({ currentStorage, onStorageChange }: StorageSelectorProps) {
  const isClient = useIsClient();
  const [isOnline, setIsOnline] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<{
    completed: boolean;
    loading: boolean;
    error?: string;
  }>({
    completed: false,
    loading: false
  });

  useEffect(() => {
    if (!isClient) return;
    
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar status da migração
    checkMigrationStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient]);

  const checkMigrationStatus = async () => {
    try {
      const completed = await migrationService.isMigrationCompleted();
      setMigrationStatus({ completed, loading: false });
    } catch (error) {
      setMigrationStatus({ 
        completed: false, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const handleStorageSelect = async (storage: StorageType) => {
    if (storage === 'indexeddb' && !migrationStatus.completed) {
      setMigrationStatus({ completed: false, loading: true });
      
      try {
        const result = await migrationService.migrateFromLocalStorage();
        if (result.success) {
          setMigrationStatus({ completed: true, loading: false });
          onStorageChange(storage);
        } else {
          setMigrationStatus({ 
            completed: false, 
            loading: false, 
            error: result.error 
          });
        }
      } catch (error) {
        setMigrationStatus({ 
          completed: false, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Migration failed' 
        });
      }
    } else {
      onStorageChange(storage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tipo de Armazenamento</h3>
          <p className="text-sm text-muted-foreground">
            Escolha como os dados serão armazenados
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storageOptions.map((option) => (
          <Card 
            key={option.type}
            className={`cursor-pointer transition-all ${
              currentStorage === option.type 
                ? 'ring-2 ring-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleStorageSelect(option.type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${option.color} text-white`}>
                    {option.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{option.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
                
                {currentStorage === option.type && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {option.features.map((feature, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {option.type === 'indexeddb' && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status da migração:</span>
                    {migrationStatus.loading ? (
                      <Badge variant="secondary" className="text-xs">
                        Migrando...
                      </Badge>
                    ) : migrationStatus.completed ? (
                      <Badge variant="default" className="bg-green-500 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concluída
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {migrationStatus.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro na migração: {migrationStatus.error}
          </AlertDescription>
        </Alert>
      )}

      {currentStorage === 'indexeddb' && !isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você está offline. O IndexedDB continuará funcionando normalmente, 
            e os dados serão sincronizados quando a conexão for restaurada.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
