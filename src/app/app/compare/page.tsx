"use client";

import { useState, useEffect } from "react";
import { StarIcon, MapPinIcon, Building2Icon, CarIcon, CheckIcon, XIcon, AlertCircleIcon, BrainIcon, TrendingUpIcon, TargetIcon, LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  photos: string[];
  sourceUrl: string;
  status: string;
  createdAt: string;
}

interface AIAnalysis {
  summary: {
    totalProperties: number;
    aiInsights: string;
    bestValueProperty: string | null;
  };
  recommendations: Array<{
    type: string;
    message: string;
    propertyId?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  detailedAnalysis: {
    executiveSummary: string;
    categoryAnalysis: string;
    personalizedRecommendations: string;
    finalDecision: string;
  };
  propertyInsights: Array<{
    propertyId: string;
    insights: string[];
    score: number;
  }>;
}

export default function ComparePage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<Property[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Comparar Imóveis com IA</h1>
          <p className="text-gray-600">
            Selecione entre 2 e 4 imóveis para uma análise inteligente e personalizada
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProperties.length >= 2 && (
            <Button onClick={compareProperties} disabled={comparing}>
              <BrainIcon className="w-4 h-4 mr-2" />
              {comparing ? 'Analisando com IA...' : 'Analisar com IA'}
            </Button>
          )}
          {comparisonData.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              Limpar Análise
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
                      <span className="flex justify-between text-sm"></span>
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

      {/* Resultado da análise com IA */}
      {comparisonData.length > 0 && analysis && (
        <div className="space-y-6">
          {/* Análise da IA */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <BrainIcon className="w-6 h-6" />
                Análise Inteligente com IA
              </CardTitle>
              <CardDescription className="text-blue-700">
                Insights personalizados baseados nas suas preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="analysis">Análise Detalhada</TabsTrigger>
                  <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                  <TabsTrigger value="insights">Insights por Imóvel</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{analysis.summary.totalProperties}</div>
                      <div className="text-sm text-gray-600">Imóveis</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.summary.bestValueProperty ? '✓' : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Melhor Custo-Benefício</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analysis.recommendations.filter(r => r.priority === 'high').length}
                      </div>
                      <div className="text-sm text-gray-600">Recomendações Importantes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {analysis.propertyInsights.length}
                      </div>
                      <div className="text-sm text-gray-600">Insights Gerados</div>
                    </div>
                  </div>

                  {analysis.detailedAnalysis.executiveSummary && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <TargetIcon className="w-4 h-4 text-blue-600" />
                        Resumo Executivo
                      </h4>
                      <p className="text-gray-700">{analysis.detailedAnalysis.executiveSummary}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  {analysis.detailedAnalysis.categoryAnalysis && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">Análise por Categoria</h4>
                      <p className="text-gray-700 whitespace-pre-line">{analysis.detailedAnalysis.categoryAnalysis}</p>
                    </div>
                  )}

                  {analysis.detailedAnalysis.finalDecision && (
                    <div className="bg-white p-4 rounded-lg border border-green-200 bg-green-50">
                      <h4 className="font-medium text-green-900 mb-2">Decisão Final da IA</h4>
                      <p className="text-green-800">{analysis.detailedAnalysis.finalDecision}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-gray-900">{rec.message}</p>
                          {rec.propertyId && (
                            <p className="text-sm text-gray-600 mt-1">
                              Imóvel: {comparisonData.find(p => p.id === rec.propertyId)?.title}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.prosAndCons.pros.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">Pontos Positivos</h4>
                      <ul className="space-y-1">
                        {analysis.prosAndCons.pros.map((pro, index) => (
                          <li key={index} className="flex items-center gap-2 text-green-800">
                            <CheckIcon className="w-4 h-4" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.prosAndCons.cons.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-900 mb-2">Pontos de Atenção</h4>
                      <ul className="space-y-1">
                        {analysis.prosAndCons.cons.map((con, index) => (
                          <li key={index} className="flex items-center gap-2 text-red-800">
                            <XIcon className="w-4 h-4" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {analysis.propertyInsights.map((insight) => {
                      const property = comparisonData.find(p => p.id === insight.propertyId);
                      return (
                        <Card key={insight.propertyId} className="bg-gradient-to-br from-gray-50 to-white">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{property?.title}</CardTitle>
                              <Badge variant="secondary" className={getScoreColor(insight.score)}>
                                <StarIcon className="w-3 h-3 mr-1" />
                                {insight.score || 'N/A'}
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              {property?.neigh}, {property?.city}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                <LightbulbIcon className="w-4 h-4 text-yellow-600" />
                                Insights da IA
                              </h5>
                              <ul className="space-y-1">
                                {insight.insights.map((insightText, index) => (
                                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {insightText}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Tabela de comparação tradicional */}
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
              Adicione imóveis pelo WhatsApp para poder compará-los com IA
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
