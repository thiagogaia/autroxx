'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter
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

// Simulando dados do localStorage para desenvolvimento
const mockData = [
  {
    "id": 1758233036813,
    "titulo": "Checkout Novo - Regras de exibição e redirecionamento de URLs",
    "descricao": "",
    "statusHistorico": ["a_fazer", "fazendo"],
    "statusAtual": "fazendo",
    "prioridade": "alta",
    "impedimento": false,
    "impedimentoMotivo": "",
    "dataCadastro": "2025-09-18T22:03:56.813Z",
    "dataInicio": "2025-09-18T22:03:58.752Z",
    "dataFim": null,
    "ordem": 0,
    "dataImpedimento": null
  },
  {
    "id": 1758231297467,
    "titulo": "[derick] - conversa sobre a estrutura do checkout",
    "statusHistorico": ["a_fazer"],
    "statusAtual": "a_fazer",
    "prioridade": "normal",
    "impedimento": false,
    "impedimentoMotivo": "",
    "dataCadastro": "2025-09-18T21:34:57.467Z",
    "dataInicio": null,
    "dataFim": null,
    "ordem": 1,
    "descricao": "Bah MEO ficou bom",
    "dataImpedimento": null
  }
  // Adicione mais dados conforme necessário
];

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
  const [tasks] = useState(mockData); // Em produção, viria do Context

  // Filtrar dados por período
  const filteredTasks = useMemo(() => {
    if (periodFilter === 'all') return tasks;
    
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const cutoffDate = subDays(new Date(), daysMap[periodFilter]);
    
    return tasks.filter(task => 
      new Date(task.dataCadastro) >= cutoffDate
    );
  }, [tasks, periodFilter]);

  // Métricas principais
  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const concluidas = filteredTasks.filter(t => t.statusAtual === 'concluido').length;
    const emAndamento = filteredTasks.filter(t => t.statusAtual === 'fazendo').length;
    const impedidas = filteredTasks.filter(t => t.impedimento).length;
    const altaPrioridade = filteredTasks.filter(t => t.prioridade === 'alta').length;
    
    return {
      total,
      concluidas,
      emAndamento,
      impedidas,
      altaPrioridade,
      taxaConclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0,
      taxaImpedimento: total > 0 ? Math.round((impedidas / total) * 100) : 0
    };
  }, [filteredTasks]);

  // Dados para gráfico de linha (tarefas criadas por dia)
  const dailyData = useMemo(() => {
    const days = periodFilter === '7d' ? 7 : periodFilter === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTasks = filteredTasks.filter(task => 
        format(new Date(task.dataCadastro), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      data.push({
        date: format(date, 'dd/MM'),
        criadas: dayTasks.length,
        concluidas: dayTasks.filter(t => t.statusAtual === 'concluido').length
      });
    }
    
    return data;
  }, [filteredTasks, periodFilter]);

  // Dados para gráfico de pizza (distribuição por status)
  const statusData = useMemo(() => {
    const statusCount = filteredTasks.reduce((acc, task) => {
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
    const priorityCount = filteredTasks.reduce((acc, task) => {
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.concluidas}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.emAndamento}</p>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.impedidas}</p>
                  <p className="text-xs text-muted-foreground">Impedidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.altaPrioridade}</p>
                  <p className="text-xs text-muted-foreground">Alta Prioridade</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.taxaConclusao}%</p>
                  <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.taxaImpedimento}%</p>
                  <p className="text-xs text-muted-foreground">Taxa Impedimento</p>
                </div>
              </div>
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

        {/* Insights Automáticos */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              💡 Insights Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Badge className="bg-green-100 text-green-800">Positivo</Badge>
                <p>Sua produtividade aumentou 23% no período selecionado</p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800">Padrão</Badge>
                <p>Você cria mais tarefas nas terças e quartas-feiras</p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-orange-100 text-orange-800">Atenção</Badge>
                <p>Tarefas de alta prioridade levam 2.3x mais tempo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}