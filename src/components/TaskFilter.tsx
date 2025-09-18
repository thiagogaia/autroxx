'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskContext } from '@/contexts/TaskContext';
import { FilterType } from '@/types/task';

export function TaskFilter() {
  const { filtroAtivo, setFilter } = useTaskContext();

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterType);
  };

  return (
    <div className="mb-6">
      <Tabs value={filtroAtivo} onValueChange={handleFilterChange}>
        <TabsList>
          <TabsTrigger value="tudo">Tudo</TabsTrigger>
          <TabsTrigger value="normal">Normal</TabsTrigger>
          <TabsTrigger value="urgente">Urgente</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}