import api from '../axios-instance';
import type { LoginInput, AuthResponse, User } from '@/types';

export async function login(credentials: LoginInput): Promise<AuthResponse> {
  // Coincide con @Post('login') en AuthController
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
}

export async function logout(): Promise<void> {
  // Coincide con @Post('logout')
  await api.post('/auth/logout');
}

export async function getCurrentUser(): Promise<User> {
  // Coincide con @Get('me')
  const { data } = await api.get<User>('/auth/me');
  return data;
}