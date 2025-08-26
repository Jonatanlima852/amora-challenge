import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BrokerStats {
  properties: {
    total: number;
    active: number;
    pending: number;
    sold: number;
  };
  contacts: {
    total: number;
    active: number;
  };
  groups: {
    total: number;
    active: number;
    inactive: number;
    totalProperties: number;
    totalMembers: number;
  };
  performance: {
    conversionRate: number;
    monthlyViews: number;
  };
}

interface RecentActivity {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  price?: number;
  location: string;
}

interface UseBrokerStatsReturn {
  stats: BrokerStats | null;
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBrokerStats(): UseBrokerStatsReturn {
  const { userRole } = useAuth();
  const [stats, setStats] = useState<BrokerStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/broker/stats');
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar estatísticas do corretor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'BROKER' || userRole === 'ADMIN') {
      fetchStats();
    }
  }, [userRole]);

  const refetch = () => fetchStats();

  return {
    stats,
    recentActivity,
    loading,
    error,
    refetch,
  };
}
