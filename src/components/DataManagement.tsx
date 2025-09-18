'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import { serializeTasks, deserializeTasks, STORAGE_KEYS } from '@/lib/storage';
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
  const { tasks, addTask } = useTaskContext();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [doubleConfirmDialogOpen, setDoubleConfirmDialogOpen] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [tasksToImport, setTasksToImport] = useState<any[]>([]);

  // Exportar dados para JSON
  const exportData = () => {
    const dataToExport = {
      tasks: tasks,
      exportDate: new Date().toISOString(),
      version: '1.0'
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
          
          if (data.tasks && Array.isArray(data.tasks)) {
            setTasksToImport(data.tasks);
            setImportDialogOpen(true);
          } else {
            alert('Formato de arquivo inválido!');
          }
        } catch (error) {
          console.error('Erro ao importar:', error);
          alert('Erro ao processar o arquivo!');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleImportConfirm = () => {
    tasksToImport.forEach((task: any) => {
      // Reconstruir a tarefa com novos IDs para evitar conflitos
      const taskData = {
        ...task,
        dataInicio: new Date(task.dataInicio),
        dataFim: task.dataFim ? new Date(task.dataFim) : null
      };
      
      addTask(taskData.titulo, taskData.prioridade);
    });
    
    setImportDialogOpen(false);
    setTasksToImport([]);
    alert('Dados importados com sucesso!');
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
    const sampleTasks = [
      { titulo: 'Desenvolver API de usuários', prioridade: 'alta' as const },
      { titulo: 'Criar telas de login', prioridade: 'normal' as const },
      { titulo: 'Configurar banco de dados', prioridade: 'media' as const },
      { titulo: 'Implementar sistema de notificações', prioridade: 'normal' as const },
      { titulo: 'Fazer deploy da aplicação', prioridade: 'alta' as const }
    ];
    
    sampleTasks.forEach((task, index) => {
      addTask(task.titulo, task.prioridade);
    });
    
    setSampleDialogOpen(false);
    alert('Tarefas de exemplo adicionadas!');
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