"use client";

import { useState } from "react";
import { 
  StarIcon, 
  MapPinIcon, 
  Building2Icon, 
  CarIcon, 
  PlusIcon,
  Trash2Icon,
  BarChart3Icon,
  LightbulbIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function ComparePage() {
  const [selectedProperties, setSelectedProperties] = useState([
    {
      id: 1,
      title: "Apartamento em Pinheiros",
      location: "Pinheiros, São Paulo",
      price: 450000,
      m2: 65,
      condo: 450,
      iptu: 1200,
      rooms: 2,
      parking: 1,
      score: 78,
      pricePerM2: 6923,
    },
    {
      id: 2,
      title: "Casa em Vila Madalena",
      location: "Vila Madalena, São Paulo",
      price: 850000,
      m2: 120,
      condo: 0,
      iptu: 1800,
      rooms: 3,
      parking: 2,
      score: 85,
      pricePerM2: 7083,
    },
    {
      id: 3,
      title: "Apartamento em Itaim Bibi",
      location: "Itaim Bibi, São Paulo",
      price: 1200000,
      m2: 85,
      condo: 800,
      iptu: 2500,
      rooms: 2,
      parking: 1,
      score: 72,
      pricePerM2: 14118,
    },
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getBestValue = () => {
    return selectedProperties.reduce((best, current) => {
      const currentValue = current.score / (current.price / 1000000); // Score por milhão
      const bestValue = best.score / (best.price / 1000000);
      return currentValue > bestValue ? current : best;
    });
  };

  const bestValue = getBestValue();

  const removeProperty = (id: number) => {
    setSelectedProperties(prev => prev.filter(p => p.id !== id));
  };

  const addProperty = () => {
    // Em produção, abriria um modal para selecionar imóvel
    console.log("Adicionar imóvel");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comparar Imóveis</h1>
          <p className="text-gray-600">
            Analise até 4 imóveis lado a lado com nosso sistema inteligente
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProperties.length < 4 && (
            <Button onClick={addProperty}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          )}
          <Link href="/app/properties">
            <Button variant="outline">
              Ver Todos
            </Button>
          </Link>
        </div>
      </div>

      {/* Resumo IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <LightbulbIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-900 mb-2">Análise Inteligente</h3>
              <p className="text-purple-700">
                Para quem busca <strong>custo-benefício</strong>, a melhor opção é{' '}
                <strong>{bestValue.title}</strong> com Índice aMORA de {bestValue.score}/100.
                {bestValue.pricePerM2 < 8000 && ' Este imóvel oferece excelente valor por m²!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de comparação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5" />
            Comparação Detalhada
          </CardTitle>
          <CardDescription>
            {selectedProperties.length} imóveis selecionados para comparação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-700">Características</th>
                  {selectedProperties.map((property) => (
                    <th key={property.id} className="text-center p-3 font-medium text-gray-700 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{property.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProperty(property.id)}
                          className="w-6 h-6"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Localização */}
                <tr>
                  <td className="p-3 text-sm font-medium text-gray-600">Localização</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{property.location}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Preço */}
                <tr className="bg-gray-50">
                  <td className="p-3 text-sm font-medium text-gray-600">Preço</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(property.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        R$ {(property.pricePerM2).toFixed(0)}/m²
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Área */}
                <tr>
                  <td className="p-3 text-sm font-medium text-gray-600">Área</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <Building2Icon className="w-4 h-4 text-gray-400" />
                        <span>{property.m2}m²</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Quartos */}
                <tr className="bg-gray-50">
                  <td className="p-3 text-sm font-medium text-gray-600">Quartos</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-sm">
                      {property.rooms}
                    </td>
                  ))}
                </tr>

                {/* Vagas */}
                <tr>
                  <td className="p-3 text-sm font-medium text-gray-600">Vagas</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <CarIcon className="w-4 h-4 text-gray-400" />
                        <span>{property.parking}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Condomínio */}
                <tr className="bg-gray-50">
                  <td className="p-3 text-sm font-medium text-gray-600">Condomínio</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-sm">
                      {property.condo > 0 ? formatPrice(property.condo) : 'Incluso'}
                    </td>
                  ))}
                </tr>

                {/* IPTU */}
                <tr>
                  <td className="p-3 text-sm font-medium text-gray-600">IPTU (ano)</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center text-sm">
                      {formatPrice(property.iptu)}
                    </td>
                  ))}
                </tr>

                {/* Índice aMORA */}
                <tr className="bg-gray-50">
                  <td className="p-3 text-sm font-medium text-gray-600">Índice aMORA</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center">
                      <Badge 
                        variant="secondary" 
                        className={`${getScoreColor(property.score)} text-lg px-3 py-1`}
                      >
                        <StarIcon className="w-4 h-4 mr-1" />
                        {property.score}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Ações */}
                <tr>
                  <td className="p-3 text-sm font-medium text-gray-600">Ações</td>
                  {selectedProperties.map((property) => (
                    <td key={property.id} className="p-3 text-center">
                      <div className="space-y-2">
                        <Link href={`/app/properties/${property.id}`} className="w-full">
                          <Button size="sm" className="w-full">
                            Ver Detalhes
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="w-full">
                          <StarIcon className="w-4 h-4 mr-1" />
                          Favoritar
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo final */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(Math.min(...selectedProperties.map(p => p.price)))}
              </div>
              <div className="text-sm text-green-700">Menor Preço</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...selectedProperties.map(p => p.score))}
              </div>
              <div className="text-sm text-blue-700">Melhor Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(Math.min(...selectedProperties.map(p => p.pricePerM2 * 1000)))}
              </div>
              <div className="text-sm text-purple-700">Melhor Custo/m²</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
