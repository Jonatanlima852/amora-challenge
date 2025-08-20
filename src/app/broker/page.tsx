'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, BarChart3, Settings } from 'lucide-react';

export default function BrokerHome() {
  const { userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
      router.push('/properties');
    }
  }, [userRole, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel do Corretor</h1>
          <p className="text-gray-600 mt-2">Gerencie seus imóveis e clientes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Imóveis
              </CardTitle>
              <CardDescription>Gerencie seu portfólio</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/properties">
                <Button className="w-full">Ver Imóveis</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Clientes
              </CardTitle>
              <CardDescription>Gerencie seus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Em breve</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Relatórios
              </CardTitle>
              <CardDescription>Análises e métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Em breve</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
