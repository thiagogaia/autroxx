'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ImpedimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (motivo: string) => void;
  initialMotivo?: string;
}

export function ImpedimentDialog({ isOpen, onClose, onSave, initialMotivo = '' }: ImpedimentDialogProps) {
  const [motivo, setMotivo] = useState(initialMotivo);

  const handleSave = () => {
    onSave(motivo);
    setMotivo('');
    onClose();
  };

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Motivo do Impedimento</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Descreva o motivo do impedimento..."
            className="resize-none h-24"
          />
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="destructive">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}