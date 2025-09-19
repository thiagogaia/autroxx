'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, TaskPriority, TaskCategory, TaskComplexity } from '@/types/task';
import { PRIORIDADE_CONFIG } from '@/lib/mock-data';
import { TagsInput } from './TagsInput';
import { MarkdownEditor } from './MarkdownEditor';
import { parseTimeString, formatMinutesToString } from '@/lib/time-converter';
import { Checkbox } from '@/components/ui/checkbox';

interface EditTaskSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  stackLevel?: number; // Nível de profundidade (0 = primeiro nível)
}

export function EditTaskSheet({ task, isOpen, onClose, stackLevel = 0 }: EditTaskSheetProps) {
  const { updateTask, tasks } = useTaskContext();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<TaskPriority>('normal');
  const [tags, setTags] = useState<string[]>([]);
  const [categoria, setCategoria] = useState<TaskCategory | undefined>(undefined);
  const [estimativaTempoString, setEstimativaTempoString] = useState('');
  const [complexidade, setComplexidade] = useState<TaskComplexity | undefined>(undefined);
  const [foiRetrabalho, setFoiRetrabalho] = useState<boolean>(false);
  const [nestedSheetOpen, setNestedSheetOpen] = useState(false);
  const [nestedTask, setNestedTask] = useState<Task | null>(null);

  // Atualizar os campos quando a tarefa mudar
  useEffect(() => {
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || '');
      setPrioridade(task.prioridade);
      setTags(task.tags || []);
      setCategoria(task.categoria);
      setEstimativaTempoString(task.estimativaTempo ? formatMinutesToString(task.estimativaTempo) : '');
      setComplexidade(task.complexidade);
      setFoiRetrabalho(task.foiRetrabalho || false);
    }
  }, [task]);

  // Função para lidar com cliques em links de tarefas
  const handleTaskLinkClick = useCallback((taskId: number) => {
    const targetTask = tasks.find((t: Task) => t.id === taskId);
    if (targetTask) {
      setSelectedTaskId(taskId);
      console.log('Abrindo tarefa referenciada:', targetTask);
      setNestedTask(targetTask);
      setNestedSheetOpen(true);
      // Aqui você pode implementar a lógica para abrir a tarefa
      // Por exemplo, abrir um modal ou navegar para a tarefa
      console.log('Abrir tarefa:', targetTask);
    } else {
      alert('Tarefa não encontrada');
    }
  }, [tasks]);

  const handleSave = () => {
    if (!task) return;

    // Converter string de tempo para minutos
    const estimativaTempo = estimativaTempoString ? parseTimeString(estimativaTempoString).minutes : undefined;

    updateTask(task.id, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prioridade,
      tags,
      categoria,
      estimativaTempo,
      complexidade,
      foiRetrabalho: foiRetrabalho || undefined
    });

    onClose();
  };

  const handleCancel = () => {
    // Resetar os campos para os valores originais
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || '');
      setPrioridade(task.prioridade);
      setTags(task.tags || []);
      setCategoria(task.categoria);
      setEstimativaTempoString(task.estimativaTempo ? formatMinutesToString(task.estimativaTempo) : '');
      setComplexidade(task.complexidade);
      setFoiRetrabalho(task.foiRetrabalho || false);
    }
    onClose();
  };


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="h-full flex flex-col w-[540px] sm:w-[620px] lg:w-[700px] xl:w-[720px] max-w-none">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            Editar Tarefa
            <Badge variant="outline" className="text-xs font-mono bg-muted">
              #{task?.id}
            </Badge>
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

            {/* Categoria */}
            <div className="grid gap-3">
              <label htmlFor="categoria" className="text-sm font-medium">
                Categoria
              </label>
              <Select value={categoria || ''} onValueChange={(value: TaskCategory) => setCategoria(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desenvolvimento">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">●</span>
                      Desenvolvimento
                    </div>
                  </SelectItem>
                  <SelectItem value="reuniao">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">●</span>
                      Reunião
                    </div>
                  </SelectItem>
                  <SelectItem value="bug">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">●</span>
                      Bug
                    </div>
                  </SelectItem>
                  <SelectItem value="documentacao">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">●</span>
                      Documentação
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Categorize a tarefa para melhor análise de tempo e produtividade.
              </p>
            </div>

            {/* Estimativa de Tempo */}
            <div className="grid gap-3">
              <label htmlFor="estimativaTempo" className="text-sm font-medium">
                Estimativa de Tempo
              </label>
              <Input
                id="estimativaTempo"
                value={estimativaTempoString}
                onChange={(e) => setEstimativaTempoString(e.target.value)}
                placeholder="Ex: 1h, 0.5h, 30min, 45"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Digite o tempo estimado. Exemplos: 1h, 0.5h, 30min, 45 (minutos).
              </p>
            </div>

            {/* Complexidade */}
            <div className="grid gap-3">
              <label htmlFor="complexidade" className="text-sm font-medium">
                Complexidade
              </label>
              <Select value={complexidade || ''} onValueChange={(value: TaskComplexity) => setComplexidade(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a complexidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">●</span>
                      Simples
                    </div>
                  </SelectItem>
                  <SelectItem value="media">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600">●</span>
                      Média
                    </div>
                  </SelectItem>
                  <SelectItem value="complexa">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">●</span>
                      Complexa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

             {/* Campos Adicionais */}
             <div className="grid gap-4 p-4 bg-muted/30 rounded-lg">
               <h4 className="text-sm font-medium text-muted-foreground">Métricas Adicionais</h4>
               
               {/* Foi Retrabalho */}
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="foiRetrabalho"
                   checked={foiRetrabalho}
                   onCheckedChange={(checked) => setFoiRetrabalho(checked as boolean)}
                 />
                 <label htmlFor="foiRetrabalho" className="text-sm font-medium">
                   Foi retrabalho
                 </label>
               </div>
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

      {/* Sheet aninhado para tarefas referenciadas */}
      {nestedSheetOpen && (
        <EditTaskSheet 
          task={nestedTask} 
          isOpen={nestedSheetOpen} 
          onClose={() => setNestedSheetOpen(false)} 
          stackLevel={stackLevel + 1} 
        />
      )}
    </Sheet>
  );
}
