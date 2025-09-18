import { Task, StatusConfig, PriorityConfig, TaskStatus, TaskPriority } from '@/types/task';

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  a_fazer: {
    label: 'A fazer',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    effect: 'none',
    icon: '🔨'
  },
  fazendo: {
    label: 'Fazendo',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    effect: 'loading',
    icon: '⟳'
  },
  concluido: {
    label: 'Concluído',
    color: '#10B981',
    bgColor: '#ECFDF5',
    effect: 'checked',
    icon: '✓'
  }
};

export const PRIORIDADE_CONFIG: Record<TaskPriority, PriorityConfig> = {
  baixa: {
    label: 'Baixa',
    color: '#9CA3AF',
    effect: 'none',
    badge: ''
  },
  normal: {
    label: 'Normal',
    color: '#6B7280',
    effect: 'none',
    badge: ''
  },
  media: {
    label: 'Média',
    color: '#F59E0B',
    effect: 'subtle-pulse',
    badge: '●'
  },
  alta: {
    label: 'Alta',
    color: '#EF4444',
    effect: 'pulse',
    badge: '🔥'
  }
};

export const TAREFAS_EXEMPLO: Task[] = [
  {
    id: 1,
    titulo: "Desenvolver API de usuários",
    descricao: "Criar endpoints para CRUD de usuários com validação de dados e autenticação JWT. Incluir testes unitários e documentação da API.",
    statusHistorico: ["a_fazer", "fazendo"],
    statusAtual: "fazendo",
    prioridade: "alta",
    impedimento: false,
    impedimentoMotivo: "",
    dataCadastro: new Date('2025-09-16T08:00:00'),
    dataInicio: new Date('2025-09-18T09:30:00'), // Definida quando mudou para "fazendo"
    dataFim: null
  },
  {
    id: 2,
    titulo: "Criar telas de login",
    descricao: "Implementar interface de login responsiva com validação em tempo real e integração com API de autenticação.",
    statusHistorico: ["a_fazer", "fazendo", "concluido"],
    statusAtual: "concluido",
    prioridade: "normal",
    impedimento: false,
    impedimentoMotivo: "",
    dataCadastro: new Date('2025-09-15T10:30:00'),
    dataInicio: new Date('2025-09-17T14:20:00'), // Definida quando mudou para "fazendo"
    dataFim: new Date('2025-09-18T11:45:00') // Definida quando mudou para "concluido"
  },
  {
    id: 3,
    titulo: "Configurar banco de dados",
    descricao: "Configurar PostgreSQL com migrations, índices otimizados e backup automático. Aguardando liberação do servidor de produção.",
    statusHistorico: ["a_fazer"],
    statusAtual: "a_fazer",
    prioridade: "media",
    impedimento: true,
    impedimentoMotivo: "Aguardando liberação do servidor",
    dataCadastro: new Date('2025-09-17T16:45:00'),
    dataInicio: null, // Ainda não iniciou (não mudou para "fazendo")
    dataFim: null
  },
  {
    id: 4,
    titulo: "Implementar sistema de notificações",
    descricao: "Desenvolver sistema de notificações push e email com templates personalizáveis e histórico de envios.",
    statusHistorico: ["a_fazer", "fazendo"],
    statusAtual: "fazendo",
    prioridade: "normal",
    impedimento: false,
    impedimentoMotivo: "",
    dataCadastro: new Date('2025-09-18T07:20:00'),
    dataInicio: new Date('2025-09-18T10:15:00'), // Definida quando mudou para "fazendo"
    dataFim: null
  }
];