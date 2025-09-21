// SyncStatusWidget.tsx — Widget para mostrar status de sincronização

'use client';

import React from 'react';
import { useSyncStatus } from '@/hooks/useSyncService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Database
} from 'lucide-react';

export function SyncStatusWidget() {
  const status = useSyncStatus();

  const getStatusIcon = () => {
    if (status.error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (status.isSyncing) return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    if (status.isOnline && status.queueLength === 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status.isOnline) return <Wifi className="h-4 w-4 text-green-500" />;
    return <WifiOff className="h-4 w-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (status.error) return 'Erro na sincronização';
    if (status.isSyncing) return 'Sincronizando...';
    if (status.isOnline && status.queueLength === 0) return 'Sincronizado';
    if (status.isOnline) return 'Online (pendente)';
    return 'Offline';
  };

  const getStatusColor = () => {
    if (status.error) return 'bg-red-100 text-red-800';
    if (status.isSyncing) return 'bg-blue-100 text-blue-800';
    if (status.isOnline && status.queueLength === 0) return 'bg-green-100 text-green-800';
    if (status.isOnline) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatLastSync = () => {
    if (!status.lastSync) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - status.lastSync.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Status de Sincronização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <Badge className={getStatusColor()}>
            {status.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Detalhes */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Última sincronização:
            </span>
            <span>{formatLastSync()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Operações pendentes:</span>
            <Badge variant="outline" className="text-xs">
              {status.queueLength}
            </Badge>
          </div>
        </div>

        {/* Erro */}
        {status.error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Erro
            </div>
            <p className="mt-1">{status.error}</p>
          </div>
        )}

        {/* Informações sobre SQLite OPFS */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <Database className="h-3 w-3" />
              SQLite OPFS Ativo
            </div>
            <p className="text-xs">
              Dados armazenados localmente com sincronização automática quando online.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente compacto para mostrar apenas o ícone de status
 */
export function SyncStatusIcon() {
  const status = useSyncStatus();

  const getIcon = () => {
    if (status.error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (status.isSyncing) return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    if (status.isOnline && status.queueLength === 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status.isOnline) return <Wifi className="h-4 w-4 text-green-500" />;
    return <WifiOff className="h-4 w-4 text-gray-500" />;
  };

  const getTooltip = () => {
    if (status.error) return `Erro: ${status.error}`;
    if (status.isSyncing) return 'Sincronizando...';
    if (status.isOnline && status.queueLength === 0) return 'Sincronizado';
    if (status.isOnline) return `Online (${status.queueLength} pendente${status.queueLength !== 1 ? 's' : ''})`;
    return 'Offline';
  };

  return (
    <div title={getTooltip()} className="cursor-help">
      {getIcon()}
    </div>
  );
}

/**
 * Componente para mostrar estatísticas de sincronização
 */
export function SyncStats() {
  const status = useSyncStatus();

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {status.queueLength}
        </div>
        <div className="text-gray-600">Pendentes</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {status.isOnline ? '✓' : '✗'}
        </div>
        <div className="text-gray-600">Conectado</div>
      </div>
    </div>
  );
}
