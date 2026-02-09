'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { LoginInput, User, AuthResponse } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { login as loginApi } from '@/lib/api/queries/auth.queries';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const handleLogin = useCallback(
    async (credentials: LoginInput) => {
      setIsLoginLoading(true);
      setError(null);
      try {
        const response: AuthResponse = await loginApi(credentials);
        
        // Mapeamos los campos 'nombre'/'apellido' del backend a 'firstName'/'lastName' de nuestra interfaz User
        const userData: User = {
          id: response.user.id,
          firstName: response.user.nombre,
          lastName: response.user.apellido,
          email: response.user.email,
          roles: response.user.roles,
          createdAt: response.user.createdAt,
          updatedAt: response.user.updatedAt,
        };

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        queryClient.setQueryData(['currentUser'], userData);
        
        router.push('/dashboard');
        return response;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Error de conexión';
        setError(message);
        throw err;
      } finally {
        setIsLoginLoading(false);
      }
    },
    [queryClient, router]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    queryClient.clear();
    router.push('/login');
  }, [queryClient, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: handleLogin,
    logout: handleLogout,
    loginMutation: {
      isPending: isLoginLoading,
      isError: !!error,
      error,
    }
  };
};