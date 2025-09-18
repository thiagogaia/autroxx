export type TaskStatus = 'a_fazer' | 'fazendo' | 'concluido';
export type TaskPriority = 'baixa' | 'normal' | 'media' | 'alta';
export type FilterType = 'tudo' | 'normal' | 'urgente';

export interface Task {
  id: number;
  titulo: string;
  statusHistorico: TaskStatus[];
  statusAtual: TaskStatus;
  prioridade: TaskPriority;
  impedimento: boolean;
  impedimentoMotivo: string;
  dataInicio: Date;
  dataFim: Date | null;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  effect: string;
  icon: string;
}

export interface PriorityConfig {
  label: string;
  color: string;
  effect: string;
  badge: string;
}

export interface TaskContextType {
  tasks: Task[];
  filtroAtivo: FilterType;
  addTask: (titulo: string, prioridade?: TaskPriority) => void;
  updateTaskStatus: (id: number, status: TaskStatus) => void;
  updateTaskPriority: (id: number, prioridade: TaskPriority) => void;
  setImpediment: (id: number, motivo: string) => void;
  removeImpediment: (id: number) => void;
  deleteTask: (id: number) => void;
  setFilter: (filter: FilterType) => void;
}