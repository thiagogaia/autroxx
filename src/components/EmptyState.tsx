'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Plus } from 'lucide-react';

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <CheckSquare className="h-24 w-24 text-muted-foreground/30" />
              <Plus className="h-8 w-8 text-muted-foreground/50 absolute -top-2 -right-2 bg-background rounded-full" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-muted-foreground">
              Nenhuma tarefa criada ainda
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Comece criando sua primeira tarefa usando o formulário acima. 
              Organize suas atividades e acompanhe seu progresso!
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground/70">
            <span className="bg-muted px-2 py-1 rounded">💡 Dica:</span>
            <span>Use as prioridades para organizar melhor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}