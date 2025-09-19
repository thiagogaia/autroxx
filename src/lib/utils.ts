import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Task, TaskStatus } from "@/types/task"
import { differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Contador global para garantir IDs únicos
let taskIdCounter = 0;

// Função para gerar IDs únicos para tarefas
export function generateUniqueTaskId(): number {
  // Usa timestamp + contador para garantir unicidade
  const timestamp = Date.now();
  const counter = ++taskIdCounter;
  
  // Combina timestamp (últimos 10 dígitos) com contador (primeiros 3 dígitos)
  // Isso garante que mesmo com múltiplas criações no mesmo milissegundo,
  // os IDs serão únicos
  return parseInt(`${counter.toString().padStart(3, '0')}${timestamp.toString().slice(-10)}`);
}

// Helper function para verificar se uma tarefa tem um status específico no histórico
export function hasStatusInHistory(task: Task, status: TaskStatus): boolean {
  return task.statusHistorico.some(entry => entry.status === status);
}

// Função para calcular instabilidade da tarefa
export function calcularInstabilidade(task: Task): number {
  const mudancasPrioridade = task.numeroMudancasPrioridade || 0;
  const mudancasImpedimento = task.impedimentoHistorico?.length || 0;
  const tempoVida = differenceInDays(new Date(), new Date(task.dataCadastro));
  
  // Combina mudanças de prioridade + impedimentos
  const totalMudancas = mudancasPrioridade + mudancasImpedimento;
  return Math.min(100, (totalMudancas / Math.max(1, tempoVida)) * 50);
}

// Helper function para migrar dados antigos para nova estrutura
export function migrateTaskData(task: unknown): Task {
  const taskData = task as Record<string, unknown>;
  
  // Se já está na nova estrutura, retorna como está
  if (Array.isArray(taskData.statusHistorico) && taskData.statusHistorico.length > 0 && typeof taskData.statusHistorico[0] === 'object') {
    return taskData as unknown as Task;
  }

  // Migrar do formato antigo (array de strings) para novo formato
  const migratedStatusHistorico = [];
  
  if (Array.isArray(taskData.statusHistorico)) {
    for (const status of taskData.statusHistorico) {
      let timestamp: Date;
      
      // Determinar timestamp baseado no status e datas disponíveis
      switch (status) {
        case 'a_fazer':
          timestamp = taskData.dataCadastro ? new Date(taskData.dataCadastro as string) : new Date();
          break;
        case 'fazendo':
          timestamp = taskData.dataInicio ? new Date(taskData.dataInicio as string) : new Date();
          break;
        case 'concluido':
          timestamp = taskData.dataFim ? new Date(taskData.dataFim as string) : new Date();
          break;
        default:
          timestamp = new Date();
      }
      
      migratedStatusHistorico.push({
        status: status as TaskStatus,
        timestamp: timestamp
      });
    }
  }

  return {
    ...taskData,
    statusHistorico: migratedStatusHistorico
  } as unknown as Task;
}
