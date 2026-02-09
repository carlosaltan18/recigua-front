import api from '../axios-instance';
import type { ConfiguracionSistema } from '@/types';

export const getConfiguracion = async (): Promise<ConfiguracionSistema> => {
  const { data } = await api.get<ConfiguracionSistema>('/config');
  return data;
};

export const updateConfiguracion = async (porcentajeAdicional: number): Promise<ConfiguracionSistema> => {
  const { data } = await api.put<ConfiguracionSistema>('/config', { porcentajeAdicional });
  return data;
};
