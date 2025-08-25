import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, MapPin, Phone, Mail, Star, Download, Share2, Home } from "lucide-react"
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
  photo: string
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
  image: string
}

// Mock data - em produção viria da API
const mockBroker: Broker = {
  id: "1",
  name: "João Silva",
  slug: "joao-silva",
  bio: "Especialista em imóveis residenciais com mais de 10 anos de experiência. Atendo principalmente as regiões de Pinheiros, Vila Madalena e Itaim Bibi.",
  phone: "+55 11 99999-9999",
  email: "joao.silva@email.com",
  rating: 4.9,
  specialties: ["Residencial", "Luxo", "Novos lançamentos"],
  photo: "/api/placeholder/150/150",
  highlights: [
    {
      id: "1",
      title: "Apartamento 3 quartos - Pinheiros",
      price: "R$ 1.200.000",
      area: "120m²",
      neighborhood: "Pinheiros",
      type: "Apartamento",
      amoraScore: 85,
      image: "/api/placeholder/300/200"
    },
    {
      id: "2",
      title: "Casa 4 quartos - Vila Madalena",
      price: "R$ 2.500.000",
      area: "180m²",
      neighborhood: "Vila Madalena",
      type: "Casa",
      amoraScore: 92,
      image: "/api/placeholder/300/200"
    },
    {
      id: "3",
      title: "Cobertura 2 quartos - Itaim Bibi",
      price: "R$ 3.800.000",
      area: "150m²",
      neighborhood: "Itaim Bibi",
      type: "Cobertura",
      amoraScore: 88,
      image: "/api/placeholder/300/200"
    }
  ]
}

export default async function BrokerPage({ params }: { params: Promise<{ slug: string }> }) {
  // const { slug } = await params; // TODO: Implementar busca por slug
  const broker = mockBroker // Em produção, buscar por slug

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
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold">{broker.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{broker.name}</h1>
                  <p className="text-xl text-blue-100 mb-4">{broker.bio}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {broker.specialties.map(specialty => (
                      <Badge key={specialty} variant="secondary" className="bg-white/20 text-white border-white/30">
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
                    <span className="text-lg">São Paulo, SP</span>
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
              {broker.highlights.map(property => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-500">Imagem do imóvel</span>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {property.type}
                      </Badge>
                      <Badge className={property.amoraScore >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {property.amoraScore}/100
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">{property.price}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{property.area}</span>
                      <span>{property.neighborhood}</span>
                    </div>
                    
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Ver detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
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