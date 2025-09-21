// useTaskRepository.ts — Hook personalizado para usar o Repository Pattern

import { useCallback, useState, useEffect } from 'react';
import { Task, Query, Page, ID } from '@/types/domain';
import { ITaskRepository } from '@/lib/repository';
import { RepositoryFactory } from '@/lib/repository';

/**
 * Hook personalizado para usar o Repository Pattern
 * Abstrai a complexidade do Specification/Query Object
 */
export function useTaskRepository() {
  const [repository, setRepository] = useState<ITaskRepository | null>(null);
  
  useEffect(() => {
    const initRepository = async () => {
      try {
        const repo = await RepositoryFactory.getTaskRepository();
        setRepository(repo);
      } catch (error) {
        console.error('Erro ao inicializar repository:', error);
        // Fallback para LocalStorage usando import dinâmico
        try {
          const { LocalStorageTaskRepository } = await import('@/lib/localstorage-repo');
          const fallbackRepo = new LocalStorageTaskRepository();
          setRepository(fallbackRepo);
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      }
    };
    
    initRepository();
  }, []);

  // Métodos básicos CRUD
  const getTask = useCallback(async (id: ID): Promise<Task | null> => {
    if (!repository) return null;
    try {
      return await repository.get(id);
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      return null;
    }
  }, [repository]);

  const saveTask = useCallback(async (task: Task): Promise<Task | null> => {
    if (!repository) return null;
    try {
      return await repository.save(task);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      return null;
    }
  }, [repository]);

  const updateTask = useCallback(async (id: ID, updates: Partial<Task>): Promise<Task | null> => {
    if (!repository) return null;
    try {
      return await repository.update(id, updates);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return null;
    }
  }, [repository]);

  const deleteTask = useCallback(async (id: ID): Promise<boolean> => {
    if (!repository) return false;
    try {
      await repository.delete(id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return false;
    }
  }, [repository]);

  // Métodos de busca
  const searchTasks = useCallback(async (query?: Query<Task>): Promise<Page<Task>> => {
    if (!repository) return { items: [], total: 0, page: 1, size: 10 };
    try {
      return await repository.search(query);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return { items: [], total: 0, page: 1, size: 10 };
    }
  }, [repository]);

  const countTasks = useCallback(async (query?: Query<Task>): Promise<number> => {
    if (!repository) return 0;
    try {
      return await repository.count(query);
    } catch (error) {
      console.error('Erro ao contar tarefas:', error);
      return 0;
    }
  }, [repository]);

  // Métodos específicos para Task
  const findByStatus = useCallback(async (status: string): Promise<Task[]> => {
    if (!repository) return [];
    try {
      return await repository.findByStatus(status);
    } catch (error) {
      console.error('Erro ao buscar tarefas por status:', error);
      return [];
    }
  }, [repository]);

  const findByPriority = useCallback(async (priority: string): Promise<Task[]> => {
    if (!repository) return [];
    try {
      return await repository.findByPriority(priority);
    } catch (error) {
      console.error('Erro ao buscar tarefas por prioridade:', error);
      return [];
    }
  }, [repository]);

  const findWithImpediments = useCallback(async (): Promise<Task[]> => {
    if (!repository) return [];
    try {
      return await repository.findWithImpediments();
    } catch (error) {
      console.error('Erro ao buscar tarefas com impedimentos:', error);
      return [];
    }
  }, [repository]);

  return {
    repository,
    getTask,
    saveTask,
    updateTask,
    deleteTask,
    searchTasks,
    countTasks,
    findByStatus,
    findByPriority,
    findWithImpediments
  };
}

/**
 * Hook para queries específicas de tarefas
 */
export function useTaskQueries() {
  const { searchTasks, countTasks } = useTaskRepository();

  // Buscar tarefas por status
  const getTasksByStatus = useCallback(async (status: string, page = 1, size = 10) => {
    return await searchTasks({
      spec: {
        where: [{ field: 'statusAtual', op: 'eq', value: status }]
      },
      page: { page, size, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
    });
  }, [searchTasks]);

  // Buscar tarefas por prioridade
  const getTasksByPriority = useCallback(async (priority: string, page = 1, size = 10) => {
    return await searchTasks({
      spec: {
        where: [{ field: 'prioridade', op: 'eq', value: priority }]
      },
      page: { page, size, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
    });
  }, [searchTasks]);

  // Buscar tarefas por título
  const searchTasksByTitle = useCallback(async (title: string, page = 1, size = 10) => {
    return await searchTasks({
      spec: {
        where: [{ field: 'titulo', op: 'contains', value: title }]
      },
      page: { page, size, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
    });
  }, [searchTasks]);

  // Buscar tarefas com impedimentos
  const getTasksWithImpediments = useCallback(async (page = 1, size = 10) => {
    return await searchTasks({
      spec: {
        where: [{ field: 'impedimento', op: 'eq', value: true }]
      },
      page: { page, size, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
    });
  }, [searchTasks]);

  // Buscar tarefas por data
  const getTasksByDateRange = useCallback(async (startDate: Date, endDate: Date, page = 1, size = 10) => {
    return await searchTasks({
      spec: {
        where: [{ field: 'dataCadastro', op: 'between', value: [startDate, endDate] }]
      },
      page: { page, size, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
    });
  }, [searchTasks]);

  // Buscar tarefas por tags
  const getTasksByTags = useCallback(async (tags: string[], page = 1, size = 10) => {
    return await searchTasks({
      spec: {
        where: [{ field: 'tags', op: 'in', value: tags }]
      },
      page: { page, size, sort: [{ field: 'dataCadastro', dir: 'desc' }] }
    });
  }, [searchTasks]);

  // Buscar tarefas urgentes não concluídas
  const getUrgentIncompleteTasks = useCallback(async (page = 1, size = 10) => {
    return await searchTasks({
      spec: {
        and: [
          { where: [{ field: 'prioridade', op: 'eq', value: 'alta' }] },
          { where: [{ field: 'statusAtual', op: 'neq', value: 'concluido' }] }
        ]
      },
      page: { page, size, sort: [{ field: 'dataCadastro', dir: 'asc' }] }
    });
  }, [searchTasks]);

  // Contar tarefas por status
  const countTasksByStatus = useCallback(async (status: string) => {
    return await countTasks({
      spec: {
        where: [{ field: 'statusAtual', op: 'eq', value: status }]
      }
    });
  }, [countTasks]);

  // Contar tarefas com impedimentos
  const countTasksWithImpediments = useCallback(async () => {
    return await countTasks({
      spec: {
        where: [{ field: 'impedimento', op: 'eq', value: true }]
      }
    });
  }, [countTasks]);

  return {
    getTasksByStatus,
    getTasksByPriority,
    searchTasksByTitle,
    getTasksWithImpediments,
    getTasksByDateRange,
    getTasksByTags,
    getUrgentIncompleteTasks,
    countTasksByStatus,
    countTasksWithImpediments
  };
}

/**
 * Hook para operações de filtro avançado
 */
export function useAdvancedTaskFilters() {
  const { searchTasks } = useTaskRepository();

  const applyAdvancedFilters = useCallback(async (filters: {
    status?: string[];
    priority?: string[];
    category?: string[];
    tags?: string[];
    impediment?: boolean;
    dateRange?: { start: Date; end: Date };
    title?: string;
    sortBy?: keyof Task;
    sortOrder?: 'asc' | 'desc';
  }, page = 1, size = 10) => {
    const spec: Record<string, unknown> = { where: [] as Record<string, unknown>[] };

    // Filtros de status
    if (filters.status && filters.status.length > 0) {
      (spec.where as Record<string, unknown>[]).push({ field: 'statusAtual', op: 'in', value: filters.status });
    }

    // Filtros de prioridade
    if (filters.priority && filters.priority.length > 0) {
      (spec.where as Record<string, unknown>[]).push({ field: 'prioridade', op: 'in', value: filters.priority });
    }

    // Filtros de categoria
    if (filters.category && filters.category.length > 0) {
      (spec.where as Record<string, unknown>[]).push({ field: 'categoria', op: 'in', value: filters.category });
    }

    // Filtros de tags
    if (filters.tags && filters.tags.length > 0) {
      (spec.where as Record<string, unknown>[]).push({ field: 'tags', op: 'in', value: filters.tags });
    }

    // Filtro de impedimento
    if (filters.impediment !== undefined) {
      (spec.where as Record<string, unknown>[]).push({ field: 'impedimento', op: 'eq', value: filters.impediment });
    }

    // Filtro de data
    if (filters.dateRange) {
      (spec.where as Record<string, unknown>[]).push({ 
        field: 'dataCadastro', 
        op: 'between', 
        value: [filters.dateRange.start, filters.dateRange.end] 
      });
    }

    // Filtro de título
    if (filters.title) {
      (spec.where as Record<string, unknown>[]).push({ field: 'titulo', op: 'contains', value: filters.title });
    }

    // Ordenação
    const sort = filters.sortBy ? [{
      field: filters.sortBy,
      dir: filters.sortOrder || 'desc'
    }] : undefined;

    return await searchTasks({
      spec,
      page: { page, size, sort }
    });
  }, [searchTasks]);

  return {
    applyAdvancedFilters
  };
}
