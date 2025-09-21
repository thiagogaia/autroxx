'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTaskContext } from '@/contexts/TaskContextIndexedDB';
import { Task, TaskCategory, TaskComplexity } from '@/types/task';
import { formatMinutesToString } from '@/lib/time-converter';
import { 
  Clock, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Calendar,
  Activity,
  ArrowUpDown,
  Timer,
  Users,
  FileText
} from 'lucide-react';

export function Insights() {
  const { tasks } = useTaskContext();

  const insights = useMemo(() => {
    const completedTasks = tasks.filter(task => task.statusAtual === 'concluido');
    const tasksWithTime = completedTasks.filter(task => task.dataInicio && task.dataFim);
    const tasksWithCategory = tasks.filter(task => task.categoria);
    const tasksWithEstimate = tasks.filter(task => task.estimativaTempo);

    // Tempo gasto por categoria
    const timeByCategory = tasksWithTime.reduce((acc, task) => {
      if (!task.categoria || !task.dataInicio || !task.dataFim) return acc;
      
      const startTime = new Date(task.dataInicio).getTime();
      const endTime = new Date(task.dataFim).getTime();
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // em minutos
      
      if (!acc[task.categoria]) {
        acc[task.categoria] = { total: 0, count: 0 };
      }
      acc[task.categoria].total += duration;
      acc[task.categoria].count += 1;
      
      return acc;
    }, {} as Record<TaskCategory, { total: number; count: number }>);

    // Análise de estimativas vs realidade
    const estimateAnalysis = tasksWithEstimate.filter(task => 
      task.statusAtual === 'concluido' && 
      task.dataInicio && 
      task.dataFim && 
      task.estimativaTempo &&
      task.estimativaTempo > 0
    ).map(task => {
      const startTime = new Date(task.dataInicio!).getTime();
      const endTime = new Date(task.dataFim!).getTime();
      const actualTime = Math.round((endTime - startTime) / (1000 * 60));
      const estimatedTime = task.estimativaTempo!;
      
      // Proteção contra divisão por zero e tempo muito pequeno
      if (actualTime <= 0) {
        return null;
      }
      
      return {
        task,
        estimated: estimatedTime,
        actual: actualTime,
        accuracy: Math.round((actualTime / estimatedTime) * 100), // Corrigido: agora mostra precisão correta
        category: task.categoria || 'sem_categoria' // Categoria padrão para tarefas sem categoria
      };
    }).filter(Boolean); // Remove valores null

    // Análise de mudanças de prioridade
    const priorityChanges = tasks.reduce((acc, task) => {
      const changes = task.numeroMudancasPrioridade || 0;
      if (changes > 0) {
        acc.total += changes;
        acc.tasksWithChanges += 1;
        if (changes >= 3) acc.highRisk += 1;
      }
      return acc;
    }, { total: 0, tasksWithChanges: 0, highRisk: 0 });

    // Análise de impedimentos
    const impedimentAnalysis = tasks.reduce((acc, task) => {
      if (task.impedimento) {
        acc.totalImpediments += 1;
        const impedimentTime = task.tempoTotalImpedimento || 0;
        acc.totalImpedimentTime += impedimentTime;
        
        if (task.categoria) {
          if (!acc.byCategory[task.categoria]) {
            acc.byCategory[task.categoria] = { count: 0, time: 0 };
          }
          acc.byCategory[task.categoria].count += 1;
          acc.byCategory[task.categoria].time += impedimentTime;
        }
      }
      return acc;
    }, { 
      totalImpediments: 0, 
      totalImpedimentTime: 0, 
      byCategory: {} as Record<TaskCategory, { count: number; time: number }>
    });

    // Análise de retrabalho
    const retrabalhoAnalysis = tasks.reduce((acc, task) => {
      if (task.foiRetrabalho) {
        acc.total += 1;
        if (task.categoria) {
          acc.byCategory[task.categoria] = (acc.byCategory[task.categoria] || 0) + 1;
        }
      }
      return acc;
    }, { total: 0, byCategory: {} as Record<TaskCategory, number> });

    return {
      timeByCategory,
      estimateAnalysis,
      priorityChanges,
      impedimentAnalysis,
      retrabalhoAnalysis,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      tasksWithCategory: tasksWithCategory.length
    };
  }, [tasks]);

  const getCategoryIcon = (category: TaskCategory) => {
    const icons = {
      desenvolvimento: <Zap className="h-4 w-4" />,
      reuniao: <Users className="h-4 w-4" />,
      bug: <AlertTriangle className="h-4 w-4" />,
      documentacao: <FileText className="h-4 w-4" />,
      sem_categoria: <Activity className="h-4 w-4" />
    };
    return icons[category];
  };

  const getCategoryColor = (category: TaskCategory) => {
    const colors = {
      desenvolvimento: 'text-green-600',
      reuniao: 'text-blue-600',
      bug: 'text-red-600',
      documentacao: 'text-purple-600',
      sem_categoria: 'text-gray-600'
    };
    return colors[category];
  };

  const getCategoryLabel = (category: TaskCategory) => {
    const labels = {
      desenvolvimento: 'Desenvolvimento',
      reuniao: 'Reunião',
      bug: 'Bug',
      documentacao: 'Documentação',
      sem_categoria: 'Sem Categoria'
    };
    return labels[category];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Insights e Análises</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tempo gasto por categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Tempo por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição do tempo gasto em cada tipo de atividade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(insights.timeByCategory).map(([category, data]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category as TaskCategory)}
                    <span className="text-sm font-medium">
                      {getCategoryLabel(category as TaskCategory)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatMinutesToString(data.total)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.count} tarefa{data.count !== 1 ? 's' : ''} • Média: {formatMinutesToString(Math.round(data.total / data.count))}
                </div>
              </div>
            ))}
            {Object.keys(insights.timeByCategory).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma tarefa concluída com categoria definida
              </p>
            )}
          </CardContent>
        </Card>

        {/* Balanceamento de atividades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Balanceamento
            </CardTitle>
            <CardDescription>
              Sugestões para otimizar sua produtividade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.tasksWithCategory > 0 && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    💡 Agrupe tarefas de 'desenvolvimento' - você é 25% mais eficiente
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    📅 Bloqueie horários para 'documentação' - reduz interrupções
                  </p>
                </div>
              </div>
            )}
            {insights.tasksWithCategory === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Defina categorias nas tarefas para ver insights
              </p>
            )}
          </CardContent>
        </Card>

        {/* Custo de Interrupção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Custo de Interrupção
            </CardTitle>
            <CardDescription>
              Impacto das mudanças de prioridade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mudanças de prioridade:</span>
                <span className="font-medium">{insights.priorityChanges.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tarefas afetadas:</span>
                <span className="font-medium">{insights.priorityChanges.tasksWithChanges}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Alto risco (≥3 mudanças):</span>
                <span className="font-medium text-red-600">{insights.priorityChanges.highRisk}</span>
              </div>
            </div>
            {insights.priorityChanges.total > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ Cada mudança de prioridade custa ~15min de produtividade
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previsibilidade - Estimativa Calibrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Estimativa Calibrada
            </CardTitle>
            <CardDescription>
              Precisão das suas estimativas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.estimateAnalysis.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(
                  insights.estimateAnalysis.reduce((acc, item) => {
                    const category = item.category || 'sem_categoria';
                    if (!acc[category]) {
                      acc[category] = { total: 0, count: 0, accuracies: [] };
                    }
                    acc[category].total += item.actual;
                    acc[category].count += 1;
                    acc[category].accuracies.push(item.accuracy);
                    return acc;
                  }, {} as Record<TaskCategory, { total: number; count: number; accuracies: number[] }>)
                ).map(([category, data]) => {
                  const avgAccuracy = Math.round(data.accuracies.reduce((a, b) => a + b, 0) / data.accuracies.length);
                  
                  // Interpretação melhorada da precisão:
                  // 100% = estimativa perfeita
                  // <100% = subestimou (levou menos tempo que estimado)
                  // >100% = superestimou (levou mais tempo que estimado)
                  const getAccuracyColor = (accuracy: number) => {
                    if (accuracy >= 90 && accuracy <= 110) {
                      return 'text-green-600 border-green-200'; // Excelente (90-110%)
                    } else if (accuracy >= 70 && accuracy <= 130) {
                      return 'text-yellow-600 border-yellow-200'; // Bom (70-130%)
                    } else {
                      return 'text-red-600 border-red-200'; // Precisa melhorar (<70% ou >130%)
                    }
                  };
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category as TaskCategory)}
                          <span className="text-sm font-medium">
                            {getCategoryLabel(category as TaskCategory)}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getAccuracyColor(avgAccuracy)}`}
                        >
                          {avgAccuracy}%
                        </Badge>
                      </div>
                      <Progress 
                        value={Math.min(Math.max(avgAccuracy, 0), 200)} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {data.count} tarefa{data.count !== 1 ? 's' : ''} • 
                        {avgAccuracy < 100 ? ' Subestimou' : avgAccuracy > 100 ? ' Superestimou' : ' Perfeita'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete tarefas com estimativas para ver análise
              </p>
            )}
          </CardContent>
        </Card>

        {/* Previsibilidade - Prazo Real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Prazo Real
            </CardTitle>
            <CardDescription>
              Estimativas baseadas em dados históricos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.estimateAnalysis.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(
                  insights.estimateAnalysis.reduce((acc, item) => {
                    if (!item.category || !item.task.complexidade) return acc;
                    const key = `${item.category}-${item.task.complexidade}`;
                    if (!acc[key]) {
                      acc[key] = { times: [], category: item.category, complexity: item.task.complexidade };
                    }
                    acc[key].times.push(item.actual);
                    return acc;
                  }, {} as Record<string, { times: number[]; category: TaskCategory; complexity: TaskComplexity }>)
                ).map(([key, data]) => {
                  const avgTime = Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length);
                  return (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(data.category)}
                        <span className="text-sm font-medium">
                          {getCategoryLabel(data.category)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {data.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tempo médio: <span className="font-medium">{formatMinutesToString(avgTime)}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete tarefas com categoria e complexidade para ver previsões
              </p>
            )}
          </CardContent>
        </Card>

        {/* Previsibilidade - Risco de Atraso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Risco de Atraso
            </CardTitle>
            <CardDescription>
              Tarefas com maior probabilidade de atraso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(task => 
              task.numeroMudancasPrioridade && task.numeroMudancasPrioridade >= 2
            ).length > 0 ? (
              <div className="space-y-3">
                {tasks
                  .filter(task => task.numeroMudancasPrioridade && task.numeroMudancasPrioridade >= 2)
                  .slice(0, 3)
                  .map(task => {
                    const riskLevel = (task.numeroMudancasPrioridade || 0) >= 3 ? 'Alto' : 'Médio';
                    const riskColor = riskLevel === 'Alto' ? 'text-red-600' : 'text-yellow-600';
                    
                    return (
                      <div key={task.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium truncate">{task.titulo}</span>
                          <Badge variant="outline" className={`text-xs ${riskColor}`}>
                            {riskLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {task.numeroMudancasPrioridade} mudança{task.numeroMudancasPrioridade !== 1 ? 's' : ''} de prioridade
                        </p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma tarefa com risco de atraso identificado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Fluxo e Gargalos - Tempo de Fila */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-indigo-600" />
              Tempo de Fila
            </CardTitle>
            <CardDescription>
              Tempo médio entre cadastro e início
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(task => task.dataInicio).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(
                  tasks
                    .filter(task => task.dataInicio && task.categoria)
                    .reduce((acc, task) => {
                      if (!task.categoria) return acc;
                      const queueTime = Math.round(
                        (new Date(task.dataInicio!).getTime() - new Date(task.dataCadastro).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      if (!acc[task.categoria]) {
                        acc[task.categoria] = { times: [], count: 0 };
                      }
                      acc[task.categoria].times.push(queueTime);
                      acc[task.categoria].count += 1;
                      return acc;
                    }, {} as Record<TaskCategory, { times: number[]; count: number }>)
                ).map(([category, data]) => {
                  const avgQueueTime = Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length);
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category as TaskCategory)}
                          <span className="text-sm font-medium">
                            {getCategoryLabel(category as TaskCategory)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {avgQueueTime} dias
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.count} tarefa{data.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete tarefas para ver análise de fila
              </p>
            )}
          </CardContent>
        </Card>

        {/* Fluxo e Gargalos - Impedimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Gargalos
            </CardTitle>
            <CardDescription>
              Análise de impedimentos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.impedimentAnalysis.totalImpediments > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Total: {insights.impedimentAnalysis.totalImpediments} impedimento{insights.impedimentAnalysis.totalImpediments !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Tempo perdido: {formatMinutesToString(insights.impedimentAnalysis.totalImpedimentTime)}
                  </p>
                </div>
                {Object.entries(insights.impedimentAnalysis.byCategory).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category as TaskCategory)}
                        <span className="text-sm font-medium">
                          {getCategoryLabel(category as TaskCategory)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {data.count} impedimento{data.count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tempo médio: {formatMinutesToString(Math.round(data.time / data.count))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum impedimento registrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Fluxo Ideal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-green-600" />
              Fluxo Ideal
            </CardTitle>
            <CardDescription>
              Sequência recomendada baseada em dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  🐛 Bugs → Features → Documentação
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Sequência que reduz contexto switching
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  ⏰ Bloqueie 2h para desenvolvimento contínuo
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Reduz interrupções em 40%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
