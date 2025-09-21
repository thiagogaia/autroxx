// TaskContextIndexedDB.tsx — Contexto usando IndexedDB com Dexie.js
// Implementação offline-first com sincronização posterior

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Task, TaskContextType, TaskStatus, TaskPriority, FilterType, ImpedimentoHistoryEntry, PaginationParams, TaskFilters } from '@/types/task';
import { indexedDBRepository } from '@/lib/indexeddb-repo';
import { generateUniqueTaskId } from '@/lib/utils';

type TaskAction =
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_TASKS'; payload: { tasks: Task[]; totalTasks?: number } }
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
  | { type: 'DELETE_TASK'; payload: { id: number } }
  | { type: 'REORDER_TASKS'; payload: { taskIds: number[] } }
  | { type: 'SET_SYNC_STATUS'; payload: { syncing: boolean; lastSync?: Date } };

interface TaskState {
  tasks: Task[];
  loading: boolean;
  syncing: boolean;
  lastSync?: Date;
  filtroAtivo: FilterType;
  pagination: PaginationParams;
  advancedFilters: TaskFilters;
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
  loading: true,
  syncing: false,
  filtroAtivo: 'tudo',
  pagination: initialPagination,
  advancedFilters: initialAdvancedFilters,
  totalTasks: 0
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading
      };

    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        totalTasks: action.payload.totalTasks ?? action.payload.tasks.length,
        loading: false
      };

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncing: action.payload.syncing,
        lastSync: action.payload.lastSync
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
      
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
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
        filtroAtivo: action.payload.filter,
        advancedFilters: {
          ...state.advancedFilters,
          statusFilter: action.payload.filter
        },
        pagination: {
          ...state.pagination,
          page: 1,
          offset: 0
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

export function TaskProviderIndexedDB({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Carregar tarefas do IndexedDB na inicialização
  useEffect(() => {
    const loadTasks = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { loading: true } });
        
        // Buscar tarefas com filtros e paginação atuais
        const result = await indexedDBRepository.search(state.advancedFilters, state.pagination);
        
        // Buscar total de tarefas que correspondem aos filtros
        const totalCount = await indexedDBRepository.count(state.advancedFilters);
        
        dispatch({ type: 'SET_TASKS', payload: { tasks: result.data, totalTasks: totalCount } });
        
      } catch (error) {
        console.error('Error loading tasks from IndexedDB:', error);
        dispatch({ type: 'SET_LOADING', payload: { loading: false } });
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
        dispatch({ type: 'SET_TASKS', payload: { tasks: result.data, totalTasks: totalCount } });
      } catch (error) {
        console.error('Error reloading tasks:', error);
      }
    };

    if (!state.loading) {
      reloadTasks();
    }
  }, [state.advancedFilters, state.pagination, state.loading]);

  // Sincronização automática quando voltar online
  useEffect(() => {
    const handleOnline = async () => {
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: true } });
      try {
        await indexedDBRepository.syncWithServer();
        dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false, lastSync: new Date() } });
      } catch (error) {
        console.error('Error syncing with server:', error);
        dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false } });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Métodos assíncronos que interagem com IndexedDB
  const addTask = useCallback(async (titulo: string, prioridade: TaskPriority = 'normal') => {
    try {
      const now = new Date();
      const newTask: Omit<Task, 'id'> = {
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
        rsync: false,
        id_rsync: null
      };

      const createdTask = await indexedDBRepository.create(newTask);
      dispatch({ type: 'ADD_TASK', payload: { titulo, prioridade } });
      
      // Recarregar lista para refletir mudanças
      const result = await indexedDBRepository.search(state.advancedFilters, state.pagination);
      dispatch({ type: 'SET_TASKS', payload: { tasks: result.data } });
      
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }, [state.advancedFilters, state.pagination]);

  const addTaskFull = useCallback(async (task: Task) => {
    try {
      const createdTask = await indexedDBRepository.create(task);
      dispatch({ type: 'ADD_TASK_FULL', payload: { task: createdTask } });
      
      // Recarregar lista
      const result = await indexedDBRepository.search(state.advancedFilters, state.pagination);
      dispatch({ type: 'SET_TASKS', payload: { tasks: result.data } });
      
    } catch (error) {
      console.error('Error adding full task:', error);
    }
  }, [state.advancedFilters, state.pagination]);

  const updateTaskStatus = useCallback(async (id: number, status: TaskStatus) => {
    try {
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;

      const now = new Date();
      const novoHistorico = [...task.statusHistorico];
      
      const statusJaExiste = novoHistorico.some(entry => entry.status === status);
      if (!statusJaExiste) {
        novoHistorico.push({ status, timestamp: now });
      }
      
      const dataInicio = status === 'fazendo' && !task.dataInicio ? now : task.dataInicio;
      const dataFim = status === 'concluido' ? now : task.dataFim;
      
      const updates = {
        statusAtual: status,
        statusHistorico: novoHistorico,
        dataInicio,
        dataFim
      };

      await indexedDBRepository.update(id, updates);
      dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
      
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }, [state.tasks]);

  const updateTaskPriority = useCallback(async (id: number, prioridade: TaskPriority) => {
    try {
      await indexedDBRepository.update(id, { prioridade });
      dispatch({ type: 'UPDATE_PRIORITY', payload: { id, prioridade } });
      
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  }, []);

  const updateTask = useCallback(async (id: number, updates: Partial<Pick<Task, 'titulo' | 'descricao' | 'prioridade' | 'tags' | 'categoria' | 'estimativaTempo' | 'complexidade' | 'numeroMudancasPrioridade' | 'tempoTotalImpedimento' | 'foiRetrabalho' | 'referenced_task_id' | 'parent_id'>>) => {
    try {
      await indexedDBRepository.update(id, updates);
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
      
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, []);

  const setImpediment = useCallback(async (id: number, motivo: string) => {
    try {
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;

      const now = new Date();
      const novoHistorico: ImpedimentoHistoryEntry = {
        id: `imp_${id}_${now.getTime()}`,
        impedimento: true,
        motivo,
        timestamp: now
      };

      const updates = {
        impedimento: true,
        impedimentoMotivo: motivo,
        impedimentoHistorico: [...(task.impedimentoHistorico || []), novoHistorico],
        dataImpedimento: now
      };

      await indexedDBRepository.update(id, updates);
      dispatch({ type: 'SET_IMPEDIMENT', payload: { id, motivo } });
      
    } catch (error) {
      console.error('Error setting impediment:', error);
    }
  }, [state.tasks]);

  const removeImpediment = useCallback(async (id: number) => {
    try {
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;

      const now = new Date();
      const novoHistorico: ImpedimentoHistoryEntry = {
        id: `imp_${id}_${now.getTime()}`,
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

      const updates = {
        impedimento: false,
        impedimentoMotivo: '',
        impedimentoHistorico: [...(task.impedimentoHistorico || []), novoHistorico],
        dataImpedimento: null,
        tempoTotalImpedimento: tempoImpedimentoCalculado
      };

      await indexedDBRepository.update(id, updates);
      dispatch({ type: 'REMOVE_IMPEDIMENT', payload: { id } });
      
    } catch (error) {
      console.error('Error removing impediment:', error);
    }
  }, [state.tasks]);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await indexedDBRepository.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: { id } });
      
      // Recarregar lista
      const result = await indexedDBRepository.search(state.advancedFilters, state.pagination);
      dispatch({ type: 'SET_TASKS', payload: { tasks: result.data } });
      
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [state.advancedFilters, state.pagination]);

  const reorderTasks = useCallback(async (taskIds: number[]) => {
    try {
      // Atualizar ordem no IndexedDB
      for (let i = 0; i < taskIds.length; i++) {
        await indexedDBRepository.update(taskIds[i], { ordem: i });
      }
      
      dispatch({ type: 'REORDER_TASKS', payload: { taskIds } });
      
    } catch (error) {
      console.error('Error reordering tasks:', error);
    }
  }, []);

  const setFilter = useCallback((filter: FilterType) => {
    dispatch({ type: 'SET_FILTER', payload: { filter } });
  }, []);

  const setAdvancedFilters = useCallback((filters: Partial<TaskFilters>) => {
    dispatch({ type: 'SET_ADVANCED_FILTERS', payload: { filters } });
  }, []);

  const setPagination = useCallback((params: Partial<PaginationParams>) => {
    dispatch({ type: 'SET_PAGINATION', payload: { params } });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Calcular tarefas paginadas
  const paginatedTasks = useMemo(() => {
    return state.tasks;
  }, [state.tasks]);

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
