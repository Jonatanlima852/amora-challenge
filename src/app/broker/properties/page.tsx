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
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Ruler, 
  Car,
  Star,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  neighborhood: string;
  city: string;
  score: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  imageUrl: string;
}

export default function BrokerProperties() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
      router.push('/properties');
    }
  }, [userRole, loading, router]);

  // Mock data - substituir por dados reais
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Apartamento 2 quartos - Centro',
        price: 450000,
        area: 65,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        neighborhood: 'Centro',
        city: 'São Paulo',
        score: 85,
        status: 'active',
        createdAt: '2024-01-15',
        imageUrl: '/placeholder.jpg'
      },
      {
        id: '2',
        title: 'Casa 3 quartos - Jardins',
        price: 1200000,
        area: 120,
        bedrooms: 3,
        bathrooms: 2,
        parking: 2,
        neighborhood: 'Jardins',
        city: 'São Paulo',
        score: 92,
        status: 'active',
        createdAt: '2024-01-10',
        imageUrl: '/placeholder.jpg'
      },
      {
        id: '3',
        title: 'Studio - Vila Madalena',
        price: 280000,
        area: 35,
        bedrooms: 1,
        bathrooms: 1,
        parking: 0,
        neighborhood: 'Vila Madalena',
        city: 'São Paulo',
        score: 78,
        status: 'pending',
        createdAt: '2024-01-20',
        imageUrl: '/placeholder.jpg'
      }
    ];
    setProperties(mockProperties);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    return null;
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Imóveis</h1>
              <p className="text-gray-600 mt-2">Gerencie seu portfólio de propriedades</p>
            </div>
            <Link href="/broker/properties/new">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Imóvel
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Imóveis</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {properties.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média de Score</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(properties.reduce((acc, p) => acc + p.score, 0) / properties.length)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
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
                    {formatPrice(properties.reduce((acc, p) => acc + p.price, 0)).split(',')[0]}M
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por título ou bairro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                <div className="absolute top-3 right-3">
                  {getStatusBadge(property.status)}
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-blue-600 text-white">
                    Score: {property.score}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.neighborhood}, {property.city}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{property.area}m²</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{property.bedrooms} quartos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">{property.parking} vagas</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro imóvel'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/broker/properties/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Imóvel
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
