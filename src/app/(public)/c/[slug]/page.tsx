import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, MapPin, Phone, Mail, Star, Download, Share2, Home, Building2 } from "lucide-react"
import Link from "next/link"

interface Broker {
  id: string
  name: string
  slug: string
  bio: string
  phone: string
  email: string
  rating: number
  specialties: string[]
  avatar: string
  company: string
  city: string
  highlights: Property[]
}

interface Property {
  id: string
  title: string
  price: string
  area: string
  neighborhood: string
  type: string
  amoraScore: number
  image: string | null
  details: {
    rooms?: number
    parking?: number
    condo?: number
    iptu?: number
  }
}

// Função para obter iniciais do nome
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// Função para formatar especialidades
const formatSpecialties = (specialties: any) => {
  if (!specialties || !Array.isArray(specialties)) return ['Residencial'];
  return specialties;
};

export default async function BrokerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Buscar dados do corretor da API
  let broker = null;
  let error = null;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/broker/public/${slug}`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      broker = data.broker;
    } else {
      error = 'Corretor não encontrado';
    }
  } catch (err) {
    error = 'Erro ao carregar perfil do corretor';
  }

  if (error || !broker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Página não encontrada</h2>
          <p className="text-gray-600 mb-4">{error || 'O corretor solicitado não foi encontrado'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  aMORA
                </h1>
                <p className="text-sm text-gray-600">Corretor Parceiro</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar PNG
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Broker Hero */}
          <Card className="mb-12 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {broker.avatar ? (
                    <img 
                      src={broker.avatar} 
                      alt={broker.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {getInitials(broker.name)}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{broker.name}</h1>
                  {broker.company && (
                    <p className="text-lg text-blue-100 mb-2">{broker.company}</p>
                  )}
                  <p className="text-xl text-blue-100 mb-4">{broker.bio || 'Corretor especializado em imóveis residenciais'}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {formatSpecialties(broker.specialties).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1,2,3,4,5].map((i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i <= Math.floor(broker.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/50'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">{broker.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-lg">{broker.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-lg">{broker.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="text-lg">{broker.city || 'Localização não informada'}</span>
                  </div>
                </div>
                
                <div className="text-center md:text-right">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                    <MessageCircle className="w-6 h-6 mr-3" />
                    Falar no WhatsApp
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Resposta em até 2 horas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imóveis em Destaque */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Imóveis em Destaque</h2>
              <Link href="/compare">
                <Button variant="outline">
                  Comparar todos
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {broker.highlights.length > 0 ? (
                broker.highlights.map(property => (
                  <Card key={property.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden relative">
                      {property.image ? (
                        <img 
                          src={property.image} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className={property.amoraScore >= 80 ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                          {property.amoraScore}/100
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {property.type}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-2xl font-bold text-green-600 mb-3">{property.price}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {property.area}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {property.neighborhood}
                          </span>
                        </div>
                        
                        {property.details.rooms && (
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>🛏️ {property.details.rooms} quarto{property.details.rooms > 1 ? 's' : ''}</span>
                            {property.details.parking && (
                              <span>🚗 {property.details.parking} vaga{property.details.parking > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                        Ver detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel em destaque</h3>
                  <p className="text-gray-500">Este corretor ainda não possui imóveis em destaque</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Precisa de ajuda para encontrar seu imóvel?</h3>
              <p className="text-green-100 mb-6">
                {broker.name} está pronto para te ajudar com uma consultoria personalizada
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar no WhatsApp
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}