"use client";

import { useState, useEffect } from "react";
import { 
  UserIcon, 
  BellIcon, 
  MessageCircleIcon, 
  MapPinIcon,
  Building2Icon,
  CheckIcon,
  XIcon,
  Loader2Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, userRole, fetchUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneE164: '',
    city: ''
  });

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

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const result = await fetchUserData();
        if (result.data) {
          setUserData(result.data);
          setFormData({
            name: result.data.name || '',
            phoneE164: result.data.phoneE164 || '',
            city: result.data.city || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user, fetchUserData]);

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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        // Recarregar dados do usuário
        const userResult = await fetchUserData();
        if (userResult.data) {
          setUserData(userResult.data);
        }
        // TODO: Mostrar toast de sucesso
        console.log('Perfil atualizado com sucesso');
      } else {
        const error = await response.json();
        console.error('Erro ao atualizar perfil:', error);
        // TODO: Mostrar toast de erro
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      // TODO: Mostrar toast de erro
    } finally {
      setSaving(false);
    }
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
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2Icon className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando dados do perfil...</p>
              </CardContent>
            </Card>
          ) : (
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
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                    <Input 
                      value={user?.email || ''} 
                      type="email" 
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Telefone</label>
                    <Input 
                      value={formData.phoneE164}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneE164: e.target.value }))}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Cidade</label>
                    <Input 
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>
                <Button disabled={saving} onClick={handleSaveProfile}>
                  {saving ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userData?.properties?.length || 0}
                  </div>
                  <div className="text-sm text-purple-700">Imóveis Salvos</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {userData?.memberships?.length || 0}
                  </div>
                  <div className="text-sm text-blue-700">Grupos Ativos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {userData?.lists?.length || 0}
                  </div>
                  <div className="text-sm text-green-700">Listas Criadas</div>
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
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                userData?.phoneE164 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    userData?.phoneE164 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {userData?.phoneE164 ? (
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <MessageCircleIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      userData?.phoneE164 ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {userData?.phoneE164 ? 'WhatsApp Conectado' : 'WhatsApp Não Conectado'}
                    </h4>
                    <p className={`text-sm ${
                      userData?.phoneE164 ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {userData?.phoneE164 || 'Nenhum telefone cadastrado'}
                    </p>
                    {userData?.phoneE164 && (
                      <p className="text-xs text-green-600">
                        Verificado: {userData?.verified ? 'Sim' : 'Não'}
                      </p>
                    )}
                  </div>
                </div>
                {userData?.phoneE164 ? (
                  <Button variant="outline" size="sm">
                    Desconectar
                  </Button>
                ) : (
                  <Button size="sm">
                    <MessageCircleIcon className="w-4 h-4 mr-2" />
                    Conectar
                  </Button>
                )}
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


            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
