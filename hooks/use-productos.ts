'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductos,
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} from '@/lib/api/queries/productos.queries';
import type { CreateProductoInput, UpdateProductoInput } from '@/types';

export const useProductos = (page: number = 1, pageSize: number = 10, search?: string) => {
  return useQuery({
    queryKey: ['productos', page, pageSize, search],
    queryFn: () => getProductos(page, pageSize, search),
    // maintainPreviousData: true, // Útil para paginación suave (depende de tu versión de React Query)
  });
};

export const useAllProductos = () => {
  return useQuery({
    queryKey: ['productos', 'all'],
    queryFn: getAllProductos,
  });
};

export const useProducto = (id: string) => {
  return useQuery({
    queryKey: ['producto', id],
    queryFn: () => getProductoById(id),
    enabled: !!id, // Solo ejecuta si hay ID
  });
};

export const useCreateProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductoInput) => createProducto(data),
    onSuccess: () => {
      // Invalidamos la lista paginada y la lista "all"
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useUpdateProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductoInput }) => updateProducto(id, data),
    onSuccess: (_, variables) => {
      // 1. Refrescar la lista principal
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      // 2. Refrescar el detalle del producto específico que se editó
      queryClient.invalidateQueries({ queryKey: ['producto', variables.id] } as any);
    },
  });
};

export const useDeleteProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};