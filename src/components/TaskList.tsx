'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SortableTaskItem } from './SortableTaskItem';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useTaskContext } from '@/contexts/TaskContext';
import { ArrowUpDown } from 'lucide-react';

export function TaskList() {
  const { tasks, filtroAtivo, reorderTasks } = useTaskContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Precisa arrastar 8px para iniciar o drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtrar tarefas baseado na aba ativa
  const tarefasFiltradas = tasks.filter(tarefa => {
    if (filtroAtivo === 'tudo') return true;
    if (filtroAtivo === 'fazendo') return tarefa.statusAtual === 'fazendo';
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tarefasFiltradas.findIndex(task => task.id === active.id);
      const newIndex = tarefasFiltradas.findIndex(task => task.id === over?.id);

      // Reordena apenas as tarefas filtradas
      const reorderedFiltered = arrayMove(tarefasFiltradas, oldIndex, newIndex);
      
      // Se estamos filtrando, precisamos mesclar com as tarefas não filtradas
      if (filtroAtivo !== 'tudo') {
        const nonFilteredTasks = tasks.filter(tarefa => {
          if (filtroAtivo === 'fazendo') return tarefa.statusAtual !== 'fazendo';
          if (filtroAtivo === 'normal') return tarefa.prioridade !== 'normal';
          if (filtroAtivo === 'urgente') return tarefa.prioridade !== 'alta';
          return false;
        });
        
        // Combina as tarefas reordenadas com as não filtradas
        const allReorderedIds = [
          ...reorderedFiltered.map(task => task.id),
          ...nonFilteredTasks.map(task => task.id)
        ];
        
        reorderTasks(allReorderedIds);
      } else {
        // Se não há filtro, reordena todas as tarefas
        reorderTasks(reorderedFiltered.map(task => task.id));
      }
    }
  }

  return (
    <Card className="overflow-hidden">
      
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center font-medium w-8">
                <ArrowUpDown className="h-4 w-4 mx-auto" />
              </TableHead>
              <TableHead className="text-center font-medium">Status</TableHead>
              <TableHead className="text-center font-medium">Fazendo</TableHead>
              <TableHead className="text-center font-medium">Concluído</TableHead>
              <TableHead className="font-medium">Tarefa</TableHead>
              <TableHead className="text-center font-medium">Impedimento</TableHead>
              <TableHead className="text-center font-medium">Prioridade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={tarefasFiltradas.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {tarefasFiltradas.map(tarefa => (
                <SortableTaskItem key={tarefa.id} task={tarefa} />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </Card>
  );
}