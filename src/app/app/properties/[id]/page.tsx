"use client";

import { useState } from "react";
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

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Mock data - em produção viria da API
  const property = {
    id: params.id,
    title: "Apartamento em Pinheiros",
    location: "Pinheiros, São Paulo, SP",
    price: 450000,
    m2: 65,
    condo: 450,
    iptu: 1200,
    rooms: 2,
    parking: 1,
    score: 78,
    scoreReasons: {
      pros: ["Área acima da média para o bairro", "Preço competitivo", "Localização privilegiada"],
      cons: ["Condomínio alto", "IPTU elevado", "Poucas vagas"]
    },
    description: "Excelente apartamento em Pinheiros, próximo ao metrô e com todas as comodidades do bairro.",
    amenities: ["Academia", "Piscina", "Salão de festas", "Portaria 24h"],
    photos: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    sourceUrl: "https://example.com/property",
    similarProperties: [
      { id: 2, title: "Apartamento similar", price: 480000, score: 75 },
      { id: 3, title: "Outra opção", price: 420000, score: 72 },
    ]
  };

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
            {property.location}
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
            {property.photos.slice(1).map((_, i) => (
              <div key={i} className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                <Building2Icon className="w-8 h-8 text-gray-400" />
              </div>
            ))}
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
              Índice aMORA: {property.score}
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
                  <span className="font-medium">{property.m2}m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Quartos:</span>
                  <span className="font-medium">{property.rooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Vagas:</span>
                  <span className="font-medium">{property.parking}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Condomínio:</span>
                  <span className="font-medium">{formatPrice(property.condo)}</span>
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
              <p className="text-gray-700">{property.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comodidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
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
                    {property.scoreReasons.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Pontos de Atenção</h4>
                  <ul className="space-y-1">
                    {property.scoreReasons.cons.map((con, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {con}
                      </li>
                    ))}
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
                {property.similarProperties.map((similar) => (
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
                ))}
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
                    <span className="font-medium">{formatPrice(property.iptu)}/ano</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fonte:</span>
                    <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      Ver anúncio original
                    </a>
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
