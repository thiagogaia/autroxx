import { TaskProvider } from '@/contexts/TaskContext';
import { TaskFilter } from '@/components/TaskFilter';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { Metrics } from '@/components/Metrics';

export default function TaskManagerPage() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Task Manager MVP
          </h1>
          
          {/* Filtros */}
          <TaskFilter />
          
          {/* Formulário */}
          <TaskForm />
          
          {/* Lista de Tarefas */}
          <TaskList />
          
          {/* Métricas */}
          <div className="mt-6">
            <Metrics />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}