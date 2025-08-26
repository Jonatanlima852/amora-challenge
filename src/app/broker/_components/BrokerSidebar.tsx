"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  HomeIcon, 
  Building2Icon, 
  UsersIcon, 
  MessageCircleIcon, 
  GlobeIcon,
  BarChart3Icon,
  SettingsIcon,
  UserCircleIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBrokerStats } from "@/hooks/useBrokerStats";

const navigation = [
  { name: "Dashboard", href: "/broker", icon: HomeIcon },
  { name: "Imóveis", href: "/broker/properties", icon: Building2Icon },
  { name: "Contatos", href: "/broker/contacts", icon: UsersIcon },
  { name: "Grupos", href: "/broker/groups", icon: MessageCircleIcon },
  { name: "Página Pública", href: "/broker/page", icon: GlobeIcon },
  { name: "Relatórios", href: "/broker/reports", icon: BarChart3Icon },
  { name: "Configurações", href: "/broker/settings", icon: SettingsIcon },
];

export function BrokerSidebar() {
  const pathname = usePathname();
  const { userRole, user } = useAuth();
  const { stats } = useBrokerStats();

  // Filtrar navegação baseado no papel do usuário
  const filteredNavigation = navigation.filter(item => {
    if (item.href === "/broker/reports" || item.href === "/broker/settings") {
      return userRole === 'ADMIN';
    }
    return true;
  });

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return "Corretor";
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">a</span>
          </div>
          <span className="text-xl font-bold text-gray-900">aMORA</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
            Corretor
          </span>
        </div>
        
        {/* Informações do Usuário */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      
    </div>
  );
}
