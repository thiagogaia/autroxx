'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/types/task';
import { serializeTasks, deserializeTasks, STORAGE_KEYS } from '@/lib/storage';

export function DataManagement() {
  const { tasks, addTask } = useTaskContext();

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
            // Confirmar antes de importar
            const confirmImport = window.confirm(
              `Importar ${data.tasks.length} tarefas? Isso irá adicionar às tarefas existentes.`
            );
            
            if (confirmImport) {
              data.tasks.forEach((task: any) => {
                // Reconstruir a tarefa com novos IDs para evitar conflitos
                const taskData = {
                  ...task,
                  dataInicio: new Date(task.dataInicio),
                  dataFim: task.dataFim ? new Date(task.dataFim) : null
                };
                
                addTask(taskData.titulo, taskData.prioridade);
              });
              
              alert('Dados importados com sucesso!');
            }
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

  // Limpar todos os dados
  const clearAllData = () => {
    const confirmClear = window.confirm(
      'Tem certeza que deseja excluir TODAS as tarefas? Esta ação não pode ser desfeita!'
    );
    
    if (confirmClear) {
      const doubleConfirm = window.confirm(
        'ATENÇÃO: Isso excluirá permanentemente todas as suas tarefas. Confirma?'
      );
      
      if (doubleConfirm) {
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.FILTER);
        window.location.reload(); // Recarrega a página para limpar o estado
      }
    }
  };

  // Adicionar tarefas de exemplo
  const addSampleData = () => {
    const confirmSample = window.confirm(
      'Adicionar tarefas de exemplo? Isso criará algumas tarefas para demonstração.'
    );
    
    if (confirmSample) {
      const sampleTasks = [
        { titulo: 'Desenvolver API de usuários', prioridade: 'alta' as const },
        { titulo: 'Criar telas de login', prioridade: 'normal' as const },
        { titulo: 'Configurar banco de dados', prioridade: 'media' as const },
        { titulo: 'Implementar sistema de notificações', prioridade: 'normal' as const },
        { titulo: 'Fazer deploy da aplicação', prioridade: 'alta' as const }
      ];
      
      sampleTasks.forEach(task => {
        addTask(task.titulo, task.prioridade);
      });
      
      alert('Tarefas de exemplo adicionadas!');
    }
  };

  return (
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
          
          <Button
            onClick={addSampleData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Exemplos
          </Button>
          
          <Button
            onClick={clearAllData}
            variant="destructive"
            className="flex items-center gap-2"
            disabled={tasks.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Limpar
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p><strong>Exportar:</strong> Baixa um arquivo JSON com todas as tarefas</p>
          <p><strong>Importar:</strong> Carrega tarefas de um arquivo JSON</p>
          <p><strong>Exemplos:</strong> Adiciona tarefas de demonstração</p>
          <p><strong>Limpar:</strong> Remove todos os dados do localStorage</p>
        </div>
      </CardContent>
    </Card>
  );
}