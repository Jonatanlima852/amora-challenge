import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Car, Ruler, Star, MessageCircle, Share2, Home, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Property {
  id: string
  title: string
  price: string
  area: string
  bedrooms: number
  bathrooms: number
  parking: number
  neighborhood: string
  city: string
  type: string
  amoraScore: number
  description: string
  features: string[]
  images: string[]
}

// Mock data - em produção viria da API
const mockProperty: Property = {
  id: "1",
  title: "Apartamento 3 quartos - Pinheiros",
  price: "R$ 1.200.000",
  area: "120m²",
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  neighborhood: "Pinheiros",
  city: "São Paulo",
  type: "Apartamento",
  amoraScore: 85,
  description: "Excelente apartamento localizado em uma das regiões mais desejadas de São Paulo. O imóvel oferece conforto e praticidade com acabamento de alto padrão.",
  features: ["Acabamento alto padrão", "Portaria 24h", "Academia", "Piscina", "Churrasqueira", "Salão de festas"],
  images: ["/file.svg", "/api/placeholder/600/400", "/api/placeholder/600/400"]
}

export default async function PropertyPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const property = mockProperty // Em produção, buscar por ID

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
                <p className="text-sm text-gray-600">Ficha do Imóvel</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              
              <Link href="/compare">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Comparar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Property Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link href="/" className="hover:text-blue-600">Início</Link>
              <span>/</span>
              <Link href="/compare" className="hover:text-blue-600">Comparar</Link>
              <span>/</span>
              <span>{property.title}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{property.title}</h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">{property.neighborhood}, {property.city}</span>
              </div>
              
              <Badge className={property.amoraScore >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                <Star className="w-4 h-4 mr-1" />
                Índice aMORA: {property.amoraScore}/100
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images */}
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-500">Galeria de imagens</span>
                  </div>
                </CardContent>
              </Card>

              {/* Price and Quick Info */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Preço</p>
                      <p className="text-3xl font-bold text-blue-600">{property.price}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Valor por m²</p>
                      <p className="text-xl font-semibold">
                        R$ {(parseInt(property.price.replace(/\D/g, '')) / parseInt(property.area) / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bed className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Quartos</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                    
                    <div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bath className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Banheiros</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                    
                    <div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Car className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600">Vagas</p>
                      <p className="font-semibold">{property.parking}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 