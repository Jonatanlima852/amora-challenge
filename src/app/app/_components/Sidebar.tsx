"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  HomeIcon, 
  Building2Icon, 
  BarChart3Icon, 
  UsersIcon, 
  UserIcon,
  MessageCircleIcon
} from "lucide-react";

const navigation = [
  { name: "Início", href: "/app", icon: HomeIcon },
  { name: "Imóveis", href: "/app/properties", icon: Building2Icon },
  { name: "Comparar", href: "/app/compare", icon: BarChart3Icon },
  { name: "Grupos", href: "/app/groups", icon: UsersIcon },
  { name: "Perfil", href: "/app/profile", icon: UserIcon },
];

export function Sidebar() {
  const pathname = usePathname();

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

      {/* <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircleIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">WhatsApp</span>
          </div>
          <p className="text-xs text-purple-700 mb-3">
            Envie links de imóveis para nosso bot
          </p>
          <Link
            href="https://wa.me/5511999999999"
            target="_blank"
            className="w-full bg-purple-600 text-white text-xs px-3 py-2 rounded-md hover:bg-purple-700 transition-colors text-center block"
          >
            Conectar
          </Link>
        </div>
      </div> */}
    </div>
  );
}
