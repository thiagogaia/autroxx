'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, GripVertical, ArrowUpDown, MousePointer2 } from 'lucide-react';

export function DragDropTutorial() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-blue-600" />
            Como usar o Drag & Drop
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-md">
              <GripVertical className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">1. Clique no ícone</p>
              <p className="text-muted-foreground">Use o ícone de grip (≡) na primeira coluna</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-md">
              <ArrowUpDown className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">2. Arraste</p>
              <p className="text-muted-foreground">Segure e arraste para a posição desejada</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-md">
              <MousePointer2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">3. Solte</p>
              <p className="text-muted-foreground">A ordem será salva automaticamente</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-blue-100 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>💡 Dica:</strong> Funciona com filtros! Você pode reordenar tarefas dentro de cada categoria.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}