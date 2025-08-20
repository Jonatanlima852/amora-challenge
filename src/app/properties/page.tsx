'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyList } from '@/components/property/PropertyList';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Link, Loader2, LogOut, SlidersHorizontal, Filter, Sparkles } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/contexts/AuthContext';
import { ParsedProperty } from '@/types/property';
import { toast } from 'sonner';
import { PhoneVerificationModal } from '@/components/auth/PhoneVerificationModal';
import { SyncAccountsModal } from '@/components/auth/SyncAccountsModal';
import { checkExistingUser } from '@/app/services';

export default function PropertiesPage() {
  const [newPropertyUrl, setNewPropertyUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'highScore' | 'budget'>('all');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [existingUserCount, setExistingUserCount] = useState<number>(0);
  const [phoneForSync, setPhoneForSync] = useState<string | null>(null);
  const { properties, loading, error, addProperty, refreshProperties } = useProperties();
  const { user, signOut } = useAuth();
  const router = useRouter();

  // ✅ PROTEÇÃO DE ROTA - REDIRECIONAR SE NÃO ESTIVER LOGADO
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // ✅ VERIFICAR SE USUÁRIO EXISTE NO PRISMA E QUAL MODAL ABRIR
  useEffect(() => {
    const checkUserInPrisma = async () => {
      if (!user) return;

      const userPhone = user.user_metadata?.phone as string | undefined;

      if (!userPhone) {
        setShowSyncModal(false);
        setShowPhoneModal(true);
        return;
      }

      const { exists, count } = await checkExistingUser(userPhone);
      if (exists) {
        setExistingUserCount(count);
        setPhoneForSync(userPhone);
        setShowPhoneModal(false);
        setShowSyncModal(true);
      } else {
        setShowSyncModal(false);
        setShowPhoneModal(true);
      }
    };

    checkUserInPrisma();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleAddProperty = async () => {
    if (!newPropertyUrl.trim()) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    try {
      setIsAdding(true);
      await addProperty(newPropertyUrl.trim());
      setNewPropertyUrl('');
      toast.success('Imóvel adicionado com sucesso! Analisando...');
    } catch (error) {
      toast.error('Erro ao adicionar imóvel. Tente novamente.');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredProperties = useMemo(() => {
    if (filter === 'highScore') {
      return properties.filter((p) => (p.score ?? 0) >= 80);
    }
    if (filter === 'budget') {
      return properties.filter((p) => (p.price ?? Infinity) <= 500000);
    }
    return properties;
  }, [properties, filter]);

  const handlePropertyClick = (property: ParsedProperty) => {
    // TODO: Navegar para página de detalhes
    console.log('Clicou no imóvel:', property);
  };

  const handleCompare = (selectedProperties: ParsedProperty[]) => {
    // TODO: Abrir modal de comparação
    console.log('Comparar imóveis:', selectedProperties);
  };

  // ✅ MOSTRAR LOADING ENQUANTO VERIFICA AUTENTICAÇÃO
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  const handlePhoneVerified = async (phone: string) => {
    setShowPhoneModal(false);
    toast.success('Telefone verificado com sucesso!');
    // Recarregar propriedades após sincronização
    await refreshProperties();
  };

  const handleRequireAssociation = (phone: string, count: number) => {
    setShowPhoneModal(false);
    setPhoneForSync(phone);
    setExistingUserCount(count);
    setShowSyncModal(true);
  };

  const handleAssociated = async () => {
    setShowSyncModal(false);
    toast.success('Conta sincronizada com sucesso!');
    await refreshProperties();
  };

  const handleSkipAssociation = () => {
    setShowSyncModal(false);
    setShowPhoneModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Modal de Verificação de Telefone */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerified={handlePhoneVerified}
        onRequireAssociation={handleRequireAssociation}
      />

      {/* Modal de Sincronização de Contas */}
      {phoneForSync && (
        <SyncAccountsModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          phone={phoneForSync}
          count={existingUserCount}
          onAssociated={handleAssociated}
          onSkip={handleSkipAssociation}
        />
      )}

      {/* Hero/Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Seus imóveis</h1>
              <p className="text-blue-100 mt-2">Gerencie, compare e compartilhe os melhores achados com a aMORA</p>
              <div className="mt-4 inline-flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">Dica: use o botão Compartilhar para gerar uma imagem com CTA</span>
              </div>
            </div>
            <Button variant="secondary" onClick={handleSignOut} className="ml-4">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Adicionar Novo Imóvel */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Novo Imóvel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Input
                placeholder="Cole o link do anúncio do imóvel..."
                value={newPropertyUrl}
                onChange={(e) => setNewPropertyUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddProperty()}
                className="flex-1"
              />
              <Button 
                onClick={handleAddProperty}
                disabled={isAdding || !newPropertyUrl.trim()}
                className="min-w-[160px]"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Adicionar
                  </>
                )}
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Compatível com QuintoAndar, VivaReal, OLX e outros.</span>
              <div className="hidden md:flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <div className="space-x-2">
                  <Button size="sm" variant={filter==='all'?'default':'outline'} onClick={() => setFilter('all')}>Todos</Button>
                  <Button size="sm" variant={filter==='highScore'?'default':'outline'} onClick={() => setFilter('highScore')}>Score 80+</Button>
                  <Button size="sm" variant={filter==='budget'?'default':'outline'} onClick={() => setFilter('budget')}>Até R$ 500k</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        {properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-sm"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{properties.length}</div><div className="text-sm text-gray-600">Total de Imóveis</div></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{properties.filter(p => p.score && p.score >= 80).length}</div><div className="text-sm text-gray-600">Score Alto (80+)</div></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{properties.filter(p => p.price && p.price <= 500000).length}</div><div className="text-sm text-gray-600">Até R$ 500k</div></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{properties.filter(p => p.m2 && p.m2 >= 80).length}</div><div className="text-sm text-gray-600">80m²+</div></CardContent></Card>
          </div>
        )}

        {/* Filtros (mobile) */}
        <div className="md:hidden flex items-center justify-start gap-2 mb-4">
          <Button size="sm" variant={filter==='all'?'default':'outline'} onClick={() => setFilter('all')}>Todos</Button>
          <Button size="sm" variant={filter==='highScore'?'default':'outline'} onClick={() => setFilter('highScore')}>Score 80+</Button>
          <Button size="sm" variant={filter==='budget'?'default':'outline'} onClick={() => setFilter('budget')}>Até R$ 500k</Button>
        </div>

        {/* Lista de Imóveis */}
        <PropertyList
          properties={filteredProperties}
          loading={loading}
          onCompare={handleCompare}
          onPropertyClick={handlePropertyClick}
        />

        {/* Mensagem de Erro */}
        {error && (
          <div className="mt-8 text-center">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800">Erro: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={refreshProperties}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
