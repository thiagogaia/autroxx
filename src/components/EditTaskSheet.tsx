'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, TaskPriority } from '@/types/task';
import { PRIORIDADE_CONFIG } from '@/lib/mock-data';
import { TagsInput } from './TagsInput';
import { MarkdownEditor } from './MarkdownEditor';

interface EditTaskSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskSheet({ task, isOpen, onClose }: EditTaskSheetProps) {
  const { updateTask, tasks } = useTaskContext();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<TaskPriority>('normal');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Atualizar os campos quando a tarefa mudar
  useEffect(() => {
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || '');
      setPrioridade(task.prioridade);
      setTags(task.tags || []);
    }
  }, [task]);

  // Função para lidar com cliques em links de tarefas
  const handleTaskLinkClick = useCallback((taskId: number) => {
    const targetTask = tasks.find((t: Task) => t.id === taskId);
    if (targetTask) {
      setSelectedTaskId(taskId);
      // Aqui você pode implementar a lógica para abrir a tarefa
      // Por exemplo, abrir um modal ou navegar para a tarefa
      console.log('Abrir tarefa:', targetTask);
    }
  }, [tasks]);

  const handleSave = () => {
    if (!task) return;

    updateTask(task.id, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prioridade,
      tags
    });

    onClose();
  };

  const handleCancel = () => {
    // Resetar os campos para os valores originais
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || '');
      setPrioridade(task.prioridade);
    }
    onClose();
  };

  const prioridadeConfig = PRIORIDADE_CONFIG[prioridade];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="h-full flex flex-col">
        <SheetHeader>
          <SheetTitle>
            Editar Tarefa
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid gap-6 py-4">
            {/* Título */}
            <div className="grid gap-3">
              <label htmlFor="titulo" className="text-sm font-medium">
                Título *
              </label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título da tarefa..."
                className="w-full"
              />
            </div>

            {/* Descrição */}
            <div className="grid gap-3">
              <label htmlFor="descricao" className="text-sm font-medium">
                Descrição
              </label>
              <MarkdownEditor
                value={descricao}
                onChange={setDescricao}
                placeholder="Adicione detalhes, anotações ou observações sobre a tarefa usando Markdown..."
                onTaskLinkClick={handleTaskLinkClick}
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown para formatação rica. Suporte a checkboxes interativos, links para outras tarefas (#123), código e muito mais.
              </p>
            </div>

            {/* Prioridade */}
            <div className="grid gap-3">
              <label htmlFor="prioridade" className="text-sm font-medium">
                Prioridade
              </label>
              <Select value={prioridade} onValueChange={(value: TaskPriority) => setPrioridade(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">
                    <div className="flex items-center gap-2">
                      <span style={{ color: PRIORIDADE_CONFIG.baixa.color }}>●</span>
                      Baixa
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <span style={{ color: PRIORIDADE_CONFIG.normal.color }}>●</span>
                      Normal
                    </div>
                  </SelectItem>
                  <SelectItem value="media">
                    <div className="flex items-center gap-2">
                      <span style={{ color: PRIORIDADE_CONFIG.media.color }}>●</span>
                      Média
                    </div>
                  </SelectItem>
                  <SelectItem value="alta">
                    <div className="flex items-center gap-2">
                      <span style={{ color: PRIORIDADE_CONFIG.alta.color }}>●</span>
                      Alta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="grid gap-3">
              <label className="text-sm font-medium">
                Tags
              </label>
              <TagsInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Digite uma tag e pressione Enter (ex: urgente, refatoração, feature)"
                maxTags={8}
              />
              <p className="text-xs text-muted-foreground">
                Use tags para categorizar e organizar suas tarefas. Isso ajuda a gerar melhores métricas e insights.
              </p>
            </div>

            {/* Informações da Tarefa */}
            {task && (
              <div className="grid gap-2 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground">Informações da Tarefa</h4>
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <div>
                    <strong>Status:</strong> {task.statusAtual === 'a_fazer' ? 'A fazer' : 
                                            task.statusAtual === 'fazendo' ? 'Fazendo' : 'Concluído'}
                  </div>
                  <div>
                    <strong>Cadastro:</strong> {new Date(task.dataCadastro).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {task.dataInicio && (
                    <div>
                      <strong>Início:</strong> {new Date(task.dataInicio).toLocaleString('pt-BR', {
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
                      <strong>Fim:</strong> {new Date(task.dataFim).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  {task.impedimento && (
                    <div className="text-red-600">
                      <strong>Impedimento:</strong> {task.impedimentoMotivo}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 flex gap-2">
          <Button 
            onClick={handleSave}
            disabled={!titulo.trim()}
          >
            Salvar Alterações
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
