'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid3X3, List, BarChart3, Home } from 'lucide-react';
import { ParsedProperty } from '@/types/property';

interface PropertyListProps {
  properties: ParsedProperty[];
  onCompare?: (properties: ParsedProperty[]) => void;
  onPropertyClick?: (property: ParsedProperty) => void;
  loading?: boolean;
}

export function PropertyList({
  properties,
  onCompare,
  onPropertyClick,
  loading = false
}: PropertyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperties, setSelectedProperties] = useState<ParsedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<ParsedProperty[]>(properties);

  // Filtrar e ordenar propriedades
  useEffect(() => {
    let filtered = properties.filter(property =>
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neigh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'm2':
          return (b.m2 || 0) - (a.m2 || 0);
        case 'date':
          return new Date(b.parsedAt).getTime() - new Date(a.parsedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredProperties(filtered);
  }, [properties, searchTerm, sortBy]);

  const handlePropertySelect = (property: ParsedProperty) => {
    const isSelected = selectedProperties.some(p => p.id === property.id);
    
    if (isSelected) {
      setSelectedProperties(selectedProperties.filter(p => p.id !== property.id));
    } else if (selectedProperties.length < 4) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const handleCompare = () => {
    if (selectedProperties.length >= 2) {
      onCompare?.(selectedProperties);
    }
  };

  const handlePropertyClick = (property: ParsedProperty) => {
    onPropertyClick?.(property);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando imóveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Imóveis ({filteredProperties.length})</h2>
          {selectedProperties.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedProperties.length} selecionado{selectedProperties.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Botão Comparar */}
          {selectedProperties.length >= 2 && (
            <Button onClick={handleCompare} className="bg-blue-600 hover:bg-blue-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              Comparar ({selectedProperties.length})
            </Button>
          )}

          {/* Toggle de Visualização */}
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por título, bairro ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Melhor Score</SelectItem>
            <SelectItem value="price">Menor Preço</SelectItem>
            <SelectItem value="m2">Maior Metragem</SelectItem>
            <SelectItem value="date">Mais Recente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Imóveis */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum imóvel encontrado</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Adicione seu primeiro imóvel para começar!'}
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'space-y-4'
        }>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSelected={selectedProperties.some(p => p.id === property.id)}
              onCompare={handlePropertySelect}
              onPropertyClick={handlePropertyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
