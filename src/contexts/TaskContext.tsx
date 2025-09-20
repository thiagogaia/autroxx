'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { Task, TaskContextType, TaskStatus, TaskPriority, FilterType, ImpedimentoHistoryEntry, PaginationParams, TaskFilters } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS, saveTasksToStorage, loadTasksFromStorage } from '@/lib/storage';
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
  | { type: 'REORDER_TASKS'; payload: { taskIds: number[] } };

interface TaskState {
  tasks: Task[];
  filtroAtivo: FilterType;
  pagination: PaginationParams;
  advancedFilters: TaskFilters;
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
  advancedFilters: initialAdvancedFilters
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'LOAD_TASKS':
      // Garante que as tarefas tenham ordem definida
      const tasksWithOrder = action.payload.tasks.map((task, index) => ({
        ...task,
        ordem: task.ordem !== undefined ? task.ordem : index
      }));
      return {
        ...state,
        tasks: tasksWithOrder.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
      };

    case 'ADD_TASK':
      const now = new Date();
      const newTask: Task = {
        id: generateUniqueTaskId(),
        titulo: action.payload.titulo,
        descricao: '', // Campo de descrição sempre inicia vazio
        statusHistorico: [{ status: 'a_fazer', timestamp: now }],
        statusAtual: 'a_fazer',
        prioridade: action.payload.prioridade,
        impedimento: false,
        impedimentoMotivo: '',
        impedimentoHistorico: [], // Histórico de impedimentos
        dataImpedimento: null, // Será preenchida quando impedimento for marcado
        dataCadastro: now, // Data de cadastro da tarefa
        dataInicio: null, // Será preenchida quando mudar para "fazendo"
        dataFim: null,
        ordem: 0, // Nova tarefa vai para o topo
        tags: [], // Tags sempre iniciam vazias
        is_active: true, // Todas as tarefas criadas vêm com true
        rsync: false, // Padrão false
        id_rsync: null // Padrão null
      };
      
      // Atualiza a ordem das outras tarefas
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
            
            // Verificar se o status já existe no histórico
            const statusJaExiste = novoHistorico.some(entry => entry.status === action.payload.status);
            if (!statusJaExiste) {
              novoHistorico.push({ status: action.payload.status, timestamp: now });
            }
            
            // Define dataInicio quando muda para "fazendo" (se ainda não foi definida)
            const dataInicio = action.payload.status === 'fazendo' && !task.dataInicio 
              ? now 
              : task.dataInicio;
            
            // Define dataFim quando muda para "concluido"
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
            // Se a prioridade está sendo alterada, incrementar o contador
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
            
            // Calcular tempo de impedimento se havia dataImpedimento
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
          page: 1, // Reset para primeira página quando filtros mudam
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

  // Função para aplicar filtros avançados
  const applyAdvancedFilters = useMemo(() => {
    return (tasks: Task[], filters: TaskFilters): Task[] => {
      let filteredTasks = [...tasks];

      // Filtro por status (abas existentes)
      if (filters.statusFilter !== 'tudo') {
        if (filters.statusFilter === 'a_fazer') {
          filteredTasks = filteredTasks.filter(task => task.statusAtual === 'a_fazer');
        } else if (filters.statusFilter === 'fazendo') {
          filteredTasks = filteredTasks.filter(task => task.statusAtual === 'fazendo');
        } else if (filters.statusFilter === 'normal') {
          filteredTasks = filteredTasks.filter(task => task.prioridade === 'normal' && task.statusAtual !== 'concluido');
        } else if (filters.statusFilter === 'urgente') {
          filteredTasks = filteredTasks.filter(task => task.prioridade === 'alta' && task.statusAtual !== 'concluido');
        }
      }

      // Filtro por título
      if (filters.titleSearch) {
        const searchTerm = filters.titleSearch.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.titulo.toLowerCase().includes(searchTerm)
        );
      }

      // Filtro por data de cadastro
      if (filters.dateRange?.start || filters.dateRange?.end) {
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = new Date(task.dataCadastro);
          if (filters.dateRange?.start && taskDate < filters.dateRange.start) return false;
          if (filters.dateRange?.end && taskDate > filters.dateRange.end) return false;
          return true;
        });
      }

      // Filtro por prioridade
      if (filters.priorityFilter && filters.priorityFilter.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          filters.priorityFilter!.includes(task.prioridade)
        );
      }

      // Filtro por categoria
      if (filters.categoryFilter && filters.categoryFilter.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          task.categoria && filters.categoryFilter!.includes(task.categoria)
        );
      }

      // Filtro por tags
      if (filters.tagsFilter && filters.tagsFilter.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          task.tags && task.tags.some(tag => filters.tagsFilter!.includes(tag))
        );
      }

      // Filtro por impedimento
      if (filters.impedimentFilter !== null) {
        filteredTasks = filteredTasks.filter(task => 
          task.impedimento === filters.impedimentFilter
        );
      }

      // Filtro por complexidade
      if (filters.complexityFilter && filters.complexityFilter.length > 0) {
        filteredTasks = filteredTasks.filter(task => 
          task.complexidade && filters.complexityFilter!.includes(task.complexidade)
        );
      }

      // Ordenação
      if (filters.sortBy) {
        filteredTasks.sort((a, b) => {
          let aValue: string | number, bValue: string | number;
          
          switch (filters.sortBy) {
            case 'titulo':
              aValue = a.titulo.toLowerCase();
              bValue = b.titulo.toLowerCase();
              break;
            case 'prioridade':
              const priorityOrder = { 'baixa': 1, 'normal': 2, 'media': 3, 'alta': 4 };
              aValue = priorityOrder[a.prioridade];
              bValue = priorityOrder[b.prioridade];
              break;
            case 'dataCadastro':
              aValue = new Date(a.dataCadastro).getTime();
              bValue = new Date(b.dataCadastro).getTime();
              break;
            case 'dataInicio':
              aValue = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;
              bValue = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;
              break;
            case 'dataFim':
              aValue = a.dataFim ? new Date(a.dataFim).getTime() : 0;
              bValue = b.dataFim ? new Date(b.dataFim).getTime() : 0;
              break;
            default:
              return 0;
          }

          if (filters.sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }

      return filteredTasks;
    };
  }, []);

  // Calcular tarefas filtradas e paginadas
  const filteredTasks = useMemo(() => {
    return applyAdvancedFilters(state.tasks, state.advancedFilters);
  }, [state.tasks, state.advancedFilters, applyAdvancedFilters]);

  const paginatedTasks = useMemo(() => {
    const start = state.pagination.offset;
    const end = start + state.pagination.limit;
    return filteredTasks.slice(start, end);
  }, [filteredTasks, state.pagination]);

  // Carregar tarefas do localStorage na inicialização
  useEffect(() => {
    const storedTasks = loadTasksFromStorage();
    if (storedTasks.length > 0) {
      dispatch({ type: 'LOAD_TASKS', payload: { tasks: storedTasks } });
    }
  }, []);

  // Sincronizar filtro com localStorage
  useEffect(() => {
    if (filterLoaded) {
      dispatch({ type: 'SET_FILTER', payload: { filter: filtroAtivo } });
    }
  }, [filtroAtivo, filterLoaded]);

  // Salvar tarefas no localStorage sempre que mudarem
  useEffect(() => {
    if (state.tasks.length > 0) {
      saveTasksToStorage(state.tasks);
    }
  }, [state.tasks]);

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