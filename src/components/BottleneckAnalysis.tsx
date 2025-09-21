'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTaskContext } from '@/contexts/TaskContextIndexedDB';
import { formatMinutesToString } from '@/lib/time-converter';
import { 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Target
} from 'lucide-react';

interface BottleneckData {
  phase: 'backlog' | 'progress';
  duration: number; // em minutos
  start: Date;
  end: Date;
  taskId: number;
  taskTitle: string;
  category?: string;
  priority: string;
}

export function BottleneckAnalysis() {
  const { tasks } = useTaskContext();

  const bottleneckAnalysis = useMemo(() => {
    const bottlenecks: BottleneckData[] = [];
    
    // Analisar cada tarefa
    tasks.forEach(task => {
      // 1. Gargalo de Backlog (a_fazer)
      if (task.dataInicio) {
        const backlogTime = new Date(task.dataInicio).getTime() - new Date(task.dataCadastro).getTime();
        bottlenecks.push({
          phase: 'backlog',
          duration: Math.round(backlogTime / (1000 * 60)), // converter para minutos
          start: new Date(task.dataCadastro),
          end: new Date(task.dataInicio),
          taskId: task.id,
          taskTitle: task.titulo,
          category: task.categoria,
          priority: task.prioridade
        });
      }
      
      // 2. Gargalo de Progress (fazendo)
      if (task.dataInicio && task.dataFim) {
        const progressTime = new Date(task.dataFim).getTime() - new Date(task.dataInicio).getTime();
        bottlenecks.push({
          phase: 'progress',
          duration: Math.round(progressTime / (1000 * 60)),
          start: new Date(task.dataInicio),
          end: new Date(task.dataFim),
          taskId: task.id,
          taskTitle: task.titulo,
          category: task.categoria,
          priority: task.prioridade
        });
      }
    });

    // Calcular estatísticas
    const backlogBottlenecks = bottlenecks.filter(b => b.phase === 'backlog');
    const progressBottlenecks = bottlenecks.filter(b => b.phase === 'progress');
    
    const avgBacklogTime = backlogBottlenecks.length > 0 
      ? backlogBottlenecks.reduce((sum, b) => sum + b.duration, 0) / backlogBottlenecks.length 
      : 0;
      
    const avgProgressTime = progressBottlenecks.length > 0 
      ? progressBottlenecks.reduce((sum, b) => sum + b.duration, 0) / progressBottlenecks.length 
      : 0;

    // Top 5 maiores gargalos
    const topBottlenecks = [...bottlenecks]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    // Análise por categoria
    const categoryAnalysis = bottlenecks.reduce((acc, bottleneck) => {
      const category = bottleneck.category || 'sem-categoria';
      if (!acc[category]) {
        acc[category] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      acc[category].count += 1;
      acc[category].totalTime += bottleneck.duration;
      acc[category].avgTime = acc[category].totalTime / acc[category].count;
      return acc;
    }, {} as Record<string, { count: number; totalTime: number; avgTime: number }>);

    // Análise por prioridade
    const priorityAnalysis = bottlenecks.reduce((acc, bottleneck) => {
      const priority = bottleneck.priority;
      if (!acc[priority]) {
        acc[priority] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      acc[priority].count += 1;
      acc[priority].totalTime += bottleneck.duration;
      acc[priority].avgTime = acc[priority].totalTime / acc[priority].count;
      return acc;
    }, {} as Record<string, { count: number; totalTime: number; avgTime: number }>);

    return {
      totalBottlenecks: bottlenecks.length,
      avgBacklogTime,
      avgProgressTime,
      topBottlenecks,
      categoryAnalysis,
      priorityAnalysis,
      backlogBottlenecks,
      progressBottlenecks
    };
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      'baixa': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'desenvolvimento': 'bg-green-100 text-green-800',
      'reuniao': 'bg-blue-100 text-blue-800',
      'bug': 'bg-red-100 text-red-800',
      'documentacao': 'bg-purple-100 text-purple-800',
      'sem-categoria': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Análise de Gargalos</h2>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio em Backlog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatMinutesToString(bottleneckAnalysis.avgBacklogTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bottleneckAnalysis.backlogBottlenecks.length} tarefas analisadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio em Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatMinutesToString(bottleneckAnalysis.avgProgressTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bottleneckAnalysis.progressBottlenecks.length} tarefas analisadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Gargalos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {bottleneckAnalysis.totalBottlenecks}
            </div>
            <p className="text-xs text-muted-foreground">
              Pontos de análise identificados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Maiores Gargalos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Maiores Gargalos
          </CardTitle>
          <CardDescription>
            As 5 tarefas que ficaram mais tempo em cada fase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bottleneckAnalysis.topBottlenecks.map((bottleneck) => (
              <div key={`${bottleneck.taskId}-${bottleneck.phase}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      #{bottleneck.taskId}
                    </Badge>
                    <Badge className={`text-xs ${bottleneck.phase === 'backlog' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                      {bottleneck.phase === 'backlog' ? 'Backlog' : 'Execução'}
                    </Badge>
                    {bottleneck.category && (
                      <Badge className={`text-xs ${getCategoryColor(bottleneck.category)}`}>
                        {bottleneck.category}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getPriorityColor(bottleneck.priority)}`}>
                      {bottleneck.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {bottleneck.taskTitle}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {formatMinutesToString(bottleneck.duration)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bottleneck.start.toLocaleDateString('pt-BR')} → {bottleneck.end.toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Gargalos por Categoria
          </CardTitle>
          <CardDescription>
            Tempo médio gasto por tipo de tarefa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(bottleneckAnalysis.categoryAnalysis).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getCategoryColor(category)}`}>
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {data.count} tarefas
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {formatMinutesToString(data.avgTime)}
                  </div>
                  <Progress 
                    value={(data.avgTime / Math.max(...Object.values(bottleneckAnalysis.categoryAnalysis).map(d => d.avgTime))) * 100} 
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Prioridade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Gargalos por Prioridade
          </CardTitle>
          <CardDescription>
            Tempo médio gasto por nível de prioridade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(bottleneckAnalysis.priorityAnalysis).map(([priority, data]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getPriorityColor(priority)}`}>
                    {priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {data.count} tarefas
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {formatMinutesToString(data.avgTime)}
                  </div>
                  <Progress 
                    value={(data.avgTime / Math.max(...Object.values(bottleneckAnalysis.priorityAnalysis).map(d => d.avgTime))) * 100} 
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
