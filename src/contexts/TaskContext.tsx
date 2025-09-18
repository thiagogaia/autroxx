'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, TaskContextType, TaskStatus, TaskPriority, FilterType } from '@/types/task';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS, saveTasksToStorage, loadTasksFromStorage } from '@/lib/storage';

type TaskAction =
  | { type: 'ADD_TASK'; payload: { titulo: string; prioridade: TaskPriority } }
  | { type: 'UPDATE_STATUS'; payload: { id: number; status: TaskStatus } }
  | { type: 'UPDATE_PRIORITY'; payload: { id: number; prioridade: TaskPriority } }
  | { type: 'UPDATE_TASK'; payload: { id: number; updates: Partial<Pick<Task, 'titulo' | 'descricao' | 'prioridade'>> } }
  | { type: 'SET_IMPEDIMENT'; payload: { id: number; motivo: string } }
  | { type: 'REMOVE_IMPEDIMENT'; payload: { id: number } }
  | { type: 'SET_FILTER'; payload: { filter: FilterType } }
  | { type: 'LOAD_TASKS'; payload: { tasks: Task[] } }
  | { type: 'DELETE_TASK'; payload: { id: number } }
  | { type: 'REORDER_TASKS'; payload: { taskIds: number[] } };

interface TaskState {
  tasks: Task[];
  filtroAtivo: FilterType;
}

const initialState: TaskState = {
  tasks: [],
  filtroAtivo: 'tudo'
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
        id: Date.now(),
        titulo: action.payload.titulo,
        descricao: '', // Campo de descrição sempre inicia vazio
        statusHistorico: ['a_fazer'],
        statusAtual: 'a_fazer',
        prioridade: action.payload.prioridade,
        impedimento: false,
        impedimentoMotivo: '',
        dataImpedimento: null, // Será preenchida quando impedimento for marcado
        dataCadastro: now, // Data de cadastro da tarefa
        dataInicio: null, // Será preenchida quando mudar para "fazendo"
        dataFim: null,
        ordem: 0 // Nova tarefa vai para o topo
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

    case 'UPDATE_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const novoHistorico = [...task.statusHistorico];
            if (!novoHistorico.includes(action.payload.status)) {
              novoHistorico.push(action.payload.status);
            }
            
            // Define dataInicio quando muda para "fazendo" (se ainda não foi definida)
            const dataInicio = action.payload.status === 'fazendo' && !task.dataInicio 
              ? new Date() 
              : task.dataInicio;
            
            // Define dataFim quando muda para "concluido"
            const dataFim = action.payload.status === 'concluido' ? new Date() : task.dataFim;
            
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
            ? { ...task, prioridade: action.payload.prioridade }
            : task
        )
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        )
      };

    case 'SET_IMPEDIMENT':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { 
                ...task, 
                impedimento: true, 
                impedimentoMotivo: action.payload.motivo,
                dataImpedimento: new Date() // Define a data do impedimento como "agora"
              }
            : task
        )
      };

    case 'REMOVE_IMPEDIMENT':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { 
                ...task, 
                impedimento: false, 
                impedimentoMotivo: '',
                dataImpedimento: null // Remove a data do impedimento
              }
            : task
        )
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
        filtroAtivo: action.payload.filter
      };

    default:
      return state;
  }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [filtroAtivo, setFiltroAtivo, filterLoaded] = useLocalStorage<FilterType>(STORAGE_KEYS.FILTER, 'tudo');

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

  const updateTaskStatus = (id: number, status: TaskStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
  };

  const updateTaskPriority = (id: number, prioridade: TaskPriority) => {
    dispatch({ type: 'UPDATE_PRIORITY', payload: { id, prioridade } });
  };

  const updateTask = (id: number, updates: Partial<Pick<Task, 'titulo' | 'descricao' | 'prioridade'>>) => {
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

  const reorderTasks = (taskIds: number[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: { taskIds } });
  };

  return (
    <TaskContext.Provider value={{
      tasks: state.tasks,
      filtroAtivo: state.filtroAtivo,
      addTask,
      updateTaskStatus,
      updateTaskPriority,
      updateTask,
      setImpediment,
      removeImpediment,
      deleteTask,
      reorderTasks,
      setFilter
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