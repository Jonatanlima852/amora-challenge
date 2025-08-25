"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Link as LinkIcon, Plus, Trash2, Sparkles, MessageCircle } from "lucide-react"
import Link from "next/link"

interface Property {
  id: string
  url: string
  price: string
  area: string
  condominium: string
  neighborhood: string
  amoraScore: number
  pros: string[]
  cons: string[]
}

export default function ComparePage() {
  const [urls, setUrls] = useState<string[]>(["", "", "", "", ""])
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, ""])
    }
  }

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index)
      setUrls(newUrls)
    }
  }

  const handleCompare = async () => {
    const validUrls = urls.filter(url => url.trim() !== "")
    if (validUrls.length < 2) return

    setIsLoading(true)
    
    // Simulação de análise
    setTimeout(() => {
      const mockProperties: Property[] = validUrls.map((url, index) => ({
        id: `prop-${index}`,
        url,
        price: `R$ ${(Math.random() * 2000000 + 500000).toLocaleString('pt-BR')}`,
        area: `${(Math.random() * 200 + 50).toFixed(0)}m²`,
        condominium: `R$ ${(Math.random() * 2000 + 500).toLocaleString('pt-BR')}`,
        neighborhood: ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Jardins", "Moema"][index % 5],
        amoraScore: Math.floor(Math.random() * 40 + 60),
        pros: ["Localização privilegiada", "Metrô próximo", "Área acima da média"],
        cons: ["Condomínio alto", "Poucas vagas", "Reforma necessária"]
      }))
      
      setProperties(mockProperties)
      setIsLoading(false)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 70) return "bg-blue-100 text-blue-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  aMORA
                </h1>
                <p className="text-sm text-gray-600">Comparador de Imóveis</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  Voltar ao início
                </Button>
              </Link>
              
              <Link href="/auth/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Compare Imóveis com IA
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Analise até 5 imóveis lado a lado com métricas padronizadas e insights inteligentes
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-12 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" />
                URLs dos Imóveis
              </CardTitle>
              <CardDescription>
                Cole os links dos imóveis que deseja comparar (mínimo 2, máximo 5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urls.map((url, index) => (
                  <div key={index} className="flex space-x-3">
                    <Input
                      placeholder={`Link do imóvel ${index + 1}`}
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {urls.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUrl(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {urls.length < 5 && (
                  <Button
                    variant="outline"
                    onClick={addUrl}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar mais imóvel
                  </Button>
                )}
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={handleCompare}
                  disabled={urls.filter(u => u.trim() !== "").length < 2 || isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Comparar Imóveis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {properties.length > 0 && (
            <div className="space-y-8">
              {/* Comparison Table */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Comparação de Imóveis</CardTitle>
                  <CardDescription>
                    Análise detalhada com métricas padronizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Métrica</TableHead>
                          {properties.map((prop, index) => (
                            <TableHead key={prop.id} className="text-center">
                              Imóvel {index + 1}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">Preço</TableCell>
                          {properties.map(prop => (
                            <TableCell key={prop.id} className="text-center font-semibold">
                              {prop.price}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Área</TableCell>
                          {properties.map(prop => (
                            <TableCell key={prop.id} className="text-center">
                              {prop.area}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Condomínio</TableCell>
                          {properties.map(prop => (
                            <TableCell key={prop.id} className="text-center">
                              {prop.condominium}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Bairro</TableCell>
                          {properties.map(prop => (
                            <TableCell key={prop.id} className="text-center">
                              {prop.neighborhood}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Índice aMORA</TableCell>
                          {properties.map(prop => (
                            <TableCell key={prop.id} className="text-center">
                              <Badge className={getScoreColor(prop.amoraScore)}>
                                {prop.amoraScore}/100
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Resumo IA
                  </CardTitle>
                  <CardDescription>
                    Análise inteligente com prós e contras de cada opção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {properties.map((prop, index) => (
                      <div key={prop.id} className="space-y-3">
                        <h4 className="font-semibold text-lg">Imóvel {index + 1}</h4>
                        <div>
                          <h5 className="font-medium text-green-700 mb-2">✅ Prós</h5>
                          <ul className="space-y-1">
                            {prop.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-gray-600">• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-red-700 mb-2">❌ Contras</h5>
                          <ul className="space-y-1">
                            {prop.cons.map((con, i) => (
                              <li key={i} className="text-sm text-gray-600">• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Gostou da comparação?</h3>
                  <p className="text-blue-100 mb-6">
                    Crie sua conta para salvar imóveis, receber notificações e comparar quantos quiser
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <Link href="/auth/register">
                      <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                        Criar conta grátis
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}