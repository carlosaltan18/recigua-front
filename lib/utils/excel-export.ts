import type { Reporte } from '@/types';
import { formatCurrency, formatNumber } from './calculations';

export const exportToExcelDetailed = (reportes: Reporte[], filename: string = 'reportes-detallado') => {
  const headers = [
    'Fecha',
    'No. Ticket',
    'Proveedor',
    'Producto',
    'Placa',
    'Piloto',
    'Peso',
    'Unidad',
    'Peso (Quintales)',
    'Precio Base',
    '% Adicional',
    'Precio Adicional',
    'Precio Total',
  ];

  const rows = reportes.map((r) => [
    new Date(r.fecha).toLocaleDateString('es-GT'),
    r.noTicket,
    r.proveedor?.nombre || '-',
    r.producto?.nombre || '-',
    r.placa,
    r.piloto,
    r.peso,
    r.unidadMedida,
    formatNumber(r.pesoEnQuintales),
    formatCurrency(r.precioBase),
    `${r.porcentajeAdicional}%`,
    formatCurrency(r.precioAdicional),
    formatCurrency(r.precioTotal),
  ]);

  downloadCSV([headers, ...rows], `${filename}.csv`);
};

export const exportToExcelResumen = (
  resumen: { producto: string; pesoTotal: number; montoTotal: number }[],
  filename: string = 'reportes-resumen'
) => {
  const headers = ['Producto', 'Peso Total (Quintales)', 'Monto Total'];

  const rows = resumen.map((r) => [
    r.producto,
    formatNumber(r.pesoTotal),
    formatCurrency(r.montoTotal),
  ]);

  // Add totals row
  const totalPeso = resumen.reduce((acc, r) => acc + r.pesoTotal, 0);
  const totalMonto = resumen.reduce((acc, r) => acc + r.montoTotal, 0);
  rows.push(['TOTAL', formatNumber(totalPeso), formatCurrency(totalMonto)]);

  downloadCSV([headers, ...rows], `${filename}.csv`);
};

const downloadCSV = (data: (string | number)[][], filename: string) => {
  const csvContent = data
    .map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          // Escape quotes and wrap in quotes if contains comma or newline
          if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
