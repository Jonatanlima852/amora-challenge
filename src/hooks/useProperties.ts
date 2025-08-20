'use client';

import { useState, useEffect, useCallback } from 'react';
import { ParsedProperty } from '@/types/property';

interface UsePropertiesReturn {
  properties: ParsedProperty[];
  loading: boolean;
  error: string | null;
  addProperty: (url: string) => Promise<void>;
  refreshProperties: () => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
}

export function useProperties(): UsePropertiesReturn {
  const [properties, setProperties] = useState<ParsedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar propriedades do usuário
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Falha ao buscar imóveis');
      }
      
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar nova propriedade
  const addProperty = useCallback(async (url: string) => {
    try {
      setError(null);
      
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao adicionar imóvel');
      }

      const newProperty = await response.json();
      
      // Adicionar à lista local
      setProperties(prev => [newProperty.property, ...prev]);
      
      // Aguardar um pouco e atualizar para pegar o parsing
      setTimeout(() => {
        fetchProperties();
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar imóvel');
      throw err;
    }
  }, [fetchProperties]);

  // Atualizar propriedades
  const refreshProperties = useCallback(async () => {
    await fetchProperties();
  }, [fetchProperties]);

  // Deletar propriedade
  const deleteProperty = useCallback(async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar imóvel');
      }

      // Remover da lista local
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar imóvel');
      throw err;
    }
  }, []);

  // Carregar propriedades na inicialização
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    addProperty,
    refreshProperties,
    deleteProperty,
  };
}
