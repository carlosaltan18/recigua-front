'use client';

import { forwardRef } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils/calculations';
import { getUnidadLabel } from '@/lib/utils/conversions';
import type { Reporte } from '@/types';
import { Recycle } from 'lucide-react';

interface ReportePrintViewProps {
  reporte: Reporte;
}

const TicketCopy = ({ reporte, copyLabel }: { reporte: Reporte; copyLabel: string }) => (
  <div className="border border-gray-300 p-4 bg-white text-black">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
          <Recycle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">RECICLADORA</h1>
          <p className="text-xs text-gray-600">Sistema de Gestion</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">{copyLabel}</p>
        <p className="text-lg font-bold">{reporte.noTicket}</p>
      </div>
    </div>

    {/* Info Grid */}
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      <div>
        <span className="text-gray-600">Fecha:</span>
        <span className="ml-2 font-medium">{new Date(reporte.fecha).toLocaleDateString('es-GT')}</span>
      </div>
      <div>
        <span className="text-gray-600">Placa:</span>
        <span className="ml-2 font-medium">{reporte.placa}</span>
      </div>
      <div className="col-span-2">
        <span className="text-gray-600">Proveedor:</span>
        <span className="ml-2 font-medium">{reporte.proveedor?.nombre || '-'}</span>
      </div>
      <div className="col-span-2">
        <span className="text-gray-600">Piloto:</span>
        <span className="ml-2 font-medium">{reporte.piloto}</span>
      </div>
    </div>

    {/* Product Info */}
    <div className="bg-gray-100 p-3 rounded mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{reporte.producto?.nombre || '-'}</span>
        <span className="text-green-600 font-medium">
          {formatCurrency(reporte.producto?.precioPorQuintal || 0)}/qq
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Peso:</span>
          <span className="ml-2 font-medium">
            {formatNumber(reporte.peso)} {getUnidadLabel(reporte.unidadMedida)}
          </span>
        </div>
        <div>
          <span className="text-gray-600">En Quintales:</span>
          <span className="ml-2 font-medium">{formatNumber(reporte.pesoEnQuintales)} qq</span>
        </div>
      </div>
    </div>

    {/* Totals */}
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Precio Base:</span>
        <span>{formatCurrency(reporte.precioBase)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Adicional ({reporte.porcentajeAdicional}%):</span>
        <span className="text-green-600">+{formatCurrency(reporte.precioAdicional)}</span>
      </div>
      <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
        <span className="font-bold text-lg">TOTAL:</span>
        <span className="font-bold text-lg text-green-600">{formatCurrency(reporte.precioTotal)}</span>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-4 pt-3 border-t border-gray-300 text-center">
      <p className="text-xs text-gray-500">Gracias por su preferencia</p>
    </div>
  </div>
);

export const ReportePrintView = forwardRef<HTMLDivElement, ReportePrintViewProps>(
  function ReportePrintView({ reporte }, ref) {
    return (
      <div ref={ref} className="hidden print:block">
        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          `}
        </style>
        <div className="grid grid-rows-2 gap-4 h-full">
          <TicketCopy reporte={reporte} copyLabel="ORIGINAL" />
          <TicketCopy reporte={reporte} copyLabel="COPIA" />
        </div>
      </div>
    );
  }
);
