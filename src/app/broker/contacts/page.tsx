'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail,
  MapPin,
  Building2,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  UserPlus,
  Send
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  neighborhood?: string;
  status: 'active' | 'inactive' | 'prospect' | 'client';
  lastContact: string;
  lastActivity: string;
  propertyCount: number;
  totalValue: number;
  preferences: {
    propertyType: string[];
    maxPrice: number;
    minArea: number;
    neighborhoods: string[];
  };
  tags: string[];
  source: string;
}

export default function BrokerContacts() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // useEffect(() => {
  //   if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
  //     router.push('/app');
  //   }
  // }, [userRole, loading, router]);

  // Mock data - substituir por dados reais
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '+55 11 99999-9999',
        city: 'São Paulo',
        neighborhood: 'Jardins',
        status: 'active',
        lastContact: '2024-01-20T10:30:00Z',
        lastActivity: '2024-01-20T10:30:00Z',
        propertyCount: 8,
        totalValue: 4500000,
        preferences: {
          propertyType: ['casa', 'apartamento'],
          maxPrice: 1500000,
          minArea: 80,
          neighborhoods: ['Jardins', 'Vila Madalena', 'Pinheiros']
        },
        tags: ['Família', 'Primeira Casa', 'Jardins'],
        source: 'WhatsApp'
      },
      {
        id: '2',
        name: 'Maria Costa',
        email: 'maria@email.com',
        phone: '+55 11 88888-8888',
        city: 'São Paulo',
        neighborhood: 'Vila Madalena',
        status: 'prospect',
        lastContact: '2024-01-18T14:20:00Z',
        lastActivity: '2024-01-19T16:45:00Z',
        propertyCount: 3,
        totalValue: 1200000,
        preferences: {
          propertyType: ['apartamento'],
          maxPrice: 800000,
          minArea: 50,
          neighborhoods: ['Vila Madalena', 'Pinheiros']
        },
        tags: ['Solteira', 'Investimento'],
        source: 'Site'
      },
      {
        id: '3',
        name: 'Carlos Santos',
        email: 'carlos@email.com',
        phone: '+55 11 77777-7777',
        city: 'São Paulo',
        neighborhood: 'Centro',
        status: 'inactive',
        lastContact: '2024-01-10T09:15:00Z',
        lastActivity: '2024-01-12T11:30:00Z',
        propertyCount: 12,
        totalValue: 3200000,
        preferences: {
          propertyType: ['casa', 'sobrado'],
          maxPrice: 2000000,
          minArea: 120,
          neighborhoods: ['Centro', 'Bela Vista']
        },
        tags: ['Família', 'Mudança'],
        source: 'Indicação'
      },
      {
        id: '4',
        name: 'Ana Oliveira',
        email: 'ana@email.com',
        phone: '+55 11 66666-6666',
        city: 'São Paulo',
        neighborhood: 'Pinheiros',
        status: 'client',
        lastContact: '2024-01-15T16:00:00Z',
        lastActivity: '2024-01-20T08:45:00Z',
        propertyCount: 5,
        totalValue: 1800000,
        preferences: {
          propertyType: ['apartamento', 'studio'],
          maxPrice: 600000,
          minArea: 40,
          neighborhoods: ['Pinheiros', 'Vila Madalena']
        },
        tags: ['Jovem', 'Aluguel'],
        source: 'WhatsApp'
      }
    ];
    setContacts(mockContacts);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    return null;
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || contact.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      prospect: 'bg-blue-100 text-blue-800',
      client: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      prospect: 'Prospecto',
      client: 'Cliente'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const variants = {
      WhatsApp: 'bg-green-100 text-green-800',
      Site: 'bg-blue-100 text-blue-800',
      Indicação: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={variants[source as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {source}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDaysSinceLastContact = (dateString: string) => {
    const lastContact = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Contatos</h1>
              <p className="text-gray-600 mt-2">Gerencie seus leads e clientes</p>
            </div>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Adicionar Contato
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Contatos</p>
                  <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {contacts.filter(c => c.status === 'active' || c.status === 'prospect').length}
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
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {contacts.filter(c => c.status === 'client').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPrice(contacts.reduce((acc, c) => acc + c.totalValue, 0)).split(',')[0]}M
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="prospect">Prospectos</SelectItem>
                  <SelectItem value="client">Clientes</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Origens</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Site">Site</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Contact Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {getStatusBadge(contact.status)}
                          {getSourceBadge(contact.source)}
                          {getDaysSinceLastContact(contact.lastContact) > 7 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              <Clock className="w-3 h-3 mr-1" />
                              {getDaysSinceLastContact(contact.lastContact)} dias
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Último contato: {formatDate(contact.lastContact)}</p>
                        <p>Última atividade: {formatDate(contact.lastActivity)}</p>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{contact.neighborhood}, {contact.city}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{contact.propertyCount} imóveis salvos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4" />
                          <span>Valor total: {formatPrice(contact.totalValue)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Preço máximo: {formatPrice(contact.preferences.maxPrice)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Mensagem
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Ligar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contato encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro contato'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && (
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Contato
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
