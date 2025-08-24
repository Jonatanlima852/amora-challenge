"use client";

import { useState } from "react";
import { BellIcon, SearchIcon, UserCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar imóveis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">João Silva</p>
              <p className="text-xs text-gray-500">Cliente</p>
            </div>
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
