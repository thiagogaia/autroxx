import { Task, StatusConfig, PriorityConfig, TaskStatus, TaskPriority, TaskCategory, TaskComplexity } from '@/types/task';

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
    statusHistorico: [
      { status: "a_fazer", timestamp: new Date('2025-09-16T08:00:00') },
      { status: "fazendo", timestamp: new Date('2025-09-18T09:30:00') }
    ],
    statusAtual: "fazendo",
    prioridade: "alta",
    impedimento: false,
    impedimentoMotivo: "",
    impedimentoHistorico: [],
    dataImpedimento: null,
    dataCadastro: new Date('2025-09-16T08:00:00'),
    dataInicio: new Date('2025-09-18T09:30:00'), // Definida quando mudou para "fazendo"
    dataFim: null,
    tags: ["backend", "api", "crud"],
    categoria: "desenvolvimento",
    estimativaTempo: 480, // 8 horas
    complexidade: "media",
    numeroMudancasPrioridade: 1,
    tempoTotalImpedimento: 0,
    foiRetrabalho: false
  },
  {
    id: 2,
    titulo: "Criar telas de login",
    descricao: "Implementar interface de login responsiva com validação em tempo real e integração com API de autenticação.",
    statusHistorico: [
      { status: "a_fazer", timestamp: new Date('2025-09-15T10:30:00') },
      { status: "fazendo", timestamp: new Date('2025-09-17T14:20:00') },
      { status: "concluido", timestamp: new Date('2025-09-18T11:45:00') }
    ],
    statusAtual: "concluido",
    prioridade: "normal",
    impedimento: false,
    impedimentoMotivo: "",
    impedimentoHistorico: [],
    dataImpedimento: null,
    dataCadastro: new Date('2025-09-15T10:30:00'),
    dataInicio: new Date('2025-09-17T14:20:00'), // Definida quando mudou para "fazendo"
    dataFim: new Date('2025-09-18T11:45:00'), // Definida quando mudou para "concluido"
    tags: ["frontend", "ui", "auth"],
    categoria: "desenvolvimento",
    estimativaTempo: 240, // 4 horas
    complexidade: "simples",
    numeroMudancasPrioridade: 0,
    tempoTotalImpedimento: 0,
    foiRetrabalho: false
  },
  {
    id: 3,
    titulo: "Configurar banco de dados",
    descricao: "Configurar PostgreSQL com migrations, índices otimizados e backup automático. Aguardando liberação do servidor de produção.",
    statusHistorico: [
      { status: "a_fazer", timestamp: new Date('2025-09-17T16:45:00') }
    ],
    statusAtual: "a_fazer",
    prioridade: "media",
    impedimento: true,
    impedimentoMotivo: "Aguardando liberação do servidor",
    impedimentoHistorico: [
      {
        id: "imp_3_1726666200000",
        impedimento: true,
        motivo: "Aguardando liberação do servidor",
        timestamp: new Date('2025-09-18T14:30:00')
      }
    ],
    dataImpedimento: new Date('2025-09-18T14:30:00'), // Definida quando impedimento foi marcado
    dataCadastro: new Date('2025-09-17T16:45:00'),
    dataInicio: null, // Ainda não iniciou (não mudou para "fazendo")
    dataFim: null,
    tags: ["infra", "database", "postgresql"],
    categoria: "desenvolvimento",
    estimativaTempo: 180, // 3 horas
    complexidade: "media",
    numeroMudancasPrioridade: 2,
    tempoTotalImpedimento: 120, // 2 horas de impedimento
    foiRetrabalho: false
  },
  {
    id: 4,
    titulo: "Implementar sistema de notificações",
    descricao: "Desenvolver sistema de notificações push e email com templates personalizáveis e histórico de envios.",
    statusHistorico: [
      { status: "a_fazer", timestamp: new Date('2025-09-18T07:20:00') },
      { status: "fazendo", timestamp: new Date('2025-09-18T10:15:00') }
    ],
    statusAtual: "fazendo",
    prioridade: "normal",
    impedimento: false,
    impedimentoMotivo: "",
    impedimentoHistorico: [],
    dataImpedimento: null,
    dataCadastro: new Date('2025-09-18T07:20:00'),
    dataInicio: new Date('2025-09-18T10:15:00'), // Definida quando mudou para "fazendo"
    dataFim: null,
    tags: ["notifications", "email", "push"],
    categoria: "desenvolvimento",
    estimativaTempo: 360, // 6 horas
    complexidade: "complexa",
    numeroMudancasPrioridade: 0,
    tempoTotalImpedimento: 0,
    foiRetrabalho: false
  },
  {
    id: 5,
    titulo: "Reunião de planejamento sprint",
    descricao: "Reunião para definir prioridades e estimativas para a próxima sprint. Participantes: dev team, PO, SM.",
    statusHistorico: [
      { status: "a_fazer", timestamp: new Date('2025-09-16T09:00:00') },
      { status: "concluido", timestamp: new Date('2025-09-16T11:30:00') }
    ],
    statusAtual: "concluido",
    prioridade: "normal",
    impedimento: false,
    impedimentoMotivo: "",
    impedimentoHistorico: [],
    dataImpedimento: null,
    dataCadastro: new Date('2025-09-16T09:00:00'),
    dataInicio: new Date('2025-09-16T10:00:00'),
    dataFim: new Date('2025-09-16T11:30:00'),
    tags: ["meeting", "planning"],
    categoria: "reuniao",
    estimativaTempo: 90, // 1.5 horas
    complexidade: "simples",
    numeroMudancasPrioridade: 0,
    tempoTotalImpedimento: 0,
    foiRetrabalho: false
  },
  {
    id: 6,
    titulo: "Corrigir bug no login mobile",
    descricao: "Usuários reportam que o login não funciona em dispositivos iOS. Investigar e corrigir problema de autenticação.",
    statusHistorico: [
      { status: "a_fazer", timestamp: new Date('2025-09-18T08:30:00') },
      { status: "fazendo", timestamp: new Date('2025-09-18T13:00:00') }
    ],
    statusAtual: "fazendo",
    prioridade: "alta",
    impedimento: false,
    impedimentoMotivo: "",
    impedimentoHistorico: [
      {
        id: "imp_6_1726668000000",
        impedimento: true,
        motivo: "Aguardando acesso ao dispositivo iOS",
        timestamp: new Date('2025-09-18T15:00:00')
      },
      {
        id: "imp_6_1726671600000",
        impedimento: false,
        motivo: "",
        timestamp: new Date('2025-09-18T16:00:00')
      }
    ],
    dataImpedimento: null,
    dataCadastro: new Date('2025-09-18T08:30:00'),
    dataInicio: new Date('2025-09-18T13:00:00'),
    dataFim: null,
    tags: ["bug", "mobile", "ios", "urgent"],
    categoria: "bug",
    estimativaTempo: 120, // 2 horas
    complexidade: "media",
    numeroMudancasPrioridade: 3,
    tempoTotalImpedimento: 30, // 30 minutos de impedimento
    foiRetrabalho: true
  },
  {
    id: 7,
    titulo: "Documentar API endpoints",
    descricao: "Criar documentação completa da API com exemplos de uso, códigos de resposta e guias de integração.",
    statusHistorico: [
      { status: "a_fazer", timestamp: new Date('2025-09-17T14:00:00') }
    ],
    statusAtual: "a_fazer",
    prioridade: "baixa",
    impedimento: false,
    impedimentoMotivo: "",
    impedimentoHistorico: [],
    dataImpedimento: null,
    dataCadastro: new Date('2025-09-17T14:00:00'),
    dataInicio: null,
    dataFim: null,
    tags: ["documentation", "api", "swagger"],
    categoria: "documentacao",
    estimativaTempo: 300, // 5 horas
    complexidade: "simples",
    numeroMudancasPrioridade: 0,
    tempoTotalImpedimento: 0,
    foiRetrabalho: false
  }
];