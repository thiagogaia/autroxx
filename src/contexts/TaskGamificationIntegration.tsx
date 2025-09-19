'use client';

import { TaskProvider } from './TaskContext';
import { useGamification } from './GamificationContext';
import { TaskGamificationMonitor } from '@/components/TaskGamificationMonitor';
import { Task } from '@/types/task';

// Componente wrapper que integra TaskContext com GamificationContext
function TaskGamificationIntegration() {
  return <TaskGamificationMonitor />;
}

// Provider que combina TaskProvider e GamificationProvider
export function TaskGamificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <TaskProvider>
      {/* <TaskGamificationIntegration /> */}
      {children}
    </TaskProvider>
  );
}

// Hook personalizado para processar gamificação quando tarefas são atualizadas
export function useTaskGamificationIntegration() {
  const gamification = useGamification();
  
  const processTaskCompletion = (task: Task, allTasks: Task[]) => {
    if (gamification) {
      gamification.processTaskCompletion(task, allTasks);
    }
  };
  
  const refreshGamificationStats = (tasks: Task[]) => {
    if (gamification) {
      gamification.refreshStats(tasks);
    }
  };
  
  return {
    processTaskCompletion,
    refreshGamificationStats
  };
}
