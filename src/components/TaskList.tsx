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
import { SortableTaskItem } from './SortableTaskItem';
import { EmptyState } from './EmptyState';
import { useTaskContext } from '@/contexts/TaskContextV2';
import { ArrowUpDown } from 'lucide-react';

export function TaskList() {
  const { tasks, paginatedTasks, totalTasks, reorderTasks } = useTaskContext();

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

  // Se não há tarefas, mostra o estado vazio
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // Se há tarefas mas nenhuma corresponde ao filtro
  if (totalTasks === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
          <p className="text-sm mt-1">
            Não há tarefas com os filtros aplicados.
          </p>
        </div>
      </Card>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = paginatedTasks.findIndex(task => task.id === active.id);
      const newIndex = paginatedTasks.findIndex(task => task.id === over?.id);

      // Reordena apenas as tarefas da página atual
      const reorderedPage = arrayMove(paginatedTasks, oldIndex, newIndex);
      
      // Para simplificar, vamos reordenar apenas dentro da página atual
      // Em uma implementação mais robusta, você poderia implementar reordenação global
      reorderTasks(reorderedPage.map(task => task.id));
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
              items={paginatedTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {paginatedTasks.map(tarefa => (
                <SortableTaskItem key={tarefa.id} task={tarefa} />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </Card>
  );
}