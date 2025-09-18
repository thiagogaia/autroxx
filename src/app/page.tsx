import { TaskProvider } from '@/contexts/TaskContext';
import { TaskFilter } from '@/components/TaskFilter';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { Metrics } from '@/components/Metrics';
import { DataManagement } from '@/components/DataManagement';
import { DragDropTutorial } from '@/components/DragDropTutorial';

export default function TaskManagerPage() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Task Manager MVP
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas tarefas de forma simples e eficiente com drag & drop
            </p>
          </div>
          
          {/* Tutorial Drag & Drop */}
          <DragDropTutorial />
          
          {/* Filtros */}
          <TaskFilter />
          
          {/* Formulário */}
          <TaskForm />
          
          {/* Lista de Tarefas */}
          <TaskList />
          
          {/* Métricas */}
          <Metrics />
          
          {/* Gerenciamento de Dados */}
          <DataManagement />
        </div>
      </div>
    </TaskProvider>
  );
}