"use client";

import { useState, use, useEffect } from "react";

interface Property {
  id: string;
  title: string;
  price: number | null;
  m2: number | null;
  condo: number | null;
  iptu: number | null;
  rooms: number | null;
  parking: number | null;
  neigh: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  photos: string[] | null;
  score: number | null;
  scoreReasons: {
    pros: string[];
    cons: string[];
  } | null;
  description: string | null;
  amenities: string[] | null;
  sourceUrl: string | null;
  similarProperties: Array<{
    id: string;
    title: string;
    price: number;
    score: number;
  }> | null;
  status: string;
  createdAt: string;
}
import { 
  StarIcon, 
  MapPinIcon, 
  Building2Icon, 
  CarIcon, 
  UsersIcon,
  Share2Icon,
  HeartIcon,
  BarChart3Icon,
  ArrowLeftIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Desempacotar params usando React.use() (Next.js 15)
  const { id } = use(params);
  
  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);
  
  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setProperty(data.property);
      } else {
        setError('Erro ao carregar imóvel');
      }
    } catch (error) {
      console.error('Erro ao buscar imóvel:', error);
      setError('Erro ao carregar imóvel');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error || 'Imóvel não encontrado'}
        </div>
        <Link href="/app/properties">
          <Button>Voltar para Imóveis</Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return 'Não informado';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (!score || score === 0) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-600 flex items-center gap-1">
            <MapPinIcon className="w-4 h-4" />
            {property.neigh && property.city ? `${property.neigh}, ${property.city}, ${property.state}` : 'Localização não informada'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
            <HeartIcon className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon">
            <Share2Icon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Galeria e informações principais */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Galeria */}
        <div className="space-y-4">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <Building2Icon className="w-16 h-16 text-gray-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {property.photos && property.photos.length > 1 ? property.photos.slice(1).map((_: string, i: number) => (
              <div key={i} className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                <Building2Icon className="w-8 h-8 text-gray-400" />
              </div>
            )) : (
              <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                <Building2Icon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Informações principais */}
        <div className="space-y-6">
          {/* Preço e score */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-3xl font-bold text-gray-900">{formatPrice(property.price)}</span>
              <p className="text-gray-500">Venda</p>
            </div>
            <Badge variant="secondary" className={`text-lg px-4 py-2 ${getScoreColor(property.score)}`}>
              <StarIcon className="w-5 h-5 mr-2" />
              Índice aMORA: {property.score || 'N/A'}
            </Badge>
          </div>

          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building2Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Área:</span>
                  <span className="font-medium">{property.m2 || 'N/A'}m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Quartos:</span>
                  <span className="font-medium">{property.rooms || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Vagas:</span>
                  <span className="font-medium">{property.parking || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Condomínio:</span>
                  <span className="font-medium">{property.condo && property.condo > 0 ? formatPrice(property.condo) : 'Incluso'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="space-y-3">
            <Link href="/app/compare" className="w-full">
              <Button className="w-full" size="lg">
                <BarChart3Icon className="w-5 h-5 mr-2" />
                Adicionar à Comparação
              </Button>
            </Link>
            <Button variant="outline" className="w-full" size="lg">
              <UsersIcon className="w-5 h-5 mr-2" />
              Compartilhar com Grupo
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analysis">Análise IA</TabsTrigger>
          <TabsTrigger value="similar">Similares</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{property.description || 'Descrição não disponível'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comodidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {property.amenities ? property.amenities.map((amenity: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {amenity}
                  </Badge>
                )) : (
                  <Badge variant="secondary">Comodidades não informadas</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise do Índice aMORA</CardTitle>
              <CardDescription>
                Pontuação {property.score}/100 baseada em múltiplos fatores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Pontos Positivos</h4>
                  <ul className="space-y-1">
                    {property.scoreReasons?.pros ? property.scoreReasons.pros.map((pro: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {pro}
                      </li>
                    )) : (
                      <li className="text-sm text-gray-500">Análise em andamento...</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Pontos de Atenção</h4>
                  <ul className="space-y-1">
                    {property.scoreReasons?.cons ? property.scoreReasons.cons.map((con: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {con}
                      </li>
                    )) : (
                      <li className="text-sm text-gray-500">Análise em andamento...</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Imóveis Similares</CardTitle>
              <CardDescription>
                Outras opções com características similares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {property.similarProperties && property.similarProperties.length > 0 ? (
                  property.similarProperties.map((similar) => (
                    <div key={similar.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{similar.title}</h4>
                        <p className="text-sm text-gray-500">{formatPrice(similar.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={getScoreColor(similar.score)}>
                          {similar.score}
                        </Badge>
                        <Link href={`/app/properties/${similar.id}`}>
                          <Button size="sm" variant="outline">
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building2Icon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum imóvel similar encontrado</p>
                    <p className="text-sm">Adicione mais imóveis para ver comparações</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IPTU:</span>
                    <span className="font-medium">{property.iptu && property.iptu > 0 ? `${formatPrice(property.iptu)}/ano` : 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fonte:</span>
                    {property.sourceUrl ? (
                      <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        Ver anúncio original
                      </a>
                    ) : (
                      <span className="text-gray-500">Não disponível</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
