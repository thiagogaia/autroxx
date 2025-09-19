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
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');
  const { tasks } = useTaskContext();

  // Filtrar dados por período
  const filteredTasks = useMemo(() => {
    if (periodFilter === 'all') return tasks;
    
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const cutoffDate = subDays(new Date(), daysMap[periodFilter]);
    
    return tasks.filter((task: Task) => 
      new Date(task.dataCadastro) >= cutoffDate
    );
  }, [tasks, periodFilter]);

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

  // Heatmap data (simulado para fase 2)
  const heatmapData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return days.map(day => ({
      day,
      data: hours.map(hour => ({
        hour,
        value: Math.floor(Math.random() * 10) // Dados simulados
      }))
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
                      <RechartsPieChart data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
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

          {/* Outras abas (placeholder por enquanto) */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Análise de tendências em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Análise avançada em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Padrões de Trabalho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Análise de padrões em desenvolvimento...</p>
                </div>
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
                {metrics.weeklyCompleted > 0 && (
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
                )}
                
                {metrics.avgCompletionTimeMinutes > 0 && (
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
                )}
                
                {metrics.totalImpedimentTime > 0 && (
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
                
                {metrics.taxaImpedimento > 20 && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Reduzir impedimentos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Taxa atual: {metrics.taxaImpedimento}% (meta: &lt;20%)
                      </p>
                    </div>
                  </div>
                )}
                
                {metrics.altaPrioridade > 3 && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Priorizar tarefas urgentes
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.altaPrioridade} tarefas de alta prioridade pendentes
                      </p>
                    </div>
                  </div>
                )}
                
                {metrics.taxaImpedimento <= 20 && metrics.criticalBottlenecks === 0 && metrics.altaPrioridade <= 3 && (
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
      </div>
    </div>
  );
}