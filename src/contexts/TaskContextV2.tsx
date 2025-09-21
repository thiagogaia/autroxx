'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { Task, TaskContextType, TaskStatus, TaskPriority, FilterType, ImpedimentoHistoryEntry, PaginationParams, TaskFilters } from '@/types/task';
import { ITaskRepository } from '@/lib/repository';
import { Query, PageRequest } from '@/types/domain';
import { RepositoryFactory } from '@/lib/repository';
import { taskFiltersToSpec, taskFiltersToPageRequest } from '@/lib/query-utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/storage';
import { generateUniqueTaskId } from '@/lib/utils';

type TaskAction =
  | { type: 'ADD_TASK'; payload: { titulo: string; prioridade: TaskPriority } }
  | { type: 'ADD_TASK_FULL'; payload: { task: Task } }
  | { type: 'UPDATE_STATUS'; payload: { id: number; status: TaskStatus } }
  | { type: 'UPDATE_PRIORITY'; payload: { id: number; prioridade: TaskPriority } }
  | { type: 'UPDATE_TASK'; payload: { id: number; updates: Partial<Pick<Task, 'titulo' | 'descricao' | 'prioridade' | 'tags' | 'categoria' | 'estimativaTempo' | 'complexidade' | 'numeroMudancasPrioridade' | 'tempoTotalImpedimento' | 'foiRetrabalho' | 'referenced_task_id' | 'parent_id'>> } }
  | { type: 'SET_IMPEDIMENT'; payload: { id: number; motivo: string } }
  | { type: 'REMOVE_IMPEDIMENT'; payload: { id: number } }
  | { type: 'SET_FILTER'; payload: { filter: FilterType } }
  | { type: 'SET_ADVANCED_FILTERS'; payload: { filters: Partial<TaskFilters> } }
  | { type: 'SET_PAGINATION'; payload: { params: Partial<PaginationParams> } }
  | { type: 'RESET_FILTERS' }
  | { type: 'LOAD_TASKS'; payload: { tasks: Task[] } }
  | { type: 'DELETE_TASK'; payload: { id: number } }
  | { type: 'REORDER_TASKS'; payload: { taskIds: number[] } }
  | { type: 'SET_REPOSITORY'; payload: { repository: ITaskRepository } };

interface TaskState {
  tasks: Task[];
  filtroAtivo: FilterType;
  pagination: PaginationParams;
  advancedFilters: TaskFilters;
  repository: ITaskRepository;
  loading: boolean;
  error: string | null;
}

const initialPagination: PaginationParams = {
  page: 1,
  limit: 10,
  offset: 0
};

const initialAdvancedFilters: TaskFilters = {
  statusFilter: 'tudo',
  titleSearch: '',
  dateRange: { start: null, end: null },
  priorityFilter: [],
  categoryFilter: [],
  tagsFilter: [],
  impedimentFilter: null,
  complexityFilter: [],
  sortBy: 'dataCadastro',
  sortOrder: 'desc'
};

const initialState: TaskState = {
  tasks: [],
  filtroAtivo: 'tudo',
  pagination: initialPagination,
  advancedFilters: initialAdvancedFilters,
  repository: null as any, // Será inicializado no useEffect
  loading: false,
  error: null
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_REPOSITORY':
      return {
        ...state,
        repository: action.payload.repository
      };

    case 'LOAD_TASKS':
      const tasksWithOrder = action.payload.tasks.map((task, index) => ({
        ...task,
        ordem: task.ordem !== undefined ? task.ordem : index
      }));
      return {
        ...state,
        tasks: tasksWithOrder.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
        loading: false,
        error: null
      };

    case 'ADD_TASK':
      const now = new Date();
      const newTask: Task = {
        id: generateUniqueTaskId(),
        titulo: action.payload.titulo,
        descricao: '',
        statusHistorico: [{ status: 'a_fazer', timestamp: now }],
        statusAtual: 'a_fazer',
        prioridade: action.payload.prioridade,
        impedimento: false,
        impedimentoMotivo: '',
        impedimentoHistorico: [],
        dataImpedimento: null,
        dataCadastro: now,
        dataInicio: null,
        dataFim: null,
        ordem: 0,
        tags: [],
        is_active: true,
        rsync: false,
        id_rsync: null
      };
      
      const updatedTasks = state.tasks.map(task => ({
        ...task,
        ordem: (task.ordem || 0) + 1
      }));
      
      return {
        ...state,
        tasks: [newTask, ...updatedTasks]
      };

    case 'ADD_TASK_FULL':
      return {
        ...state,
        tasks: [...state.tasks, action.payload.task]
      };

    case 'UPDATE_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const now = new Date();
            const novoHistorico = [...task.statusHistorico];
            
            const statusJaExiste = novoHistorico.some(entry => entry.status === action.payload.status);
            if (!statusJaExiste) {
              novoHistorico.push({ status: action.payload.status, timestamp: now });
            }
            
            const dataInicio = action.payload.status === 'fazendo' && !task.dataInicio 
              ? now 
              : task.dataInicio;
            
            const dataFim = action.payload.status === 'concluido' ? now : task.dataFim;
            
            return {
              ...task,
              statusAtual: action.payload.status,
              statusHistorico: novoHistorico,
              dataInicio,
              dataFim
            };
          }
          return task;
        })
      };

    case 'UPDATE_PRIORITY':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { 
                ...task, 
                prioridade: action.payload.prioridade,
                numeroMudancasPrioridade: (task.numeroMudancasPrioridade || 0) + 1
              }
            : task
        )
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const updates = action.payload.updates;
            if (updates.prioridade && updates.prioridade !== task.prioridade) {
              return { 
                ...task, 
                ...updates,
                numeroMudancasPrioridade: (task.numeroMudancasPrioridade || 0) + 1
              };
            }
            return { ...task, ...updates };
          }
          return task;
        })
      };

    case 'SET_IMPEDIMENT':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const now = new Date();
            const novoHistorico: ImpedimentoHistoryEntry = {
              id: `imp_${task.id}_${now.getTime()}`,
              impedimento: true,
              motivo: action.payload.motivo,
              timestamp: now
            };
            
            return { 
              ...task, 
              impedimento: true, 
              impedimentoMotivo: action.payload.motivo,
              impedimentoHistorico: [...(task.impedimentoHistorico || []), novoHistorico],
              dataImpedimento: now
            };
          }
          return task;
        })
      };

    case 'REMOVE_IMPEDIMENT':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const now = new Date();
            const novoHistorico: ImpedimentoHistoryEntry = {
              id: `imp_${task.id}_${now.getTime()}`,
              impedimento: false,
              motivo: '',
              timestamp: now
            };
            
            let tempoImpedimentoCalculado = task.tempoTotalImpedimento || 0;
            if (task.dataImpedimento) {
              const diferencaMs = now.getTime() - task.dataImpedimento.getTime();
              const diferencaMinutos = Math.floor(diferencaMs / (1000 * 60));
              tempoImpedimentoCalculado += diferencaMinutos;
            }
            
            return { 
              ...task, 
              impedimento: false, 
              impedimentoMotivo: '',
              impedimentoHistorico: [...(task.impedimentoHistorico || []), novoHistorico],
              dataImpedimento: null,
              tempoTotalImpedimento: tempoImpedimentoCalculado
            };
          }
          return task;
        })
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload.id)
      };

    case 'REORDER_TASKS':
      const taskMap = new Map(state.tasks.map(task => [task.id, task]));
      const reorderedTasks = action.payload.taskIds.map((id, index) => ({
        ...taskMap.get(id)!,
        ordem: index
      }));
      
      return {
        ...state,
        tasks: reorderedTasks
      };

    case 'SET_FILTER':
      return {
        ...state,
        filtroAtivo: action.payload.filter,
        advancedFilters: {
          ...state.advancedFilters,
          statusFilter: action.payload.filter
        }
      };

    case 'SET_ADVANCED_FILTERS':
      return {
        ...state,
        advancedFilters: {
          ...state.advancedFilters,
          ...action.payload.filters
        },
        pagination: {
          ...state.pagination,
          page: 1,
          offset: 0
        }
      };

    case 'SET_PAGINATION':
      const newPage = action.payload.params.page || state.pagination.page;
      const newLimit = action.payload.params.limit || state.pagination.limit;
      return {
        ...state,
        pagination: {
          page: newPage,
          limit: newLimit,
          offset: (newPage - 1) * newLimit
        }
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filtroAtivo: 'tudo',
        advancedFilters: initialAdvancedFilters,
        pagination: {
          ...state.pagination,
          page: 1,
          offset: 0
        }
      };

    default:
      return state;
  }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [filtroAtivo, setFiltroAtivo, filterLoaded] = useLocalStorage<FilterType>(STORAGE_KEYS.FILTER, 'tudo');

  // Inicializar repository usando RepositoryFactory
  useEffect(() => {
    const initRepository = async () => {
      try {
        const repository = await RepositoryFactory.getTaskRepository();
        dispatch({ type: 'SET_REPOSITORY', payload: { repository } });
      } catch (error) {
        console.error('Erro ao inicializar repository:', error);
      }
    };
    
    initRepository();
  }, []);

  // Converter filtros atuais para Specification/Query Object
  const currentQuery = useMemo((): Query<Task> => {
    const spec = taskFiltersToSpec(state.advancedFilters as unknown as Record<string, unknown>);
    const pageRequest: PageRequest = {
      page: state.pagination.page,
      size: state.pagination.limit,
      sort: state.advancedFilters.sortBy ? [{
        field: state.advancedFilters.sortBy as keyof Task,
        dir: (state.advancedFilters.sortOrder || 'desc') as 'asc' | 'desc'
      }] : undefined
    };
    
    return { spec: spec as any, page: pageRequest };
  }, [state.advancedFilters, state.pagination]);

  // Buscar tarefas usando o repository
  const searchTasks = useMemo(async () => {
    if (!state.repository) {
      return { items: [], total: 0, page: 1, size: 10 };
    }
    
    try {
      const result = await state.repository.search(currentQuery);
      return result;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return { items: [], total: 0, page: 1, size: 10 };
    }
  }, [state.repository, currentQuery]);

  // Calcular tarefas filtradas e paginadas (fallback para compatibilidade)
  const filteredTasks = useMemo(() => {
    // Por enquanto, usa a lógica antiga para manter compatibilidade
    // TODO: Migrar completamente para usar o repository
    return state.tasks;
  }, [state.tasks]);

  const paginatedTasks = useMemo(() => {
    const start = state.pagination.offset;
    const end = start + state.pagination.limit;
    return filteredTasks.slice(start, end);
  }, [filteredTasks, state.pagination]);

  // Carregar tarefas do repository na inicialização
  useEffect(() => {
    if (!state.repository) return; // Só executa quando repository estiver disponível
    
    const loadTasks = async () => {
      if (!state.repository) return; // Só executa quando repository estiver disponível
      
      try {
        dispatch({ type: 'LOAD_TASKS', payload: { tasks: [] } }); // Reset loading
        const result = await state.repository.search({
          page: { page: 1, size: 1000 } // Carregar todas as tarefas
        });
        dispatch({ type: 'LOAD_TASKS', payload: { tasks: result.items } });
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      }
    };
    
    loadTasks();
  }, [state.repository]);

  // Sincronizar filtro com localStorage
  useEffect(() => {
    if (filterLoaded) {
      dispatch({ type: 'SET_FILTER', payload: { filter: filtroAtivo } });
    }
  }, [filtroAtivo, filterLoaded]);

  // Salvar tarefas no repository sempre que mudarem
  useEffect(() => {
    if (!state.repository) return; // Só executa quando repository estiver disponível
    
    const saveTasks = async () => {
      if (state.tasks.length > 0) {
        try {
          // Salvar cada tarefa individualmente
          for (const task of state.tasks) {
            await state.repository.save(task);
          }
        } catch (error) {
          console.error('Erro ao salvar tarefas:', error);
        }
      }
    };
    
    saveTasks();
  }, [state.tasks, state.repository]);

  const addTask = (titulo: string, prioridade: TaskPriority = 'normal') => {
    dispatch({ type: 'ADD_TASK', payload: { titulo, prioridade } });
  };

  const addTaskFull = (task: Task) => {
    dispatch({ type: 'ADD_TASK_FULL', payload: { task } });
  };

  const updateTaskStatus = (id: number, status: TaskStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
  };

  const updateTaskPriority = (id: number, prioridade: TaskPriority) => {
    dispatch({ type: 'UPDATE_PRIORITY', payload: { id, prioridade } });
  };

  const updateTask = (id: number, updates: Partial<Pick<Task, 'titulo' | 'descricao' | 'prioridade' | 'tags' | 'categoria' | 'estimativaTempo' | 'complexidade' | 'numeroMudancasPrioridade' | 'tempoTotalImpedimento' | 'foiRetrabalho'>>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  };

  const setImpediment = (id: number, motivo: string) => {
    dispatch({ type: 'SET_IMPEDIMENT', payload: { id, motivo } });
  };

  const removeImpediment = (id: number) => {
    dispatch({ type: 'REMOVE_IMPEDIMENT', payload: { id } });
  };

  const deleteTask = (id: number) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } });
  };

  const setFilter = (filter: FilterType) => {
    setFiltroAtivo(filter);
  };

  const setAdvancedFilters = (filters: Partial<TaskFilters>) => {
    dispatch({ type: 'SET_ADVANCED_FILTERS', payload: { filters } });
  };

  const setPagination = (params: Partial<PaginationParams>) => {
    dispatch({ type: 'SET_PAGINATION', payload: { params } });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const reorderTasks = (taskIds: number[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: { taskIds } });
  };

  // Método para trocar o repository (útil para migração)
  const setRepository = (repository: ITaskRepository) => {
    dispatch({ type: 'SET_REPOSITORY', payload: { repository } });
  };

  return (
    <TaskContext.Provider value={{
      tasks: state.tasks,
      filtroAtivo: state.filtroAtivo,
      pagination: state.pagination,
      paginatedTasks,
      totalTasks: filteredTasks.length,
      advancedFilters: state.advancedFilters,
      addTask,
      addTaskFull,
      updateTaskStatus,
      updateTaskPriority,
      updateTask,
      setImpediment,
      removeImpediment,
      deleteTask,
      reorderTasks,
      setFilter,
      setAdvancedFilters,
      setPagination,
      resetFilters,
      // Métodos adicionais para o novo padrão
      repository: state.repository,
      setRepository
    } as TaskContextType & { repository: ITaskRepository; setRepository: (repo: ITaskRepository) => void }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
