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
import { 
  Users, 
  Plus, 
  Search, 
  MessageCircle, 
  Building2, 
  Calendar,
  UserPlus,
  Settings,
  Eye,
  Share2,
  TrendingUp
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  propertyCount: number;
  lastActivity: string;
  status: 'active' | 'inactive';
  members: GroupMember[];
  properties: GroupProperty[];
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'lead' | 'broker';
  joinedAt: string;
  lastSeen: string;
}

interface GroupProperty {
  id: string;
  title: string;
  price: number;
  addedBy: string;
  addedAt: string;
}

export default function BrokerGroups() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedGroup, setSelectedGroup] = useState<Group | null>(null); // TODO: Implementar seleção de grupo

  // useEffect(() => {
  //   if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
  //     router.push('/app');
  //   }
  // }, [userRole, loading, router]);

  // Mock data - substituir por dados reais
  useEffect(() => {
    const mockGroups: Group[] = [
      {
        id: '1',
        name: 'Família Silva - Casa Jardins',
        description: 'Grupo para família Silva buscando casa na região dos Jardins',
        memberCount: 4,
        propertyCount: 12,
        lastActivity: '2024-01-20T10:30:00Z',
        status: 'active',
        members: [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@email.com',
            role: 'lead',
            joinedAt: '2024-01-10',
            lastSeen: '2024-01-20T10:30:00Z'
          },
          {
            id: '2',
            name: 'Maria Silva',
            email: 'maria@email.com',
            role: 'lead',
            joinedAt: '2024-01-10',
            lastSeen: '2024-01-20T09:15:00Z'
          },
          {
            id: '3',
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            role: 'lead',
            joinedAt: '2024-01-12',
            lastSeen: '2024-01-19T16:45:00Z'
          }
        ],
        properties: [
          {
            id: '1',
            title: 'Casa 3 quartos - Jardins',
            price: 1200000,
            addedBy: 'João Silva',
            addedAt: '2024-01-15'
          },
          {
            id: '2',
            title: 'Casa 4 quartos - Jardim Paulista',
            price: 1500000,
            addedBy: 'Maria Silva',
            addedAt: '2024-01-16'
          }
        ]
      },
      {
        id: '2',
        name: 'Investidores SP',
        description: 'Grupo para investidores interessados em imóveis em São Paulo',
        memberCount: 8,
        propertyCount: 25,
        lastActivity: '2024-01-19T14:20:00Z',
        status: 'active',
        members: [
          {
            id: '4',
            name: 'Ana Costa',
            email: 'ana@email.com',
            role: 'lead',
            joinedAt: '2024-01-05',
            lastSeen: '2024-01-19T14:20:00Z'
          }
        ],
        properties: []
      },
      {
        id: '3',
        name: 'Primeira Casa - Zona Sul',
        description: 'Jovens casais buscando primeira casa na zona sul',
        memberCount: 6,
        propertyCount: 18,
        lastActivity: '2024-01-18T11:00:00Z',
        status: 'inactive',
        members: [],
        properties: []
      }
    ];
    setGroups(mockGroups);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    return null;
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
    );
  };

  const getMemberInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Grupos</h1>
              <p className="text-gray-600 mt-2">Gerencie grupos de clientes e colaborações</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar Novo Grupo
            </Button>
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
                  <p className="text-2xl font-bold text-green-600">
                    {groups.filter(g => g.status === 'active').length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {groups.reduce((acc, g) => acc + g.memberCount, 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Imóveis Compartilhados</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {groups.reduce((acc, g) => acc + g.propertyCount, 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar grupos por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{group.name}</CardTitle>
                    <CardDescription className="mb-3">{group.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{group.memberCount} membros</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{group.propertyCount} imóveis</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(group.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(group.status)}
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Members Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Membros Recentes</h4>
                  <div className="flex items-center gap-2">
                    {group.members.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {getMemberInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {group.memberCount > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{group.memberCount - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Grupo
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Mensagens
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando seu primeiro grupo de clientes'
                }
              </p>
              {!searchTerm && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Grupo
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
