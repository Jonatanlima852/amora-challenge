'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Home, Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implementar reenvio de email
      toast.success('Email de verificação reenviado!');
    } catch (error) {
      toast.error('Erro ao reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para {user?.email}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email enviado com sucesso!
              </h3>
              <p className="text-gray-600 text-sm">
                Clique no link enviado para seu email para confirmar sua conta.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResendEmail}
              variant="outline" 
              className="w-full"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar email
                </>
              )}
            </Button>

            <Button 
              onClick={handleSignOut}
              variant="ghost" 
              className="w-full"
            >
              Voltar ao login
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Não recebeu o email?</p>
            <p>Verifique sua pasta de spam ou</p>
            <button 
              onClick={handleResendEmail}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              clique aqui para reenviar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
