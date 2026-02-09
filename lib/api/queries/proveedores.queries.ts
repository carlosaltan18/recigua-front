import api from '../axios-instance';
import type { Proveedor, CreateProveedorInput, UpdateProveedorInput, PaginatedResponse } from '@/types';

// Endpoint base según tu supplier.controller.ts: /suppliers

export const getProveedores = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<PaginatedResponse<Proveedor>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) params.append('search', search);

  const { data } = await api.get<PaginatedResponse<Proveedor>>(`/suppliers?${params}`);
  return data;
};

// Workaround: Tu backend no tiene '/suppliers/all'.
// Pedimos una página grande para llenar dropdowns.
export const getAllProveedores = async (): Promise<Proveedor[]> => {
  const params = new URLSearchParams({
    page: '1',
    pageSize: '100',
  });
  const { data } = await api.get<PaginatedResponse<Proveedor>>(`/suppliers?${params}`);
  return data.data; // Retornamos el array de proveedores
};

export const getProveedorById = async (id: string): Promise<Proveedor> => {
  const { data } = await api.get<Proveedor>(`/suppliers/${id}`);
  return data;
};

export const createProveedor = async (proveedor: CreateProveedorInput): Promise<Proveedor> => {
  const { data } = await api.post<Proveedor>('/suppliers', proveedor);
  return data;
};

export const updateProveedor = async (id: string, proveedor: UpdateProveedorInput): Promise<Proveedor> => {
  const { data } = await api.put<Proveedor>(`/suppliers/${id}`, proveedor);
  return data;
};

export const deleteProveedor = async (id: string): Promise<void> => {
  await api.delete(`/suppliers/${id}`);
};