"use client";

import { useState, useEffect } from "react";
import { FilterIcon, StarIcon, MapPinIcon, Building2Icon, CarIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";

interface Property {
  id: string;
  title: string;
  price: number;
  m2: number;
  condo: number;
  iptu: number;
  rooms: number;
  parking: number;
  neigh: string;
  city: string;
  state: string;
  score: number;
  photos: any;
  sourceUrl: string;
  status: string;
  createdAt: string;
}

interface Filters {
  priceMin: string;
  priceMax: string;
  m2Min: string;
  m2Max: string;
  neighborhood: string;
  type: string;
  parking: string;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priceMin: "",
    priceMax: "",
    m2Min: "",
    m2Max: "",
    neighborhood: "",
    type: "",
    parking: "",
  });

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties');
      
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
      } else {
        console.error('Erro ao buscar propriedades');
      }
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Filtro de preço mínimo
    if (filters.priceMin) {
      const minPrice = parseInt(filters.priceMin) * 1000; // Converter para centavos
      filtered = filtered.filter(p => p.price >= minPrice);
    }

    // Filtro de preço máximo
    if (filters.priceMax) {
      const maxPrice = parseInt(filters.priceMax) * 1000; // Converter para centavos
      filtered = filtered.filter(p => p.price <= maxPrice);
    }

    // Filtro de área mínima
    if (filters.m2Min) {
      const minArea = parseInt(filters.m2Min);
      filtered = filtered.filter(p => p.m2 && p.m2 >= minArea);
    }

    // Filtro de área máxima
    if (filters.m2Max) {
      const maxArea = parseInt(filters.m2Max);
      filtered = filtered.filter(p => p.m2 && p.m2 <= maxArea);
    }

    // Filtro de bairro
    if (filters.neighborhood) {
      filtered = filtered.filter(p => 
        p.neigh && p.neigh.toLowerCase().includes(filters.neighborhood.toLowerCase())
      );
    }

    // Filtro de vagas
    if (filters.parking) {
      const parkingValue = parseInt(filters.parking);
      if (parkingValue === 0) {
        filtered = filtered.filter(p => p.parking === 0);
      } else if (parkingValue === 1) {
        filtered = filtered.filter(p => p.parking === 1);
      } else if (parkingValue === 2) {
        filtered = filtered.filter(p => p.parking && p.parking >= 2);
      }
    }

    setFilteredProperties(filtered);
  };

  const clearFilters = () => {
    setFilters({
      priceMin: "",
      priceMax: "",
      m2Min: "",
      m2Max: "",
      neighborhood: "",
      type: "",
      parking: "",
    });
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Imóveis</h1>
          <p className="text-gray-600">
            {filteredProperties.length} de {properties.length} imóveis encontrados
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/compare">
            <Button>
              <StarIcon className="w-4 h-4 mr-2" />
              Comparar
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Adicionar por URL
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Preço Mínimo (R$k)</label>
              <Input
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Preço Máximo (R$k)</label>
              <Input
                placeholder="1000"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Área Mínima (m²)</label>
              <Input
                placeholder="0"
                value={filters.m2Min}
                onChange={(e) => setFilters({ ...filters, m2Min: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Área Máxima (m²)</label>
              <Input
                placeholder="200"
                value={filters.m2Max}
                onChange={(e) => setFilters({ ...filters, m2Max: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Bairro</label>
              <Input
                placeholder="Pinheiros"
                value={filters.neighborhood}
                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Vagas</label>
              <Select value={filters.parking} onValueChange={(value) => setFilters({ ...filters, parking: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sem vaga</SelectItem>
                  <SelectItem value="1">1 vaga</SelectItem>
                  <SelectItem value="2">2+ vagas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de imóveis */}
      {filteredProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                {property.photos && property.photos.length > 0 ? (
                  <img 
                    src={property.photos[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <Building2Icon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPinIcon className="w-4 h-4" />
                      {property.neigh && property.city ? `${property.neigh}, ${property.city}` : 'Localização não informada'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={getScoreColor(property.score)}
                  >
                    <StarIcon className="w-3 h-3 mr-1" />
                    {property.score || 'N/A'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(property.price)}
                    </span>
                    <span className="text-sm text-gray-500">{property.m2}m²</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Building2Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Condomínio:</span>
                      <span className="font-medium">
                        {property.condo > 0 ? formatPrice(property.condo) : 'Incluso'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Vagas:</span>
                      <span className="font-medium">{property.parking || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Link href={`/app/properties/${property.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="px-3">
                      <StarIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Building2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {properties.length === 0 ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel corresponde aos filtros'}
            </h3>
            <p className="text-gray-500 mb-4">
              {properties.length === 0 
                ? 'Envie links de imóveis pelo WhatsApp para começar a usar o aMORA'
                : 'Tente ajustar os filtros ou adicionar novos imóveis'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <MapPinIcon className="w-4 h-4 mr-2" />
              {properties.length === 0 ? 'Adicionar Primeiro Imóvel' : 'Adicionar Novo Imóvel'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar imóvel */}
      <AddPropertyDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onPropertyAdded={(property) => {
          setProperties([property, ...properties]);
          fetchProperties();
        }}
      />
    </div>
  );
}
