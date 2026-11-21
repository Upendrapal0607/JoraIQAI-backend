'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role } from '../types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role: Role }) => Promise<void>;
  quickLogin: (account: 'TEACHER' | 'STUDENT_1' | 'STUDENT_2' | 'STUDENT_3') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUserFromStorage() {
      const storedToken = localStorage.getItem('joraiq_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const profile = await api.get<User>('/auth/me');
        setUser(profile);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('joraiq_token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  const handleAuthSuccess = (userData: User, accessToken: string) => {
    localStorage.setItem('joraiq_token', accessToken);
    setUser(userData);
    setToken(accessToken);

    if (userData.role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Optional Supabase Auth integration if keys are configured
      if (supabase) {
        try {
          const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!supaError && supaData.session) {
            const syncRes = await api.post<{ user: User; accessToken: string }>('/auth/supabase-sync', {
              supabaseUid: supaData.user.id,
              email: supaData.user.email!,
              role: supaData.user.user_metadata?.role,
            });
            handleAuthSuccess(syncRes.user, syncRes.accessToken);
            return;
          }
        } catch {
          // Fall back to direct backend auth
        }
      }

      const res = await api.post<{ user: User; accessToken: string }>('/auth/login', {
        email,
        password,
      });

      handleAuthSuccess(res.user, res.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    role: Role;
  }) => {
    setIsLoading(true);
    try {
      let supabaseUid: string | undefined = undefined;

      if (supabase) {
        try {
          const { data: supaData } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: { name: data.name, role: data.role },
            },
          });
          if (supaData.user) {
            supabaseUid = supaData.user.id;
          }
        } catch {
          // Continue with backend registration
        }
      }

      const res = await api.post<{ user: User; accessToken: string }>('/auth/register', {
        ...data,
        supabaseUid,
      });

      handleAuthSuccess(res.user, res.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (account: 'TEACHER' | 'STUDENT_1' | 'STUDENT_2' | 'STUDENT_3') => {
    const creds = {
      TEACHER: { email: 'teacher@joraiq.ai', password: 'password123' },
      STUDENT_1: { email: 'student1@joraiq.ai', password: 'password123' },
      STUDENT_2: { email: 'student2@joraiq.ai', password: 'password123' },
      STUDENT_3: { email: 'student3@joraiq.ai', password: 'password123' },
    }[account];

    await login(creds.email, creds.password);
  };

  const logout = () => {
    localStorage.removeItem('joraiq_token');
    setUser(null);
    setToken(null);
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
