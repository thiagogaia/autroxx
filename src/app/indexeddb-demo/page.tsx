// IndexedDBDemo.tsx — Componente de demonstração do IndexedDB
// Mostra funcionalidades offline-first, sincronização e queries paginadas

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { indexedDBRepository } from '@/lib/indexeddb-repo';
import { migrationService } from '@/lib/migration-utils';
import { Task, TaskPriority } from '@/types/task';
import { TaskFilters, PaginationParams } from '@/types/task';
import { useIsClient } from '@/hooks/useIsClient';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload, 
  RefreshCw as Sync,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface DatabaseInfo {
  taskCount: number;
  syncQueueCount: number;
  unsyncedCount: number;
  databaseSize: number;
}

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  error?: string;
  backupCreated?: boolean;
}

export default function IndexedDBDemo() {
  const isClient = useIsClient();
  const [isOnline, setIsOnline] = useState(true);
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Filtros e paginação
  const [filters, setFilters] = useState<TaskFilters>({
    statusFilter: 'tudo',
    titleSearch: '',
    dateRange: { start: null, end: null },
    priorityFilter: [],
    categoryFilter: [],
    tagsFilter: [],
    impedimentFilter: null,
    complexityFilter: [],
    sortBy: 'dataCadastro',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    offset: 0
  });

  const [paginationResult, setPaginationResult] = useState<{
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Carregar informações do banco
  const loadDatabaseInfo = async () => {
    try {
      const info = await indexedDBRepository.getDatabaseInfo();
      setDbInfo(info);
    } catch (error) {
      console.error('Error loading database info:', error);
    }
  };

  // Sincronizar com servidor
  const handleSync = useCallback(async () => {
    if (!isOnline) return;
    
    setSyncing(true);
    try {
      await indexedDBRepository.syncWithServer();
      await loadDatabaseInfo();
      await loadTasks();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [isOnline]);

  // Executar migração
  const handleMigration = async () => {
    setLoading(true);
    try {
      const result = await migrationService.migrateFromLocalStorage();
      setMigrationResult(result);
      await loadDatabaseInfo();
      await loadTasks();
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult({
        success: false,
        migratedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Monitorar status online/offline
  useEffect(() => {
    if (!isClient) return;
    
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient, handleSync]);

  // Carregar tarefas com filtros e paginação
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await indexedDBRepository.search(filters, pagination);
      setTasks(result.data);
      setPaginationResult(result.pagination);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Adicionar tarefa de teste
  const addTestTask = async () => {
    const testTask: Omit<Task, 'id'> = {
      titulo: `Tarefa de Teste ${Date.now()}`,
      descricao: 'Esta é uma tarefa criada para testar o IndexedDB',
      statusHistorico: [{ status: 'a_fazer', timestamp: new Date() }],
      statusAtual: 'a_fazer',
      prioridade: 'normal',
      impedimento: false,
      impedimentoMotivo: '',
      impedimentoHistorico: [],
      dataImpedimento: null,
      dataCadastro: new Date(),
      dataInicio: null,
      dataFim: null,
      ordem: 0,
      tags: ['teste', 'indexeddb'],
      categoria: 'desenvolvimento',
      estimativaTempo: 60,
      complexidade: 'simples',
      is_active: true,
      rsync: false,
      id_rsync: null
    };

    try {
      await indexedDBRepository.create(testTask);
      await loadTasks();
      await loadDatabaseInfo();
    } catch (error) {
      console.error('Error adding test task:', error);
    }
  };

  // Atualizar filtros
  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPagination({ ...pagination, page: 1, offset: 0 });
  };

  // Atualizar paginação
  const updatePagination = (newPagination: Partial<PaginationParams>) => {
    const updatedPagination = { ...pagination, ...newPagination };
    setPagination(updatedPagination);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadDatabaseInfo();
    loadTasks();
  }, [filters, pagination, loadTasks]);

  // Só renderizar no cliente para evitar problemas de hidratação
  if (!isClient) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IndexedDB Demo</h1>
          <p className="text-muted-foreground">
            Demonstração das funcionalidades offline-first com Dexie.js
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="w-4 h-4 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="w-4 h-4 mr-1" />
              Offline
            </Badge>
          )}
          
          <Button 
            onClick={handleSync} 
            disabled={!isOnline || syncing}
            variant="outline"
            size="sm"
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Sync className="w-4 h-4 mr-1" />
            )}
            Sync
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="migration">Migração</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="filters">Filtros & Paginação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbInfo?.taskCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Armazenadas no IndexedDB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Sincronizadas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{dbInfo?.unsyncedCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando sincronização
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fila de Sync</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbInfo?.syncQueueCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Operações pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamanho do DB</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dbInfo ? `${(dbInfo.databaseSize / 1024).toFixed(1)} KB` : '0 KB'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dados armazenados
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status da Conexão</CardTitle>
              <CardDescription>
                Monitoramento do status online/offline e sincronização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {isOnline ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {isOnline ? 'Sincronização automática ativa' : 'Modo offline - dados salvos localmente'}
                </div>
              </div>

              {!isOnline && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Você está offline. As alterações serão salvas localmente e sincronizadas quando a conexão for restaurada.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migração de Dados</CardTitle>
              <CardDescription>
                Migre dados do localStorage para IndexedDB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleMigration} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Executar Migração
              </Button>

              {migrationResult && (
                <Alert variant={migrationResult.success ? "default" : "destructive"}>
                  {migrationResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {migrationResult.success ? (
                      `Migração concluída! ${migrationResult.migratedCount} tarefas migradas.`
                    ) : (
                      `Erro na migração: ${migrationResult.error}`
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Tarefas</CardTitle>
              <CardDescription>
                Teste as operações CRUD com IndexedDB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addTestTask} className="w-full">
                Adicionar Tarefa de Teste
              </Button>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Tarefas ({tasks.length})</h4>
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Carregando...
                  </div>
                ) : tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center p-4">
                    Nenhuma tarefa encontrada
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{task.titulo}</h5>
                            <p className="text-sm text-muted-foreground">
                              {task.statusAtual} • {task.prioridade}
                            </p>
                          </div>
                          <Badge variant="outline">
                            ID: {task.id}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros e Paginação</CardTitle>
              <CardDescription>
                Teste os filtros avançados e paginação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar por título</Label>
                  <Input
                    id="search"
                    placeholder="Digite para buscar..."
                    value={filters.titleSearch || ''}
                    onChange={(e) => updateFilters({ titleSearch: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.statusFilter}
                    onValueChange={(value) => updateFilters({ statusFilter: value as TaskFilters['statusFilter'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tudo">Todos</SelectItem>
                      <SelectItem value="a_fazer">A Fazer</SelectItem>
                      <SelectItem value="fazendo">Fazendo</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={filters.priorityFilter?.[0] || ''}
                    onValueChange={(value) => updateFilters({ priorityFilter: value ? [value as TaskPriority] : [] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort">Ordenar por</Label>
                  <Select
                    value={filters.sortBy || 'dataCadastro'}
                    onValueChange={(value) => updateFilters({ sortBy: value as TaskFilters['sortBy'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dataCadastro">Data de Cadastro</SelectItem>
                      <SelectItem value="titulo">Título</SelectItem>
                      <SelectItem value="prioridade">Prioridade</SelectItem>
                      <SelectItem value="dataInicio">Data de Início</SelectItem>
                      <SelectItem value="dataFim">Data de Fim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="impediment"
                    checked={filters.impedimentFilter === true}
                    onCheckedChange={(checked) => 
                      updateFilters({ impedimentFilter: checked ? true : null })
                    }
                  />
                  <Label htmlFor="impediment">Apenas com impedimentos</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="desc"
                    checked={filters.sortOrder === 'desc'}
                    onCheckedChange={(checked) => 
                      updateFilters({ sortOrder: checked ? 'desc' : 'asc' })
                    }
                  />
                  <Label htmlFor="desc">Ordem decrescente</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Paginação</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="limit">Itens por página:</Label>
                    <Select
                      value={pagination.limit.toString()}
                      onValueChange={(value) => updatePagination({ limit: parseInt(value), page: 1, offset: 0 })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePagination({ page: pagination.page - 1 })}
                      disabled={pagination.page <= 1}
                    >
                      Anterior
                    </Button>
                    
                    <span className="text-sm">
                      Página {pagination.page} de {paginationResult?.totalPages || 1}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePagination({ page: pagination.page + 1 })}
                      disabled={!paginationResult?.hasNext}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>

                {paginationResult && (
                  <div className="text-sm text-muted-foreground">
                    Mostrando {tasks.length} de {paginationResult.total} tarefas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
