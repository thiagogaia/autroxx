import { TaskFilter } from '@/components/TaskFilter';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { Pagination } from '@/components/Pagination';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { Metrics } from '@/components/Metrics';
import { Insights } from '@/components/Insights';
import { DataManagement } from '@/components/DataManagement';
import { Navigation } from '@/components/Navigation';

export default function TaskManagerPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {/* <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              Task Manager MVP
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground">
            Gerencie suas tarefas de forma simples e eficiente com drag & drop
          </p>
        </div> */}
        
        {/* Navigation */}
        <Navigation />

        
        
        {/* Métricas */}
        <Metrics />
        
        {/* Insights */}
        <Insights />
        
        {/* Gerenciamento de Dados */}
        {/* <DataManagement /> */}
      </div>
    </div>
  );
}