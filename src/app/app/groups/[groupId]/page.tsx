"use client";

import { useState } from "react";
import { 
  UsersIcon, 
  MessageCircleIcon, 
  HeartIcon,
  Share2Icon,
  Building2Icon,
  StarIcon,
  ArrowLeftIcon,
  SendIcon,
  PlusIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function GroupRoomPage({ params }: { params: { groupId: string } }) {
  const [newComment, setNewComment] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  // Mock data - em produção viria da API
  const group = {
    id: params.groupId,
    name: "Família Silva",
    description: "Grupo da família para busca de imóveis",
    members: [
      { id: 1, name: "João Silva", role: "owner", avatar: "JS" },
      { id: 2, name: "Maria Silva", role: "member", avatar: "MS" },
      { id: 3, name: "Pedro Silva", role: "member", avatar: "PS" },
      { id: 4, name: "Ana Silva", role: "member", avatar: "AS" },
    ],
    properties: [
      {
        id: 1,
        title: "Apartamento em Pinheiros",
        location: "Pinheiros, São Paulo",
        price: 450000,
        m2: 65,
        score: 78,
        addedBy: "João Silva",
        addedAt: "2 horas atrás",
        comments: [
          { id: 1, user: "Maria Silva", text: "Gostei muito deste! Preço está ótimo para a região", timestamp: "1 hora atrás", reactions: { like: 2 } },
          { id: 2, user: "Pedro Silva", text: "Localização excelente, mas o condomínio está alto", timestamp: "30 min atrás", reactions: { like: 1 } },
        ]
      },
      {
        id: 2,
        title: "Casa em Vila Madalena",
        location: "Vila Madalena, São Paulo",
        price: 850000,
        m2: 120,
        score: 85,
        addedBy: "Maria Silva",
        addedAt: "1 dia atrás",
        comments: [
          { id: 3, user: "João Silva", text: "Esta casa tem tudo que precisamos!", timestamp: "2 horas atrás", reactions: { like: 3, love: 1 } },
        ]
      },
    ]
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const addComment = (propertyId: number) => {
    if (newComment.trim()) {
      // Em produção, enviaria para a API
      console.log("Adicionar comentário:", { propertyId, comment: newComment });
      setNewComment("");
      setSelectedProperty(null);
    }
  };

  const addReaction = (commentId: number, reactionType: string) => {
    // Em produção, enviaria para a API
    console.log("Adicionar reação:", { commentId, reactionType });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600">{group.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2Icon className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Adicionar Imóvel
          </Button>
        </div>
      </div>

      {/* Informações do grupo */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {group.members.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 border-white ${
                      member.role === 'owner' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {member.avatar}
                  </div>
                ))}
                {group.members.length > 4 && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium border-2 border-white">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{group.members.length} membros</p>
                <p className="text-sm text-gray-500">{group.properties.length} imóveis salvos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Criado por</p>
              <p className="font-medium text-gray-900">
                {group.members.find(m => m.role === 'owner')?.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de imóveis com comentários */}
      <div className="space-y-6">
        {group.properties.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <Badge variant="secondary" className={getScoreColor(property.score)}>
                      <StarIcon className="w-3 h-3 mr-1" />
                      {property.score}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Building2Icon className="w-4 h-4" />
                    {property.location}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-sm text-gray-500">{property.m2}m²</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Adicionado por {property.addedBy}</span>
                <span>{property.addedAt}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Comentários existentes */}
              <div className="space-y-3 mb-4">
                {property.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900">{comment.user}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.text}</p>
                    <div className="flex items-center gap-2">
                      {Object.entries(comment.reactions).map(([type, count]) => (
                        <Button
                          key={type}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addReaction(comment.id, type)}
                        >
                          {type === 'like' && <HeartIcon className="w-3 h-3 mr-1" />}
                          {type === 'love' && '❤️'}
                          {count}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar novo comentário */}
              {selectedProperty === property.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => addComment(property.id)}
                      disabled={!newComment.trim()}
                    >
                      <SendIcon className="w-4 h-4 mr-2" />
                      Comentar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProperty(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProperty(property.id)}
                  className="w-full"
                >
                  <MessageCircleIcon className="w-4 h-4 mr-2" />
                  Adicionar Comentário
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vazio */}
      {group.properties.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel no grupo</h3>
            <p className="text-gray-500 mb-4">
              Seja o primeiro a adicionar um imóvel para começar a colaboração
            </p>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Adicionar Primeiro Imóvel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
