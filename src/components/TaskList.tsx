'use client';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useTaskContext } from '@/contexts/TaskContext';

export function TaskList() {
  const { tasks, filtroAtivo } = useTaskContext();

  // Filtrar tarefas baseado na aba ativa
  const tarefasFiltradas = tasks.filter(tarefa => {
    if (filtroAtivo === 'tudo') return true;
    if (filtroAtivo === 'normal') return tarefa.prioridade === 'normal';
    if (filtroAtivo === 'urgente') return tarefa.prioridade === 'alta';
    return true;
  });

  // Se não há tarefas, mostra o estado vazio
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // Se há tarefas mas nenhuma corresponde ao filtro
  if (tarefasFiltradas.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
          <p className="text-sm mt-1">
            Não há tarefas com o filtro "{filtroAtivo}" aplicado.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-center font-medium">Status</TableHead>
            <TableHead className="text-center font-medium">Fazendo</TableHead>
            <TableHead className="text-center font-medium">Concluído</TableHead>
            <TableHead className="font-medium">Tarefa</TableHead>
            <TableHead className="text-center font-medium">Impedimento</TableHead>
            <TableHead className="text-center font-medium">Prioridade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tarefasFiltradas.map(tarefa => (
            <TaskItem key={tarefa.id} task={tarefa} />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}