'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRoles,
  getRoles,
} from '@/lib/api/queries/users.queries';
import type { CreateUserInput, UpdateUserInput } from '@/types';
import { id } from 'date-fns/locale';

export const useUsers = (page: number = 1, pageSize: number = 10, search?: string) => {
  return useQuery({
    queryKey: ['users', page, pageSize, search],
    queryFn: () => getUsers(page, pageSize, search),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // También invalidamos el usuario individual por si se está viendo en detalle
      queryClient.invalidateQueries({ queryKey: ['user', id] } as any);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// CORRECCIÓN: Actualizado para usar roleNames
export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleNames }: { id: string; roleNames: string[] }) => updateUserRoles(id, roleNames),
    onSuccess: (_, variables) => {
      // Invalidamos la lista general
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Invalidamos el usuario específico ya que sus roles cambiaron
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] } as any);
      
      // Opcional: Si el usuario se edita a sí mismo, invalidar 'currentUser'
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};