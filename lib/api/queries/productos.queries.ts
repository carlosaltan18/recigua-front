import api from '../axios-instance';
import type { Producto, CreateProductoInput, UpdateProductoInput, PaginatedResponse } from '@/types';

// Endpoint base según tu product.controller.ts: /products

export const getProductos = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<PaginatedResponse<Producto>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) params.append('search', search);

  const { data } = await api.get<PaginatedResponse<Producto>>(`/products?${params}`);
  return data;
};

// NOTA: Tu backend no tiene un endpoint '/products/all'. 
// Simulamos "traer todos" pidiendo una página grande para usar en Selects/Dropdowns.
export const getAllProductos = async (): Promise<Producto[]> => {
  const params = new URLSearchParams({
    page: '1',
    pageSize: '100', // Límite alto para traer "todos"
  });
  const { data } = await api.get<PaginatedResponse<Producto>>(`/products?${params}`);
  return data.data; // Retornamos el array de items
};

export const getProductoById = async (id: string): Promise<Producto> => {
  const { data } = await api.get<Producto>(`/products/${id}`);
  return data;
};

export const createProducto = async (producto: CreateProductoInput): Promise<Producto> => {
  const { data } = await api.post<Producto>('/products', producto);
  return data;
};

export const updateProducto = async (id: string, producto: UpdateProductoInput): Promise<Producto> => {
  // UpdateProductDto acepta parciales, así que enviamos solo lo que cambia
  const { data } = await api.put<Producto>(`/products/${id}`, producto);
  return data;
};

export const deleteProducto = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};