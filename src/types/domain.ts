// domain.ts — Contratos e tipos comuns para Specification/Query Object Pattern

export type ID = string | number;

// Tipos existentes do projeto
export type TaskStatus = 'a_fazer' | 'fazendo' | 'concluido';
export type TaskPriority = 'baixa' | 'normal' | 'media' | 'alta';
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

// Entidade Task principal
export interface Task {
  id: number;
  titulo: string;
  descricao: string;
  statusHistorico: StatusHistoryEntry[];
  statusAtual: TaskStatus;
  prioridade: TaskPriority;
  impedimento: boolean;
  impedimentoMotivo: string;
  impedimentoHistorico: ImpedimentoHistoryEntry[];
  dataImpedimento: Date | null;
  dataCadastro: Date;
  dataInicio: Date | null;
  dataFim: Date | null;
  ordem?: number;
  tags?: string[];
  categoria?: TaskCategory;
  estimativaTempo?: number;
  complexidade?: TaskComplexity;
  numeroMudancasPrioridade?: number;
  tempoTotalImpedimento?: number;
  foiRetrabalho?: boolean;
  referenced_task_id?: string | null;
  parent_id?: string | null;
  is_active?: boolean;
  rsync?: boolean;
  id_rsync?: number | null;
}

// Tipos para ordenação
export type SortDir = "asc" | "desc";
export type Sort<T> = { field: keyof T; dir: SortDir };

// Tipos para paginação
export type PageRequest = { page: number; size: number; sort?: Sort<Task>[] };
export type Page<T> = { items: T[]; total: number; page: number; size: number };

// Tipos para filtros
export type FilterOp = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in" | "between" | "is_null" | "is_not_null";
export type FilterRule<T> = { field: keyof T; op: FilterOp; value: unknown };

// Specification (filtros compostos)
export type Spec<T> = {
  and?: Spec<T>[];
  or?: Spec<T>[];
  not?: Spec<T>;
  where?: FilterRule<T>[];
};

// Query Object = Spec + paginação/ordenação
export type Query<T> = { spec?: Spec<T>; page?: PageRequest };

// Repository genérico
export interface Repository<T extends { id: ID }> {
  get(id: ID): Promise<T | null>;
  search(query?: Query<T>): Promise<Page<T>>;
  save(entity: T): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
  count(query?: Query<T>): Promise<number>;
}

// Tipos específicos para compatibilidade com o sistema atual
export type FilterType = 'tudo' | 'a_fazer' | 'fazendo' | 'concluido' | 'normal' | 'urgente';

// Configurações de status e prioridade (mantidas para compatibilidade)
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

// Tipos para migração gradual (mantidos para compatibilidade)
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

export interface TaskFilters {
  statusFilter: FilterType;
  titleSearch?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  priorityFilter?: TaskPriority[];
  categoryFilter?: TaskCategory[];
  tagsFilter?: string[];
  impedimentFilter?: boolean | null;
  complexityFilter?: TaskComplexity[];
  sortBy?: 'dataCadastro' | 'titulo' | 'prioridade' | 'dataInicio' | 'dataFim';
  sortOrder?: 'asc' | 'desc';
}

// Contexto de Task (mantido para compatibilidade)
export interface TaskContextType {
  tasks: Task[];
  filtroAtivo: FilterType;
  pagination: PaginationParams;
  paginatedTasks: Task[];
  totalTasks: number;
  advancedFilters: TaskFilters;
  
  // Métodos básicos
  addTask: (titulo: string, prioridade?: TaskPriority) => void;
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
