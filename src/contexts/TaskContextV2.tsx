'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { Task, TaskContextType, TaskStatus, TaskPriority, FilterType, ImpedimentoHistoryEntry, StatusHistoryEntry, PaginationParams, TaskFilters } from '@/types/task';
import { indexedDBRepository } from '@/lib/indexeddb-repo';
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
  | { type: 'LOAD_TASKS'; payload: { tasks: Task[]; totalTasks?: number } }
  | { type: 'DELETE_TASK'; payload: { id: number } }
  | { type: 'REORDER_TASKS'; payload: { taskIds: number[] } };

interface TaskState {
  tasks: Task[];
  filtroAtivo: FilterType;
  pagination: PaginationParams;
  advancedFilters: TaskFilters;
  loading: boolean;
  error: string | null;
  totalTasks: number;
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
  loading: true,
  error: null,
  totalTasks: 0
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'LOAD_TASKS':
      if (!action.payload.tasks) {
        return state;
      }
      const tasksWithOrder = action.payload.tasks && action.payload.tasks.map((task, index) => ({
        ...task,
        ordem: task.ordem !== undefined ? task.ordem : index
      }));
      return {
        ...state,
        tasks: tasksWithOrder.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
        totalTasks: action.payload.totalTasks ?? action.payload.tasks.length,
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
        categoria: 'sem_categoria',
        estimativaTempo: undefined,
        complexidade: 'media',
        numeroMudancasPrioridade: 0,
        tempoTotalImpedimento: 0,
        foiRetrabalho: false,
        referenced_task_id: null,
        parent_id: null,
        rsync: false,
        id_rsync: null
      };
      
      const updatedTasks = state.tasks.map(task => ({
        ...task,
        ordem: (task.ordem || 0) + 1
      }));
      
      return {
        ...state,
        tasks: [newTask, ...updatedTasks],
        totalTasks: state.totalTasks + 1
      };

    case 'ADD_TASK_FULL':
      return {
        ...state,
        tasks: [...state.tasks, action.payload.task],
        totalTasks: state.totalTasks + 1
      };

    case 'UPDATE_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const newStatusEntry: StatusHistoryEntry = {
              status: action.payload.status,
              timestamp: new Date()
            };
            return {
              ...task,
              statusAtual: action.payload.status,
              statusHistorico: [...task.statusHistorico, newStatusEntry],
              dataInicio: action.payload.status === 'fazendo' && !task.dataInicio ? new Date() : task.dataInicio,
              dataFim: action.payload.status === 'concluido' ? new Date() : task.dataFim
            };
          }
          return task;
        })
      };

    case 'UPDATE_PRIORITY':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            return {
              ...task,
              prioridade: action.payload.prioridade,
              numeroMudancasPrioridade: (task.numeroMudancasPrioridade || 0) + 1
            };
          }
          return task;
        })
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            return {
              ...task,
              ...action.payload.updates
            };
          }
          return task;
        })
      };

    case 'SET_IMPEDIMENT':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const impedimentoEntry: ImpedimentoHistoryEntry = {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              impedimento: true,
              motivo: action.payload.motivo,
              timestamp: new Date()
            };
            return {
              ...task,
              impedimento: true,
              impedimentoMotivo: action.payload.motivo,
              impedimentoHistorico: [...task.impedimentoHistorico, impedimentoEntry],
              dataImpedimento: new Date()
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
            const impedimentoEntry: ImpedimentoHistoryEntry = {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              impedimento: false,
              motivo: '',
              timestamp: new Date()
            };
            return {
              ...task,
              impedimento: false,
              impedimentoMotivo: '',
              impedimentoHistorico: [...task.impedimentoHistorico, impedimentoEntry],
              dataImpedimento: null
            };
          }
          return task;
        })
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload.id),
        totalTasks: Math.max(0, state.totalTasks - 1)
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
        filtroAtivo: action.payload.filter
      };

    case 'SET_ADVANCED_FILTERS':
      return {
        ...state,
        advancedFilters: { ...state.advancedFilters, ...action.payload.filters }
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload.params }
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        advancedFilters: initialAdvancedFilters,
        pagination: initialPagination,
        filtroAtivo: 'tudo'
      };

    default:
      return state;
  }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Carregar tarefas do IndexedDB na inicialização
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Buscar tarefas com filtros e paginação atuais
        const result = await indexedDBRepository.search(state.advancedFilters, state.pagination);
        
        // Buscar total de tarefas que correspondem aos filtros
        const totalCount = await indexedDBRepository.count(state.advancedFilters);
        
        dispatch({ type: 'LOAD_TASKS', payload: { tasks: result.data, totalTasks: totalCount } });
        
      } catch (error) {
        console.error('Error loading tasks from IndexedDB:', error);
        dispatch({ type: 'LOAD_TASKS', payload: { tasks: [] } });
      }
    };

    loadTasks();
  }, []);

  // Recarregar tarefas quando filtros ou paginação mudarem
  useEffect(() => {
    const reloadTasks = async () => {
      try {
        const result = await indexedDBRepository.search(state.advancedFilters, state.pagination);
        const totalCount = await indexedDBRepository.count(state.advancedFilters);
        dispatch({ type: 'LOAD_TASKS', payload: { tasks: result.data, totalTasks: totalCount } });
      } catch (error) {
        console.error('Error reloading tasks:', error);
      }
    };

    if (!state.loading) {
      reloadTasks();
    }
  }, [state.advancedFilters, state.pagination, state.loading]);

  // Calcular tarefas paginadas - as tarefas já vêm paginadas do repositório
  const paginatedTasks = useMemo(() => {
    return state.tasks;
  }, [state.tasks]);

  // Funções do contexto
  const addTask = async (titulo: string, prioridade: TaskPriority = 'normal') => {
    dispatch({ type: 'ADD_TASK', payload: { titulo, prioridade } });
    
    // Salvar no IndexedDB
    try {
      const now = new Date();
      const newTask: Task = {
        id: generateUniqueTaskId(),
        titulo,
        descricao: '',
        statusHistorico: [{ status: 'a_fazer', timestamp: now }],
        statusAtual: 'a_fazer',
        prioridade,
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
        categoria: 'sem_categoria',
        estimativaTempo: undefined,
        complexidade: 'media',
        numeroMudancasPrioridade: 0,
        tempoTotalImpedimento: 0,
        foiRetrabalho: false,
        referenced_task_id: null,
        parent_id: null,
        rsync: false,
        id_rsync: null
      };
      
      await indexedDBRepository.create(newTask);
    } catch (error) {
      console.error('Error saving task to IndexedDB:', error);
    }
  };

  const addTaskFull = async (task: Task) => {
    dispatch({ type: 'ADD_TASK_FULL', payload: { task } });
    
    try {
      await indexedDBRepository.create(task);
    } catch (error) {
      console.error('Error saving task to IndexedDB:', error);
    }
  };

  const updateTaskStatus = async (id: number, status: TaskStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
    
    try {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const updatedTask = {
          ...task,
          statusAtual: status,
          dataInicio: status === 'fazendo' && !task.dataInicio ? new Date() : task.dataInicio,
          dataFim: status === 'concluido' ? new Date() : task.dataFim
        };
        await indexedDBRepository.update(id, updatedTask);
      }
    } catch (error) {
      console.error('Error updating task status in IndexedDB:', error);
    }
  };

  const updateTaskPriority = async (id: number, prioridade: TaskPriority) => {
    dispatch({ type: 'UPDATE_PRIORITY', payload: { id, prioridade } });
    
    try {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const updatedTask = {
          ...task,
          prioridade,
          numeroMudancasPrioridade: (task.numeroMudancasPrioridade || 0) + 1
        };
        await indexedDBRepository.update(id, updatedTask);
      }
    } catch (error) {
      console.error('Error updating task priority in IndexedDB:', error);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    
    try {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const updatedTask = { ...task, ...updates };
        await indexedDBRepository.update(id, updatedTask);
      }
    } catch (error) {
      console.error('Error updating task in IndexedDB:', error);
    }
  };

  const setImpediment = async (id: number, motivo: string) => {
    dispatch({ type: 'SET_IMPEDIMENT', payload: { id, motivo } });
    
    try {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const updatedTask = {
          ...task,
          impedimento: true,
          impedimentoMotivo: motivo,
          dataImpedimento: new Date()
        };
        await indexedDBRepository.update(id, updatedTask);
      }
    } catch (error) {
      console.error('Error setting impediment in IndexedDB:', error);
    }
  };

  const removeImpediment = async (id: number) => {
    dispatch({ type: 'REMOVE_IMPEDIMENT', payload: { id } });
    
    try {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const updatedTask = {
          ...task,
          impedimento: false,
          impedimentoMotivo: '',
          dataImpedimento: null
        };
        await indexedDBRepository.update(id, updatedTask);
      }
    } catch (error) {
      console.error('Error removing impediment in IndexedDB:', error);
    }
  };

  const deleteTask = async (id: number) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } });
    
    try {
      await indexedDBRepository.delete(id);
    } catch (error) {
      console.error('Error deleting task from IndexedDB:', error);
    }
  };

  const reorderTasks = async (taskIds: number[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: { taskIds } });
    
    try {
      // Atualizar ordem no IndexedDB
      for (let i = 0; i < taskIds.length; i++) {
        const task = state.tasks.find(t => t.id === taskIds[i]);
        if (task) {
          const updatedTask = { ...task, ordem: i };
          await indexedDBRepository.update(taskIds[i], updatedTask);
        }
      }
    } catch (error) {
      console.error('Error reordering tasks in IndexedDB:', error);
    }
  };

  const setFilter = (filter: FilterType) => {
    dispatch({ type: 'SET_FILTER', payload: { filter } });
    
    // Converter filtro simples para advancedFilters
    let statusFilter: string = 'tudo';
    let priorityFilter: TaskPriority[] = [];
    
    if (filter === 'a_fazer') {
      statusFilter = 'a_fazer';
    } else if (filter === 'fazendo') {
      statusFilter = 'fazendo';
    } else if (filter === 'concluido') {
      statusFilter = 'concluido';
    } else if (filter === 'normal') {
      statusFilter = 'normal';
    } else if (filter === 'urgente') {
      statusFilter = 'urgente';
    }
    
    // Atualizar advancedFilters para disparar o reload
    dispatch({ 
      type: 'SET_ADVANCED_FILTERS', 
      payload: { 
        filters: { 
          statusFilter: statusFilter as any,
          priorityFilter: priorityFilter
        } 
      } 
    });
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

  return (
    <TaskContext.Provider value={{
      tasks: state.tasks,
      filtroAtivo: state.filtroAtivo,
      pagination: state.pagination,
      paginatedTasks,
      totalTasks: state.totalTasks,
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
      resetFilters
    }}>
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