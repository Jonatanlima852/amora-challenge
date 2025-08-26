'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Home, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, session } = useAuth();
  const router = useRouter();

  useEffect(() => {  
    if (session?.user) {
      // Extrair o role do user_metadata da session
      const userRole = session.user.user_metadata?.role;
      
      if (userRole) {
        // Redirecionar baseado no role
        const destination = userRole === 'BROKER' || userRole === 'ADMIN' ? '/broker' : '/app';
        router.push(destination);
      }
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('Erro no login: ' + error);
      } else {
        toast.success('Login realizado! Verificando configurações...');
      }
    } catch (error) {
      toast.error('Erro inesperado no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
              <CardDescription>
                Faça login para acessar seus imóveis
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  'Entrando...'
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 w-4" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Registre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal será mostrado na página home */}
    </>
  );
}
