'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthSession } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Demo user for development
const DEMO_USER: User = {
  id: 'demo-user-1',
  email: 'demo@company.com',
  name: 'Demo User',
  role: 'admin',
  department: 'Engineering',
  permissions: [
    { resource: 'transactions', actions: ['read', 'export'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'cards', actions: ['read'] },
  ],
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const savedSession = localStorage.getItem('auth-session');
    if (savedSession) {
      try {
        const session: AuthSession = JSON.parse(savedSession);
        if (session.expiresAt > Date.now()) {
          setUser(session.user);
        } else {
          localStorage.removeItem('auth-session');
        }
      } catch (err) {
        localStorage.removeItem('auth-session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo authentication - in production, this would call your auth API
      if (credentials.email === 'demo@company.com' && credentials.password === 'demo123') {
        const session: AuthSession = {
          user: DEMO_USER,
          accessToken: 'demo-token-' + Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        };

        localStorage.setItem('auth-session', JSON.stringify(session));
        setUser(DEMO_USER);
      } else {
        throw new Error('Invalid credentials. Use demo@company.com / demo123 for demo access.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-session');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}