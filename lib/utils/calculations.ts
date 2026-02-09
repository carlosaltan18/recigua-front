import type { PrecioCalculado, UnidadMedida } from '@/types';
import { convertToQuintales } from './conversions';

export const calcularPrecioReporte = (
  precioPorQuintal: number,
  peso: number,
  unidadMedida: UnidadMedida,
  porcentajeAdicional: number
): PrecioCalculado => {
  const pesoEnQuintales = convertToQuintales(peso, unidadMedida);
  const precioBase = precioPorQuintal * pesoEnQuintales;
  const precioAdicional = precioBase * (porcentajeAdicional / 100);
  const precioTotal = precioBase + precioAdicional;

  return {
    precioBase: Number(precioBase.toFixed(2)),
    precioAdicional: Number(precioAdicional.toFixed(2)),
    precioTotal: Number(precioTotal.toFixed(2)),
    pesoEnQuintales,
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
