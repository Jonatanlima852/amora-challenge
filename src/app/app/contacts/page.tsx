'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Phone, 
  Mail,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

interface PendingInvite {
  id: string;
  brokerId: string;
  brokerName: string;
  brokerEmail: string;
  brokerAvatar?: string;
  brokerCompany?: string;
  brokerBio?: string;
  brokerSlug?: string;
  notes?: string;
  invitedAt: string;
}

interface AcceptedInvite {
  id: string;
  brokerId: string;
  brokerName: string;
  brokerEmail: string;
  brokerAvatar?: string;
  brokerCompany?: string;
  brokerBio?: string;
  brokerSlug?: string;
  notes?: string;
  invitedAt: string;
  respondedAt: string;
}

interface ContactStats {
  pending: number;
  accepted: number;
  total: number;
}

export default function UserContacts() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [acceptedInvites, setAcceptedInvites] = useState<AcceptedInvite[]>([]);
  const [stats, setStats] = useState<ContactStats>({ pending: 0, accepted: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar convites da API
  useEffect(() => {
    if (userRole === 'USER') {
      fetchInvites();
    }
  }, [userRole]);

  const fetchInvites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contacts/invites');
      if (response.ok) {
        const data = await response.json();
        setPendingInvites(data.pendingInvites);
        setAcceptedInvites(data.acceptedInvites);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const respondToInvite = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch('/api/contacts/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId,
          action
        }),
      });

      if (response.ok) {
        // Recarregar convites
        await fetchInvites();
        // TODO: Mostrar toast de sucesso
      } else {
        const error = await response.json();
        // TODO: Mostrar toast de erro
        console.error('Erro ao responder convite:', error);
      }
    } catch (error) {
      console.error('Erro ao responder convite:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'USER') {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const getDaysSinceInvite = (dateString: string) => {
    const inviteDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - inviteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Convites de Corretores</h1>
            <p className="text-gray-600 mt-2">Gerencie suas conexões com corretores</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Convites Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Corretores Conectados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Convites</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Convites Pendentes */}
        {pendingInvites.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Convites Pendentes ({pendingInvites.length})
              </CardTitle>
              <CardDescription>
                Corretores que querem se conectar com você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <Card key={invite.id} className="border-orange-200 bg-orange-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar do Corretor */}
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={invite.brokerAvatar || ''} />
                          <AvatarFallback className="text-lg">
                            {getInitials(invite.brokerName)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Informações do Corretor */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{invite.brokerName}</h3>
                              {invite.brokerCompany && (
                                <p className="text-sm text-gray-600">{invite.brokerCompany}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-orange-600 border-orange-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {getDaysSinceInvite(invite.invitedAt)} dias atrás
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>Convite enviado: {formatDate(invite.invitedAt)}</p>
                            </div>
                          </div>

                          {/* Detalhes do Corretor */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{invite.brokerEmail}</span>
                              </div>
                              {invite.brokerBio && (
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium">Sobre:</p>
                                  <p>{invite.brokerBio}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {invite.notes && (
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium">Mensagem do corretor:</p>
                                  <p className="italic">"{invite.notes}"</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => respondToInvite(invite.id, 'accept')}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Aceitar Convite
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => respondToInvite(invite.id, 'decline')}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Recusar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Corretores Conectados */}
        {acceptedInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Corretores Conectados ({acceptedInvites.length})
              </CardTitle>
              <CardDescription>
                Corretores com quem você está conectado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {acceptedInvites.map((invite) => (
                  <Card key={invite.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar do Corretor */}
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={invite.brokerAvatar || ''} />
                          <AvatarFallback className="text-lg">
                            {getInitials(invite.brokerName)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Informações do Corretor */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{invite.brokerName}</h3>
                              {invite.brokerCompany && (
                                <p className="text-sm text-gray-600">{invite.brokerCompany}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Conectado
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>Conectado em: {formatDate(invite.respondedAt)}</p>
                            </div>
                          </div>

                          {/* Detalhes do Corretor */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{invite.brokerEmail}</span>
                              </div>
                              {invite.brokerBio && (
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium">Sobre:</p>
                                  <p>{invite.brokerBio}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {invite.notes && (
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium">Mensagem do corretor:</p>
                                  <p className="italic">"{invite.notes}"</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Enviar Mensagem
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Phone className="w-4 h-4 mr-2" />
                              Ligar
                            </Button>
                            {invite.brokerSlug && (
                              <Button variant="outline">
                                <Building2 className="w-4 h-4 mr-2" />
                                Ver Perfil
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado Vazio */}
        {!isLoading && pendingInvites.length === 0 && acceptedInvites.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum convite encontrado</h3>
              <p className="text-gray-600 mb-4">
                Quando corretores quiserem se conectar com você, os convites aparecerão aqui
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando convites...</p>
          </div>
        )}
      </div>
    </div>
  );
}
