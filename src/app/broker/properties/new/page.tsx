'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowLeft, 
  Save, 
  Link as LinkIcon,
  MapPin,
  Home,
  Car,
  DollarSign,
  Ruler,
  AlertCircle
} from 'lucide-react';

interface PropertyFormData {
  sourceUrl: string;
  title: string;
  price: string;
  m2: string;
  condo: string;
  iptu: string;
  rooms: string;
  parking: string;
  neigh: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
}

export default function NewPropertyPage() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<PropertyFormData>({
    sourceUrl: '',
    title: '',
    price: '',
    m2: '',
    condo: '',
    iptu: '',
    rooms: '',
    parking: '',
    neigh: '',
    city: '',
    state: '',
    zipCode: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    router.push('/app');
    return null;
  }

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sourceUrl.trim()) {
      setError('URL do imóvel é obrigatória');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/broker/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUrl: formData.sourceUrl.trim(),
          title: formData.title.trim() || undefined,
          price: formData.price ? parseInt(formData.price) : undefined,
          m2: formData.m2 ? parseInt(formData.m2) : undefined,
          condo: formData.condo ? parseInt(formData.condo) : undefined,
          iptu: formData.iptu ? parseInt(formData.iptu) : undefined,
          rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
          parking: formData.parking ? parseInt(formData.parking) : undefined,
          neigh: formData.neigh.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          zipCode: formData.zipCode.trim() || undefined,
          description: formData.description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/broker/properties');
        }, 2000);
      } else {
        setError(data.error || 'Erro ao criar propriedade');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
      console.error('Erro ao criar propriedade:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Propriedade Criada!</h2>
            <p className="text-gray-600 mb-6">
              Sua propriedade foi criada com sucesso e está sendo processada.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Redirecionando para a lista de propriedades...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Propriedade</h1>
          <p className="text-gray-600 mt-2">Adicione uma nova propriedade ao seu portfólio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados essenciais da propriedade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceUrl" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    URL do Imóvel *
                  </Label>
                  <Input
                    id="sourceUrl"
                    type="url"
                    placeholder="https://exemplo.com/imovel"
                    value={formData.sourceUrl}
                    onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Cole aqui o link da página do imóvel para análise automática
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Apartamento 2 quartos - Centro"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Deixe em branco para análise automática
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva as características principais do imóvel..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Localização
                </CardTitle>
                <CardDescription>
                  Endereço e localização da propriedade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neigh">Bairro</Label>
                    <Input
                      id="neigh"
                      placeholder="Ex: Centro"
                      value={formData.neigh}
                      onChange={(e) => handleInputChange('neigh', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="Ex: São Paulo"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      placeholder="Ex: SP"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      placeholder="Ex: 01234-567"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Características
                </CardTitle>
                <CardDescription>
                  Detalhes físicos da propriedade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Quartos</Label>
                    <Input
                      id="rooms"
                      type="number"
                      min="0"
                      placeholder="Ex: 2"
                      value={formData.rooms}
                      onChange={(e) => handleInputChange('rooms', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parking">Vagas de Estacionamento</Label>
                    <Input
                      id="parking"
                      type="number"
                      min="0"
                      placeholder="Ex: 1"
                      value={formData.parking}
                      onChange={(e) => handleInputChange('parking', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m2">Área (m²)</Label>
                  <Input
                    id="m2"
                    type="number"
                    min="0"
                    placeholder="Ex: 65"
                    value={formData.m2}
                    onChange={(e) => handleInputChange('m2', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Valores
                </CardTitle>
                <CardDescription>
                  Preços e taxas da propriedade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="Ex: 450000"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condo">Condomínio (R$)</Label>
                    <Input
                      id="condo"
                      type="number"
                      min="0"
                      placeholder="Ex: 350"
                      value={formData.condo}
                      onChange={(e) => handleInputChange('condo', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iptu">IPTU Anual (R$)</Label>
                    <Input
                      id="iptu"
                      type="number"
                      min="0"
                      placeholder="Ex: 1200"
                      value={formData.iptu}
                      onChange={(e) => handleInputChange('iptu', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Dicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    A URL é obrigatória para análise automática
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Preencha apenas os campos que você conhece
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Outros dados serão extraídos automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status inicial:</span>
                    <Badge variant="secondary">Pendente</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Análise:</span>
                    <Badge variant="outline">Automática</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || !formData.sourceUrl.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Criar Propriedade
                      </>
                    )}
                  </Button>
                  
                  <Link href="/broker/properties" className="block">
                    <Button variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Erro</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700 p-1 h-auto"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
