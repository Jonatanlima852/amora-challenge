'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Verificando sua conta...');

        // Processar o callback do Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session?.user) {
          // Usuário autenticado com sucesso
          setStatus('success');
          setMessage('Conta verificada com sucesso! Redirecionando...');
          
          // Aguardar um pouco para mostrar a mensagem
          setTimeout(() => {
            router.push('/app');
          }, 2000);
        } else {
          // Usuário não autenticado
          setStatus('error');
          setMessage('Erro na verificação. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro no callback:', error);
        setStatus('error');
        setMessage('Erro na verificação da conta. Tente novamente.');
      }
    };

    handleAuthCallback();
  }, [router]);

  const handleRetry = () => {
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Verificação da Conta</CardTitle>
            <CardDescription>
              Processando sua verificação...
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
                <p className="text-gray-600">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold text-green-600">
                  Sucesso!
                </h3>
                <p className="text-gray-600">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h3 className="text-lg font-semibold text-red-600">
                  Erro na verificação
                </h3>
                <p className="text-gray-600">{message}</p>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                Tentar novamente
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                Voltar ao início
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
