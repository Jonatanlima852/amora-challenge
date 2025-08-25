"use client";

import { useEffect, useState } from "react";
import { AlertTriangleIcon, StarIcon, TrendingUpIcon, UsersIcon, Building2Icon, MapPinIcon, CarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Property {
  id: string;
  title: string;
  price: number;
  m2: number;
  condo: number;
  neigh: string;
  city: string;
  state: string;
  score: number;
  photos: any;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  members: any[];
  properties: any[];
  createdAt: string;
}

export default function AppHomePage() {
  const { user, userRole } = useAuth();
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastProperty, setLastProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar propriedades recentes
      const propertiesResponse = await fetch('/api/properties');
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        const properties = propertiesData.properties.slice(0, 3); // Últimas 3
        setRecentProperties(properties);
        
        if (properties.length > 0) {
          setLastProperty(properties[0]);
        }
      }

      // Buscar grupos
      const groupsResponse = await fetch('/api/groups');
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.groups.slice(0, 2)); // Últimos 2 grupos
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'há alguns minutos';
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInHours < 48) return 'há 1 dia';
    return `há ${Math.floor(diffInHours / 24)} dias`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      <div className="grid gap-4 md:grid-cols-2">
        {lastProperty && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangleIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">Último imóvel salvo</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {lastProperty.title} foi adicionado {formatDate(lastProperty.createdAt)}
                </p>
                <Link href="/app/properties" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
                  Ver detalhes →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUpIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-900">Novos similares encontrados</h3>
              <p className="text-sm text-green-700 mt-1">
                {recentProperties.length > 0 ? `${recentProperties.length} imóveis` : 'Nenhum imóvel'} similares ao seu perfil foram encontrados
              </p>
              <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                Ver opções
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA para comparação rápida */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Compare seus imóveis favoritos</h2>
              <p className="text-purple-100">
                Analise até 4 imóveis lado a lado com nosso sistema inteligente
              </p>
            </div>
            <Link href="/app/compare">
              <Button variant="secondary" size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                Comparar Agora
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Imóveis recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Imóveis Recentes</h2>
          <Link href="/app/properties" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Ver todos →
          </Link>
        </div>
        
        {recentProperties.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{property.title}</CardTitle>
                      <CardDescription>{property.city}, {property.state}</CardDescription>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        property.score >= 80 ? 'bg-green-100 text-green-800' :
                        property.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <StarIcon className="w-3 h-3 mr-1" />
                      {property.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-medium">{formatPrice(property.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Área:</span>
                      <span className="font-medium">{property.m2}m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Condomínio:</span>
                      <span className="font-medium">
                        {property.condo > 0 ? formatPrice(property.condo) : 'Incluso'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/app/properties/${property.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        Ver detalhes
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="px-2">
                      <StarIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Building2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-500 mb-4">
                Envie links de imóveis pelo WhatsApp para começar a usar o aMORA
              </p>
              <Button onClick={() => window.location.href = '/app/properties'}>
                <MapPinIcon className="w-4 h-4 mr-2" />
                Adicionar Primeiro Imóvel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grupos ativos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Grupos Ativos</h2>
          <Link href="/app/groups" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Ver todos →
          </Link>
        </div>
        
        {groups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">
                        {group.members.length} membro{group.members.length > 1 ? 's' : ''} • {group.properties.length} imóveis
                      </p>
                    </div>
                    <Link href={`/app/groups/${group.id}`}>
                      <Button size="sm" variant="outline">
                        Entrar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum grupo ativo</h3>
              <p className="text-gray-500 mb-4">
                Crie um grupo para colaborar com familiares ou corretores
              </p>
              <Link href="/app/groups">
                <Button>
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Criar Primeiro Grupo
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
