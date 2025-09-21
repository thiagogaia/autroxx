// TaskRepositoryDemo.tsx — Componente de demonstração do novo padrão

'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/domain';
import { useTaskRepository, useTaskQueries, useAdvancedTaskFilters } from '@/hooks/useTaskRepository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function TaskRepositoryDemo() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  const { searchTasks, updateTask, deleteTask } = useTaskRepository();
  const { getTasksByStatus, searchTasksByTitle, getUrgentIncompleteTasks } = useTaskQueries();
  const { applyAdvancedFilters } = useAdvancedTaskFilters();

  // Carregar tarefas iniciais
  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    setLoading(true);
    try {
      const result = await searchTasks({
        page: { page: 1, size: 50, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
      });
      setTasks(result.items);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAllTasks();
      return;
    }

    setLoading(true);
    try {
      const result = await searchTasksByTitle(searchTerm);
      setTasks(result.items);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status: string) => {
    setSelectedStatus(status);
    setLoading(true);
    
    try {
      if (status === 'urgentes') {
        const result = await getUrgentIncompleteTasks();
        setTasks(result.items);
      } else if (status === '') {
        loadAllTasks();
      } else {
        const result = await getTasksByStatus(status);
        setTasks(result.items);
      }
    } catch (error) {
      console.error('Erro ao filtrar por status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityFilter = async (priority: string) => {
    setSelectedPriority(priority);
    setLoading(true);
    
    try {
      const result = await searchTasks({
        spec: {
          where: [{ field: 'prioridade', op: 'eq', value: priority }]
        },
        page: { page: 1, size: 50, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
      });
      setTasks(result.items);
    } catch (error) {
      console.error('Erro ao filtrar por prioridade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedFilter = async () => {
    setLoading(true);
    
    try {
      const result = await applyAdvancedFilters({
        status: selectedStatus ? [selectedStatus] : undefined,
        priority: selectedPriority ? [selectedPriority] : undefined,
        title: searchTerm || undefined,
        sortBy: 'dataCadastro',
        sortOrder: 'desc'
      });
      setTasks(result.items);
    } catch (error) {
      console.error('Erro ao aplicar filtros avançados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await updateTask(taskId, { statusAtual: newStatus as 'a_fazer' | 'fazendo' | 'concluido' });
      loadAllTasks(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        await deleteTask(taskId);
        loadAllTasks(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'a_fazer': return 'bg-gray-100 text-gray-800';
      case 'fazendo': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demonstração do Padrão Specification/Query Object</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles de busca e filtro */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === '' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('')}
            >
              Todas
            </Button>
            <Button
              variant={selectedStatus === 'a_fazer' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('a_fazer')}
            >
              A Fazer
            </Button>
            <Button
              variant={selectedStatus === 'fazendo' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('fazendo')}
            >
              Fazendo
            </Button>
            <Button
              variant={selectedStatus === 'concluido' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('concluido')}
            >
              Concluído
            </Button>
            <Button
              variant={selectedStatus === 'urgentes' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('urgentes')}
            >
              Urgentes
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPriority === '' ? 'default' : 'outline'}
              onClick={() => handlePriorityFilter('')}
            >
              Todas Prioridades
            </Button>
            <Button
              variant={selectedPriority === 'baixa' ? 'default' : 'outline'}
              onClick={() => handlePriorityFilter('baixa')}
            >
              Baixa
            </Button>
            <Button
              variant={selectedPriority === 'normal' ? 'default' : 'outline'}
              onClick={() => handlePriorityFilter('normal')}
            >
              Normal
            </Button>
            <Button
              variant={selectedPriority === 'media' ? 'default' : 'outline'}
              onClick={() => handlePriorityFilter('media')}
            >
              Média
            </Button>
            <Button
              variant={selectedPriority === 'alta' ? 'default' : 'outline'}
              onClick={() => handlePriorityFilter('alta')}
            >
              Alta
            </Button>
          </div>

          <Button onClick={handleAdvancedFilter} disabled={loading}>
            Aplicar Filtros Avançados
          </Button>
        </CardContent>
      </Card>

      {/* Lista de tarefas */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma tarefa encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.titulo}</h3>
                      {task.descricao && (
                        <p className="text-sm text-gray-600 mt-1">{task.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(task.statusAtual)}>
                        {task.statusAtual}
                      </Badge>
                      <Badge className={getPriorityColor(task.prioridade)}>
                        {task.prioridade}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Criado em: {new Date(task.dataCadastro).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {task.statusAtual !== 'concluido' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateTaskStatus(task.id, 'concluido')}
                        >
                          Concluir
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre o padrão */}
      <Card>
        <CardHeader>
          <CardTitle>Como funciona o Specification/Query Object</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Vantagens:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Abstração completa de filtros, ordenação e paginação</li>
              <li>Troca de backend sem alterar código de domínio</li>
              <li>Filtros compostos com AND, OR e NOT</li>
              <li>Type-safe com TypeScript</li>
              <li>Fácil migração de sistemas legados</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Exemplo de Query:</h4>
            <pre className="p-3 rounded text-xs overflow-x-auto">
{`const query = {
  spec: {
    and: [
      { where: [{ field: 'prioridade', op: 'eq', value: 'alta' }] },
      { where: [{ field: 'statusAtual', op: 'neq', value: 'concluido' }] }
    ]
  },
  page: { 
    page: 1, 
    size: 10, 
    sort: [{ field: 'dataCadastro', dir: 'desc' }] 
  }
};`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
