'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, TaskContextType, TaskStatus, TaskPriority, FilterType } from '@/types/task';
import { TAREFAS_EXEMPLO } from '@/lib/mock-data';

type TaskAction =
  | { type: 'ADD_TASK'; payload: { titulo: string; prioridade: TaskPriority } }
  | { type: 'UPDATE_STATUS'; payload: { id: number; status: TaskStatus } }
  | { type: 'UPDATE_PRIORITY'; payload: { id: number; prioridade: TaskPriority } }
  | { type: 'SET_IMPEDIMENT'; payload: { id: number; motivo: string } }
  | { type: 'REMOVE_IMPEDIMENT'; payload: { id: number } }
  | { type: 'SET_FILTER'; payload: { filter: FilterType } };

interface TaskState {
  tasks: Task[];
  filtroAtivo: FilterType;
}

const initialState: TaskState = {
  tasks: TAREFAS_EXEMPLO,
  filtroAtivo: 'tudo'
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      const newTask: Task = {
        id: Date.now(),
        titulo: action.payload.titulo,
        statusHistorico: ['a_fazer'],
        statusAtual: 'a_fazer',
        prioridade: action.payload.prioridade,
        impedimento: false,
        impedimentoMotivo: '',
        dataInicio: new Date(),
        dataFim: null
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks]
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
            
            const dataFim = action.payload.status === 'concluido' ? new Date() : task.dataFim;
            
            return {
              ...task,
              statusAtual: action.payload.status,
              statusHistorico: novoHistorico,
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

    case 'SET_IMPEDIMENT':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, impedimento: true, impedimentoMotivo: action.payload.motivo }
            : task
        )
      };

    case 'REMOVE_IMPEDIMENT':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, impedimento: false, impedimentoMotivo: '' }
            : task
        )
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

  const addTask = (titulo: string, prioridade: TaskPriority = 'normal') => {
    dispatch({ type: 'ADD_TASK', payload: { titulo, prioridade } });
  };

  const updateTaskStatus = (id: number, status: TaskStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
  };

  const updateTaskPriority = (id: number, prioridade: TaskPriority) => {
    dispatch({ type: 'UPDATE_PRIORITY', payload: { id, prioridade } });
  };

  const setImpediment = (id: number, motivo: string) => {
    dispatch({ type: 'SET_IMPEDIMENT', payload: { id, motivo } });
  };

  const removeImpediment = (id: number) => {
    dispatch({ type: 'REMOVE_IMPEDIMENT', payload: { id } });
  };

  const setFilter = (filter: FilterType) => {
    dispatch({ type: 'SET_FILTER', payload: { filter } });
  };

  return (
    <TaskContext.Provider value={{
      tasks: state.tasks,
      filtroAtivo: state.filtroAtivo,
      addTask,
      updateTaskStatus,
      updateTaskPriority,
      setImpediment,
      removeImpediment,
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