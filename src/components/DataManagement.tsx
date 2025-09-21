'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { migrateTaskData, generateUniqueTaskId } from '@/lib/utils';
import { deserializeTasks, STORAGE_KEYS } from '@/lib/storage';
import { useTaskContext } from '@/contexts/TaskContextV2';
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

interface ImportedData {
  tasks: unknown[];
}

export function DataManagement() {
  const { tasks, addTaskFull } = useTaskContext();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [doubleConfirmDialogOpen, setDoubleConfirmDialogOpen] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [tasksToImport, setTasksToImport] = useState<Task[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Validar estrutura de dados importados
  const validateImportedData = (data: unknown): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Verificar se é um objeto com propriedade tasks
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
      
      if (taskObj.dataCadastro && isNaN(new Date(taskObj.dataCadastro as string).getTime())) {
        errors.push(`Tarefa ${index + 1}: data de cadastro inválida`);
      }
      
      if (taskObj.dataInicio && isNaN(new Date(taskObj.dataInicio as string).getTime())) {
        errors.push(`Tarefa ${index + 1}: data de início inválida`);
      }
      
      if (taskObj.dataFim && isNaN(new Date(taskObj.dataFim as string).getTime())) {
        errors.push(`Tarefa ${index + 1}: data de fim inválida`);
      }
      
      // Validar categoria se presente
      if (taskObj.categoria && !['feature', 'desenvolvimento', 'qa', 'devops', 'bug', 'atendimento', 'comercial', 'juridico', 'design', 'documentacao', 'reuniao', 'sem_categoria', 'outro'].includes(taskObj.categoria as string)) {
        errors.push(`Tarefa ${index + 1}: categoria inválida`);
      }
      
      // Validar complexidade se presente
      if (taskObj.complexidade && !['simples', 'media', 'complexa'].includes(taskObj.complexidade as string)) {
        errors.push(`Tarefa ${index + 1}: complexidade inválida`);
      }
      
      // Validar referenced_task_id se presente (deve ser string ou null)
      if (taskObj.referenced_task_id !== undefined && taskObj.referenced_task_id !== null && typeof taskObj.referenced_task_id !== 'string') {
        errors.push(`Tarefa ${index + 1}: referenced_task_id deve ser string ou null`);
      }
      
      // Validar parent_id se presente (deve ser string ou null)
      if (taskObj.parent_id !== undefined && taskObj.parent_id !== null && typeof taskObj.parent_id !== 'string') {
        errors.push(`Tarefa ${index + 1}: parent_id deve ser string ou null`);
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
          
          // Validar dados
          const validation = validateImportedData(data);
          
          if (!validation.isValid) {
            setImportErrors(validation.errors);
            setErrorMessage(`Erro na validação:\n${validation.errors.join('\n')}`);
            return;
          }
          
          if (data && typeof data === 'object' && 'tasks' in data && Array.isArray((data as ImportedData).tasks)) {
            setTasksToImport((data as ImportedData).tasks as Task[]);
            setImportErrors([]);
            setImportDialogOpen(true);
          } else {
            setErrorMessage('Formato de arquivo inválido!');
          }
        } catch (error) {
          console.error('Erro ao importar:', error);
          setErrorMessage('Erro ao processar o arquivo!');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleImportConfirm = () => {
    try {
      // Usar a função de deserialização do storage para garantir consistência
      const serializedTasks = JSON.stringify(tasksToImport);
      const deserializedTasks = deserializeTasks(serializedTasks);
      
      // Adicionar cada tarefa com dados completos
      deserializedTasks.forEach((task: Task) => {
        // Gerar novo ID para evitar conflitos
        const newTask: Task = migrateTaskData({
          ...task,
          id: generateUniqueTaskId(), // ID único garantido
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
          // Novos campos com valores padrão
          is_active: task.is_active !== undefined ? task.is_active : true,
          rsync: task.rsync !== undefined ? task.rsync : false,
          id_rsync: task.id_rsync || null,
          referenced_task_id: task.referenced_task_id || null,
          parent_id: task.parent_id || null
        });
        
        // Usar a nova função addTaskFull
        addTaskFull(newTask);
      });
      
      setImportDialogOpen(false);
      setTasksToImport([]);
      setSuccessMessage('Dados importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      setErrorMessage('Erro ao importar dados. Verifique o formato do arquivo.');
    }
  };

  // Limpar todos os dados
  const clearAllData = () => {
    setClearDialogOpen(true);
  };

  const handleClearConfirm = () => {
    setClearDialogOpen(false);
    setDoubleConfirmDialogOpen(true);
  };

  const handleDoubleConfirm = () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.FILTER);
    setDoubleConfirmDialogOpen(false);
    window.location.reload(); // Recarrega a página para limpar o estado
  };

  // Adicionar tarefas de exemplo
  const addSampleData = () => {
    setSampleDialogOpen(true);
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
        rsync: false,
        id_rsync: null,
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
        dataCadastro: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        dataInicio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        dataFim: null,
        dataImpedimento: null,
        ordem: 1,
        tags: ['frontend', 'ui', 'autenticação'],
        categoria: 'design',
        complexidade: 'simples',
        is_active: true,
        rsync: false,
        id_rsync: null,
        referenced_task_id: null,
        parent_id: null
      },
      {
        id: generateUniqueTaskId(),
        titulo: 'Configurar banco de dados',
        descricao: 'Setup do PostgreSQL com migrations e seeds',
        prioridade: 'media',
        statusAtual: 'concluido',
        statusHistorico: [
          { status: 'a_fazer', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'fazendo', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'concluido', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ],
        impedimento: false,
        impedimentoMotivo: '',
        impedimentoHistorico: [],
        dataCadastro: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        dataInicio: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
        dataFim: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        dataImpedimento: null,
        ordem: 2,
        tags: ['database', 'postgresql', 'infraestrutura'],
        categoria: 'devops',
        complexidade: 'media',
        is_active: true,
        rsync: false,
        id_rsync: null,
        referenced_task_id: null,
        parent_id: null
      },
      {
        id: generateUniqueTaskId(),
        titulo: 'Implementar sistema de notificações',
        descricao: 'Criar sistema de push notifications e email',
        prioridade: 'normal',
        statusAtual: 'a_fazer',
        statusHistorico: [{ status: 'a_fazer', timestamp: new Date() }],
        impedimento: true,
        impedimentoMotivo: 'Aguardando aprovação do cliente para o design',
        impedimentoHistorico: [],
        dataCadastro: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        dataInicio: null,
        dataFim: null,
        dataImpedimento: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
        ordem: 3,
        tags: ['notificações', 'email', 'push', 'design'],
        categoria: 'feature',
        complexidade: 'complexa',
        is_active: true,
        rsync: false,
        id_rsync: null,
        referenced_task_id: null,
        parent_id: null
      },
      {
        id: generateUniqueTaskId(),
        titulo: 'Fazer deploy da aplicação',
        descricao: 'Deploy em produção com CI/CD pipeline',
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
        ordem: 4,
        tags: ['deploy', 'produção', 'ci-cd', 'devops'],
        categoria: 'devops',
        complexidade: 'media',
        is_active: true,
        rsync: false,
        id_rsync: null,
        referenced_task_id: null,
        parent_id: null
      }
    ];
    
    sampleTasks.forEach((task) => {
      addTaskFull(task);
    });
    
    setSampleDialogOpen(false);
    setSuccessMessage('Tarefas de exemplo adicionadas com sucesso!');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={exportData}
              variant="outline"
              className="flex items-center gap-2"
              disabled={tasks.length === 0}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <Button
              onClick={importData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            
            <AlertDialog open={sampleDialogOpen} onOpenChange={setSampleDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Exemplos
                </Button>
              </AlertDialogTrigger>
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
            
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={tasks.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Todas as Tarefas</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir TODAS as tarefas? Esta ação não pode ser desfeita!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearConfirm}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Exportar:</strong> Baixa um arquivo JSON com todas as tarefas</p>
            <p><strong>Importar:</strong> Carrega tarefas de um arquivo JSON</p>
            <p><strong>Exemplos:</strong> Adiciona tarefas de demonstração</p>
            <p><strong>Limpar:</strong> Remove todos os dados do localStorage</p>
          </div>
          
          {/* Feedback Messages */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-800 dark:text-green-200 text-sm">{successMessage}</p>
              <button 
                onClick={() => setSuccessMessage('')}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-xs mt-1"
              >
                ✕ Fechar
              </button>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm whitespace-pre-line">{errorMessage}</p>
              <button 
                onClick={() => setErrorMessage('')}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xs mt-1"
              >
                ✕ Fechar
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Importação */}
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

      {/* Dialog de Confirmação Dupla para Limpeza */}
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
            <AlertDialogAction 
              onClick={handleDoubleConfirm}
            >
              SIM, EXCLUIR TUDO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}