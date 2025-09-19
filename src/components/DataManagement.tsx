'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import { deserializeTasks, STORAGE_KEYS } from '@/lib/storage';
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

export function DataManagement() {
  const { tasks, addTaskFull } = useTaskContext();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [doubleConfirmDialogOpen, setDoubleConfirmDialogOpen] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [tasksToImport, setTasksToImport] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Validar estrutura de dados importados
  const validateImportedData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.tasks || !Array.isArray(data.tasks)) {
      errors.push('Arquivo deve conter um array de tarefas');
      return { isValid: false, errors };
    }
    
    data.tasks.forEach((task: any, index: number) => {
      if (!task.titulo || typeof task.titulo !== 'string') {
        errors.push(`Tarefa ${index + 1}: título é obrigatório`);
      }
      
      if (!task.prioridade || !['baixa', 'normal', 'media', 'alta'].includes(task.prioridade)) {
        errors.push(`Tarefa ${index + 1}: prioridade inválida`);
      }
      
      if (!task.statusAtual || !['a_fazer', 'fazendo', 'concluido'].includes(task.statusAtual)) {
        errors.push(`Tarefa ${index + 1}: status atual inválido`);
      }
      
      if (task.dataCadastro && isNaN(new Date(task.dataCadastro).getTime())) {
        errors.push(`Tarefa ${index + 1}: data de cadastro inválida`);
      }
      
      if (task.dataInicio && isNaN(new Date(task.dataInicio).getTime())) {
        errors.push(`Tarefa ${index + 1}: data de início inválida`);
      }
      
      if (task.dataFim && isNaN(new Date(task.dataFim).getTime())) {
        errors.push(`Tarefa ${index + 1}: data de fim inválida`);
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
          a_fazer: tasks.filter(t => t.statusAtual === 'a_fazer').length,
          fazendo: tasks.filter(t => t.statusAtual === 'fazendo').length,
          concluido: tasks.filter(t => t.statusAtual === 'concluido').length
        },
        tasksByPriority: {
          baixa: tasks.filter(t => t.prioridade === 'baixa').length,
          normal: tasks.filter(t => t.prioridade === 'normal').length,
          media: tasks.filter(t => t.prioridade === 'media').length,
          alta: tasks.filter(t => t.prioridade === 'alta').length
        },
        impediments: tasks.filter(t => t.impedimento).length
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
          
          if (data.tasks && Array.isArray(data.tasks)) {
            setTasksToImport(data.tasks);
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
        const newTask: Task = {
          ...task,
          id: Date.now() + Math.random(), // ID único
          dataCadastro: task.dataCadastro || new Date(),
          dataInicio: task.dataInicio || null,
          dataFim: task.dataFim || null,
          dataImpedimento: task.dataImpedimento || null,
          descricao: task.descricao || '',
          impedimento: task.impedimento || false,
          impedimentoMotivo: task.impedimentoMotivo || '',
          statusHistorico: task.statusHistorico || ['a_fazer'],
          statusAtual: task.statusAtual || 'a_fazer',
          ordem: task.ordem || 0
        };
        
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
        id: Date.now() + 1,
        titulo: 'Desenvolver API de usuários',
        descricao: 'Criar endpoints para CRUD de usuários com autenticação JWT',
        prioridade: 'alta',
        statusAtual: 'a_fazer',
        statusHistorico: ['a_fazer'],
        impedimento: false,
        impedimentoMotivo: '',
        dataCadastro: new Date(),
        dataInicio: null,
        dataFim: null,
        dataImpedimento: null,
        ordem: 0,
        tags: ['backend', 'api', 'autenticação', 'jwt']
      },
      {
        id: Date.now() + 2,
        titulo: 'Criar telas de login',
        descricao: 'Implementar interface de login e registro de usuários',
        prioridade: 'normal',
        statusAtual: 'fazendo',
        statusHistorico: ['a_fazer', 'fazendo'],
        impedimento: false,
        impedimentoMotivo: '',
        dataCadastro: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        dataInicio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        dataFim: null,
        dataImpedimento: null,
        ordem: 1,
        tags: ['frontend', 'ui', 'autenticação']
      },
      {
        id: Date.now() + 3,
        titulo: 'Configurar banco de dados',
        descricao: 'Setup do PostgreSQL com migrations e seeds',
        prioridade: 'media',
        statusAtual: 'concluido',
        statusHistorico: ['a_fazer', 'fazendo', 'concluido'],
        impedimento: false,
        impedimentoMotivo: '',
        dataCadastro: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        dataInicio: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
        dataFim: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        dataImpedimento: null,
        ordem: 2,
        tags: ['database', 'postgresql', 'infraestrutura']
      },
      {
        id: Date.now() + 4,
        titulo: 'Implementar sistema de notificações',
        descricao: 'Criar sistema de push notifications e email',
        prioridade: 'normal',
        statusAtual: 'a_fazer',
        statusHistorico: ['a_fazer'],
        impedimento: true,
        impedimentoMotivo: 'Aguardando aprovação do cliente para o design',
        dataCadastro: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        dataInicio: null,
        dataFim: null,
        dataImpedimento: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
        ordem: 3,
        tags: ['notificações', 'email', 'push', 'design']
      },
      {
        id: Date.now() + 5,
        titulo: 'Fazer deploy da aplicação',
        descricao: 'Deploy em produção com CI/CD pipeline',
        prioridade: 'alta',
        statusAtual: 'a_fazer',
        statusHistorico: ['a_fazer'],
        impedimento: false,
        impedimentoMotivo: '',
        dataCadastro: new Date(),
        dataInicio: null,
        dataFim: null,
        dataImpedimento: null,
        ordem: 4,
        tags: ['deploy', 'produção', 'ci-cd', 'devops']
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
                    className="bg-red-600 hover:bg-red-700"
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
              className="bg-red-600 hover:bg-red-700"
            >
              SIM, EXCLUIR TUDO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}