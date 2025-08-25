"use client";

import { useState, use, useEffect } from "react";
import { 
  UsersIcon, 
  PlusIcon, 
  MapPinIcon, 
  StarIcon, 
  Building2Icon, 
  MessageCircleIcon, 
  Share2Icon,
  ArrowLeftIcon,
  UserPlusIcon,
  Trash2Icon,
  EditIcon,
  HeartIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface GroupMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  membershipRole: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ACTIVE' | 'INACTIVE';
  invitedBy?: string;
  invitedAt?: string;
  respondedAt?: string;
}

interface GroupProperty {
  id: string;
  title: string;
  price: number;
  m2: number;
  score: number;
  photos: any;
  notes: string;
  favorite: boolean;
  addedAt: string;
}

interface GroupList {
  id: string;
  name: string;
  isDefault: boolean;
  itemCount: number;
  items: GroupProperty[];
}

interface Group {
  id: string;
  name: string;
  role: string;
  members: GroupMember[];
  lists: GroupList[];
  createdAt: string;
}

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showAddPropertyDialog, setShowAddPropertyDialog] = useState(false);
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newPropertyUrl, setNewPropertyUrl] = useState("");
  const [newListName, setNewListName] = useState("");
  const [selectedListId, setSelectedListId] = useState<string>("default");
  const [addingMember, setAddingMember] = useState(false);
  const [addingProperty, setAddingProperty] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  
  // Desempacotar params usando React.use() (Next.js 15)
  const { groupId } = use(params);
  
  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);
  
  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}`);
      
      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
      } else {
        setError('Erro ao carregar grupo');
      }
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      setError('Erro ao carregar grupo');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      setAddingMember(true);
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newMemberEmail.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Atualizar lista de membros
        if (group) {
          setGroup({
            ...group,
            members: [...group.members, data.member]
          });
        }
        setNewMemberEmail("");
        setShowAddMemberDialog(false);
      } else {
        console.error('Erro ao adicionar membro');
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
    } finally {
      setAddingMember(false);
    }
  };

  const createList = async () => {
    if (!newListName.trim()) return;

    try {
      setCreatingList(true);
      const response = await fetch(`/api/groups/${groupId}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newListName.trim(),
          isDefault: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Recarregar dados do grupo
        fetchGroup();
        setNewListName("");
        setShowCreateListDialog(false);
      } else {
        console.error('Erro ao criar lista');
      }
    } catch (error) {
      console.error('Erro ao criar lista:', error);
    } finally {
      setCreatingList(false);
    }
  };

  const addProperty = async () => {
    if (!newPropertyUrl.trim()) return;

    try {
      setAddingProperty(true);
      const response = await fetch(`/api/groups/${groupId}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyUrl: newPropertyUrl.trim(),
          listId: selectedListId === "default" ? undefined : selectedListId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Recarregar dados do grupo para atualizar as listas
        fetchGroup();
        setNewPropertyUrl("");
        setShowAddPropertyDialog(false);
      } else {
        const errorData = await response.json();
        console.error('Erro ao adicionar propriedade:', errorData.error);
        alert(`Erro: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar propriedade:', error);
      alert('Erro ao adicionar imóvel');
    } finally {
      setAddingProperty(false);
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
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error || 'Grupo não encontrado'}
        </div>
        <Link href="/app/groups">
          <Button>Voltar para Grupos</Button>
        </Link>
      </div>
    );
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Recarregar dados do grupo
        fetchGroup();
      } else {
        console.error('Erro ao remover membro');
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            {group.members?.length || 0} membro{(group.members?.length || 0) > 1 ? 's' : ''} • 
            <Building2Icon className="w-4 h-4" />
            {group.lists?.reduce((total, list) => total + list.itemCount, 0) || 0} imóveis em {group.lists?.length || 0} lista{(group.lists?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2Icon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="properties">Imóveis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas do grupo */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{group.members.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Imóveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{group.lists?.reduce((total, list) => total + list.itemCount, 0) || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Listas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{group.lists?.length || 0}</div>
              </CardContent>
            </Card>
      <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Criado em</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDate(group.createdAt)}</div>
              </CardContent>
            </Card>
                  </div>

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Button onClick={() => setShowAddMemberDialog(true)} className="flex-1">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
                <Button onClick={() => setShowAddPropertyDialog(true)} variant="outline" className="flex-1">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Adicionar Imóvel
                </Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowCreateListDialog(true)} variant="outline" className="flex-1">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Criar Nova Lista
                </Button>
              </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Membros do Grupo</CardTitle>
                <CardDescription>
                  Gerencie quem tem acesso ao grupo
                  </CardDescription>
                </div>
              <Button onClick={() => setShowAddMemberDialog(true)} size="sm">
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Convites Pendentes */}
                {group.members.filter(m => m.status === 'PENDING').length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-amber-700 mb-2">Convites Pendentes</h4>
                    <div className="space-y-2">
                      {group.members
                        .filter(m => m.status === 'PENDING')
                        .map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border border-amber-200 rounded-lg bg-amber-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <UsersIcon className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-amber-600">{member.email}</p>
                                <p className="text-xs text-amber-500">
                                  Convite enviado em {formatDate(member.invitedAt || '')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                Pendente
                              </Badge>
                              {group.role === 'OWNER' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => removeMember(member.id)}
                                >
                                  <Trash2Icon className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Membros Ativos */}
                <h4 className="font-medium text-gray-700 mb-2">Membros Ativos</h4>
                {group.members
                  .filter(m => m.status === 'ACCEPTED')
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={
                            member.membershipRole === 'OWNER' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {member.membershipRole === 'OWNER' ? 'Proprietário' : 'Membro'}
                        </Badge>
                        {group.role === 'OWNER' && member.membershipRole !== 'OWNER' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Listas e Imóveis do Grupo</CardTitle>
                <CardDescription>
                  Organize os imóveis em listas personalizadas
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateListDialog(true)} size="sm" variant="outline">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nova Lista
                </Button>
                <Button onClick={() => setShowAddPropertyDialog(true)} size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Adicionar Imóvel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {group.lists && group.lists.length > 0 ? (
                <div className="space-y-6">
                  {group.lists.map((list) => (
                    <div key={list.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{list.name}</h4>
                          {list.isDefault && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Padrão
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            ({list.itemCount} imóvel{list.itemCount > 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>
                      
                      {list.items.length > 0 ? (
                        <div className="space-y-3">
                          {list.items.map((property) => (
                            <div key={property.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                {property.photos && property.photos.length > 0 ? (
                                  <img 
                                    src={property.photos[0]} 
                                    alt={property.title}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <Building2Icon className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {property.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatPrice(property.price)} • {property.m2}m²
                                </p>
                                <p className="text-xs text-gray-400">
                                  Adicionado em {formatDate(property.addedAt)}
                                </p>
                                {property.notes && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Nota: {property.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={getScoreColor(property.score)}>
                                  <StarIcon className="w-3 h-3 mr-1" />
                                  {property.score || 'N/A'}
                                </Badge>
                                <Link href={`/app/properties/${property.id}`}>
                                  <Button size="sm" variant="outline">
                                    Ver
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Building2Icon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Nenhum imóvel nesta lista</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2Icon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma lista criada ainda</p>
                  <p className="text-sm">Crie uma lista e adicione imóveis para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar membro */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro ao Grupo</DialogTitle>
            <DialogDescription>
              Digite o email da pessoa que você quer convidar para o grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email do Membro
              </label>
              <Input
                type="email"
                placeholder="exemplo@email.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
      </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addMember} disabled={addingMember || !newMemberEmail.trim()}>
              {addingMember ? 'Adicionando...' : 'Adicionar Membro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar propriedade */}
      <Dialog open={showAddPropertyDialog} onOpenChange={setShowAddPropertyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Imóvel ao Grupo</DialogTitle>
            <DialogDescription>
              Cole a URL do imóvel e escolha em qual lista adicionar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                URL do Imóvel
              </label>
              <Input
                placeholder="https://www.zapimoveis.com.br/imovel/..."
                value={newPropertyUrl}
                onChange={(e) => setNewPropertyUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Lista de Destino
              </label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma lista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Lista Padrão (criada automaticamente)</SelectItem>
                  {group?.lists?.filter(list => !list.isDefault).map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPropertyDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addProperty} disabled={addingProperty || !newPropertyUrl.trim()}>
              {addingProperty ? 'Adicionando...' : 'Adicionar Imóvel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar lista */}
      <Dialog open={showCreateListDialog} onOpenChange={setShowCreateListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Lista</DialogTitle>
            <DialogDescription>
              Crie uma nova lista para organizar os imóveis do grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nome da Lista
              </label>
              <Input
                placeholder="Ex: Imóveis para Visitar"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateListDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createList} disabled={creatingList || !newListName.trim()}>
              {creatingList ? 'Criando...' : 'Criar Lista'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
