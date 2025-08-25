'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'USER' | 'BROKER' | 'ADMIN' | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { name?: string; phone?: string; role?: 'USER' | 'BROKER' | 'ADMIN' }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePhone: (phone: string) => Promise<{ error: any }>;
  establishServerSession: () => Promise<{ error: any; data?: any }>;
  fetchUserData: () => Promise<{ error: any; data?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'USER' | 'BROKER' | 'ADMIN' | null>(null);
  const [loading, setLoading] = useState(true);

  const hasHandledSignInRef = useRef(false);

  // Função para buscar papel do usuário do cookie
  const fetchUserRole = async () => {
    try {
      // Buscar dados completos do usuário via /api/auth/me
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user?.role) {
          setUserRole(data.user.role);
        }
      } else {
        // Se der 401, tentar estabelecer sessão novamente
        if (response.status === 401) {
          const sessionResult = await establishServerSession();
          if (!sessionResult.error) {
            // Tentar buscar papel novamente
            await fetchUserRole();
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar papel do usuário:', error);
    }
  };

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole();
      }
      
      setLoading(false);
    });

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          if (hasHandledSignInRef.current) return;
          hasHandledSignInRef.current = true;

          // Estabelecer sessão server-side primeiro
          const sessionResult = await establishServerSession();
          if (sessionResult.error) {
            console.error('Erro ao estabelecer sessão server-side:', sessionResult.error);
          }

          await fetchUserRole();
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null);
          hasHandledSignInRef.current = false;
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  
  const signUp = async (email: string, password: string, metadata?: { name?: string; phone?: string; role?: 'USER' | 'BROKER' | 'ADMIN' }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro no signIn:', error);
    }

    return { error };
  };

  const signOut = async () => {
    setUserRole(null);
    
    // Limpar sessão server-side primeiro
    try {
      const response = await fetch('/api/auth/session', { 
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro ao limpar sessão server-side:', error);
    }
    
    // Limpar sessão do Supabase
    await supabase.auth.signOut();
    
    // Forçar limpeza do estado local
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const updatePhone = useCallback(async (phone: string) => {
    try {
      // Atualizar telefone diretamente na tabela public.users via API
      const response = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone })
      });

      if (response.ok) {
        return { error: null };
      } else {
        const errorData = await response.json();
        return { error: errorData.error || 'Erro ao atualizar telefone' };
      }
    } catch (error) {
      console.error('Erro de conexão ao atualizar telefone:', error);
      return { error: 'Erro de conexão' };
    }
  }, []);

  const establishServerSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { error: 'Sem sessão ativa' };
      }

      // Enviar dados do usuário validados pelo Supabase
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user: {
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { error: null, data };
      }
      
      // Se der erro, tentar entender o que aconteceu
      const errorData = await response.json();
      return { error: errorData.error || 'Erro ao estabelecer sessão' };
    } catch (error) {
      console.error('Erro de conexão ao estabelecer sessão:', error);
      return { error: 'Erro de conexão' };
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return { error: null, data: data.user };
      }
      
      const error = await response.json();
      return { error: error.error || 'Erro ao buscar dados do usuário' };
    } catch (error) {
      console.error('Erro de conexão ao buscar dados do usuário:', error);
      return { error: 'Erro de conexão' };
    }
  }, []);

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    updatePhone,
    establishServerSession,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
