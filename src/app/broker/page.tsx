'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBrokerStats } from '@/hooks/useBrokerStats';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Globe,
  MessageCircle,
  TrendingUp,
  Star,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function BrokerHome() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const { stats, recentActivity, loading: loadingStats, error } = useBrokerStats();
  
  // Estado local para compatibilidade com o código existente
  const [localStats, setLocalStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalContacts: 0,
    activeContacts: 0,
    totalGroups: 0,
    activeGroups: 0,
    monthlyViews: 0,
    conversionRate: 0
  });

  // useEffect(() => {
  //   // Só redireciona se não estiver carregando E o usuário não for corretor/admin
  //   if (!loading && userRole && userRole !== 'BROKER' && userRole !== 'ADMIN') {
  //     router.push('/app');
  //   }
  // }, [userRole, loading, router]);

  useEffect(() => {
    if (stats) {
      setLocalStats({
        totalProperties: stats.properties.total,
        activeProperties: stats.properties.active,
        pendingProperties: stats.properties.pending || 0,
        totalContacts: stats.contacts.total,
        activeContacts: stats.contacts.active,
        totalGroups: stats.groups.total,
        activeGroups: stats.groups.active,
        monthlyViews: stats.performance.monthlyViews,
        conversionRate: stats.performance.conversionRate
      });
    }
  }, [stats]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'há alguns minutos';
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInHours < 48) return 'há 1 dia';
    return `há ${Math.floor(diffInHours / 24)} dias`;
  };

      if (loading || loadingStats) {
      return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
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
                <p className="text-2xl font-bold text-gray-900">{localStats.activeProperties}</p>
                <p className="text-xs text-gray-500">de {localStats.totalProperties} total</p>
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
                <p className="text-2xl font-bold text-green-600">{localStats.activeContacts}</p>
                <p className="text-xs text-gray-500">de {localStats.totalContacts} total</p>
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
                <p className="text-2xl font-bold text-purple-600">{localStats.activeGroups}</p>
                <p className="text-xs text-gray-500">de {localStats.totalGroups} total</p>
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
                <p className="text-2xl font-bold text-orange-600">{localStats.conversionRate}%</p>
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
                <span className="text-sm text-gray-600">{localStats.activeProperties} imóveis ativos</span>
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
                <span className="text-sm text-gray-600">{localStats.activeContacts} contatos ativos</span>
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
                <span className="text-sm text-gray-600">{localStats.activeGroups} grupos ativos</span>
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
            <CardDescription>Últimas propriedades adicionadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'ACTIVE' ? 'bg-green-500' :
                      activity.status === 'PENDING' ? 'bg-yellow-500' :
                      activity.status === 'SOLD' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.location}</p>
                      {activity.price && (
                        <p className="text-xs text-green-600 font-medium">
                          R$ {activity.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
                </div>
              )}
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
              {localStats.pendingProperties > 0 && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Revisar propriedades pendentes</p>
                    <p className="text-xs text-gray-500">{localStats.pendingProperties} imóveis aguardando análise</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Urgente</Badge>
                </div>
              )}
              {localStats.totalContacts > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Contatar leads inativos</p>
                    <p className="text-xs text-gray-500">{Math.floor(localStats.totalContacts * 0.3)} contatos sem atividade</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Esta semana</Badge>
                </div>
              )}
              {localStats.activeProperties > 0 && (
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Atualizar destaques</p>
                    <p className="text-xs text-gray-500">Adicionar novos imóveis à página pública</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Esta semana</Badge>
                </div>
              )}
              {localStats.totalGroups === 0 && (
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Criar primeiro grupo</p>
                    <p className="text-xs text-gray-500">Organize seus clientes em grupos</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Recomendado</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
