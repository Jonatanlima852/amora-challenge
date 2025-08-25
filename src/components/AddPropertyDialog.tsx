"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyAdded?: (property: any) => void;
}

export function AddPropertyDialog({ open, onOpenChange, onPropertyAdded }: AddPropertyDialogProps) {
  const [newPropertyUrl, setNewPropertyUrl] = useState("");
  const [addingProperty, setAddingProperty] = useState(false);

  const addProperty = async () => {
    if (!newPropertyUrl.trim()) return;

    try {
      setAddingProperty(true);
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUrl: newPropertyUrl.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewPropertyUrl("");
        onOpenChange(false);
        
        // Callback para notificar que uma propriedade foi adicionada
        if (onPropertyAdded) {
          onPropertyAdded(data.property);
        }
        
        // Mostrar mensagem de sucesso
        alert('Imóvel adicionado com sucesso! O sistema irá analisá-lo automaticamente.');
      } else {
        const errorData = await response.json();
        alert(`Erro ao adicionar imóvel: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar imóvel:', error);
      alert('Erro ao adicionar imóvel. Tente novamente.');
    } finally {
      setAddingProperty(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addProperty();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Imóvel</DialogTitle>
          <DialogDescription>
            Cole a URL do imóvel que você quer adicionar. O sistema irá analisar automaticamente e extrair todas as informações.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              URL do Imóvel
            </label>
            <Input
              placeholder="https://www.zapimoveis.com.br/imovel/..."
              value={newPropertyUrl}
              onChange={(e) => setNewPropertyUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Suportamos sites como: Zap Imóveis, Viva Real, OLX, etc.</p>
            <p>• O imóvel será analisado automaticamente em alguns segundos</p>
            <p>• Você receberá notificações sobre o progresso</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={addProperty} 
            disabled={addingProperty || !newPropertyUrl.trim()}
          >
            {addingProperty ? 'Adicionando...' : 'Adicionar Imóvel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
