'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils/calculations';
import { Calculator, Weight, DollarSign, Percent } from 'lucide-react';
import type { PrecioCalculado } from '@/types';

interface ReporteCalculatorProps {
  calculo: PrecioCalculado | null;
  porcentajeAdicional: number;
  precioPorQuintal: number;
}

export function ReporteCalculator({ calculo, porcentajeAdicional, precioPorQuintal }: ReporteCalculatorProps) {
  if (!calculo) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Calculator className="w-5 h-5 text-primary" />
            Calculo de Precio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Selecciona un producto e ingresa el peso para ver el calculo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Calculator className="w-5 h-5 text-primary" />
          Calculo de Precio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Weight className="w-4 h-4" />
              Peso en Quintales
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatNumber(calculo.pesoEnQuintales, 4)} qq
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              Precio/Quintal
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(precioPorQuintal)}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Precio Base</span>
            <span className="text-foreground font-medium">{formatCurrency(calculo.precioBase)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Percent className="w-4 h-4" />
              <span>Adicional ({porcentajeAdicional}%)</span>
            </div>
            <span className="text-primary font-medium">+ {formatCurrency(calculo.precioAdicional)}</span>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">PRECIO TOTAL</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(calculo.precioTotal)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
