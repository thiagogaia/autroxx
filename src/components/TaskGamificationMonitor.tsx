'use client';

import { useEffect, useRef } from 'react';
import { useTaskContext } from '@/contexts/TaskContextIndexedDB';
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
    
    // Verificar se alguma tarefa foi completada
    const completedTasks = tasks.filter(task => 
      task.statusAtual === 'concluido' && 
      !previousTasks.find(prev => prev.id === task.id && prev.statusAtual === 'concluido')
    );

    // Processar gamificação para tarefas recém-completadas
    completedTasks.forEach(task => {
      processTaskCompletion(task, tasks);
    });

    // Atualizar estatísticas de gamificação apenas se houve mudanças significativas
    if (tasks.length !== previousTasks.length || 
        tasks.some(task => task.statusAtual !== previousTasks.find(p => p.id === task.id)?.statusAtual)) {
      refreshGamificationStats(tasks);
    }

    // Atualizar referência
    previousTasksRef.current = tasks;
  }, [tasks, processTaskCompletion, refreshGamificationStats]);

  return null; // Este componente não renderiza nada
}
