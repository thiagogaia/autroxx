export type TaskStatus = 'a_fazer' | 'fazendo' | 'concluido';
export type TaskPriority = 'baixa' | 'normal' | 'media' | 'alta';
export type FilterType = 'tudo' | 'normal' | 'urgente';

export interface Task {
  id: number;
  titulo: string;
  descricao: string; // Campo para detalhes/anotações da tarefa
  statusHistorico: TaskStatus[];
  statusAtual: TaskStatus;
  prioridade: TaskPriority;
  impedimento: boolean;
  impedimentoMotivo: string;
  dataCadastro: Date; // Data de cadastro da tarefa
  dataInicio: Date | null; // Data de início (quando muda para "fazendo")
  dataFim: Date | null; // Data de fim (quando muda para "concluido")
  ordem?: number; // Novo campo para ordenação
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
  updateTask: (id: number, updates: Partial<Pick<Task, 'titulo' | 'descricao' | 'prioridade'>>) => void;
  setImpediment: (id: number, motivo: string) => void;
  removeImpediment: (id: number) => void;
  deleteTask: (id: number) => void;
  reorderTasks: (taskIds: number[]) => void; // Nova função para reordenar
  setFilter: (filter: FilterType) => void;
}