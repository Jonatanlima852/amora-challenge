"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { 
  HomeIcon, 
  Building2Icon, 
  BarChart3Icon, 
  UsersIcon, 
  UserIcon,
  MessageCircleIcon,
  XIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PhoneVerificationModal } from "@/app/properties/_components/PhoneVerificationModal";
import { SyncAccountsModal } from "@/app/properties/_components/SyncAccountsModal";

const navigation = [
  { name: "Início", href: "/app", icon: HomeIcon },
  { name: "Imóveis", href: "/app/properties", icon: Building2Icon },
  { name: "Comparar", href: "/app/compare", icon: BarChart3Icon },
  { name: "Grupos", href: "/app/groups", icon: UsersIcon },
  { name: "Perfil", href: "/app/profile", icon: UserIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showSyncAccounts, setShowSyncAccounts] = useState(false);
  const [syncPhone, setSyncPhone] = useState('');
  const [syncCount, setSyncCount] = useState(0);
  const { user, fetchUserData } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false);

  // Verificar status do usuário apenas uma vez na montagem
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user && !hasCheckedInitial) {
        try {
          const result = await fetchUserData();
          if (result.data) {
            setUserData(result.data);
            
            // Mostrar modal de verificação se telefone não estiver verificado
            if (!result.data.verified) {
              setShowWhatsAppModal(true);
            } else {
              setShowWhatsAppModal(false);
            }
            
            setHasCheckedInitial(true);
          }
        } catch (error) {
          console.error('Erro ao verificar status do usuário:', error);
          setHasCheckedInitial(true);
        }
      }
    };

    checkUserStatus();
  }, [user, hasCheckedInitial, fetchUserData]);

  const handleWhatsAppConnect = useCallback(() => {
    setShowWhatsAppModal(false);
    setShowPhoneVerification(true);
  }, []);

  const handlePhoneVerified = useCallback(async (phone: string) => {
    // Atualizar dados do usuário após verificação
    try {
      const result = await fetchUserData();
      if (result.data?.verified) {
        setShowWhatsAppModal(false);
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }, [fetchUserData]);

  const handleRequireAssociation = useCallback((phone: string, count: number) => {
    setSyncPhone(phone);
    setSyncCount(count);
    setShowSyncAccounts(true);
  }, []);

  const handleSyncAssociated = useCallback(async () => {
    // Atualizar dados do usuário após sincronização
    try {
      const result = await fetchUserData();
      if (result.data?.verified) {
        setShowWhatsAppModal(false);
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }, [fetchUserData]);

  const handleSyncSkip = useCallback(async () => {
    // Atualizar dados do usuário após pular sincronização
    try {
      const result = await fetchUserData();
      if (result.data?.verified) {
        setShowWhatsAppModal(false);
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }, [fetchUserData]);

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">a</span>
          </div>
          <span className="text-xl font-bold text-gray-900">aMORA</span>
        </div>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Modal de WhatsApp - só aparece se não estiver conectado */}
      {showWhatsAppModal && (
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 relative">
            {/* Botão de fechar */}
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-2 right-2 text-purple-600 hover:text-purple-800 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <MessageCircleIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Conecte o WhatsApp</span>
            </div>
            <p className="text-xs text-purple-700 mb-3 pr-6">
              Envie links de imóveis para nosso bot e receba análises instantâneas
            </p>
            <Button
              onClick={handleWhatsAppConnect}
              className="w-full bg-purple-600 text-white text-xs px-3 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Conectar WhatsApp
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Verificação de Telefone */}
      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onVerified={handlePhoneVerified}
        onRequireAssociation={handleRequireAssociation}
      />

      {/* Modal de Sincronização de Contas */}
      <SyncAccountsModal
        isOpen={showSyncAccounts}
        onClose={() => setShowSyncAccounts(false)}
        phone={syncPhone}
        count={syncCount}
        onAssociated={handleSyncAssociated}
        onSkip={handleSyncSkip}
      />
    </div>
  );
}
