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
    statusHistorico: ["a_fazer", "fazendo"],
    statusAtual: "fazendo",
    prioridade: "alta",
    impedimento: false,
    impedimentoMotivo: "",
    dataInicio: new Date('2025-09-18T09:30:00'),
    dataFim: null
  },
  {
    id: 2,
    titulo: "Criar telas de login",
    statusHistorico: ["a_fazer", "fazendo", "concluido"],
    statusAtual: "concluido",
    prioridade: "normal",
    impedimento: false,
    impedimentoMotivo: "",
    dataInicio: new Date('2025-09-17T14:20:00'),
    dataFim: new Date('2025-09-18T11:45:00')
  },
  {
    id: 3,
    titulo: "Configurar banco de dados",
    statusHistorico: ["a_fazer"],
    statusAtual: "a_fazer",
    prioridade: "media",
    impedimento: true,
    impedimentoMotivo: "Aguardando liberação do servidor",
    dataInicio: new Date('2025-09-18T08:00:00'),
    dataFim: null
  },
  {
    id: 4,
    titulo: "Implementar sistema de notificações",
    statusHistorico: ["a_fazer", "fazendo"],
    statusAtual: "fazendo",
    prioridade: "normal",
    impedimento: false,
    impedimentoMotivo: "",
    dataInicio: new Date('2025-09-18T10:15:00'),
    dataFim: null
  }
];