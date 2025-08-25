"use client";

import { useState, useEffect, useRef } from "react";
import { BellIcon, SearchIcon, UserCircleIcon, LogOut, MessageCircle, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function BrokerHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return "Corretor";
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'BROKER': return 'Corretor';
      case 'ADMIN': return 'Administrador';
      default: return 'Corretor';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Busca e Navegação */}
        <div className="flex items-center gap-6 flex-1">
          <div className="max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar imóveis, contatos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/broker/properties/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Imóvel
              </Button>
            </Link>
            <Link href="/broker/contacts">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Novo Contato
              </Button>
            </Link>
          </div>
        </div>

        {/* Notificações e Perfil */}
        <div className="flex items-center gap-4">
          {/* Notificações */}
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* WhatsApp Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">WhatsApp Ativo</span>
          </div>

          {/* Página Pública */}
          <Link href="/broker/page">
            <Button variant="ghost" size="icon" className="relative">
              <Globe className="w-5 h-5" />
            </Button>
          </Link>
          
          {/* Perfil do Usuário */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-xs text-blue-600 font-medium">{getRoleDisplayName()}</p>
              </div>
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <Link
                    href="/broker/page"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Página Pública
                  </Link>
                  <Link
                    href="/broker/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserCircleIcon className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Status (Mobile) */}
      <div className="md:hidden mt-3 flex items-center gap-2">
        <Link href="/broker/properties/new" className="flex-1">
          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Imóvel
          </Button>
        </Link>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
          <MessageCircle className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-700 font-medium">WhatsApp</span>
        </div>
      </div>
    </header>
  );
}
