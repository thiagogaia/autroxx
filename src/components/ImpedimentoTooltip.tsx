'use client';

import { ImpedimentoHistoryEntry } from '@/types/task';

interface ImpedimentoTooltipProps {
  historico: ImpedimentoHistoryEntry[];
  children: React.ReactNode;
}

export function ImpedimentoTooltip({ historico, children }: ImpedimentoTooltipProps) {
  if (!historico || historico.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground border border-border text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-64 z-50">
        <div className="space-y-1">
          {historico.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                entry.impedimento 
                  ? 'bg-orange-500' 
                  : 'bg-green-500'
              }`} />
              <span className="text-muted-foreground text-xs">
                {entry.timestamp.toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {entry.motivo && (
                <span className="text-foreground text-xs truncate max-w-32">
                  {entry.motivo}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
