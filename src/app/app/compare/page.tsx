"use client";

import { useState, useEffect } from "react";
import { StarIcon, MapPinIcon, Building2Icon, CarIcon, CheckIcon, XIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

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

interface ComparisonAnalysis {
  summary: {
    totalProperties: number;
    averagePrice: number;
    averageArea: number;
    averageScore: number;
    bestValueProperty: string | null;
  };
  recommendations: Array<{
    type: string;
    message: string;
    propertyId?: string;
  }>;
}

export default function ComparePage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<Property[]>([]);
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

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

  const handlePropertySelection = (propertyId: string, checked: boolean) => {
    if (checked) {
      if (selectedProperties.length < 4) {
        setSelectedProperties([...selectedProperties, propertyId]);
      }
    } else {
      setSelectedProperties(selectedProperties.filter(id => id !== propertyId));
    }
  };

  const compareProperties = async () => {
    if (selectedProperties.length < 2) return;

    try {
      setComparing(true);
      const response = await fetch('/api/properties/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyIds: selectedProperties,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonData(data.properties);
        setAnalysis(data.analysis);
      } else {
        console.error('Erro ao comparar propriedades');
      }
    } catch (error) {
      console.error('Erro ao comparar propriedades:', error);
    } finally {
      setComparing(false);
    }
  };

  const clearComparison = () => {
    setSelectedProperties([]);
    setComparisonData([]);
    setAnalysis(null);
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Comparar Imóveis</h1>
          <p className="text-gray-600">
            Selecione entre 2 e 4 imóveis para comparar características e encontrar a melhor opção
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProperties.length >= 2 && (
            <Button onClick={compareProperties} disabled={comparing}>
              {comparing ? 'Comparando...' : 'Comparar Selecionados'}
            </Button>
          )}
          {comparisonData.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              Limpar Comparação
            </Button>
          )}
        </div>
      </div>

      {/* Seleção de propriedades */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Imóveis para Comparar</CardTitle>
          <CardDescription>
            {selectedProperties.length}/4 selecionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Card 
                key={property.id} 
                className={`cursor-pointer transition-all ${
                  selectedProperties.includes(property.id) 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handlePropertySelection(
                  property.id, 
                  !selectedProperties.includes(property.id)
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedProperties.includes(property.id)}
                      onCheckedChange={(checked) => handlePropertySelection(property.id, checked === true)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base">{property.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPinIcon className="w-4 h-4" />
                        {property.neigh && property.city ? `${property.neigh}, ${property.city}` : 'Localização não informada'}
                      </CardDescription>
                    </div>
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
                      <span className="text-gray-600">Score:</span>
                      <Badge variant="secondary" className={getScoreColor(property.score)}>
                        <StarIcon className="w-3 h-3 mr-1" />
                        {property.score || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultado da comparação */}
      {comparisonData.length > 0 && (
        <div className="space-y-6">
          {/* Análise */}
          {analysis && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircleIcon className="w-5 h-5 text-blue-600" />
                  Análise Comparativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analysis.summary.totalProperties}</div>
                      <div className="text-sm text-gray-600">Imóveis</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{formatPrice(analysis.summary.averagePrice)}</div>
                      <div className="text-sm text-gray-600">Preço Médio</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{analysis.summary.averageArea}m²</div>
                      <div className="text-sm text-gray-600">Área Média</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{analysis.summary.averageScore.toFixed(0)}</div>
                      <div className="text-sm text-gray-600">Score Médio</div>
                    </div>
                  </div>

                  {analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recomendações:</h4>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckIcon className="w-4 h-4 text-green-600" />
                            <span>{rec.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabela de comparação */}
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Comparação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Característica</th>
                      {comparisonData.map((property) => (
                        <th key={property.id} className="text-center p-3 font-medium">
                          {property.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Preço</td>
                      {comparisonData.map((property) => (
                        <td key={property.id} className="text-center p-3">
                          <span className="text-lg font-bold">{formatPrice(property.price)}</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Área</td>
                      {comparisonData.map((property) => (
                        <td key={property.id} className="text-center p-3">
                          {property.m2}m²
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Condomínio</td>
                      {comparisonData.map((property) => (
                        <td key={property.id} className="text-center p-3">
                          {property.condo > 0 ? formatPrice(property.condo) : 'Incluso'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Vagas</td>
                      {comparisonData.map((property) => (
                        <td key={property.id} className="text-center p-3">
                          {property.parking || 0}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Localização</td>
                      {comparisonData.map((property) => (
                        <td key={property.id} className="text-center p-3">
                          {property.neigh && property.city ? `${property.neigh}, ${property.city}` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Score aMORA</td>
                      {comparisonData.map((property) => (
                        <td key={property.id} className="text-center p-3">
                          <Badge variant="secondary" className={getScoreColor(property.score)}>
                            <StarIcon className="w-3 h-3 mr-1" />
                            {property.score || 'N/A'}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado vazio */}
      {properties.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel para comparar</h3>
            <p className="text-gray-500 mb-4">
              Adicione imóveis pelo WhatsApp para poder compará-los
            </p>
            <Button onClick={() => window.location.href = '/app/properties'}>
              <MapPinIcon className="w-4 h-4 mr-2" />
              Adicionar Primeiro Imóvel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
