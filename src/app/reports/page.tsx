'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskContext } from '@/contexts/TaskContext';
import { formatMinutesToString } from '@/lib/time-converter';
import { hasStatusInHistory } from '@/lib/utils';
import { Task } from '@/types/task';
import { TAREFAS_EXEMPLO } from '@/lib/mock-data';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Target, 
  Activity,
  Calendar,
  PieChart,
  Download,
  Filter,
  CheckCircle,
  Timer
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BottleneckAnalysis } from '@/components/BottleneckAnalysis';
import { Navigation } from '@/components/Navigation';


type PeriodFilter = '7d' | '30d' | '90d' | 'all';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const STATUS_COLORS = {
  'a_fazer': '#6B7280',
  'fazendo': '#3B82F6', 
  'concluido': '#10B981'
};

const PRIORITY_COLORS = {
  'baixa': '#9CA3AF',
  'normal': '#6B7280',
  'media': '#F59E0B',
  'alta': '#EF4444'
};

export default function ReportsPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const { tasks } = useTaskContext();
  
  // Usar dados mock se não houver tarefas reais (para demonstração)
  const tasksToUse = useMemo(() => {
    if (tasks && tasks.length > 0) {
      return tasks;
    }
    // Fallback para dados mock se não houver tarefas reais
    try {
      return TAREFAS_EXEMPLO || [];
    } catch (error) {
      console.warn('Erro ao carregar dados mock:', error);
      return [];
    }
  }, [tasks]);

  // Filtrar dados por período
  const filteredTasks = useMemo(() => {
    if (periodFilter === 'all') return tasksToUse;
    
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const cutoffDate = subDays(new Date(), daysMap[periodFilter]);
    
    return tasksToUse.filter((task: Task) => 
      new Date(task.dataCadastro) >= cutoffDate
    );
  }, [tasksToUse, periodFilter]);

  // Métricas principais
  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const concluidas = filteredTasks.filter((t: Task) => t.statusAtual === 'concluido').length;
    const emAndamento = filteredTasks.filter((t: Task) => t.statusAtual === 'fazendo').length;
    const impedidas = filteredTasks.filter((t: Task) => t.impedimento).length;
    const altaPrioridade = filteredTasks.filter((t: Task) => t.prioridade === 'alta').length;
    
    // Progresso geral
    const progressPercentage = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    
    // Tempo médio de conclusão (apenas tarefas concluídas com dados completos)
    const completedWithTime = filteredTasks.filter((t: Task) => 
      t.statusAtual === 'concluido' && 
      t.dataInicio && 
      t.dataFim
    );
    
    const avgCompletionTime = completedWithTime.length > 0 
      ? completedWithTime.reduce((acc: number, task: Task) => {
          const diffMs = new Date(task.dataFim!).getTime() - new Date(task.dataInicio!).getTime();
          return acc + diffMs;
        }, 0) / completedWithTime.length
      : 0;
    
    const avgCompletionTimeMinutes = Math.round(avgCompletionTime / (1000 * 60));
    
    // Produtividade semanal (tarefas concluídas nos últimos 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyCompleted = filteredTasks.filter((t: Task) => {
      if (t.statusAtual !== 'concluido' || !t.dataFim) return false;
      return new Date(t.dataFim) >= oneWeekAgo;
    }).length;
    
    // Gargalos críticos (tarefas em "a_fazer" há mais de 7 dias)
    const criticalBottlenecks = filteredTasks.filter((t: Task) => {
      if (t.statusAtual !== 'a_fazer') return false;
      const daysInBacklog = (Date.now() - new Date(t.dataCadastro).getTime()) / (1000 * 60 * 60 * 24);
      return daysInBacklog > 7;
    });
    
    // Análise de impedimentos por categoria
    const impedimentAnalysis = filteredTasks.reduce((acc: Record<string, number>, task: Task) => {
      if (task.impedimento && task.categoria) {
        acc[task.categoria] = (acc[task.categoria] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Tempo total de impedimento
    const totalImpedimentTime = filteredTasks.reduce((acc: number, task: Task) => {
      return acc + (task.tempoTotalImpedimento || 0);
    }, 0);
    
    return {
      total,
      concluidas,
      emAndamento,
      impedidas,
      altaPrioridade,
      progressPercentage,
      taxaConclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0,
      taxaImpedimento: total > 0 ? Math.round((impedidas / total) * 100) : 0,
      avgCompletionTimeMinutes,
      weeklyCompleted,
      criticalBottlenecks: criticalBottlenecks.length,
      impedimentAnalysis,
      totalImpedimentTime
    };
  }, [filteredTasks]);

  // Dados para gráfico de linha (tarefas criadas por dia)
  const dailyData = useMemo(() => {
    const days = periodFilter === '7d' ? 7 : periodFilter === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTasks = filteredTasks.filter((task: Task) => 
        format(new Date(task.dataCadastro), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      data.push({
        date: format(date, 'dd/MM'),
        criadas: dayTasks.length,
        concluidas: dayTasks.filter((t: Task) => t.statusAtual === 'concluido').length
      });
    }
    
    return data;
  }, [filteredTasks, periodFilter]);

  // Dados para gráfico de pizza (distribuição por status)
  const statusData = useMemo(() => {
    const statusCount = filteredTasks.reduce((acc: Record<string, number>, task: Task) => {
      acc[task.statusAtual] = (acc[task.statusAtual] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status === 'a_fazer' ? 'A Fazer' : status === 'fazendo' ? 'Fazendo' : 'Concluído',
      value: count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
    }));
  }, [filteredTasks]);

  // Dados para gráfico de barras (tarefas por prioridade)
  const priorityData = useMemo(() => {
    const priorityCount = filteredTasks.reduce((acc: Record<string, number>, task: Task) => {
      acc[task.prioridade] = (acc[task.prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(priorityCount).map(([priority, count]) => ({
      prioridade: priority.charAt(0).toUpperCase() + priority.slice(1),
      total: count,
      color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
    }));
  }, [filteredTasks]);

  // Dados para análise de tendências
  const trendsData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayTasks = filteredTasks.filter((task: Task) => 
        format(new Date(task.dataCadastro), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const completedTasks = filteredTasks.filter((task: Task) => 
        task.statusAtual === 'concluido' && 
        task.dataFim && 
        format(new Date(task.dataFim), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'dd/MM'),
        fullDate: format(date, 'yyyy-MM-dd'),
        criadas: dayTasks.length,
        concluidas: completedTasks.length,
        impedidas: dayTasks.filter((t: Task) => t.impedimento).length,
        altaPrioridade: dayTasks.filter((t: Task) => t.prioridade === 'alta').length
      };
    });
    
    return last30Days;
  }, [filteredTasks]);

  // Dados para análise avançada
  const advancedAnalysis = useMemo(() => {
    // Análise de eficiência por categoria
    const categoryEfficiency = filteredTasks.reduce((acc: Record<string, { total: number; completed: number; avgTime: number }>, task: Task) => {
      if (!task.categoria) return acc;
      
      if (!acc[task.categoria]) {
        acc[task.categoria] = { total: 0, completed: 0, avgTime: 0 };
      }
      
      acc[task.categoria].total++;
      
      if (task.statusAtual === 'concluido' && task.dataInicio && task.dataFim) {
        acc[task.categoria].completed++;
        const timeDiff = new Date(task.dataFim).getTime() - new Date(task.dataInicio).getTime();
        acc[task.categoria].avgTime += timeDiff;
      }
      
      return acc;
    }, {});
    
    // Calcular médias
    Object.keys(categoryEfficiency).forEach(category => {
      if (categoryEfficiency[category].completed > 0) {
        categoryEfficiency[category].avgTime = Math.round(
          categoryEfficiency[category].avgTime / categoryEfficiency[category].completed / (1000 * 60)
        );
      }
    });
    
    // Análise de impedimentos por período
    const impedimentTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayTasks = filteredTasks.filter((task: Task) => 
        task.dataImpedimento && 
        format(new Date(task.dataImpedimento), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        day: format(date, 'dd/MM'),
        impedimentos: dayTasks.length,
        tempoPerdido: dayTasks.reduce((sum: number, task: Task) => sum + (task.tempoTotalImpedimento || 0), 0)
      };
    });
    
    // Análise de mudanças de prioridade
    const priorityChanges = filteredTasks.reduce((acc: Record<string, number>, task: Task) => {
      const changes = task.numeroMudancasPrioridade || 0;
      if (changes > 0) {
        acc[task.titulo] = changes;
      }
      return acc;
    }, {});
    
    return {
      categoryEfficiency,
      impedimentTrend,
      priorityChanges,
      totalImpedimentTime: metrics.totalImpedimentTime
    };
  }, [filteredTasks, metrics.totalImpedimentTime]);

  // Dados para análise de padrões
  const patternsData = useMemo(() => {
    // Padrões por dia da semana
    const weeklyPatterns = Array.from({ length: 7 }, (_, i) => {
      const dayOfWeek = i; // 0 = domingo, 1 = segunda, etc.
      const dayTasks = filteredTasks.filter((task: Task) => {
        const taskDate = new Date(task.dataCadastro);
        return taskDate.getDay() === dayOfWeek;
      });
      
      const completedTasks = filteredTasks.filter((task: Task) => {
        if (task.statusAtual !== 'concluido' || !task.dataFim) return false;
        const taskDate = new Date(task.dataFim);
        return taskDate.getDay() === dayOfWeek;
      });
      
      return {
        day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek],
        criadas: dayTasks.length,
        concluidas: completedTasks.length,
        eficiencia: dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0
      };
    });
    
    // Padrões por hora (baseado em dataCadastro)
    const hourlyPatterns = Array.from({ length: 24 }, (_, i) => {
      const hourTasks = filteredTasks.filter((task: Task) => {
        const taskDate = new Date(task.dataCadastro);
        return taskDate.getHours() === i;
      });
      
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        tasks: hourTasks.length
      };
    });
    
    // Análise de sequência de status
    const statusTransitions = filteredTasks.reduce((acc: Record<string, number>, task: Task) => {
      const history = task.statusHistorico;
      for (let i = 0; i < history.length - 1; i++) {
        const currentEntry = history[i];
        const nextEntry = history[i + 1];
        
        // Verificar se ambos os status existem
        if (!currentEntry?.status || !nextEntry?.status) {
          continue;
        }
        
        const transition = `${currentEntry.status} → ${nextEntry.status}`;
        acc[transition] = (acc[transition] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Tempo médio entre transições
    const transitionTimes = filteredTasks.reduce((acc: Record<string, number[]>, task: Task) => {
      const history = task.statusHistorico;
      for (let i = 0; i < history.length - 1; i++) {
        const currentEntry = history[i];
        const nextEntry = history[i + 1];
        
        // Verificar se ambos os timestamps existem e são válidos
        if (!currentEntry?.timestamp || !nextEntry?.timestamp) {
          continue;
        }
        
        // Garantir que os timestamps são objetos Date
        const currentTime = currentEntry.timestamp instanceof Date 
          ? currentEntry.timestamp 
          : new Date(currentEntry.timestamp);
        const nextTime = nextEntry.timestamp instanceof Date 
          ? nextEntry.timestamp 
          : new Date(nextEntry.timestamp);
        
        // Verificar se as datas são válidas
        if (isNaN(currentTime.getTime()) || isNaN(nextTime.getTime())) {
          continue;
        }
        
        const transition = `${currentEntry.status} → ${nextEntry.status}`;
        const timeDiff = nextTime.getTime() - currentTime.getTime();
        const minutes = Math.round(timeDiff / (1000 * 60));
        
        if (!acc[transition]) acc[transition] = [];
        acc[transition].push(minutes);
      }
      return acc;
    }, {});
    
    return {
      weeklyPatterns,
      hourlyPatterns,
      statusTransitions,
      transitionTimes
    };
  }, [filteredTasks]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <Navigation />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Relatórios Avançados
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise detalhada da sua produtividade e padrões de trabalho
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todos os dados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Progresso Geral */}
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
                {metrics.concluidas}/{metrics.total}
              </div>
              <div className="space-y-2">
                <Progress value={metrics.progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {metrics.progressPercentage}% concluído
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Carga Atual */}
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
                {metrics.emAndamento}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  tarefas em andamento
                </p>
                {metrics.emAndamento > 0 && metrics.impedidas > 0 && (
                  <p className="text-xs text-destructive">
                    {metrics.impedidas} com impedimento
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Eficiência */}
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
          
          {/* Problemas */}
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
                {metrics.taxaImpedimento}%
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
          
          {/* Produtividade Semanal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                  <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Produtividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-foreground">
                {metrics.weeklyCompleted}
              </div>
              <p className="text-sm text-muted-foreground">
                concluídas esta semana
              </p>
            </CardContent>
          </Card>
          
          {/* Alta Prioridade */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                Alta Prioridade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-foreground">
                {metrics.altaPrioridade}
              </div>
              <p className="text-sm text-muted-foreground">
                tarefas urgentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Abas dos Relatórios */}
        <Tabs defaultValue="productivity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="productivity">Produtividade</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="analysis">Análise Avançada</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
            <TabsTrigger value="bottlenecks">Gargalos</TabsTrigger>
          </TabsList>

          {/* Aba Produtividade */}
          <TabsContent value="productivity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Linha - Tarefas por Dia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tarefas Criadas por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="criadas" 
                        stackId="1"
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="concluidas" 
                        stackId="1"
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Pizza - Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie 
                        data={statusData} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        dataKey="value"
                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {statusData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Barras - Prioridades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tarefas por Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="prioridade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Tendências */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tendência de Produtividade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendência de Produtividade (30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="criadas" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Criadas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="concluidas" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Concluídas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tendência de Impedimentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Tendência de Impedimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="impedidas" 
                        stackId="1"
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.6}
                        name="Impedidas"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="altaPrioridade" 
                        stackId="1"
                        stroke="#F59E0B" 
                        fill="#F59E0B" 
                        fillOpacity={0.8}
                        name="Alta Prioridade"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Resumo de Tendências */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Resumo de Tendências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {trendsData.slice(-7).reduce((sum, day) => sum + day.concluidas, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Concluídas (7 dias)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {trendsData.slice(-7).reduce((sum, day) => sum + day.criadas, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Criadas (7 dias)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {trendsData.slice(-7).reduce((sum, day) => sum + day.impedidas, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Impedidas (7 dias)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Análise Avançada */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eficiência por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Eficiência por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(advancedAnalysis.categoryEfficiency).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(advancedAnalysis.categoryEfficiency).map(([category, data]: [string, any]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">{category}</span>
                            <span className="text-sm text-muted-foreground">
                              {data.completed}/{data.total} concluídas
                            </span>
                          </div>
                          <div className="space-y-1">
                            <Progress 
                              value={(data.completed / data.total) * 100} 
                              className="h-2" 
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Taxa: {Math.round((data.completed / data.total) * 100)}%</span>
                              <span>Tempo médio: {data.avgTime > 0 ? formatMinutesToString(data.avgTime) : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Nenhuma categoria definida nas tarefas</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tendência de Impedimentos (7 dias) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Impedimentos Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={advancedAnalysis.impedimentTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="impedimentos" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatMinutesToString(advancedAnalysis.totalImpedimentTime)}
                    </div>
                    <p className="text-sm text-muted-foreground">Tempo total perdido</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análise de Mudanças de Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Análise de Mudanças de Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(advancedAnalysis.priorityChanges).length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(advancedAnalysis.priorityChanges)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 6)
                        .map(([taskTitle, changes]: [string, any]) => (
                          <div key={taskTitle} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{taskTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {changes} mudança{changes > 1 ? 's' : ''}
                                </p>
                              </div>
                              <Badge 
                                variant={changes >= 3 ? "destructive" : changes >= 2 ? "secondary" : "outline"}
                                className="ml-2"
                              >
                                {changes >= 3 ? "Alto Risco" : changes >= 2 ? "Médio" : "Baixo"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Total de tarefas com mudanças: {Object.keys(advancedAnalysis.priorityChanges).length}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma mudança de prioridade registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Padrões */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Padrões Semanais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Padrões por Dia da Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={patternsData.weeklyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="criadas" fill="#3B82F6" name="Criadas" />
                      <Bar dataKey="concluidas" fill="#10B981" name="Concluídas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Padrões por Hora */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Padrões por Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={patternsData.hourlyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="tasks" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.6}
                        name="Tarefas Criadas"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Análise de Transições de Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Análise de Transições de Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(patternsData.statusTransitions).length > 0 ? (
                  <div className="space-y-6">
                    {/* Transições mais comuns */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Transições Mais Comuns</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(patternsData.statusTransitions)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 6)
                          .map(([transition, count]: [string, any]) => (
                            <div key={transition} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{transition}</span>
                                <Badge variant="outline">{count}</Badge>
                              </div>
                              {patternsData.transitionTimes[transition] && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Tempo médio: {formatMinutesToString(
                                    Math.round(
                                      patternsData.transitionTimes[transition].reduce((a: number, b: number) => a + b, 0) / 
                                      patternsData.transitionTimes[transition].length
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Insights de Padrões */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Dia Mais Produtivo
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {patternsData.weeklyPatterns.reduce((max, day) => 
                            day.concluidas > max.concluidas ? day : max
                          ).day}
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Hora Pico
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {patternsData.hourlyPatterns.reduce((max, hour) => 
                            hour.tasks > max.tasks ? hour : max
                          ).hour}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            Transição Mais Rápida
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          {Object.entries(patternsData.transitionTimes)
                            .sort(([,a], [,b]) => {
                              const avgA = (a as number[]).reduce((sum: number, time: number) => sum + time, 0) / (a as number[]).length;
                              const avgB = (b as number[]).reduce((sum: number, time: number) => sum + time, 0) / (b as number[]).length;
                              return avgA - avgB;
                            })[0]?.[0] || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma transição de status registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Gargalos */}
          <TabsContent value="bottlenecks" className="space-y-6">
            <BottleneckAnalysis />
          </TabsContent>
        </Tabs>

        {/* Insights e Ações Recomendadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights Automáticos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Insights Automáticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Insight de Produtividade */}
                {metrics.weeklyCompleted > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Positivo</Badge>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Produtividade semanal: {metrics.weeklyCompleted} tarefas
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.weeklyCompleted >= 5 ? 'Excelente ritmo!' : 'Bom progresso esta semana'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Dica</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Comece a completar tarefas
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Complete algumas tarefas para ver insights de produtividade
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Insight de Eficiência */}
                {metrics.avgCompletionTimeMinutes > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Eficiência</Badge>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Tempo médio: {formatMinutesToString(metrics.avgCompletionTimeMinutes)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.avgCompletionTimeMinutes < 240 ? 'Muito eficiente!' : 'Considere otimizar estimativas'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Sugestão</Badge>
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        Defina datas de início e fim
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para calcular eficiência, marque quando iniciar e concluir tarefas
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Insight de Impedimentos */}
                {metrics.totalImpedimentTime > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Atenção</Badge>
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Tempo perdido: {formatMinutesToString(metrics.totalImpedimentTime)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Identifique padrões nos impedimentos
                      </p>
                    </div>
                  </div>
                ) : metrics.impedidas > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Monitoramento</Badge>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {metrics.impedidas} tarefa(s) com impedimento
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resolva os impedimentos para manter o fluxo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ótimo</Badge>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Nenhum impedimento ativo
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fluxo de trabalho está fluindo bem
                      </p>
                    </div>
                  </div>
                )}

                {/* Insight de Prioridades */}
                {metrics.altaPrioridade > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Urgente</Badge>
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {metrics.altaPrioridade} tarefa(s) de alta prioridade
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Foque nas tarefas críticas primeiro
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                {/* Ação: Gargalos Críticos */}
                {metrics.criticalBottlenecks > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/5 dark:bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Resolver {metrics.criticalBottlenecks} gargalos críticos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tarefas em backlog há mais de 7 dias - revise prioridades
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Ação: Impedimentos */}
                {metrics.taxaImpedimento > 20 ? (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Reduzir impedimentos urgentemente
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Taxa atual: {metrics.taxaImpedimento}% (meta: &lt;20%) - identifique causas raiz
                      </p>
                    </div>
                  </div>
                ) : metrics.impedidas > 0 ? (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Monitorar impedimentos ativos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.impedidas} tarefa(s) com impedimento - resolva rapidamente
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {/* Ação: Prioridades */}
                {metrics.altaPrioridade > 3 ? (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Target className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Priorizar tarefas urgentes
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.altaPrioridade} tarefas de alta prioridade - muitas urgentes podem indicar má planejamento
                      </p>
                    </div>
                  </div>
                ) : metrics.altaPrioridade > 0 ? (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Focar em tarefas críticas
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.altaPrioridade} tarefa(s) de alta prioridade - complete primeiro
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Ação: Produtividade */}
                {metrics.weeklyCompleted === 0 && metrics.total > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Começar a completar tarefas
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Nenhuma tarefa concluída esta semana - defina metas pequenas e alcançáveis
                      </p>
                    </div>
                  </div>
                )}

                {/* Ação: Eficiência */}
                {metrics.avgCompletionTimeMinutes === 0 && metrics.concluidas > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        Melhorar rastreamento de tempo
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Defina datas de início e fim para calcular eficiência
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Estado Saudável */}
                {metrics.taxaImpedimento <= 20 && metrics.criticalBottlenecks === 0 && metrics.altaPrioridade <= 3 && metrics.weeklyCompleted > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Fluxo saudável mantido
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Continue mantendo o ritmo atual e monitore métricas regularmente
                      </p>
                    </div>
                  </div>
                )}

                {/* Estado Inicial */}
                {metrics.total === 0 && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Target className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Começar a usar o sistema
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Crie algumas tarefas para começar a receber insights e recomendações
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}