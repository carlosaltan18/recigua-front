'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Calendar, Truck, User, Package, Scale } from 'lucide-react';
import type { Report, ReportState } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils/calculations';

interface ReportDetailDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint?: (report: Report) => void;
}

export function ReportDetailDialog({
  report,
  open,
  onOpenChange,
  onPrint,
}: ReportDetailDialogProps) {
  if (!report) return null;

  const getStateColor = (state: ReportState) => {
    switch (state) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'APPROVED': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              Ticket: {report.ticketNumber}
              <Badge className={getStateColor(report.state)}>
                {report.state}
              </Badge>
            </DialogTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(report.reportDate).toLocaleDateString('es-GT', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </p>
          </div>
          {onPrint && (
            <Button variant="outline" size="sm" onClick={() => onPrint(report)} className="mr-6">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          )}
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Truck className="w-4 h-4" /> Logística
              </h3>
              <div className="space-y-2 border-l-2 border-primary/20 pl-4">
                <p className="text-sm"><strong>Proveedor:</strong> {report.supplier?.name || 'N/A'}</p>
                <p className="text-sm"><strong>Placa:</strong> <span className="uppercase font-mono">{report.plateNumber}</span></p>
                <p className="text-sm"><strong>Piloto:</strong> {report.driverName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Scale className="w-4 h-4" /> Resumen de Pesos (lb)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Bruto</p>
                    <p className="font-bold">{formatNumber(report.grossWeight)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Tara</p>
                    <p className="font-bold">{formatNumber(report.tareWeight)}</p>
                  </CardContent>
                </Card>
                <Card className="col-span-2 bg-primary/10 border-none shadow-none">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-primary font-semibold">Peso Neto Total</p>
                    <p className="text-xl font-black text-primary">{formatNumber(report.netWeight)} qq</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Desglose de Productos
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Producto</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Peso Orig.</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">QQ</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Precio/QQ</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium">{item.product?.name}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(item.weight)} {item.weightUnit}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(item.weightInQuintals, 2)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.pricePerQuintal)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.basePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales Monetarios */}
          <div className="flex justify-end">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Imponible:</span>
                <span>{formatCurrency(report.basePrice)}</span>
              </div>
              {/* <div className="flex justify-between text-sm text-primary">
                <span className="flex items-center gap-1 font-medium">
                  Adicional ({report.extraPercentage}%):
                </span>
                <span>+ {formatCurrency(report.totalPrice - report.basePrice)}</span>
              </div> */}
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">TOTAL:</span>
                <span className="text-2xl font-black text-primary">
                  {formatCurrency(report.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}