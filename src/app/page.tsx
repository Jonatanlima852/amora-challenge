import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Link as LinkIcon, TrendingUp, Target, Sparkles, User, LogIn } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
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
              <Button variant="outline" size="sm">
                <LinkIcon className="w-4 h-4 mr-2" />
                Como funciona
              </Button>
              
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
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transforme links do WhatsApp em
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                análises inteligentes
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Cole o link do imóvel e receba análise completa com Índice aMORA, 
              comparações e insights para tomar a melhor decisão.
            </p>
          </div>

          {/* Input Section */}
          <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Adicione seu primeiro imóvel</CardTitle>
              <CardDescription>
                Cole o link do WhatsApp e deixe o aMORA analisar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Input 
                  placeholder="Cole o link do imóvel aqui..."
                  className="flex-1 text-lg py-6"
                />
                <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analisar
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                ⚠️ Você precisa estar logado para adicionar imóveis
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
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