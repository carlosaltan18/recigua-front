'use client';

import { useState, useEffect } from 'react'; // 1. Importar useEffect
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AddItemsForm, FinishReportForm } from './reporte-form';
import type { Report, Product, CreateReportItemDto, WeightUnit } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AddItemsDialogProps {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onAddItem: (reportId: string, item: CreateReportItemDto) => Promise<Report>;
  onFinish: (reportId: string, tareWeight: number) => Promise<any>;
  onSuccess: () => void;
}

export function AddItemsDialog({
  report,
  open,
  onOpenChange,
  products,
  onAddItem,
  onFinish,
  onSuccess,
}: AddItemsDialogProps) {
  const [step, setStep] = useState<'items' | 'finish'>('items');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 2. Sincronización forzada: Si cambia el reporte prop, actualizamos el estado local
  const [currentReport, setCurrentReport] = useState<Report>(report);

  useEffect(() => {
    if (open) {
      setCurrentReport(report);
      setStep('items');
    }
  }, [report, open]);

  // Función de utilidad robusta para evitar NaN
  const convertToQuintals = (weight: any, unit: any): number => {
    const w = Number(weight) || 0;
    const factors: Record<string, number> = {
      quintals: 1,
      pounds: 0.01,
      kilograms: 0.022046,
      tons: 20,
    };
    return w * (factors[unit] || 1);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleAddItem = async (itemDto: CreateReportItemDto) => {
    setIsLoading(true);
    try {
      const updatedReport = await onAddItem(currentReport.id, itemDto);
      // 3. Reemplazamos el objeto completo para asegurar que React detecte el cambio
      setCurrentReport({...updatedReport}); 

      toast({
        title: 'Producto agregado',
        description: 'Peso convertido a quintales exitosamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al agregar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishReport = async (data: { tareWeight: number }) => {
    setIsLoading(true);
    try {
      await onFinish(currentReport.id, data.tareWeight);
      toast({ title: 'Reporte finalizado' });
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al finalizar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Cálculo TOTAL con protección contra valores nulos/undefined
  const totalItemsWeightInQuintals = (currentReport.items || []).reduce((sum, item) => {
    // Priorizamos el valor que ya viene convertido del backend
    const weightVal = item.weightInQuintals 
      ? Number(item.weightInQuintals) 
      : convertToQuintals(item.weight, item.weightUnit as WeightUnit);
    
    return sum + weightVal;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ticket: {currentReport.ticketNumber}
            <Badge variant="outline" className="bg-[#009421] text-white border-none">
              {step === 'items' ? 'Carga de Productos' : 'Cierre de Ticket'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Peso total acumulado: <strong>{totalItemsWeightInQuintals.toFixed(2)} qq</strong>.
          </DialogDescription>
        </DialogHeader>

        {step === 'items' && (
          <AddItemsForm
            reportId={currentReport.id}
            grossWeight={Number(currentReport.grossWeight)}
            currentItems={currentReport.items as any}
            products={products}
            onAddItem={handleAddItem}
            onRemoveItem={() => {}} 
            onFinish={() => setStep('finish')}
            isLoading={isLoading}
          />
        )}

        {step === 'finish' && (
          <FinishReportForm
            reportId={currentReport.id}
            grossWeight={Number(currentReport.grossWeight)}
            totalItemsWeight={totalItemsWeightInQuintals}
            onFinish={handleFinishReport}
            onBack={() => setStep('items')}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}