'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Globe,
  MessageCircle,
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react';

export default function BrokerHome() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [stats] = useState({
    totalProperties: 24,
    activeProperties: 18,
    totalContacts: 45,
    activeContacts: 32,
    totalGroups: 8,
    activeGroups: 6,
    monthlyViews: 156,
    conversionRate: 12.5
  });

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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel do Corretor</h1>
        <p className="text-gray-600 mt-2">Bem-vindo de volta! Aqui está o resumo da sua atividade</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Imóveis Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProperties}</p>
                <p className="text-xs text-gray-500">de {stats.totalProperties} total</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contatos Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeContacts}</p>
                <p className="text-xs text-gray-500">de {stats.totalContacts} total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grupos Ativos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeGroups}</p>
                <p className="text-xs text-gray-500">de {stats.totalGroups} total</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-orange-600">{stats.conversionRate}%</p>
                <p className="text-xs text-gray-500">este mês</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/broker/properties">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Gerenciar Imóveis
              </CardTitle>
              <CardDescription>
                Adicione, edite e gerencie seu portfólio de imóveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stats.activeProperties} imóveis ativos</span>
                <Badge variant="secondary">Ver todos</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/broker/contacts">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gerenciar Contatos
              </CardTitle>
              <CardDescription>
                Acompanhe leads e mantenha contato com clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stats.activeContacts} contatos ativos</span>
                <Badge variant="secondary">Ver todos</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/broker/groups">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Gerenciar Grupos
              </CardTitle>
              <CardDescription>
                Organize colaborações e compartilhe imóveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stats.activeGroups} grupos ativos</span>
                <Badge variant="secondary">Ver todos</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/broker/page">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Página Pública
              </CardTitle>
              <CardDescription>
                Personalize sua página para clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Personalizar perfil</span>
                <Badge variant="secondary">Editar</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Relatórios
            </CardTitle>
            <CardDescription>
              Análises e métricas de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visualizar métricas</span>
              <Badge variant="secondary">Em breve</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>
              Preferências e configurações da conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ajustar configurações</span>
              <Badge variant="secondary">Em breve</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações e interações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo imóvel adicionado</p>
                  <p className="text-xs text-gray-500">Apartamento 2 quartos - Centro</p>
                </div>
                <span className="text-xs text-gray-400">2h atrás</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Contato atualizado</p>
                  <p className="text-xs text-gray-500">João Silva - preferências atualizadas</p>
                </div>
                <span className="text-xs text-gray-400">5h atrás</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo grupo criado</p>
                  <p className="text-xs text-gray-500">Família Costa - Casa Jardins</p>
                </div>
                <span className="text-xs text-gray-400">1 dia atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Ações</CardTitle>
            <CardDescription>Lembretes e tarefas pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reativar contatos inativos</p>
                  <p className="text-xs text-gray-500">3 contatos sem atividade há 7+ dias</p>
                </div>
                <Badge variant="outline" className="text-xs">Hoje</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Atualizar destaques</p>
                  <p className="text-xs text-gray-500">Adicionar novos imóveis à página pública</p>
                </div>
                <Badge variant="outline" className="text-xs">Esta semana</Badge>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Enviar newsletter</p>
                  <p className="text-xs text-gray-500">Novos imóveis similares para leads</p>
                </div>
                <Badge variant="outline" className="text-xs">Próxima semana</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
