'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Home,
  Car,
  Users,
  Calendar
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price?: number;
  m2?: number;
  condo?: number;
  iptu?: number;
  rooms?: number;
  parking?: number;
  neigh?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  photos?: any;
  score?: number;
  status: string;
  sourceUrl: string;
  description?: string;
  amenities?: any;
  lastParsedAt?: string;
  createdAt: string;
  updatedAt: string;
  lists: Array<{
    listId: string;
    listName: string;
    householdId?: string;
    householdName?: string;
  }>;
}

interface PropertyStats {
  total: number;
  active: number;
  pending: number;
  sold: number;
}

export default function BrokerPropertiesPage() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats>({ total: 0, active: 0, pending: 0, sold: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   // Só redireciona se não estiver carregando E o usuário não for corretor/admin
  //   if (!loading && userRole && userRole !== 'BROKER' && userRole !== 'ADMIN') {
  //     router.push('/app');
  //   }
  // }, [userRole, loading, router]);

      useEffect(() => {
      if (userRole === 'BROKER' || userRole === 'ADMIN') {
        fetchProperties();
      }
    }, [userRole]);

  const fetchProperties = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      const response = await fetch('/api/broker/properties');
      if (!response.ok) {
        throw new Error('Erro ao buscar propriedades');
      }
      
      const data = await response.json();
      if (data.success) {
        setProperties(data.properties);
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar propriedades:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Preço não informado';
    if (price >= 1000000) {
      return `R$ ${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `R$ ${(price / 1000).toFixed(0)}k`;
    }
    return `R$ ${price}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { label: 'Ativo', variant: 'default', color: 'bg-green-100 text-green-800' },
      'PENDING': { label: 'Pendente', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      'SOLD': { label: 'Vendido', variant: 'outline', color: 'bg-blue-100 text-blue-800' },
      'INACTIVE': { label: 'Inativo', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['INACTIVE'];
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.neigh?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando propriedades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar propriedades</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchProperties}>
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Imóveis</h1>
            <p className="text-gray-600 mt-2">Gerencie seu portfólio de imóveis</p>
          </div>
          <Link href="/broker/properties/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Imóvel
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendidos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por título, cidade ou bairro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="PENDING">Pendentes</option>
            <option value="SOLD">Vendidos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </div>

      {/* Lista de Propriedades */}
      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma propriedade encontrada</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando sua primeira propriedade'
                }
              </p>
              <Link href="/broker/properties/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Propriedade
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Imagem */}
                  <div className="w-full lg:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    {property.photos && property.photos.length > 0 ? (
                      <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {property.title || 'Título não informado'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          {property.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {property.neigh && property.city ? `${property.neigh}, ${property.city}` : property.city}
                            </div>
                          )}
                          {property.rooms && (
                            <div className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {property.rooms} quarto{property.rooms > 1 ? 's' : ''}
                            </div>
                          )}
                          {property.parking && (
                            <div className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {property.parking} vaga{property.parking > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(property.status)}
                        {property.score && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Score: {property.score}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Preço</p>
                        <p className="text-lg font-semibold text-green-600">{formatPrice(property.price)}</p>
                      </div>
                      {property.m2 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Área</p>
                          <p className="text-lg font-semibold text-gray-900">{property.m2}m²</p>
                        </div>
                      )}
                      {property.condo && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Condomínio</p>
                          <p className="text-lg font-semibold text-gray-900">R$ {property.condo}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-600">Adicionado</p>
                        <p className="text-sm text-gray-900">{formatDate(property.createdAt)}</p>
                      </div>
                    </div>

                    {/* Grupos */}
                    {property.lists.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Presente em grupos:</p>
                        <div className="flex flex-wrap gap-2">
                          {property.lists.map((list) => (
                            <Badge key={list.listId} variant="secondary" className="text-xs">
                              {list.householdName ? `${list.householdName} - ${list.listName}` : list.listName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Última atualização: {formatDate(property.updatedAt)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={`/broker/properties/${property.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/broker/properties/${property.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
