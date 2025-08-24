import { AlertTriangleIcon, StarIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AppHomePage() {
  return (
    <div className="space-y-6">
      {/* Alertas */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangleIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Último imóvel salvo</h3>
              <p className="text-sm text-blue-700 mt-1">
                Apartamento em Pinheiros foi adicionado há 2 horas
              </p>
              <Link href="/app/properties" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
                Ver detalhes →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUpIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-900">Novos similares encontrados</h3>
              <p className="text-sm text-green-700 mt-1">
                3 imóveis similares ao seu perfil foram encontrados
              </p>
              <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                Ver opções
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA para comparação rápida */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Compare seus imóveis favoritos</h2>
              <p className="text-purple-100">
                Analise até 4 imóveis lado a lado com nosso sistema inteligente
              </p>
            </div>
            <Link href="/app/compare">
              <Button variant="secondary" size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                Comparar Agora
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Imóveis recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Imóveis Recentes</h2>
          <Link href="/app/properties" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Ver todos →
          </Link>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">Apartamento em Pinheiros</CardTitle>
                    <CardDescription>São Paulo, SP</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <StarIcon className="w-3 h-3 mr-1" />
                    78
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço:</span>
                    <span className="font-medium">R$ 450.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Área:</span>
                    <span className="font-medium">65m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Condomínio:</span>
                    <span className="font-medium">R$ 450</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver detalhes
                  </Button>
                  <Button size="sm" variant="ghost" className="px-2">
                    <StarIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Grupos ativos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Grupos Ativos</h2>
          <Link href="/app/groups" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Ver todos →
          </Link>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Família Silva</h3>
                    <p className="text-sm text-gray-500">4 membros • 12 imóveis</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Entrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
