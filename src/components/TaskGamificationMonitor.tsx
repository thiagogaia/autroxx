'use client';

import { useEffect, useRef } from 'react';
import { useTaskContext } from '@/contexts/TaskContextV2';
import { useTaskGamificationIntegration } from '@/contexts/TaskGamificationIntegration';
import { Task } from '@/types/task';

// Componente que monitora mudanças nas tarefas e processa gamificação
export function TaskGamificationMonitor() {
  const { tasks } = useTaskContext();
  const { processTaskCompletion, refreshGamificationStats } = useTaskGamificationIntegration();
  const previousTasksRef = useRef<Task[]>([]);

  // Monitorar mudanças nas tarefas
  useEffect(() => {
    const previousTasks = previousTasksRef.current;
    
    // Só processar se não for o carregamento inicial
    if (previousTasks.length === 0) {
      previousTasksRef.current = tasks;
      return;
    }
    
    // Verificar se alguma tarefa foi realmente completada (mudou de status)
    const completedTasks = tasks.filter(task => {
      const previousTask = previousTasks.find(prev => prev.id === task.id);
      return task.statusAtual === 'concluido' && 
             previousTask && 
             previousTask.statusAtual !== 'concluido';
    });

    // Processar gamificação apenas para tarefas que realmente mudaram de status
    completedTasks.forEach(task => {
      processTaskCompletion(task, tasks);
    });

    // Atualizar estatísticas de gamificação apenas se houve mudanças significativas
    if (tasks.length !== previousTasks.length || 
        tasks.some(task => {
          const prevTask = previousTasks.find(p => p.id === task.id);
          return prevTask && task.statusAtual !== prevTask.statusAtual;
        })) {
      refreshGamificationStats(tasks);
    }

    // Atualizar referência
    previousTasksRef.current = tasks;
  }, [tasks, processTaskCompletion, refreshGamificationStats]);

  return null; // Este componente não renderiza nada
}
