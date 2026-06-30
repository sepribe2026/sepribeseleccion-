'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  cedula: string;
  name: string;
  company_slug: string;
  company_name: string;
  perfil: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (cedula: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('digi_admin_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.company_name) {
          parsedUser.company_name = parsedUser.company_name
            .replace(/SUPERDEPORT S\.A\./g, 'SEPRIBE CIA.LTDA.')
            .replace(/SUPERDEPORTE S\.A\./g, 'SEPRIBE CIA.LTDA.')
            .replace(/SUPERDEPORTE/gi, 'SEPRIBE CIA.LTDA.');
        }
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('digi_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (cedula: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, password, app: 'candidates' })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('digi_admin_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('digi_admin_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
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
