'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Globe, 
  Edit, 
  Eye, 
  Building2, 
  MapPin, 
  DollarSign, 
  Star,
  Camera,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Plus,
  Save,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { ShareExportButtons } from '../_components/ShareExportButtons';

interface BrokerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  slug: string;
  avatar?: string;
  company?: string;
  specialties: string[];
  highlights: PropertyHighlight[];
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface PropertyHighlight {
  id: string;
  title: string;
  price: number;
  area: number;
  neighborhood: string;
  city: string;
  imageUrl: string;
  score: number;
}

export default function BrokerPage() {
  const { userRole, loading, user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<BrokerProfile>({
    id: user?.id || '',
    name: user?.user_metadata?.name || 'Seu Nome',
    email: user?.email || 'seu@email.com',
    phone: user?.phone || '+55 11 99999-9999',
    bio: 'Corretor especializado em imóveis residenciais. Conte um pouco sobre você e sua experiência...',
    slug: 'seu-slug',
    company: 'Sua Empresa',
    specialties: ['Residencial', 'Primeira Casa'],
    highlights: [],
    socialLinks: {
      whatsapp: '',
      instagram: '',
      linkedin: ''
    }
  });

  // Carregar perfil do banco de dados
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/broker/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            setProfile(prev => ({
              ...prev,
              ...data.profile,
              // Garantir que campos nunca sejam null
              name: data.profile.name || prev.name,
              bio: data.profile.bio || prev.bio,
              slug: data.profile.slug || prev.slug,
              company: data.profile.company || prev.company,
              phone: data.profile.phone || prev.phone,
              specialties: data.profile.specialties || prev.specialties,
              socialLinks: {
                whatsapp: data.profile.socialLinks?.whatsapp || prev.socialLinks.whatsapp,
                instagram: data.profile.socialLinks?.instagram || prev.socialLinks.instagram,
                linkedin: data.profile.socialLinks?.linkedin || prev.socialLinks.linkedin
              }
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    if (user?.email) {
      loadProfile();
    }
  }, [user?.email]);

  // useEffect(() => {
  //   if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
  //     router.push('/app');
  //   }
  // }, [userRole, loading, router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validações básicas
      if (!profile.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!profile.slug.trim()) {
        throw new Error('URL personalizada é obrigatória');
      }
      
      // Validar formato do slug (apenas letras, números e hífens)
      if (!/^[a-z0-9-]+$/.test(profile.slug)) {
        throw new Error('URL personalizada deve conter apenas letras minúsculas, números e hífens');
      }
      
      const response = await fetch('/api/broker/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: (profile.name ?? '').trim(),
          bio: (profile.bio ?? '').trim(),
          slug: (profile.slug ?? '').trim().toLowerCase(),
          company: profile.company?.trim() || null,
          specialties: (profile.specialties ?? []).filter(s => s.trim()),
          socialLinks: {
            whatsapp: profile.socialLinks.whatsapp?.trim() || null,
            instagram: profile.socialLinks.instagram?.trim() || null,
            linkedin: profile.socialLinks.linkedin?.trim() || null
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsEditing(false);
          // Atualizar o perfil com os dados retornados
          setProfile(prev => ({
            ...prev,
            ...data.profile,
            phone: data.profile.phone || prev.phone,
            specialties: data.profile.specialties || prev.specialties,
            socialLinks: data.profile.socialLinks || prev.socialLinks
          }));
          // Mostrar mensagem de sucesso
          setMessage({ type: 'success', text: 'Perfil salvo com sucesso!' });
          setTimeout(() => setMessage(null), 5000);
        } else {
          throw new Error(data.error || 'Erro ao salvar perfil');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      // Mostrar mensagem de erro
      setMessage({ 
        type: 'error', 
        text: `Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/c/${profile.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  };

  const handleNameChange = (name: string) => {
    setProfile(prev => ({ 
      ...prev, 
      name,
      // Gerar slug automaticamente se estiver vazio ou for o padrão
      slug: prev.slug === 'seu-slug' ? generateSlug(name) : prev.slug
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minha Página Pública</h1>
              <p className="text-gray-600 mt-2">Personalize e gerencie sua página pública para clientes</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/c/${profile.slug}`} target="_blank">
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visualizar
                </Button>
              </Link>
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Salvar' : 'Editar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mensagens de feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Perfil Público
                </CardTitle>
                <CardDescription>
                  Informações que aparecerão na sua página pública
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Alterar Foto
                    </Button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium mt-1">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={profile.company ?? ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                        className="mt-1"
                        placeholder="Nome da empresa"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profile.company ?? 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={profile.bio ?? ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1"
                        rows={4}
                        placeholder="Conte um pouco sobre você e sua experiência..."
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profile.bio ?? 'Biografia não informada'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Personalizada</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">amora.app/c/</span>
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            id="slug"
                            value={profile.slug}
                            onChange={(e) => setProfile(prev => ({ ...prev, slug: e.target.value }))}
                            className="flex-1"
                            placeholder="sua-url-personalizada"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setProfile(prev => ({ ...prev, slug: generateSlug(profile.name) }))}
                            className="whitespace-nowrap"
                          >
                            Gerar
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium">{profile.slug}</span>
                      )}
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Use apenas letras minúsculas, números e hífens. Ex: joao-silva
                      </p>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <Label>Especialidades</Label>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id="specialtyInput"
                          placeholder="Adicionar especialidade"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                             setProfile(prev => ({
                                 ...prev,
                                 specialties: [...(prev.specialties ?? []), e.currentTarget.value.trim()]
                               }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const input = document.getElementById('specialtyInput') as HTMLInputElement;
                            if (input && input.value.trim()) {
                                                           setProfile(prev => ({
                               ...prev,
                               specialties: [...(prev.specialties ?? []), input.value.trim()]
                             }));
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                                             <div className="flex flex-wrap gap-2">
                         {(profile.specialties ?? []).map((specialty, index) => (
                           <Badge key={index} variant="secondary" className="group">
                             {specialty}
                             <button
                               onClick={() => setProfile(prev => ({
                                 ...prev,
                                 specialties: (prev.specialties ?? []).filter((_, i) => i !== index)
                               }))}
                               className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                             >
                               ×
                             </button>
                           </Badge>
                         ))}
                       </div>
                    </div>
                  ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                       {(profile.specialties ?? []).length > 0 ? (
                         profile.specialties.map((specialty, index) => (
                           <Badge key={index} variant="secondary">
                             {specialty}
                           </Badge>
                         ))
                       ) : (
                         <span className="text-gray-500 text-sm">Nenhuma especialidade definida</span>
                       )}
                     </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <Label>Links Sociais</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">WhatsApp:</span>
                      {isEditing ? (
                        <Input
                          value={profile.socialLinks.whatsapp ?? ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, whatsapp: e.target.value }
                          }))}
                          placeholder="+5511999999999"
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-sm">{profile.socialLinks.whatsapp ?? 'Não informado'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">Instagram:</span>
                      {isEditing ? (
                        <Input
                          value={profile.socialLinks.instagram ?? ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                          }))}
                          placeholder="@usuario"
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-sm">{profile.socialLinks.instagram ?? 'Não informado'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Public URL Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  URL Pública
                </CardTitle>
                <CardDescription>
                  Compartilhe este link com seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
                    <code className="text-sm">
                      {`${window.location.origin}/c/${profile.slug}`}
                    </code>
                  </div>
                  <Button 
                    onClick={copyPublicUrl}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Highlights Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Imóveis em Destaque
                    </CardTitle>
                    <CardDescription>
                      Estes imóveis aparecerão em destaque na sua página pública
                    </CardDescription>
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Gerenciar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {profile.highlights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.highlights.map((property) => (
                      <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-blue-600 text-white">
                              Score: {property.score}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                            {property.title}
                          </h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{property.neighborhood}, {property.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{formatPrice(property.price)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{property.area}m²</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel em destaque</h4>
                    <p className="text-gray-500 mb-4">
                      Adicione imóveis ao seu portfólio para que apareçam em destaque na sua página pública
                    </p>
                    <Link href="/broker/properties">
                      <Button variant="outline">
                        <Building2 className="w-4 h-4 mr-2" />
                        Ver Imóveis
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Exportar e Compartilhar</CardTitle>
                <CardDescription>
                  Crie materiais para compartilhar nas redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShareExportButtons 
                  brokerName={profile.name}
                  brokerCompany={profile.company}
                  brokerBio={profile.bio}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              onClick={handleSave} 
              size="lg" 
              className="shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
