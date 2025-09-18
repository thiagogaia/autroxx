'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskContext } from '@/contexts/TaskContext';

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
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Em andamento", 
      value: tarefasEmAndamento.length,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Tempo médio",
      value: tempoMedioHoras > 0 ? `${tempoMedioHoras.toFixed(1)}h` : '--',
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Taxa impedimento",
      value: `${taxaImpedimento}%`,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Finalizadas hoje",
      value: tarefasHoje.length,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Alta prioridade",
      value: prioridades.alta || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Total tarefas",
      value: tasks.length,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: "Taxa conclusão",
      value: `${tasks.length > 0 ? Math.round((tarefasConcluidas.length / tasks.length) * 100) : 0}%`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Métricas de Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricas.map((metrica, index) => (
            <div key={index} className={`p-4 rounded-lg ${metrica.bgColor}`}>
              <div className={`text-2xl font-bold ${metrica.color}`}>
                {metrica.value}
              </div>
              <div className={`text-sm ${metrica.color.replace('600', '800')}`}>
                {metrica.title}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}