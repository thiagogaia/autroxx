// GamificationMigrationDemo.tsx — Componente de demonstração da migração
// Mostra o status da migração e permite testar funcionalidades offline

'use client';

import { useState, useEffect } from 'react';
import { useGamification } from '@/contexts/GamificationContext';
import { gamificationMigrationService } from '@/lib/gamification-migration-service';
import { gamificationRepository } from '@/lib/gamification-indexeddb-repo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface MigrationStats {
  localStorageSize: number;
  indexedDBSize: number;
  itemsMigrated: {
    stats: number;
    events: number;
    achievements: number;
    powerUps: number;
    weeklyChallenges: number;
  };
}

export function GamificationMigrationDemo() {
  const { 
    userStats, 
    events, 
    isLoading, 
    // migrationStatus, 
    // migrateFromLocalStorage 
  } = useGamification();
  
  const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
  const [localStorageInfo, setLocalStorageInfo] = useState<any>(null);
  const [indexedDBInfo, setIndexedDBInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar informações iniciais
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsRefreshing(true);
      
      const [stats, localStorageData, indexedDBData] = await Promise.all([
        gamificationMigrationService.getMigrationStats(),
        gamificationMigrationService.checkLocalStorageData(),
        gamificationRepository.getDatabaseInfo()
      ]);

      setMigrationStats(stats);
      setLocalStorageInfo(localStorageData);
      setIndexedDBInfo(indexedDBData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualMigration = async () => {
    try {
      // await migrateFromLocalStorage();
      await loadStats(); // Recarregar estatísticas após migração
    } catch (error) {
      console.error('Erro na migração manual:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status da Migração de Gamificação
          </CardTitle>
          <CardDescription>
            Migração de dados do localStorage para IndexedDB com funcionalidade offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Migração */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* {getStatusIcon(migrationStatus)} */}
              <span className="font-medium">Status da Migração:</span>
            </div>
            {/* <Badge className={getStatusColor(migrationStatus)}> */}
              {/* {migrationStatus === 'pending' && 'Pendente'} */}
              {/* {migrationStatus === 'in_progress' && 'Em Progresso'} */}
              {/* {migrationStatus === 'completed' && 'Concluída'} */}
              {/* {migrationStatus === 'error' && 'Erro'} */}
            {/* </Badge> */}
          </div>

          {/* Loading State */}
          {isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Carregando dados de gamificação...
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2">
            {/* <Button 
              onClick={handleManualMigration}
              disabled={isLoading || migrationStatus === 'in_progress'}
              variant="outline"
            >
              {migrationStatus === 'in_progress' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Migrando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Migrar Manualmente
                </>
              )}
            </Button> */}
            
            <Button 
              onClick={loadStats}
              disabled={isRefreshing}
              variant="outline"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Stats
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      {migrationStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* localStorage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">localStorage</CardTitle>
              <CardDescription>Dados originais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Stats:</span>
                <Badge variant={localStorageInfo?.hasStats ? 'default' : 'secondary'}>
                  {localStorageInfo?.hasStats ? 'Presente' : 'Ausente'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Events:</span>
                <Badge variant={localStorageInfo?.hasEvents ? 'default' : 'secondary'}>
                  {localStorageInfo?.hasEvents ? 'Presente' : 'Ausente'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Tamanho Total:</span>
                <span className="font-mono">{formatBytes(localStorageInfo?.totalSize || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* IndexedDB */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">IndexedDB</CardTitle>
              <CardDescription>Novo armazenamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Stats:</span>
                <Badge variant={migrationStats.itemsMigrated.stats > 0 ? 'default' : 'secondary'}>
                  {migrationStats.itemsMigrated.stats > 0 ? 'Migrado' : 'Não Migrado'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Events:</span>
                <Badge variant={migrationStats.itemsMigrated.events > 0 ? 'default' : 'secondary'}>
                  {migrationStats.itemsMigrated.events} eventos
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Achievements:</span>
                <Badge variant={migrationStats.itemsMigrated.achievements > 0 ? 'default' : 'secondary'}>
                  {migrationStats.itemsMigrated.achievements} conquistas
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>PowerUps:</span>
                <Badge variant={migrationStats.itemsMigrated.powerUps > 0 ? 'default' : 'secondary'}>
                  {migrationStats.itemsMigrated.powerUps} power-ups
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Challenges:</span>
                <Badge variant={migrationStats.itemsMigrated.weeklyChallenges > 0 ? 'default' : 'secondary'}>
                  {migrationStats.itemsMigrated.weeklyChallenges} desafios
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Tamanho Total:</span>
                <span className="font-mono">{formatBytes(migrationStats.indexedDBSize)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informações do IndexedDB */}
      {indexedDBInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do IndexedDB</CardTitle>
            <CardDescription>Estatísticas detalhadas do banco de dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{indexedDBInfo.statsCount}</div>
                <div className="text-sm text-gray-600">Stats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{indexedDBInfo.eventsCount}</div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{indexedDBInfo.achievementsCount}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{indexedDBInfo.powerUpsCount}</div>
                <div className="text-sm text-gray-600">PowerUps</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span>Itens não sincronizados:</span>
                <Badge variant={indexedDBInfo.unsyncedCount > 0 ? 'destructive' : 'default'}>
                  {indexedDBInfo.unsyncedCount}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Tamanho do banco:</span>
                <span className="font-mono">{formatBytes(indexedDBInfo.databaseSize)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados Atuais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados Atuais de Gamificação</CardTitle>
          <CardDescription>Informações carregadas no contexto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalXP}</div>
              <div className="text-sm text-gray-600">XP Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.totalQP}</div>
              <div className="text-sm text-gray-600">QP Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.currentLevel}</div>
              <div className="text-sm text-gray-600">Nível Atual</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso do Nível</span>
              <span>{userStats.levelProgress.toFixed(1)}%</span>
            </div>
            <Progress value={userStats.levelProgress} className="h-2" />
          </div>

          <div className="mt-4">
            <div className="flex justify-between">
              <span>Eventos carregados:</span>
              <Badge>{events.length}</Badge>
            </div>
            <div className="flex justify-between mt-2">
              <span>Conquistas desbloqueadas:</span>
              <Badge>{userStats.achievements.filter(a => a.unlocked).length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
