'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Search, 
  MessageCircle, 
  Building2, 
  Star,
  CheckIcon,
  XIcon,
  ClockIcon,
  UserPlus,
  Settings,
  Eye,
  Share2,
  TrendingUp,
  MapPinIcon,
  Building2Icon,
  MessageCircleIcon,
  Share2Icon
} from 'lucide-react';

interface GroupMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  membershipRole: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invitedAt?: string;
  phoneE164?: string;
  avatar?: string;
}

interface Group {
  id: string;
  name: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  members: GroupMember[];
  properties: Array<{
  id: string;
  title: string;
  price: number;
    m2: number;
    score: number;
    photos: any;
    notes: string;
    favorite: boolean;
  addedAt: string;
  }>;
  createdAt: string;
  invitedAt?: string;
}

export default function BrokerGroups() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [respondingToInvite, setRespondingToInvite] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userRole === 'BROKER' || userRole === 'ADMIN') {
      fetchGroups();
    }
  }, [userRole]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await fetch('/api/broker/groups');
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      } else {
        console.error('Erro ao buscar grupos', response);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/broker/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGroups([data.group, ...groups]);
        setNewGroupName("");
        setNewGroupDescription("");
        setShowCreateDialog(false);
      } else {
        console.error('Erro ao criar grupo');
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
    } finally {
      setCreating(false);
    }
  };

  const respondToInvite = async (groupId: string, action: 'accept' | 'decline') => {
    try {
      setRespondingToInvite(groupId);
      
      // Encontrar o grupo
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      // Buscar o membership do corretor atual neste grupo
      const membership = group.members.find(m => m.userId === (userRole === 'ADMIN' ? 'ADMIN' : m.userId));
      if (!membership) return;

      // Enviar para a rota /api/broker/groups/[groupId]/members com memberId no corpo
      const response = await fetch(`/api/broker/groups/${groupId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action,
          memberId: membership.id 
        }),
      });

      if (response.ok) {
        // Atualizar o status do grupo localmente
        setGroups(prevGroups => 
          prevGroups.map(g => 
            g.id === groupId 
              ? { ...g, status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' }
              : g
          )
        );
        
        // Recarregar os grupos para atualizar a lista
        setTimeout(() => {
          fetchGroups();
        }, 500);
      } else {
        console.error('Erro ao responder ao convite');
      }
    } catch (error) {
      console.error('Erro ao responder ao convite:', error);
    } finally {
      setRespondingToInvite(null);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `R$ ${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `R$ ${(price / 1000).toFixed(0)}k`;
    }
    return `R$ ${price}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    return null;
  }

  if (loadingGroups) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Separar grupos ativos e convites pendentes
  const activeGroups = groups.filter(g => g.status === 'ACCEPTED');
  const pendingInvites = groups.filter(g => g.status === 'PENDING');

  // Filtrar grupos por busca
  const filteredActiveGroups = activeGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.members.some(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Grupos</h1>
              <p className="text-gray-600 mt-2">
                Colabore com clientes para encontrar o imóvel ideal
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Grupo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Grupo</DialogTitle>
                  <DialogDescription>
                    Crie um grupo para colaborar com clientes na busca por imóveis.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nome do Grupo
                    </label>
                    <Input
                      placeholder="Ex: Família Silva - Casa Jardins"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descrição (opcional)
                    </label>
                    <Input
                      placeholder="Ex: Grupo para família Silva buscando casa na região dos Jardins"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                  </div>
            </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createGroup} disabled={creating || !newGroupName.trim()}>
                    {creating ? 'Criando...' : 'Criar Grupo'}
            </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Grupos</p>
                  <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Grupos Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{activeGroups.length}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Convites Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingInvites.length}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {groups.reduce((acc, g) => acc + g.members.filter(m => m.role === 'USER').length, 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Convites Pendentes */}
        {pendingInvites.length > 0 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Convites Pendentes</h2>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {pendingInvites.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingInvites.map((group) => (
                <Card key={group.id} className="border-amber-200 bg-amber-50 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-amber-900">{group.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 text-amber-700">
                          <ClockIcon className="w-4 h-4" />
                          Convite enviado em {group.invitedAt ? formatDate(group.invitedAt) : 'data desconhecida'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Pendente
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Membros */}
                    <div>
                      <h4 className="font-medium text-amber-900 mb-2">Membros:</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.members.map((member) => (
                          <Badge key={member.id} variant="outline" className="text-xs border-amber-300 text-amber-700">
                            {member.name}
                            {member.membershipRole === 'OWNER' && (
                              <span className="ml-1 text-amber-600">👑</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Ações para convite */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => respondToInvite(group.id, 'accept')}
                        disabled={respondingToInvite === group.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {respondingToInvite === group.id ? 'Aceitando...' : 'Aceitar Convite'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => respondToInvite(group.id, 'decline')}
                        disabled={respondingToInvite === group.id}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XIcon className="w-4 h-4 mr-2" />
                        {respondingToInvite === group.id ? 'Recusando...' : 'Recusar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar grupos por nome, membros ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Grupos Ativos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Meus Grupos Ativos</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeGroups.length}
            </Badge>
          </div>
          
          {filteredActiveGroups.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredActiveGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                        <CardTitle className="text-xl">{group.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                        <Users className="w-4 h-4" />
                          {group.members.length} membro{group.members.length > 1 ? 's' : ''}
                          <span className="mx-2">•</span>
                        <Building2 className="w-4 h-4" />
                          {group.properties.length} imóveis
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={
                          group.role === 'OWNER' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {group.role === 'OWNER' ? 'Proprietário' : 'Membro'}
                      </Badge>
                </div>
              </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Membros */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Membros:</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.members.map((member) => (
                          <Badge key={member.id} variant="outline" className="text-xs">
                            {member.name}
                            {member.membershipRole === 'OWNER' && (
                              <span className="ml-1 text-purple-600">👑</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Imóveis recentes */}
                    {group.properties.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Imóveis Recentes:</h4>
                        <div className="space-y-2">
                          {group.properties.slice(0, 3).map((property) => (
                            <div key={property.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                {property.photos && property.photos.length > 0 ? (
                                  <img 
                                    src={property.photos[0]} 
                                    alt={property.title}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <Building2 className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {property.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatPrice(property.price)} • {property.m2}m²
                                </p>
                              </div>
                              <Badge variant="secondary" className={getScoreColor(property.score)}>
                                <Star className="w-3 h-3 mr-1" />
                                {property.score || 'N/A'}
                      </Badge>
                            </div>
                          ))}
                          {group.properties.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{group.properties.length - 3} outros imóveis
                            </p>
                    )}
                  </div>
                </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/broker/groups/${group.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                    Ver Grupo
                  </Button>
                      </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          ) : (
          <Card className="text-center py-12">
            <CardContent>
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo ativo</h3>
                <p className="text-gray-500 mb-4">
                  {pendingInvites.length > 0 
                    ? 'Você tem convites pendentes acima. Aceite-os para começar a colaborar!'
                    : 'Crie seu primeiro grupo para colaborar com clientes na busca por imóveis'
                }
              </p>
                {pendingInvites.length === 0 && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Grupo
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        </div>

        {/* Informações sobre grupos */}
        <Card className="bg-blue-50 border-blue-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-2">Como funcionam os grupos?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Crie grupos</strong> para organizar buscas com clientes</li>
                  <li>• <strong>Convide clientes</strong> para receber sugestões especializadas</li>
                  <li>• <strong>Compartilhe imóveis</strong> e receba feedback dos clientes</li>
                  <li>• <strong>Colabore</strong> em tempo real com comentários e reações</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
