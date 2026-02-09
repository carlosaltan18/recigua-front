import api from '../axios-instance';
import type { User, Role, CreateUserInput, UpdateUserInput, PaginatedResponse } from '@/types';

export const getUsers = async (page: number = 1, pageSize: number = 10, search?: string): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) params.append('search', search);
  
  const { data } = await api.get<PaginatedResponse<User>>(`/users?${params}`);
  return data;
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
};

export const createUser = async (user: CreateUserInput): Promise<User> => {
  // El backend espera firstName y lastName (definido en tu CreateUserInput actualizado)
  const { data } = await api.post<User>('/users', user);
  return data;
};

export const updateUser = async (id: string, user: UpdateUserInput): Promise<User> => {
  const { data } = await api.put<User>(`/users/${id}`, user);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

// CORRECCIÓN CRÍTICA: El backend espera 'roleNames' (ChangeRoleDto), no 'roleIds'
export const updateUserRoles = async (id: string, roleNames: string[]): Promise<User> => {
  const { data } = await api.put<User>(`/users/${id}/roles`, { roleNames });
  return data;
};

export const getRoles = async (): Promise<Role[]> => {
  const { data } = await api.get<Role[]>('/roles');
  return data;
};