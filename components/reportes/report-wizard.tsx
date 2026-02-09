'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CreateReportForm, AddItemsForm, FinishReportForm } from './reporte-form';
import type { 
  Proveedor, 
  Producto, 
  CreateReportItemDto, 
  CreateReportDto, 
  Report,
  WeightUnit
} from '@/types';
import { useToast } from '@/hooks/use-toast';

type WizardItem = CreateReportItemDto & { id?: string; weightInQuintals?: number };

interface ReportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Proveedor[];
  products: Producto[];
  onCreateReport: (data: CreateReportDto) => Promise<string>; 
  onAddItem: (reportId: string, item: CreateReportItemDto) => Promise<Report>; 
  onRemoveItem: (reportId: string, itemId: string) => Promise<Report>;
  onFinish: (reportId: string, tareWeight: number) => Promise<void>;
  onSuccess: () => void;
}

type Step = 'create' | 'items' | 'finish';

export function ReportWizard({
  open,
  onOpenChange,
  suppliers,
  products,
  onCreateReport,
  onAddItem,
  onRemoveItem,
  onFinish,
  onSuccess,
}: ReportWizardProps) {
  const [step, setStep] = useState<Step>('create');
  const [reportId, setReportId] = useState<string | null>(null);
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [items, setItems] = useState<WizardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Función de utilidad para conversión visual antes de recibir respuesta del servidor
  const convertToQuintals = (weight: number, unit: WeightUnit): number => {
    const factors = { quintals: 1, pounds: 0.01, kilograms: 0.022046, tons: 20 };
    return weight * (factors[unit] || 1);
  };

  const handleReset = () => {
    setStep('create');
    setReportId(null);
    setGrossWeight(0);
    setItems([]);
    setIsLoading(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      handleReset();
      onOpenChange(false);
    }
  };

  const handleCreateReport = async (data: CreateReportDto) => {
    setIsLoading(true);
    try {
      const id = await onCreateReport(data);
      setReportId(id);
      setGrossWeight(data.grossWeight);
      
      // Si quieres que siga al paso 2, usa setStep('items')
      // Si quieres que cierre, usa handleClose() y onSuccess() como pediste antes
      setStep('items'); 
      toast({ title: 'Reporte iniciado', description: 'Agrega los productos.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al crear', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (itemDto: CreateReportItemDto) => {
    if (!reportId) return;
    setIsLoading(true);
    try {
      const updatedReport = await onAddItem(reportId, itemDto);
      if (updatedReport.items) {
        setItems(updatedReport.items.map(i => ({
          id: i.id,
          productId: i.productId || (i as any).product?.id, 
          weight: Number(i.weight),
          weightUnit: i.weightUnit,
          discountWeight: i.discountWeight || 0,
          weightInQuintals: i.weightInQuintals // Crucial: Usar el valor del backend
        })));
      }
      toast({ title: 'Producto agregado' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'No se pudo agregar item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (index: number) => {
    const item = items[index];
    if (item.id && reportId) {
      setIsLoading(true);
      try {
        const updatedReport = await onRemoveItem(reportId, item.id);
        setItems(updatedReport.items?.map(i => ({
          id: i.id,
          productId: i.productId || (i as any).product?.id,
          weight: Number(i.weight),
          weightUnit: i.weightUnit,
          discountWeight: i.discountWeight || 0,
          weightInQuintals: i.weightInQuintals
        })) || []);
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFinishReport = async (data: { tareWeight: number }) => {
    if (!reportId) return;
    setIsLoading(true);
    try {
      await onFinish(reportId, data.tareWeight);
      toast({ title: 'Reporte Finalizado' });
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // CÁLCULO TOTAL EN QUINTALES: Suma los valores convertidos
  const totalItemsWeightInQuintals = items.reduce((sum, item) => {
    return sum + (item.weightInQuintals || convertToQuintals(item.weight, item.weightUnit as WeightUnit));
  }, 0);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Nuevo Reporte
            <Badge variant="outline" className="bg-[#009421] text-white border-none">
              {step === 'create' ? 'Paso 1: Datos' : step === 'items' ? 'Paso 2: Productos' : 'Paso 3: Cierre'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Registro de ingreso - Valores totalizados en <strong>Quintales (qq)</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {step === 'create' && (
            <CreateReportForm 
              suppliers={suppliers}
              products={products}
              onSubmit={handleCreateReport}
              isLoading={isLoading}
            />
          )}

          {step === 'items' && reportId && (
            <AddItemsForm 
              reportId={reportId}
              grossWeight={grossWeight}
              currentItems={items as any}
              products={products}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onFinish={() => setStep('finish')}
              isLoading={isLoading}
            />
          )}

          {step === 'finish' && reportId && (
            <FinishReportForm 
              reportId={reportId}
              grossWeight={grossWeight}
              totalItemsWeight={totalItemsWeightInQuintals} // Enviamos el total convertido
              onFinish={handleFinishReport}
              onBack={() => setStep('items')}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}