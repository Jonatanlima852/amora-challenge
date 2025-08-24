"use client";

import { useState } from "react";
import { 
  UserIcon, 
  BellIcon, 
  MessageCircleIcon, 
  MapPinIcon,
  Building2Icon,
  DollarSignIcon,
  SettingsIcon,
  CheckIcon,
  XIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [notifications, setNotifications] = useState({
    weeklyDigest: true,
    newSimilar: true,
    groupActivity: true,
    priceChanges: false,
    marketUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    maxPrice: 800000,
    minArea: 60,
    maxArea: 150,
    neighborhoods: ["Pinheiros", "Vila Madalena", "Itaim Bibi"],
    propertyTypes: ["apartment", "house"],
    minParking: 1,
  });

  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: true,
    phone: "+55 11 99999-9999",
    lastSync: "2 horas atrás",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const addNeighborhood = (neighborhood: string) => {
    if (neighborhood && !preferences.neighborhoods.includes(neighborhood)) {
      setPreferences(prev => ({
        ...prev,
        neighborhoods: [...prev.neighborhoods, neighborhood]
      }));
    }
  };

  const removeNeighborhood = (neighborhood: string) => {
    setPreferences(prev => ({
      ...prev,
      neighborhoods: prev.neighborhoods.filter(n => n !== neighborhood)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas preferências e configurações</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Nome</label>
                  <Input defaultValue="João Silva" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                  <Input defaultValue="joao.silva@email.com" type="email" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Telefone</label>
                  <Input defaultValue="+55 11 99999-9999" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Cidade</label>
                  <Input defaultValue="São Paulo" />
                </div>
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-purple-700">Imóveis Salvos</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <div className="text-sm text-blue-700">Grupos Ativos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-green-700">Comparações</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2Icon className="w-5 h-5" />
                Preferências de Imóveis
              </CardTitle>
              <CardDescription>
                Configure suas preferências para receber recomendações personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Faixa de preço */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Faixa de Preço</label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-gray-500">Mínimo</label>
                    <Input
                      type="number"
                      value={preferences.maxPrice / 1000}
                      onChange={(e) => updatePreference('maxPrice', parseInt(e.target.value) * 1000)}
                      placeholder="800"
                    />
                    <span className="text-xs text-gray-500">mil reais</span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Máximo</label>
                    <Input
                      type="number"
                      value={preferences.maxPrice / 1000}
                      onChange={(e) => updatePreference('maxPrice', parseInt(e.target.value) * 1000)}
                      placeholder="1500"
                    />
                    <span className="text-xs text-gray-500">mil reais</span>
                  </div>
                </div>
              </div>

              {/* Faixa de área */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Faixa de Área</label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-gray-500">Mínima</label>
                    <Input
                      type="number"
                      value={preferences.minArea}
                      onChange={(e) => updatePreference('minArea', parseInt(e.target.value))}
                      placeholder="60"
                    />
                    <span className="text-xs text-gray-500">m²</span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Máxima</label>
                    <Input
                      type="number"
                      value={preferences.maxArea}
                      onChange={(e) => updatePreference('maxArea', parseInt(e.target.value))}
                      placeholder="150"
                    />
                    <span className="text-xs text-gray-500">m²</span>
                  </div>
                </div>
              </div>

              {/* Bairros preferidos */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bairros Preferidos</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar bairro..."
                      onKeyPress={(e) => e.key === 'Enter' && addNeighborhood(e.currentTarget.value)}
                    />
                    <Button size="sm" onClick={() => addNeighborhood('Novo Bairro')}>
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.neighborhoods.map((neighborhood) => (
                      <Badge key={neighborhood} variant="secondary" className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {neighborhood}
                        <button
                          onClick={() => removeNeighborhood(neighborhood)}
                          className="ml-1 hover:text-red-600"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tipo de imóvel */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Imóvel</label>
                <Select
                  value={preferences.propertyTypes.join(',')}
                  onValueChange={(value) => updatePreference('propertyTypes', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vagas */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Vagas de Estacionamento</label>
                <Select
                  value={preferences.minParking.toString()}
                  onValueChange={(value) => updatePreference('minParking', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem vaga</SelectItem>
                    <SelectItem value="1">1 vaga</SelectItem>
                    <SelectItem value="2">2 vagas</SelectItem>
                    <SelectItem value="3">3+ vagas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button>Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Gerencie como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {key === 'weeklyDigest' && 'Resumo Semanal'}
                      {key === 'newSimilar' && 'Novos Imóveis Similares'}
                      {key === 'groupActivity' && 'Atividade nos Grupos'}
                      {key === 'priceChanges' && 'Mudanças de Preço'}
                      {key === 'marketUpdates' && 'Atualizações de Mercado'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {key === 'weeklyDigest' && 'Receba um resumo semanal dos melhores imóveis'}
                      {key === 'newSimilar' && 'Seja notificado sobre novos imóveis similares'}
                      {key === 'groupActivity' && 'Receba atualizações sobre atividades nos grupos'}
                      {key === 'priceChanges' && 'Seja notificado sobre mudanças de preço'}
                      {key === 'marketUpdates' && 'Receba insights sobre o mercado imobiliário'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateNotification(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleIcon className="w-5 h-5" />
                Integração WhatsApp
              </CardTitle>
              <CardDescription>
                Gerencie sua conexão com o WhatsApp para receber notificações e adicionar imóveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">WhatsApp Conectado</h4>
                    <p className="text-sm text-green-700">{whatsappStatus.phone}</p>
                    <p className="text-xs text-green-600">Última sincronização: {whatsappStatus.lastSync}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Desconectar
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Como usar:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                    Envie links de imóveis para nosso bot no WhatsApp
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                    Receba análises e pontuações instantaneamente
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                    Acesse todos os imóveis salvos no app
                  </li>
                </ul>
              </div>

              <Button className="w-full">
                <MessageCircleIcon className="w-4 h-4 mr-2" />
                Conectar WhatsApp
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
