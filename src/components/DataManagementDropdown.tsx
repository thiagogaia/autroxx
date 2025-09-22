'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Database, Download, Upload, RefreshCw, Trash2, Hammer } from 'lucide-react';
import { migrateTaskData, generateUniqueTaskId } from '@/lib/utils';
import { deserializeTasks } from '@/lib/storage';
import { useTaskContext } from '@/contexts/TaskContextV2';
import { useGamificationRepository } from '@/hooks/useGamificationRepository';
import { useTaskGamificationIntegration } from '@/contexts/TaskGamificationIntegration';
import { Task } from '@/types/task';
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
import { toast } from 'sonner';
import { indexedDBRepository } from '@/lib/indexeddb-repo';

interface ImportedData {
  tasks: unknown[];
}

export function DataManagementDropdown() {
  const { tasks, addTaskFull, clearAllData } = useTaskContext();
  const gamificationRepo = useGamificationRepository();
  const { processTaskCompletion, refreshGamificationStats } = useTaskGamificationIntegration();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [doubleConfirmDialogOpen, setDoubleConfirmDialogOpen] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [forgeXPDialogOpen, setForgeXPDialogOpen] = useState(false);
  const [tasksToImport, setTasksToImport] = useState<Task[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isForgingXP, setIsForgingXP] = useState(false);

  // Validar estrutura de dados importados
  const validateImportedData = (data: unknown): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object' || !('tasks' in data)) {
      errors.push('Arquivo deve conter um objeto com propriedade "tasks"');
      return { isValid: false, errors };
    }
    
    const importedData = data as ImportedData;
    
    if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
      errors.push('Arquivo deve conter um array de tarefas');
      return { isValid: false, errors };
    }
    
    importedData.tasks.forEach((task: unknown, index: number) => {
      if (!task || typeof task !== 'object') {
        errors.push(`Tarefa ${index + 1}: deve ser um objeto`);
        return;
      }
      
      const taskObj = task as Record<string, unknown>;
      
      if (!taskObj.titulo || typeof taskObj.titulo !== 'string') {
        errors.push(`Tarefa ${index + 1}: título é obrigatório`);
      }
      
      if (!taskObj.prioridade || !['baixa', 'normal', 'media', 'alta'].includes(taskObj.prioridade as string)) {
        errors.push(`Tarefa ${index + 1}: prioridade inválida`);
      }
      
      if (!taskObj.statusAtual || !['a_fazer', 'fazendo', 'concluido'].includes(taskObj.statusAtual as string)) {
        errors.push(`Tarefa ${index + 1}: status atual inválido`);
      }
    });
    
    return { isValid: errors.length === 0, errors };
  };

  // Exportar dados para JSON
  const exportData = () => {
    const dataToExport = {
      tasks: tasks,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalTasks: tasks.length,
        tasksByStatus: {
          a_fazer: tasks.filter((t: Task) => t.statusAtual === 'a_fazer').length,
          fazendo: tasks.filter((t: Task) => t.statusAtual === 'fazendo').length,
          concluido: tasks.filter((t: Task) => t.statusAtual === 'concluido').length
        },
        tasksByPriority: {
          baixa: tasks.filter((t: Task) => t.prioridade === 'baixa').length,
          normal: tasks.filter((t: Task) => t.prioridade === 'normal').length,
          media: tasks.filter((t: Task) => t.prioridade === 'media').length,
          alta: tasks.filter((t: Task) => t.prioridade === 'alta').length
        },
        impediments: tasks.filter((t: Task) => t.impedimento).length
      }
    };
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Importar dados de JSON
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          const validation = validateImportedData(data);
          
          if (!validation.isValid) {
            setImportErrors(validation.errors);
            toast.error(`Erro na validação:\n${validation.errors.join('\n')}`);
            return;
          }
          
          if (data && typeof data === 'object' && 'tasks' in data && Array.isArray((data as ImportedData).tasks)) {
            setTasksToImport((data as ImportedData).tasks as Task[]);
            setImportErrors([]);
            setImportDialogOpen(true);
          } else {
            toast.error('Formato de arquivo inválido!');
          }
        } catch (error) {
          console.error('Erro ao importar:', error);
          toast.error('Erro ao processar o arquivo!');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleImportConfirm = () => {
    try {
      const serializedTasks = JSON.stringify(tasksToImport);
      const deserializedTasks = deserializeTasks(serializedTasks);
      
      deserializedTasks.forEach((task: Task) => {
        const newTask: Task = migrateTaskData({
          ...task,
          id: generateUniqueTaskId(),
          dataCadastro: task.dataCadastro || new Date(),
          dataInicio: task.dataInicio || null,
          dataFim: task.dataFim || null,
          dataImpedimento: task.dataImpedimento || null,
          descricao: task.descricao || '',
          impedimento: task.impedimento || false,
          impedimentoMotivo: task.impedimentoMotivo || '',
          statusHistorico: task.statusHistorico || ['a_fazer'],
          statusAtual: task.statusAtual || 'a_fazer',
          ordem: task.ordem || 0,
          is_active: task.is_active !== undefined ? task.is_active : true,
          referenced_task_id: task.referenced_task_id || null,
          parent_id: task.parent_id || null
        });
        
        addTaskFull(newTask);
      });
      
      setImportDialogOpen(false);
      setTasksToImport([]);
      toast.success('Dados importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados. Verifique o formato do arquivo.');
    }
  };

  const handleClearConfirm = () => {
    setClearDialogOpen(false);
    setDoubleConfirmDialogOpen(true);
  };

  const handleDoubleConfirm = async () => {
    try {
      await clearAllData();
      setDoubleConfirmDialogOpen(false);
      toast.success('Todos os dados foram excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast.error('Erro ao excluir dados. Tente novamente.');
    }
  };

  const addSampleData = () => {
    setSampleDialogOpen(true);
  };

  const forgeXP = async () => {
    try {
      setIsForgingXP(true);
      setForgeXPDialogOpen(false);
      console.log('🔥 Iniciando processo de Forjar XP...');

      // 1. Limpar todos os dados de gamificação existentes
      console.log('📊 Limpando dados de gamificação existentes...');
      await gamificationRepo.clearAllData();
      console.log('✅ Dados de gamificação limpos com sucesso');

      // 2. Buscar todas as tarefas concluídas (equivalente a SELECT * FROM tasks WHERE status = 'concluido')
      console.log('🔍 Buscando tarefas concluídas...');
      // const completedTasks = await indexedDBRepository.search({ statusFilter: 'concluido' }, { page: 1, limit: 10000, offset: 0 });
      const completedTasks = tasks.filter(task => task.statusAtual === 'concluido');

      // console.log(`📋 Encontradas ${completedTasks.data.length} tarefas concluídas`);

      for (const task of completedTasks) {
        processTaskCompletion(task, tasks);
      }

      refreshGamificationStats(tasks);
      toast.success('XP forjado com sucesso!');
    } catch (error) {
      console.error('Erro ao forjar XP:', error);
      toast.error('Erro ao forjar XP. Verifique o console para mais detalhes.');
    } finally {
      setIsForgingXP(false);
    }
  };

  const handleSampleConfirm = () => {
    const sampleTasks: Task[] = [
      {
        id: generateUniqueTaskId(),
        titulo: 'Desenvolver API de usuários',
        descricao: 'Criar endpoints para CRUD de usuários com autenticação JWT',
        prioridade: 'alta',
        statusAtual: 'a_fazer',
        statusHistorico: [{ status: 'a_fazer', timestamp: new Date() }],
        impedimento: false,
        impedimentoMotivo: '',
        impedimentoHistorico: [],
        dataCadastro: new Date(),
        dataInicio: null,
        dataFim: null,
        dataImpedimento: null,
        ordem: 0,
        tags: ['backend', 'api', 'autenticação', 'jwt'],
        categoria: 'desenvolvimento',
        complexidade: 'media',
        is_active: true,
        referenced_task_id: null,
        parent_id: null
      },
      {
        id: generateUniqueTaskId(),
        titulo: 'Criar telas de login',
        descricao: 'Implementar interface de login e registro de usuários',
        prioridade: 'normal',
        statusAtual: 'fazendo',
        statusHistorico: [
          { status: 'a_fazer', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'fazendo', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        impedimento: false,
        impedimentoMotivo: '',
        impedimentoHistorico: [],
        dataCadastro: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dataInicio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        dataFim: null,
        dataImpedimento: null,
        ordem: 1,
        tags: ['frontend', 'ui', 'autenticação'],
        categoria: 'design',
        complexidade: 'simples',
        is_active: true,
        referenced_task_id: null,
        parent_id: null
      }
    ];
    
    sampleTasks.forEach((task) => {
      addTaskFull(task);
    });
    
    setSampleDialogOpen(false);
    toast.success('Tarefas de exemplo adicionadas com sucesso!');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Database className="h-4 w-4" />
            <span className="sr-only">Gerenciamento de dados</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Gerenciamento de Dados</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={exportData} disabled={tasks.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={importData}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Importar</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={addSampleData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Exemplos</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setForgeXPDialogOpen(true)} disabled={tasks.length === 0 || isForgingXP}>
            <Hammer className="mr-2 h-4 w-4" />
            <span>{isForgingXP ? 'Forjando...' : 'Forjar XP'}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setClearDialogOpen(true)} 
            disabled={tasks.length === 0}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Limpar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar Tarefas</AlertDialogTitle>
            <AlertDialogDescription>
              Importar {tasksToImport.length} tarefas? Isso irá adicionar às tarefas existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm}>
              Importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={sampleDialogOpen} onOpenChange={setSampleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Tarefas de Exemplo</AlertDialogTitle>
            <AlertDialogDescription>
              Isso criará algumas tarefas para demonstração. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSampleConfirm}>
              Adicionar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={forgeXPDialogOpen} onOpenChange={setForgeXPDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forjar XP</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá recalcular todas as pontuações de gamificação baseadas nas suas tarefas existentes. 
              Todos os dados de gamificação atuais serão apagados e recalculados do zero. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={forgeXP} disabled={isForgingXP}>
              {isForgingXP ? 'Forjando...' : 'Forjar XP'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Todas as Tarefas</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir TODAS as tarefas? Esta ação não pode ser desfeita!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={doubleConfirmDialogOpen} onOpenChange={setDoubleConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ATENÇÃO: Confirmação Final</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente todas as suas tarefas. Confirma?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDoubleConfirm}>
              SIM, EXCLUIR TUDO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
