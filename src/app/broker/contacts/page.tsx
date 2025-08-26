'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail,
  MapPin,
  Building2,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  UserPlus,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Contact {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneE164?: string;
  city?: string;
  avatar?: string;
  notes?: string;
  invitedAt: string;
  respondedAt?: string;
}

interface PendingInvite {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneE164?: string;
  city?: string;
  avatar?: string;
  notes?: string;
  invitedAt: string;
}

interface ContactStats {
  total: number;
  pending: number;
  totalInvites: number;
}

export default function BrokerContacts() {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [stats, setStats] = useState<ContactStats>({ total: 0, pending: 0, totalInvites: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // useEffect(() => {
  //   if (!loading && userRole !== 'BROKER' && userRole !== 'ADMIN') {
  //     router.push('/app');
  //   }
  // }, [userRole, loading, router]);

  // Carregar contatos da API
  useEffect(() => {
    if (userRole === 'BROKER' || userRole === 'ADMIN') {
      fetchContacts();
    }
  }, [userRole]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/broker/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
        setPendingInvites(data.pendingInvites);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setIsSendingInvite(true);
      const response = await fetch('/api/broker/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          notes: inviteNotes.trim() || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Recarregar contatos
        await fetchContacts();
        // Limpar formulário
        setInviteEmail('');
        setInviteNotes('');
        setShowInviteDialog(false);
        // TODO: Mostrar toast de sucesso
      } else {
        const error = await response.json();
        // TODO: Mostrar toast de erro
        console.error('Erro ao enviar convite:', error);
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const removeContact = async (contactId: string) => {
    if (!confirm('Tem certeza que deseja remover este contato?')) return;

    try {
      const response = await fetch(`/api/broker/contacts?id=${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchContacts();
        // TODO: Mostrar toast de sucesso
      }
    } catch (error) {
      console.error('Erro ao remover contato:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (userRole !== 'BROKER' && userRole !== 'ADMIN') {
    return null;
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const getDaysSinceInvite = (dateString: string) => {
    const inviteDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - inviteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Contatos</h1>
              <p className="text-gray-600 mt-2">Gerencie seus leads e clientes</p>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowInviteDialog(true)}
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Contato
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Contatos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Convites Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Convites</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalInvites}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Aceitação</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalInvites > 0 ? Math.round((stats.total / stats.totalInvites) * 100) : 0}%
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Convites Pendentes */}
        {pendingInvites.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Convites Pendentes ({pendingInvites.length})
              </CardTitle>
              <CardDescription>
                Usuários que ainda não responderam ao seu convite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={invite.avatar || ''} />
                        <AvatarFallback>{getInitials(invite.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{invite.name}</p>
                        <p className="text-sm text-gray-600">{invite.email}</p>
                        {invite.city && <p className="text-xs text-gray-500">{invite.city}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <Clock className="w-3 h-3 mr-1" />
                        {getDaysSinceInvite(invite.invitedAt)} dias
                      </Badge>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Reenviar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Contatos</SelectItem>
                  <SelectItem value="recent">Contatos Recentes</SelectItem>
                  <SelectItem value="old">Contatos Antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando contatos...</p>
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={contact.avatar || ''} />
                      <AvatarFallback className="text-lg">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Contact Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Contato Aceito
                            </Badge>
                            {contact.respondedAt && (
                              <Badge variant="outline" className="text-gray-600">
                                Respondido em {formatDate(contact.respondedAt)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Convite enviado: {formatDate(contact.invitedAt)}</p>
                          {contact.respondedAt && (
                            <p>Respondido: {formatDate(contact.respondedAt)}</p>
                          )}
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phoneE164 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{contact.phoneE164}</span>
                            </div>
                          )}
                          {contact.city && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{contact.city}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {contact.notes && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">Notas:</p>
                              <p>{contact.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Mensagem
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="w-4 h-4 mr-2" />
                          Ligar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeContact(contact.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contato encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece enviando convites para usuários'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enviar Primeiro Convite
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de Convite */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Enviar Convite</CardTitle>
              <CardDescription>
                Convide um usuário para ser seu contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email do usuário
                </label>
                <Input
                  type="email"
                  placeholder="usuario@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Por que você quer conectar com este usuário?"
                  rows={3}
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                />
              </div>
            </CardContent>
            <div className="px-6 pb-6 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={sendInvite}
                disabled={!inviteEmail.trim() || isSendingInvite}
                className="flex-1"
              >
                {isSendingInvite ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
