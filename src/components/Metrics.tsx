'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskContext } from '@/contexts/TaskContext';
import { 
  CheckCircle, 
  Clock, 
  Timer, 
  AlertTriangle, 
  Calendar, 
  AlertCircle, 
  BarChart3, 
  Target 
} from 'lucide-react';

export function Metrics() {
  const { tasks } = useTaskContext();

  // Calcular métricas úteis
  const tarefasConcluidas = tasks.filter(t => t.statusAtual === 'concluido' && t.dataFim && t.dataInicio);
  const tarefasEmAndamento = tasks.filter(t => t.statusAtual === 'fazendo');
  const tarefasComImpedimento = tasks.filter(t => t.impedimento);
  
  // Tempo médio de conclusão
  const tempoMedio = tarefasConcluidas.length > 0 ? 
    tarefasConcluidas.reduce((acc, tarefa) => {
      const diffMs = new Date(tarefa.dataFim!).getTime() - new Date(tarefa.dataInicio!).getTime();
      return acc + diffMs;
    }, 0) / tarefasConcluidas.length : 0;
  
  const tempoMedioHoras = Math.round(tempoMedio / (1000 * 60 * 60 * 24) * 24) / 24;
  
  // Produtividade diária
  const hoje = new Date();
  const tarefasHoje = tarefasConcluidas.filter(t => {
    const dataFim = new Date(t.dataFim!);
    return dataFim.toDateString() === hoje.toDateString();
  });
  
  // Taxa de impedimentos
  const taxaImpedimento = tasks.length > 0 ? 
    Math.round((tarefasComImpedimento.length / tasks.length) * 100) : 0;
  
  // Distribuição de prioridades
  const prioridades = tasks.reduce((acc, t) => {
    acc[t.prioridade] = (acc[t.prioridade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const metricas = [
    {
      title: "Concluídas",
      value: tarefasConcluidas.length,
      icon: CheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      description: "Tarefas com status 'concluido'"
    },
    {
      title: "Em andamento", 
      value: tarefasEmAndamento.length,
      icon: Clock,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      description: "Tarefas com status 'fazendo'"
    },
    {
      title: "Tempo médio",
      value: tempoMedioHoras > 0 ? `${tempoMedioHoras.toFixed(1)}h` : '--',
      icon: Timer,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      description: "Tempo médio de conclusão em horas"
    },
    {
      title: "Taxa impedimento",
      value: `${taxaImpedimento}%`,
      icon: AlertTriangle,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      description: "Percentual de tarefas com impedimento"
    },
    {
      title: "Finalizadas hoje",
      value: tarefasHoje.length,
      icon: Calendar,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      description: "Tarefas concluídas no dia atual"
    },
    {
      title: "Alta prioridade",
      value: prioridades.alta || 0,
      icon: AlertCircle,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      description: "Tarefas com prioridade 'alta'"
    },
    {
      title: "Total tarefas",
      value: tasks.length,
      icon: BarChart3,
      iconColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      description: "Número total de tarefas"
    },
    {
      title: "Taxa conclusão",
      value: `${tasks.length > 0 ? Math.round((tarefasConcluidas.length / tasks.length) * 100) : 0}%`,
      icon: Target,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      description: "Percentual de tarefas concluídas"
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Métricas de Performance</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricas.map((metrica, index) => {
            const IconComponent = metrica.icon;
            return (
              <Card key={index} className={`${metrica.bgColor} ${metrica.borderColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconComponent className={`h-5 w-5 ${metrica.iconColor} cursor-help`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metrica.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className={`text-2xl font-bold ${metrica.iconColor} mb-1`}>
                    {metrica.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {metrica.title}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}