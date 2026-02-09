'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProveedores,
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from '@/lib/api/queries/proveedores.queries';
import type { CreateProveedorInput, UpdateProveedorInput } from '@/types';

export const useProveedores = (page: number = 1, pageSize: number = 10, search?: string) => {
  return useQuery({
    queryKey: ['proveedores', page, pageSize, search],
    queryFn: () => getProveedores(page, pageSize, search),
  });
};

export const useAllProveedores = () => {
  return useQuery({
    queryKey: ['proveedores', 'all'],
    queryFn: getAllProveedores,
  });
};

export const useProveedor = (id: string) => {
  return useQuery({
    queryKey: ['proveedor', id],
    queryFn: () => getProveedorById(id),
    enabled: !!id,
  });
};

export const useCreateProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProveedorInput) => createProveedor(data),
    onSuccess: () => {
      // Invalidamos la lista general
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });
};

export const useUpdateProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProveedorInput }) => updateProveedor(id, data),
    onSuccess: (_, variables) => {
      // 1. Refrescar la lista principal
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      // 2. Refrescar el detalle específico por si el usuario lo está viendo
      queryClient.invalidateQueries({ queryKey: ['proveedor', variables.id] } as any);
    },
  });
};

export const useDeleteProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProveedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });
};