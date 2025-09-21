'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskContext } from '@/contexts/TaskContextV2';
import { TaskPriority } from '@/types/task';

export function TaskForm() {
  const { addTask, filtroAtivo } = useTaskContext();
  const [novaTarefa, setNovaTarefa] = useState('');
  const [prioridadeNovaTarefa, setPrioridadeNovaTarefa] = useState<TaskPriority>('normal');

  const handleSubmit = () => {
    if (novaTarefa.trim()) {
      // Determina a prioridade baseada na aba ativa
      let prioridade: TaskPriority = 'normal';
      if (filtroAtivo === 'urgente') prioridade = 'alta';
      else if (filtroAtivo === 'normal') prioridade = 'normal';
      else prioridade = prioridadeNovaTarefa; // Usa o select quando está na aba "tudo"

      addTask(novaTarefa.trim(), prioridade);
      setNovaTarefa('');
      setPrioridadeNovaTarefa('normal');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 mb-8 items-end">
      <div className="flex-1">
        <Input
          type="text"
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          placeholder="Digite uma nova tarefa..."
          onKeyPress={handleKeyPress}
        />
      </div>
      
      {/* Select de Prioridade - só aparece na aba "tudo" */}
      {filtroAtivo === 'tudo' && (
        <div>
          <Select value={prioridadeNovaTarefa} onValueChange={(value: TaskPriority) => setPrioridadeNovaTarefa(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button onClick={handleSubmit}>
        Adicionar
      </Button>
    </div>
  );
}