import type { UnidadMedida } from '@/types';

// Conversion factors to quintales
// 1 quintal = 100 libras = 45.36 kg
const CONVERSIONES: Record<UnidadMedida, number> = {
  quintals: 1,
  pounds: 0.01, // 1 libra = 0.01 quintales
  kilograms: 0.022046, // 1 kg = 0.022046 quintales
  tons: 22.046, // 1 tonelada = 22.046 quintales
};

export const convertToQuintales = (peso: number, unidad: UnidadMedida): number => {
  return Number((peso * CONVERSIONES[unidad]).toFixed(4));
};

export const getUnidadLabel = (unidad: UnidadMedida): string => {
  const labels: Record<UnidadMedida, string> = {
    quintals: 'Quintales',
    pounds: 'Libras',
    kilograms: 'Kilogramos',
    tons: 'Toneladas',
  };
  return labels[unidad];
};

export const UNIDADES_MEDIDA: { value: UnidadMedida; label: string }[] = [
  { value: 'quintals', label: 'Quintales' },
  { value: 'pounds', label: 'Libras' },
  { value: 'kilograms', label: 'Kilogramos' },
  { value: 'tons', label: 'Toneladas' },
];
