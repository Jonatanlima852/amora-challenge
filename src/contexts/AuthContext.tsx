'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    return { error };
  };

  const signOut = async () => {
    setUserRole(null);
    
    // Limpar sessão server-side
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (error) {
      console.error('Erro ao limpar sessão server-side:', error);
    }
    
    await supabase.auth.signOut();
  };

  const updatePhone = async (phone: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { phone }
    });
    return { error };
  };

  const establishServerSession = async () => {
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
      
      const error = await response.json();
      return { error: error.error || 'Erro ao estabelecer sessão' };
    } catch (error) {
      return { error: 'Erro de conexão' };
    }
  };

  const fetchUserData = async () => {
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
      return { error: 'Erro de conexão' };
    }
  };

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
