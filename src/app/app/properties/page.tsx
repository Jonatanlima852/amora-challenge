"use client";

import { useState } from "react";
import { FilterIcon, StarIcon, MapPinIcon, Building2Icon, CarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function PropertiesPage() {
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    m2Min: "",
    m2Max: "",
    neighborhood: "",
    type: "",
    parking: "",
  });

  const properties = [
    {
      id: 1,
      title: "Apartamento em Pinheiros",
      location: "Pinheiros, São Paulo",
      price: 450000,
      m2: 65,
      condo: 450,
      parking: 1,
      score: 78,
      photos: ["/placeholder.jpg"],
    },
    {
      id: 2,
      title: "Casa em Vila Madalena",
      location: "Vila Madalena, São Paulo",
      price: 850000,
      m2: 120,
      condo: 0,
      parking: 2,
      score: 85,
      photos: ["/placeholder.jpg"],
    },
    {
      id: 3,
      title: "Apartamento em Itaim Bibi",
      location: "Itaim Bibi, São Paulo",
      price: 1200000,
      m2: 85,
      condo: 800,
      parking: 1,
      score: 72,
      photos: ["/placeholder.jpg"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Imóveis</h1>
          <p className="text-gray-600">Gerencie e analise seus imóveis salvos</p>
        </div>
        <Link href="/app/compare">
          <Button>
            <StarIcon className="w-4 h-4 mr-2" />
            Comparar
          </Button>
        </Link>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Preço Mínimo</label>
              <Input
                placeholder="R$ 0"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Preço Máximo</label>
              <Input
                placeholder="R$ 1.000.000"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Área Mínima</label>
              <Input
                placeholder="0m²"
                value={filters.m2Min}
                onChange={(e) => setFilters({ ...filters, m2Min: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Área Máxima</label>
              <Input
                placeholder="200m²"
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
              <Button variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de imóveis */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
              <Building2Icon className="w-12 h-12 text-gray-400" />
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    {property.location}
                  </CardDescription>
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
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {(property.price / 1000).toFixed(0)}k
                  </span>
                  <span className="text-sm text-gray-500">{property.m2}m²</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Building2Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Condomínio:</span>
                    <span className="font-medium">
                      {property.condo > 0 ? `R$ ${property.condo}` : 'Incluso'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Vagas:</span>
                    <span className="font-medium">{property.parking}</span>
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

      {properties.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-gray-500 mb-4">
              Envie links de imóveis pelo WhatsApp para começar a usar o aMORA
            </p>
            <Button>
              <MapPinIcon className="w-4 h-4 mr-2" />
              Adicionar Primeiro Imóvel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
