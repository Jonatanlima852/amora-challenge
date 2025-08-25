"use client";

import { useState, useEffect } from "react";
import { 
  UsersIcon, 
  PlusIcon, 
  MapPinIcon, 
  StarIcon, 
  Building2Icon, 
  MessageCircleIcon, 
  Share2Icon,
  CheckIcon,
  XIcon,
  ClockIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: string;
  membershipRole: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invitedAt?: string;
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

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [respondingToInvite, setRespondingToInvite] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups');
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      } else {
        console.error('Erro ao buscar grupos');
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGroups([data.group, ...groups]);
        setNewGroupName("");
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

      // Buscar o membership do usuário atual neste grupo
      const membership = group.members.find(m => m.email === user?.email);
      if (!membership) return;

      // Enviar para a rota /api/groups/[groupId]/members com memberId no corpo
      const response = await fetch(`/api/groups/${groupId}/members`, {
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

  if (loading) {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Grupos</h1>
          <p className="text-gray-600">
            Colabore com familiares e corretores para encontrar o imóvel ideal
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Criar Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription>
                Crie um grupo para colaborar com familiares ou corretores na busca por imóveis.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome do Grupo
                </label>
                <Input
                  placeholder="Ex: Família Silva"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
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

      {/* Convites Pendentes */}
      {pendingInvites.length > 0 && (
        <div className="space-y-4">
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

      {/* Grupos Ativos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Meus Grupos Ativos</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {activeGroups.length}
          </Badge>
        </div>
        
                {activeGroups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{group.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <UsersIcon className="w-4 h-4" />
                        {group.members.length} membro{group.members.length > 1 ? 's' : ''}
                        <span className="mx-2">•</span>
                        <Building2Icon className="w-4 h-4" />
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
                                <Building2Icon className="w-6 h-6 text-gray-400" />
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
                              <StarIcon className="w-3 h-3 mr-1" />
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
                    <Link href={`/app/groups/${group.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <MessageCircleIcon className="w-4 h-4 mr-2" />
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
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo ativo</h3>
              <p className="text-gray-500 mb-4">
                {pendingInvites.length > 0 
                  ? 'Você tem convites pendentes acima. Aceite-os para começar a colaborar!'
                  : 'Crie seu primeiro grupo para colaborar com familiares ou corretores na busca por imóveis'
                }
              </p>
              {pendingInvites.length === 0 && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Criar Primeiro Grupo
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informações sobre grupos */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">Como funcionam os grupos?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Crie grupos</strong> para organizar buscas com familiares</li>
                <li>• <strong>Adicione corretores</strong> para receber sugestões especializadas</li>
                <li>• <strong>Compartilhe imóveis</strong> e receba feedback da equipe</li>
                <li>• <strong>Colabore</strong> em tempo real com comentários e reações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
