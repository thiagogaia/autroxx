'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTaskContext } from '@/contexts/TaskContext';
import { formatMinutesToString } from '@/lib/time-converter';
import { 
  CheckCircle, 
  Clock, 
  Timer, 
  AlertTriangle,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export default function Reports2Page() {
  const { tasks } = useTaskContext();

  // Calcular métricas essenciais
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.statusAtual === 'concluido').length;
    const inProgressTasks = tasks.filter(t => t.statusAtual === 'fazendo').length;
    const blockedTasks = tasks.filter(t => t.impedimento).length;
    
    // Progresso geral
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Tempo médio de conclusão (apenas tarefas concluídas com dados completos)
    const completedWithTime = tasks.filter(t => 
      t.statusAtual === 'concluido' && 
      t.dataInicio && 
      t.dataFim
    );
    
    const avgCompletionTime = completedWithTime.length > 0 
      ? completedWithTime.reduce((acc, task) => {
          const diffMs = new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime();
          return acc + diffMs;
        }, 0) / completedWithTime.length
      : 0;
    
    const avgCompletionTimeMinutes = Math.round(avgCompletionTime / (1000 * 60));
    
    // Taxa de impedimentos
    const impedimentRate = totalTasks > 0 ? Math.round((blockedTasks / totalTasks) * 100) : 0;
    
    // Produtividade semanal (tarefas concluídas nos últimos 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyCompleted = tasks.filter(t => {
      if (t.statusAtual !== 'concluido' || !t.dataFim) return false;
      return new Date(t.dataFim) >= oneWeekAgo;
    }).length;
    
    // Gargalos críticos (tarefas em "a_fazer" há mais de 7 dias)
    const criticalBottlenecks = tasks.filter(t => {
      if (t.statusAtual !== 'a_fazer') return false;
      const daysInBacklog = (Date.now() - new Date(t.dataCadastro).getTime()) / (1000 * 60 * 60 * 24);
      return daysInBacklog > 7;
    });
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      progressPercentage,
      avgCompletionTimeMinutes,
      impedimentRate,
      weeklyCompleted,
      criticalBottlenecks: criticalBottlenecks.length
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <Navigation />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Dashboard Essencial</h1>
              <p className="text-sm text-muted-foreground">Métricas focadas em valor e ação</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Target className="h-3 w-3" />
            Minimalista
          </Badge>
        </div>

        {/* Métricas Principais - 4 Cards Essenciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Progresso Geral */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-foreground">
                {metrics.completedTasks}/{metrics.totalTasks}
              </div>
              <div className="space-y-2">
                <Progress value={metrics.progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {metrics.progressPercentage}% concluído
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Carga Atual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Carga Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-foreground">
                {metrics.inProgressTasks}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  tarefas em andamento
                </p>
                {metrics.inProgressTasks > 0 && metrics.blockedTasks > 0 && (
                  <p className="text-xs text-destructive">
                    {metrics.blockedTasks} com impedimento
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Eficiência */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Eficiência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-foreground">
                {metrics.avgCompletionTimeMinutes > 0 
                  ? formatMinutesToString(metrics.avgCompletionTimeMinutes)
                  : '--'
                }
              </div>
              <p className="text-sm text-muted-foreground">
                tempo médio de conclusão
              </p>
            </CardContent>
          </Card>

          {/* 4. Problemas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                Problemas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-foreground">
                {metrics.impedimentRate}%
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  taxa de impedimentos
                </p>
                {metrics.criticalBottlenecks > 0 && (
                  <p className="text-xs text-destructive">
                    {metrics.criticalBottlenecks} gargalos críticos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights e Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produtividade Semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Produtividade Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-foreground">
                {metrics.weeklyCompleted}
              </div>
              <p className="text-sm text-muted-foreground">
                tarefas concluídas nos últimos 7 dias
              </p>
              {metrics.weeklyCompleted > 0 && (
                <div className="space-y-2">
                  <Progress 
                    value={Math.min((metrics.weeklyCompleted / 10) * 100, 100)} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta sugerida: 10 tarefas/semana
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Recomendadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Ações Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.criticalBottlenecks > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/5 dark:bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Resolver {metrics.criticalBottlenecks} gargalos críticos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tarefas em backlog há mais de 7 dias
                      </p>
                    </div>
                  </div>
                )}
                
                {metrics.impedimentRate > 20 && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Reduzir impedimentos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Taxa atual: {metrics.impedimentRate}% (meta: &lt;20%)
                      </p>
                    </div>
                  </div>
                )}
                
                {metrics.impedimentRate <= 20 && metrics.criticalBottlenecks === 0 && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Fluxo saudável
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Continue mantendo o ritmo atual
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Executivo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status Geral</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    metrics.progressPercentage >= 70 ? 'bg-green-500' : 
                    metrics.progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <p className="text-sm font-medium text-foreground">
                    {metrics.progressPercentage >= 70 ? 'Excelente' : 
                     metrics.progressPercentage >= 50 ? 'Bom' : 'Precisa melhorar'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Foco Principal</p>
                <p className="text-sm text-foreground">
                  {metrics.criticalBottlenecks > 0 ? 'Resolver gargalos' :
                   metrics.impedimentRate > 20 ? 'Reduzir impedimentos' : 'Manter produtividade'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Próxima Ação</p>
                <p className="text-sm text-foreground">
                  {metrics.inProgressTasks > 5 ? 'Finalizar tarefas em andamento' : 'Iniciar novas tarefas'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}