"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Link as LinkIcon, TrendingUp, Target, User, LogIn, MessageCircle, BarChart3, Users, Star, BrainIcon, MapPinIcon, Building2Icon, CheckIcon, XIcon, AlertCircleIcon, LightbulbIcon, TargetIcon } from "lucide-react";
import Link from "next/link";

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
  propertyType: string;
  sourceUrl: string;
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
    recommendations: string;
    finalDecision: string;
  };
  propertyInsights: Array<{
    propertyId: string;
    insights: string[];
    score: number;
  }>;
}

export default function HomePage() {
  const [propertyUrls, setPropertyUrls] = useState(['', '', '', '', '']);
  const [comparing, setComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<Property[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...propertyUrls];
    newUrls[index] = value;
    setPropertyUrls(newUrls);
  };

  const compareProperties = async () => {
    const validUrls = propertyUrls.filter(url => url && url.trim() !== '');
    
    if (validUrls.length < 2) {
      alert('Selecione pelo menos 2 URLs de imóveis para comparar');
      return;
    }

    try {
      setComparing(true);
      const response = await fetch('/api/properties/compare-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyUrls: validUrls,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonData(data.properties);
        setAnalysis(data.analysis);
        setShowResults(true);
      } else {
        alert('Erro ao comparar propriedades');
      }
    } catch (error) {
      console.error('Erro ao comparar propriedades:', error);
      alert('Erro ao comparar propriedades');
    } finally {
      setComparing(false);
    }
  };

  const clearComparison = () => {
    setPropertyUrls(['', '', '', '', '']);
    setComparisonData([]);
    setAnalysis(null);
    setShowResults(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  aMORA
                </h1>
                <p className="text-sm text-gray-600">Encontre seu imóvel ideal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              
              <Link href="/auth/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <User className="w-4 h-4 mr-2" />
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforme links do WhatsApp em
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                análises inteligentes
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Cole o link do imóvel e receba análise completa com Índice aMORA, 
              comparações e insights para tomar a melhor decisão.
            </p>
            
            {/* WhatsApp CTA */}
            <div className="flex justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.open('https://wa.me/551152971796?text=Olá! Gostaria de analisar um imóvel com a aMORA.', '_blank')}
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                Enviar link por WhatsApp
              </Button>
            </div>
          </div>

          {/* Passos */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envie o link</h3>
              <p className="text-gray-600">
                Cole o link do imóvel no WhatsApp do aMORA
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receba insights</h3>
              <p className="text-gray-600">
                Análise completa com Índice aMORA e métricas
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare no app</h3>
              <p className="text-gray-600">
                Compare até 4 imóveis lado a lado
              </p>
            </div>
          </div>

          {/* Demo de comparação */}
          <Card className="max-w-5xl mx-auto mb-16 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BrainIcon className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Comparação Inteligente com IA
                </CardTitle>
              </div>
              <CardDescription className="text-lg">
                Teste a ferramenta de comparação com até 5 links - Sem necessidade de conta!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Links dos Imóveis</h4>
                  {propertyUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Input 
                        placeholder={`Link do imóvel ${index + 1}`}
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        className="pr-20"
                      />
                      {url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUrlChange(index, '')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Ação</h4>
                  <Button 
                    onClick={compareProperties} 
                    disabled={comparing || propertyUrls.filter(u => u.trim()).length < 2}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <BrainIcon className="w-5 h-5 mr-2" />
                    {comparing ? 'Analisando com IA...' : 'Comparar com IA'}
                  </Button>
                  
                  {showResults && (
                    <Button 
                      variant="outline" 
                      onClick={clearComparison}
                      className="w-full"
                    >
                      Nova Comparação
                    </Button>
                  )}
                  
                  <p className="text-sm text-gray-500 text-center">
                    ✨ Experimente gratuitamente sem criar conta
                  </p>
                </div>
              </div>

              {/* Resultados da comparação */}
              {showResults && comparisonData.length > 0 && analysis && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <BrainIcon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Resultado da Análise com IA</h3>
                  </div>
                  
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="summary">Resumo</TabsTrigger>
                      <TabsTrigger value="analysis">Análise Detalhada</TabsTrigger>
                      <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                      <TabsTrigger value="insights">Insights por Imóvel</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{analysis.summary.totalProperties}</div>
                          <div className="text-sm text-gray-600">Imóveis</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {analysis.summary.bestValueProperty ? '✓' : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Melhor Custo-Benefício</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {analysis.recommendations.filter(r => r.priority === 'high').length}
                          </div>
                          <div className="text-sm text-gray-600">Recomendações Importantes</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {analysis.propertyInsights.length}
                          </div>
                          <div className="text-sm text-gray-600">Insights Gerados</div>
                        </div>
                      </div>

                      {analysis.detailedAnalysis.executiveSummary && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <TargetIcon className="w-5 h-5 text-blue-600" />
                            Resumo Executivo da IA
                          </h4>
                          <p className="text-gray-700 text-lg leading-relaxed">{analysis.detailedAnalysis.executiveSummary}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                      {analysis.detailedAnalysis.categoryAnalysis && (
                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-3">Análise por Categoria</h4>
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{analysis.detailedAnalysis.categoryAnalysis}</p>
                        </div>
                      )}

                      {analysis.detailedAnalysis.finalDecision && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-3">Decisão Final da IA</h4>
                          <p className="text-green-800 text-lg leading-relaxed">{analysis.detailedAnalysis.finalDecision}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="recommendations" className="space-y-4">
                      <div className="space-y-3">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border shadow-sm">
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
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-3">Pontos Positivos</h4>
                          <ul className="space-y-2">
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
                        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-900 mb-3">Pontos de Atenção</h4>
                          <ul className="space-y-2">
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
                            <Card key={insight.propertyId} className="bg-gradient-to-br from-gray-50 to-white shadow-md">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{property?.title}</CardTitle>
                                  <Badge variant="secondary" className={getScoreColor(insight.score)}>
                                    <Star className="w-3 h-3 mr-1" />
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <LinkIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cole links facilmente</h3>
              <p className="text-gray-600">
                Envie links do WhatsApp e o aMORA faz o resto automaticamente
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compare e analise</h3>
              <p className="text-gray-600">
                Compare até 4 imóveis lado a lado com métricas padronizadas
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tome a decisão certa</h3>
              <p className="text-gray-600">
                Receba insights e resumos para escolher o melhor imóvel
              </p>
            </Card>
          </div>

          {/* Corretores parceiros */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">Corretores Parceiros</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">João Silva</h4>
                <p className="text-sm text-gray-600 mb-3">Especialista em imóveis residenciais</p>
                <div className="flex justify-center items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
              
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Maria Santos</h4>
                <p className="text-sm text-gray-600 mb-3">Especialista em imóveis comerciais</p>
                <div className="flex justify-center items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
              
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Pedro Costa</h4>
                <p className="text-sm text-gray-600 mb-3">Especialista em imóveis de luxo</p>
                <div className="flex justify-center items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl border-0">
            <CardContent className="p-10 text-center">
              <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
              <p className="text-blue-100 mb-8 text-lg">
                Crie sua conta gratuita e comece a analisar imóveis com inteligência artificial
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                    <User className="w-5 h-5 mr-2" />
                    Criar conta grátis
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold">
                    <LogIn className="w-5 h-5 mr-2" />
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}