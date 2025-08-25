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
  Download, 
  Share2, 
  Building2, 
  MapPin, 
  DollarSign, 
  Star,
  Camera,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Plus
} from 'lucide-react';

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
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<BrokerProfile>({
    id: '1',
    name: 'João Silva',
    email: 'joao@amora.com',
    phone: '+55 11 99999-9999',
    bio: 'Corretor especializado em imóveis residenciais na região de São Paulo. Mais de 10 anos de experiência no mercado imobiliário, ajudando famílias a encontrar o lar dos sonhos.',
    slug: 'joao-silva',
    company: 'aMORA Imóveis',
    specialties: ['Residencial', 'Jardins', 'Vila Madalena', 'Primeira Casa'],
    highlights: [
      {
        id: '1',
        title: 'Apartamento 2 quartos - Centro',
        price: 450000,
        area: 65,
        neighborhood: 'Centro',
        city: 'São Paulo',
        imageUrl: '/placeholder.jpg',
        score: 85
      },
      {
        id: '2',
        title: 'Casa 3 quartos - Jardins',
        price: 1200000,
        area: 120,
        neighborhood: 'Jardins',
        city: 'São Paulo',
        imageUrl: '/placeholder.jpg',
        score: 92
      },
      {
        id: '3',
        title: 'Studio - Vila Madalena',
        price: 280000,
        area: 35,
        neighborhood: 'Vila Madalena',
        city: 'São Paulo',
        imageUrl: '/placeholder.jpg',
        score: 78
      }
    ],
    socialLinks: {
      whatsapp: '+5511999999999',
      instagram: '@joaosilva',
      linkedin: 'joao-silva'
    }
  });

  useEffect(() => {
    if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
      router.push('/properties');
    }
  }, [userRole, loading, router]);

  const handleSave = async () => {
    // Simular salvamento - substituir por chamada real da API
    setIsEditing(false);
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
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
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
                        value={profile.company || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                        className="mt-1"
                        placeholder="Nome da empresa"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profile.company || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1"
                        rows={4}
                        placeholder="Conte um pouco sobre você e sua experiência..."
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profile.bio}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Personalizada</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">amora.app/c/</span>
                      {isEditing ? (
                        <Input
                          id="slug"
                          value={profile.slug}
                          onChange={(e) => setProfile(prev => ({ ...prev, slug: e.target.value }))}
                          className="flex-1"
                        />
                      ) : (
                        <span className="font-medium">{profile.slug}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <Label>Especialidades</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <Label>Links Sociais</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">WhatsApp:</span>
                      {isEditing ? (
                        <Input
                          value={profile.socialLinks.whatsapp || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, whatsapp: e.target.value }
                          }))}
                          placeholder="+5511999999999"
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-sm">{profile.socialLinks.whatsapp || 'Não informado'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">Instagram:</span>
                      {isEditing ? (
                        <Input
                          value={profile.socialLinks.instagram || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                          }))}
                          placeholder="@usuario"
                          className="flex-1"
                        />
                      ) : (
                        <span className="text-sm">{profile.socialLinks.instagram || 'Não informado'}</span>
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
                      Adicionar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.highlights.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-200 relative">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Download className="w-6 h-6" />
                    <span>Exportar PNG</span>
                    <span className="text-xs text-gray-500">Card promocional</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Share2 className="w-6 h-6" />
                    <span>Compartilhar</span>
                    <span className="text-xs text-gray-500">Redes sociais</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="fixed bottom-6 right-6">
            <Button onClick={handleSave} size="lg" className="shadow-lg">
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
