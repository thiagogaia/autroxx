'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ImpedimentDialog } from './ImpedimentDialog';
import { useTaskContext } from '@/contexts/TaskContextV2';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from '@/lib/mock-data';
import { hasStatusInHistory } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTaskStatus, updateTaskPriority, setImpediment, removeImpediment, deleteTask } = useTaskContext();
  const [impedimentDialogOpen, setImpedimentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statusConfig = STATUS_CONFIG[task.statusAtual];
  const prioridadeConfig = PRIORIDADE_CONFIG[task.prioridade];

  const handleStatusChange = (status: TaskStatus) => {
    updateTaskStatus(task.id, status);
  };

  const handlePriorityChange = (prioridade: TaskPriority) => {
    updateTaskPriority(task.id, prioridade);
  };

  const handleImpedimentChange = (checked: boolean) => {
    if (checked) {
      setImpedimentDialogOpen(true);
    } else {
      removeImpediment(task.id);
    }
  };

  const handleImpedimentSave = (motivo: string) => {
    setImpediment(task.id, motivo);
  };

  const handleDeleteTask = () => {
    deleteTask(task.id);
    setDeleteDialogOpen(false);
  };

  const calcularTempoDecorrido = () => {
    if (!task.dataFim || !task.dataInicio) return null;
    const inicio = new Date(task.dataInicio);
    const fim = new Date(task.dataFim);
    const diffMs = fim.getTime() - inicio.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }
    return `${diffMinutes}min`;
  };

  const tempoDecorrido = calcularTempoDecorrido();
  const isAltaPrioridade = task.prioridade === 'alta';
  const isMediaPrioridade = task.prioridade === 'media';

  return (
    <>
      <tr className={`hover:bg-muted/50 transition-colors ${
        isAltaPrioridade ? 'bg-red-50/50 border-l-4 border-l-red-500 task-priority-pulse' : 
        isMediaPrioridade ? 'bg-yellow-50/50 border-l-4 border-l-yellow-500' : ''
      }`}>
        {/* Status Atual */}
        <td className="text-center p-4">
          <div className="flex items-center justify-center gap-2">
            {task.statusAtual === 'fazendo' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <span style={{ color: statusConfig.color, fontSize: '20px' }}>
                {statusConfig.icon}
              </span>
            )}
            
            {task.impedimento && (
              <div className="relative group">
                <span 
                  className="text-red-500 animate-bounce cursor-pointer"
                  onClick={() => setImpedimentDialogOpen(true)}
                >
                  ⚠️
                </span>
                {task.impedimentoMotivo && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-48 text-center">
                    {task.impedimentoMotivo}
                  </div>
                )}
              </div>
            )}
          </div>
        </td>

        {/* Checkbox Fazendo */}
        <td className="text-center p-4">
          <Checkbox
            checked={hasStatusInHistory(task, 'fazendo')}
            onCheckedChange={() => handleStatusChange('fazendo')}
            className="mx-auto"
          />
        </td>

        {/* Checkbox Concluído */}
        <td className="text-center p-4">
          <Checkbox
            checked={hasStatusInHistory(task, 'concluido')}
            onCheckedChange={() => handleStatusChange('concluido')}
            className="mx-auto"
          />
        </td>

        {/* Título da Tarefa */}
        <td className="col-span-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start flex-1">
              <span className={`font-medium ${
                task.statusAtual === 'concluido' ? 'line-through text-muted-foreground' : ''
              } ${isAltaPrioridade ? 'task-priority-pulse' : ''}`}>
                {task.titulo}
              </span>
              
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                {task.dataInicio && (
                  <div>
                    Início: {new Date(task.dataInicio).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
                {task.dataFim && (
                  <div>
                    Fim: {new Date(task.dataFim).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {tempoDecorrido && (
                      <span className="font-medium text-green-600 ml-1">
                        ({tempoDecorrido})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Botão de Excluir */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTask}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </td>


        {/* Checkbox Impedimento */}
        <td className="text-center p-4">
          <Checkbox
            checked={task.impedimento}
            onCheckedChange={handleImpedimentChange}
            className="mx-auto accent-red-600"
          />
        </td>

        {/* Prioridade Editável */}
        <td className="text-center p-4">
          <Select value={task.prioridade} onValueChange={handlePriorityChange}>
            <SelectTrigger 
              className="w-24 text-xs"
              style={{ 
                color: prioridadeConfig.color,
                backgroundColor: isAltaPrioridade ? '#fef2f2' : isMediaPrioridade ? '#fefbf0' : 'white'
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </td>
      </tr>

      <ImpedimentDialog
        isOpen={impedimentDialogOpen}
        onClose={() => setImpedimentDialogOpen(false)}
        onSave={handleImpedimentSave}
        initialMotivo={task.impedimentoMotivo}
      />
    </>
  );
}