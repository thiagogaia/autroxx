export type TaskStatus = 'a_fazer' | 'fazendo' | 'concluido';
export type TaskPriority = 'baixa' | 'normal' | 'media' | 'alta';
export type FilterType = 'tudo' | 'a_fazer' | 'fazendo' | 'concluido' | 'normal' | 'urgente';
export type TaskCategory = 'feature' | 'desenvolvimento' | 'qa' | 'devops' | 'bug' | 'atendimento' | 'comercial' | 'juridico' | 'design' | 'documentacao' | 'reuniao' | 'sem_categoria' | 'outro';
export type TaskComplexity = 'simples' | 'media' | 'complexa';

export interface StatusHistoryEntry {
  status: TaskStatus;
  timestamp: Date;
}

export interface ImpedimentoHistoryEntry {
  id: string;
  impedimento: boolean;
  motivo: string;
  timestamp: Date;
}

export interface Task {
  id: number;
  titulo: string;
  descricao: string; // Campo para detalhes/anotações da tarefa
  statusHistorico: StatusHistoryEntry[];
  statusAtual: TaskStatus;
  prioridade: TaskPriority;
  impedimento: boolean;
  impedimentoMotivo: string;
  impedimentoHistorico: ImpedimentoHistoryEntry[]; // Histórico de impedimentos
  dataImpedimento: Date | null; // Data do impedimento (quando foi marcado)
  dataCadastro: Date; // Data de cadastro da tarefa
  dataInicio: Date | null; // Data de início (quando muda para "fazendo")
  dataFim: Date | null; // Data de fim (quando muda para "concluido")
  ordem?: number; // Novo campo para ordenação
  tags?: string[]; // Tags para categorizar a tarefa
  categoria?: TaskCategory; // Categoria da tarefa
  estimativaTempo?: number; // Estimativa em minutos
  complexidade?: TaskComplexity; // Complexidade da tarefa
  numeroMudancasPrioridade?: number; // Número de mudanças de prioridade
  tempoTotalImpedimento?: number; // Tempo total de impedimento em minutos
  foiRetrabalho?: boolean; // Se foi retrabalho
  referenced_task_id?: string | null; // Referência cruzada (bugs, retrabalhos, dependências)
  parent_id?: string | null; // Árvore de tarefas (para feature futura)
  is_active?: boolean; // Visível na listagem? -> não
  rsync?: boolean; // Visível na listagem? -> não
  id_rsync?: number | null; // Visível na listagem? -> não
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

// Tipos para paginação (preparado para migração SQL)
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para filtros avançados (preparado para migração SQL)
export interface TaskFilters {
  // Filtros básicos (abas existentes)
  statusFilter: FilterType;
  
  // Filtros avançados
  titleSearch?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  priorityFilter?: TaskPriority[];
  categoryFilter?: TaskCategory[];
  tagsFilter?: string[];
  impedimentFilter?: boolean | null; // null = todos, true = com impedimento, false = sem impedimento
  complexityFilter?: TaskComplexity[];
  
  // Ordenação
  sortBy?: 'dataCadastro' | 'titulo' | 'prioridade' | 'dataInicio' | 'dataFim';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskContextType {
  tasks: Task[];
  filtroAtivo: FilterType;
  
  // Paginação
  pagination: PaginationParams;
  paginatedTasks: Task[];
  totalTasks: number;
  
  // Filtros avançados
  advancedFilters: TaskFilters;
  
  // Estados de loading
  isCreatingTask: boolean;
  
  // Métodos básicos
  addTask: (titulo: string, prioridade?: TaskPriority) => Promise<void>;
  addTaskFull: (task: Task) => void;
  updateTaskStatus: (id: number, status: TaskStatus) => void;
  updateTaskPriority: (id: number, prioridade: TaskPriority) => void;
  updateTask: (id: number, updates: Partial<Pick<Task, 'titulo' | 'descricao' | 'prioridade' | 'tags' | 'categoria' | 'estimativaTempo' | 'complexidade' | 'numeroMudancasPrioridade' | 'tempoTotalImpedimento' | 'foiRetrabalho' | 'referenced_task_id' | 'parent_id'>>) => void;
  setImpediment: (id: number, motivo: string) => void;
  removeImpediment: (id: number) => void;
  deleteTask: (id: number) => void;
  reorderTasks: (taskIds: number[]) => void;
  
  // Métodos de filtro e paginação
  setFilter: (filter: FilterType) => void;
  setAdvancedFilters: (filters: Partial<TaskFilters>) => void;
  setPagination: (params: Partial<PaginationParams>) => void;
  resetFilters: () => void;
}

// Re-exportar tipos do novo padrão para compatibilidade
export * from './domain';