'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { syncUserWithDatabase } from '@/app/services';

interface SyncAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  count: number;
  onAssociated: () => void;
  onSkip: () => void;
}

export function SyncAccountsModal({ isOpen, onClose, phone, count, onAssociated, onSkip }: SyncAccountsModalProps) {
  const [loading, setLoading] = useState(false);

  const handleAssociate = async () => {
    setLoading(true);
    try {
      const { error } = await syncUserWithDatabase(phone, true);
      if (error) throw error;
      toast.success('Dados associados com sucesso!');
      onAssociated();
      onClose();
    } catch {
      toast.error('Erro ao associar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LinkIcon className="mr-2 h-5 w-5" />
            Sincronizar sua conta
          </DialogTitle>
          <DialogDescription>
            Encontramos dados existentes para este telefone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <AlertCircle className="mr-2 h-4 w-4 text-blue-600" />
                Dados Encontrados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                Encontramos {count} imóveis salvos para este telefone.
                Deseja associar esses dados à sua conta?
              </CardDescription>
            </CardContent>
          </Card>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={onSkip}
              disabled={loading}
              className="flex-1"
            >
              Não, começar do zero
            </Button>
            <Button 
              onClick={handleAssociate}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Sim, associar dados
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


