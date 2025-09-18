import { Task } from '@/types/task';

// Constantes para localStorage
export const STORAGE_KEYS = {
  TASKS: 'task-manager-tasks',
  FILTER: 'task-manager-filter'
} as const;

// Serializar tarefas para localStorage (converte Dates para strings)
export const serializeTasks = (tasks: Task[]): string => {
  const serializedTasks = tasks.map(task => ({
    ...task,
    dataCadastro: task.dataCadastro.toISOString(),
    dataInicio: task.dataInicio ? task.dataInicio.toISOString() : null,
    dataFim: task.dataFim ? task.dataFim.toISOString() : null,
    dataImpedimento: task.dataImpedimento ? task.dataImpedimento.toISOString() : null
  }));
  
  return JSON.stringify(serializedTasks);
};

// Deserializar tarefas do localStorage (converte strings para Dates)
export const deserializeTasks = (tasksJson: string): Task[] => {
  try {
    const parsed = JSON.parse(tasksJson);
    
    return parsed.map((task: any) => ({
      ...task,
      dataCadastro: new Date(task.dataCadastro),
      dataInicio: task.dataInicio ? new Date(task.dataInicio) : null,
      dataFim: task.dataFim ? new Date(task.dataFim) : null,
      dataImpedimento: task.dataImpedimento ? new Date(task.dataImpedimento) : null
    }));
  } catch (error) {
    console.warn('Erro ao deserializar tarefas:', error);
    return [];
  }
};

// Função helper para salvar tarefas no localStorage
export const saveTasksToStorage = (tasks: Task[]) => {
  if (typeof window !== 'undefined') {
    try {
      const serialized = serializeTasks(tasks);
      localStorage.setItem(STORAGE_KEYS.TASKS, serialized);
    } catch (error) {
      console.error('Erro ao salvar tarefas no localStorage:', error);
    }
  }
};

// Função helper para carregar tarefas do localStorage
export const loadTasksFromStorage = (): Task[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) {
        return deserializeTasks(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
    }
  }
  return [];
};