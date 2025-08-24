import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Link as LinkIcon, TrendingUp, Target, Sparkles, User, LogIn, MessageCircle, BarChart3, Users, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  aMORA
                </h1>
                <p className="text-sm text-gray-600">Encontre seu imóvel ideal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/compare">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Comparar
                </Button>
              </Link>
              
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              
              <Link href="/auth/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <User className="w-4 h-4 mr-2" />
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforme links do WhatsApp em
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                análises inteligentes
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Cole o link do imóvel e receba análise completa com Índice aMORA, 
              comparações e insights para tomar a melhor decisão.
            </p>
            
            {/* WhatsApp CTA */}
            <div className="flex justify-center mb-8">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                <MessageCircle className="w-6 h-6 mr-3" />
                Enviar link por WhatsApp
              </Button>
            </div>
          </div>

          {/* Passos */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envie o link</h3>
              <p className="text-gray-600">
                Cole o link do imóvel no WhatsApp do aMORA
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receba insights</h3>
              <p className="text-gray-600">
                Análise completa com Índice aMORA e métricas
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare no app</h3>
              <p className="text-gray-600">
                Compare até 4 imóveis lado a lado
              </p>
            </div>
          </div>

          {/* Demo de comparação */}
          <Card className="max-w-4xl mx-auto mb-16 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Demo de Comparação</CardTitle>
              <CardDescription>
                Teste a ferramenta de comparação com até 5 links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Input placeholder="Link do imóvel 1" />
                  <Input placeholder="Link do imóvel 2" />
                  <Input placeholder="Link do imóvel 3" />
                </div>
                <div className="space-y-3">
                  <Input placeholder="Link do imóvel 4" />
                  <Input placeholder="Link do imóvel 5" />
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Comparar Agora
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                ✨ Experimente gratuitamente sem criar conta
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cole links facilmente</h3>
              <p className="text-gray-600">
                Envie links do WhatsApp e o aMORA faz o resto automaticamente
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare e analise</h3>
              <p className="text-gray-600">
                Compare até 4 imóveis lado a lado com métricas padronizadas
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tome a decisão certa</h3>
              <p className="text-gray-600">
                Receba insights e resumos para escolher o melhor imóvel
              </p>
            </Card>
          </div>

          {/* Corretores parceiros */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8">Corretores Parceiros</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">João Silva</h4>
                <p className="text-sm text-gray-600 mb-3">Especialista em imóveis residenciais</p>
                <div className="flex justify-center items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Maria Santos</h4>
                <p className="text-sm text-gray-600 mb-3">Especialista em imóveis comerciais</p>
                <div className="flex justify-center items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
              
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Pedro Costa</h4>
                <p className="text-sm text-gray-600 mb-3">Especialista em imóveis de luxo</p>
                <div className="flex justify-center items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
              <p className="text-blue-100 mb-6">
                Crie sua conta gratuita e comece a analisar imóveis com inteligência artificial
              </p>
              <div className="flex space-x-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    <User className="w-5 h-5 mr-2" />
                    Criar conta grátis
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    <LogIn className="w-5 h-5 mr-2" />
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}