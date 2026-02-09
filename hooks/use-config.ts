'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfiguracion, updateConfiguracion } from '@/lib/api/queries/config.queries';

export const useConfig = () => {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: getConfiguracion,
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (porcentajeAdicional: number) => updateConfiguracion(porcentajeAdicional),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });
};
