'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, GripVertical, Edit, AlertTriangle } from 'lucide-react';
import { ImpedimentDialog } from './ImpedimentDialog';
import { EditTaskSheet } from './EditTaskSheet';
import { ImpedimentoTooltip } from './ImpedimentoTooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, TaskStatus, TaskPriority, TaskCategory, TaskComplexity } from '@/types/task';
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from '@/lib/mock-data';
import { hasStatusInHistory } from '@/lib/utils';
import { formatMinutesToString } from '@/lib/time-converter';
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

interface SortableTaskItemProps {
  task: Task;
}

export function SortableTaskItem({ task }: SortableTaskItemProps) {
  const { updateTaskStatus, updateTaskPriority, setImpediment, removeImpediment, deleteTask } = useTaskContext();
  const [impedimentDialogOpen, setImpedimentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

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

  // Funções para obter cores dos badges
  const getCategoriaColor = (categoria: TaskCategory) => {
    const colors = {
      desenvolvimento: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      reuniao: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      bug: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      documentacao: 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    };
    return colors[categoria];
  };

  const getComplexidadeColor = (complexidade: TaskComplexity) => {
    const colors = {
      simples: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      media: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      complexa: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    };
    return colors[complexidade];
  };

  const getCategoriaLabel = (categoria: TaskCategory) => {
    const labels = {
      desenvolvimento: 'Desenvolvimento',
      reuniao: 'Reunião',
      bug: 'Bug',
      documentacao: 'Documentação'
    };
    return labels[categoria];
  };

  const getComplexidadeLabel = (complexidade: TaskComplexity) => {
    const labels = {
      simples: 'Simples',
      media: 'Média',
      complexa: 'Complexa'
    };
    return labels[complexidade];
  };

  return (
    <>
      <tr 
        ref={setNodeRef} 
        style={style}
        className={`hover:bg-muted/50 transition-colors ${
          isAltaPrioridade ? 'bg-red-50/50 dark:bg-red-950/20 border-l-4 border-l-red-500 dark:border-l-red-400 task-priority-pulse' : 
          isMediaPrioridade ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-l-4 border-l-yellow-500 dark:border-l-yellow-400' : ''
        } ${isDragging ? 'bg-muted shadow-lg' : ''}`}
        {...attributes}
      >
        {/* Handle de Drag */}
        <td className="text-center p-2 w-8">
          <div 
            {...listeners}
            className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing p-1"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </td>

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
                <AlertTriangle 
                  className="h-5 w-5 text-red-500 animate-pulse cursor-pointer hover:animate-shake"
                  onClick={() => setImpedimentDialogOpen(true)}
                />
                {task.impedimentoMotivo && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground border border-border text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-48 text-center z-50">
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
            className="mx-auto cursor-pointer"
          />
        </td>

        {/* Checkbox Concluído */}
        <td className="text-center p-4">
          <Checkbox
            checked={hasStatusInHistory(task, 'concluido')}
            onCheckedChange={() => handleStatusChange('concluido')}
            className="mx-auto cursor-pointer"
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
                <div>
                  Cadastro: {new Date(task.dataCadastro).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
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
                      <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                        ({tempoDecorrido})
                      </span>
                    )}
                  </div>
                )}
                {task.dataImpedimento && (
                  <div className="text-red-600 dark:text-red-400">
                    Impedimento: 
                    <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        {new Date(task.dataImpedimento).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    
                    </TooltipTrigger>
                    <TooltipContent>
                      
                      {task.impedimentoHistorico && task.impedimentoHistorico.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          entry.impedimento 
                            ? 'bg-orange-500' 
                            : 'bg-green-500'
                        }`} />
                        <span className="text-muted-foreground text-xs">
                          {new Date(entry.timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {entry.motivo && (
                          <span className="text-foreground text-xs truncate max-w-32">
                            {entry.motivo}
                          </span>
                        )}
                      </div>
                      ))}
                    </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Badges de Categoria, Estimativa e Complexidade */}
              <div className="flex flex-wrap gap-1 mt-2">
                {/* Badge de Categoria */}
                {task.categoria && (
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${getCategoriaColor(task.categoria)}`}
                  >
                    {getCategoriaLabel(task.categoria)}
                  </Badge>
                )}

                {/* Badge de Estimativa de Tempo */}
                {task.estimativaTempo && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                  >
                    {formatMinutesToString(task.estimativaTempo)}
                  </Badge>
                )}

                {/* Badge de Complexidade */}
                {task.complexidade && (
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${getComplexidadeColor(task.complexidade)}`}
                  >
                    {getComplexidadeLabel(task.complexidade)}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex items-center gap-1">
              {/* Botão de Editar */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer"
                onClick={() => setEditSheetOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>

              {/* Botão de Excluir */}
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
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
          </div>
        </td>

        {/* Checkbox Impedimento */}
        <td className="text-center p-4">
          <Checkbox
            checked={task.impedimento}
            onCheckedChange={handleImpedimentChange}
            className="mx-auto accent-red-600 cursor-pointer"
          />
        </td>

        {/* Prioridade Editável */}
        <td className="text-center p-4">
          <Select value={task.prioridade} onValueChange={handlePriorityChange}>
            <SelectTrigger 
              className={`w-24 text-xs cursor-pointer ${
                isAltaPrioridade ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' : 
                isMediaPrioridade ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''
              }`}
              style={{ 
                color: prioridadeConfig.color
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

      <EditTaskSheet
        task={task}
        isOpen={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
      />
    </>
  );
}