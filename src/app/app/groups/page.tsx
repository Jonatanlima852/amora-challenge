"use client";

import { useState } from "react";
import { 
  UsersIcon, 
  PlusIcon, 
  MessageCircleIcon, 
  HeartIcon,
  Share2Icon,
  CopyIcon,
  Building2Icon,
  StarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState("my-groups");
  const [inviteLink, setInviteLink] = useState("");

  const groups = [
    {
      id: 1,
      name: "Família Silva",
      description: "Grupo da família para busca de imóveis",
      members: 4,
      properties: 12,
      lastActivity: "2 horas atrás",
      isOwner: true,
      inviteCode: "familiasilva123",
    },
    {
      id: 2,
      name: "Amigos Trabalho",
      description: "Colegas buscando imóveis na região",
      members: 6,
      properties: 8,
      lastActivity: "1 dia atrás",
      isOwner: false,
      inviteCode: "amigostrabalho456",
    },
  ];

  const activities = [
    {
      id: 1,
      type: "property_added",
      user: "João Silva",
      message: "adicionou um novo imóvel",
      property: "Apartamento em Pinheiros",
      timestamp: "2 horas atrás",
      reactions: { like: 2, love: 1 },
    },
    {
      id: 2,
      type: "comment",
      user: "Maria Silva",
      message: "Gostei muito deste! Preço está ótimo para a região",
      property: "Apartamento em Pinheiros",
      timestamp: "1 hora atrás",
      reactions: { like: 3 },
    },
    {
      id: 3,
      type: "property_added",
      user: "Pedro Costa",
      message: "Encontrei esta opção também",
      property: "Casa em Vila Madalena",
      timestamp: "3 horas atrás",
      reactions: { like: 1, wow: 1 },
    },
  ];

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    // Em produção, mostrar toast de sucesso
  };

  const createGroup = () => {
    // Em produção, abriria modal para criar grupo
    console.log("Criar grupo");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Grupos</h1>
          <p className="text-gray-600">Colabore com familiares e amigos na busca de imóveis</p>
        </div>
        <Button onClick={createGroup}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Criar Grupo
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-groups">Meus Grupos</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-6">
          {/* Lista de grupos */}
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </div>
                    </div>
                    {group.isOwner && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Proprietário
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Membros:</span>
                      <span className="font-medium">{group.members} pessoas</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Imóveis:</span>
                      <span className="font-medium">{group.properties} salvos</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Última atividade:</span>
                      <span className="text-gray-500">{group.lastActivity}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircleIcon className="w-4 h-4 mr-2" />
                        Entrar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyInviteLink(group.inviteCode)}
                      >
                        <Share2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Criar novo grupo */}
          <Card className="border-dashed border-2 border-gray-300 hover:border-purple-400 transition-colors">
            <CardContent className="p-8 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Criar Novo Grupo</h3>
              <p className="text-gray-500 mb-4">
                Convide familiares e amigos para colaborar na busca de imóveis
              </p>
              <Button onClick={createGroup}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Criar Grupo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Feed de atividades */}
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{activity.user}</span>
                        <span className="text-gray-500">{activity.message}</span>
                        {activity.property && (
                          <span className="font-medium text-purple-600">{activity.property}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                        
                        {/* Reações */}
                        <div className="flex items-center gap-2">
                          {Object.entries(activity.reactions).map(([type, count]) => (
                            <Button
                              key={type}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                            >
                              {type === 'like' && <HeartIcon className="w-3 h-3 mr-1" />}
                              {type === 'love' && '❤️'}
                              {type === 'wow' && '😮'}
                              {count}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de convite (simulado) */}
      {inviteLink && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Link de convite copiado!</h4>
                <p className="text-sm text-blue-700">
                  Compartilhe este link para convidar pessoas para o grupo
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInviteLink("")}
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
