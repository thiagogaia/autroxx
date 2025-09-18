'use client';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { TaskItem } from './TaskItem';
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