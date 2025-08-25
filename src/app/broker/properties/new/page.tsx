'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Link as LinkIcon, 
  MapPin, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function BrokerNewProperty() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [propertyUrl, setPropertyUrl] = useState('');
  const [parsingStatus, setParsingStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [parsedData, setParsedData] = useState<{
    title: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    parking: number;
    neighborhood: string;
    city: string;
    description: string;
    propertyType: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    neighborhood: '',
    city: '',
    description: '',
    propertyType: '',
    highlights: [] as string[]
  });

  useEffect(() => {
    if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
      router.push('/properties');
    }
  }, [userRole, loading, router]);

  const handleUrlSubmit = async () => {
    if (!propertyUrl) return;
    
    setIsLoading(true);
    setParsingStatus('parsing');
    
    // Simular parsing - substituir por chamada real da API
    setTimeout(() => {
      const mockParsedData = {
        title: 'Apartamento 2 quartos - Centro',
        price: 450000,
        area: 65,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        neighborhood: 'Centro',
        city: 'São Paulo',
        description: 'Excelente apartamento em localização privilegiada',
        propertyType: 'apartamento'
      };
      
      setParsedData(mockParsedData);
      setFormData({
        title: mockParsedData.title,
        price: mockParsedData.price.toString(),
        area: mockParsedData.area.toString(),
        bedrooms: mockParsedData.bedrooms.toString(),
        bathrooms: mockParsedData.bathrooms.toString(),
        parking: mockParsedData.parking.toString(),
        neighborhood: mockParsedData.neighborhood,
        city: mockParsedData.city,
        description: mockParsedData.description,
        propertyType: mockParsedData.propertyType,
        highlights: []
      });
      
      setParsingStatus('success');
      setIsLoading(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio - substituir por chamada real da API
    setTimeout(() => {
      setIsLoading(false);
      router.push('/broker/properties');
    }, 1500);
  };

  const addHighlight = () => {
    const highlight = prompt('Digite um destaque do imóvel:');
    if (highlight && !formData.highlights.includes(highlight)) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlight]
      }));
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/broker/properties">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Novo Imóvel</h1>
          <p className="text-gray-600 mt-2">Cadastre um novo imóvel no seu portfólio</p>
        </div>

        {/* URL Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Cadastro Rápido por URL
            </CardTitle>
            <CardDescription>
              Cole o link do imóvel e deixe nossa IA extrair as informações automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="https://www.olx.com.br/imovel/..."
                  value={propertyUrl}
                  onChange={(e) => setPropertyUrl(e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button 
                onClick={handleUrlSubmit} 
                disabled={!propertyUrl || isLoading}
                className="whitespace-nowrap"
              >
                {isLoading ? 'Processando...' : 'Extrair Dados'}
              </Button>
            </div>

            {/* Parsing Status */}
            {parsingStatus === 'parsing' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                  <span className="text-sm">Analisando imóvel...</span>
                </div>
              </div>
            )}

            {parsingStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Dados extraídos com sucesso! Revise e ajuste se necessário.</span>
                </div>
              </div>
            )}

            {parsingStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Erro ao extrair dados. Preencha manualmente.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Imóvel</CardTitle>
            <CardDescription>
              Preencha ou revise as informações do imóvel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Apartamento 2 quartos - Centro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">Tipo de Imóvel *</Label>
                  <Select 
                    value={formData.propertyType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="cobertura">Cobertura</SelectItem>
                      <SelectItem value="loft">Loft</SelectItem>
                      <SelectItem value="sobrado">Sobrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Ex: Centro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Ex: São Paulo"
                    required
                  />
                </div>
              </div>

              {/* Price and Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="450000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="65"
                    required
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parking">Vagas</Label>
                  <Input
                    id="parking"
                    type="number"
                    value={formData.parking}
                    onChange={(e) => setFormData(prev => ({ ...prev, parking: e.target.value }))}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parking">Tipo</Label>
                  <Select 
                    value={formData.propertyType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os principais atrativos do imóvel..."
                  rows={4}
                />
              </div>

              {/* Highlights */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Destaques</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addHighlight}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map((highlight, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeHighlight(index)}
                    >
                      {highlight}
                      <span className="ml-2 text-red-500">×</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Link href="/broker/properties">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Salvando...' : 'Salvar Imóvel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
