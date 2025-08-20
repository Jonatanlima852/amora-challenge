'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Phone, Loader2 } from 'lucide-react';
import { checkExistingUser, sendVerificationCode, verifyPhone } from '@/app/services';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
  onRequireAssociation?: (phone: string, count: number) => void;
}

export function PhoneVerificationModal({ isOpen, onClose, onVerified, onRequireAssociation }: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { updatePhone } = useAuth();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handlePhoneSubmit = async () => {
    if (!phone.replace(/\D/g, '').match(/^\d{10,11}$/)) {
      toast.error('Telefone inválido');
      return;
    }

    setLoading(true);
    
    try {
      // Atualizar telefone no Supabase
      const { error } = await updatePhone(phone.replace(/\D/g, ''));
      if (error) throw error;

      // Verificar se já existe usuário com este telefone
      const { exists, count } = await checkExistingUser(phone.replace(/\D/g, ''));
      if (exists) {
        onRequireAssociation?.(phone.replace(/\D/g, ''), count);
        onClose();
        return;
      }

      // Enviar código de verificação
      await handleSendVerificationCode(phone.replace(/\D/g, ''));
      setStep('verification');
    } catch (error) {
      toast.error('Erro ao configurar telefone');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async (phoneNumber: string) => {
    try {
      const { error } = await sendVerificationCode(phoneNumber);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Código de verificação enviado para seu WhatsApp!');
      }
    } catch (error) {
      toast.error('Erro ao enviar código de verificação');
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode.trim()) {
      toast.error('Digite o código de verificação');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await verifyPhone(phone.replace(/\D/g, ''), verificationCode);
      if (error) throw error;

      toast.success('Telefone verificado com sucesso!');
      onVerified(phone.replace(/\D/g, ''));
      onClose();
    } catch (error) {
      toast.error('Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'phone') {
      onClose();
    } else {
      setStep('phone');
      setPhone('');
      setVerificationCode('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Phone className="mr-2 h-5 w-5" />
            Verificação de Telefone
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' && 'Configure seu número de WhatsApp para receber notificações'}
            {step === 'verification' && 'Digite o código enviado para seu WhatsApp'}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone (WhatsApp)</label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handlePhoneSubmit} 
              disabled={loading || !phone.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </div>
        )}

        {step === 'verification' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código de Verificação</label>
              <Input
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <Button 
              onClick={handleVerificationSubmit} 
              disabled={loading || !verificationCode.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>
          </div>
        )}

        {/* Associação foi movida para SyncAccountsModal */}
      </DialogContent>
    </Dialog>
  );
}


