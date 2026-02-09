'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, Save, ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Producto, Proveedor, CreateReportItemDto, WeightUnit, CreateReportDto } from '@/types';
import { formatNumber } from '@/lib/utils/calculations';

// --- SCHEMAS ---
const reportSchema = z.object({
  reportDate: z.string().min(1, 'La fecha es requerida'),
  plateNumber: z.string().min(1, 'La placa es requerida'),
  supplierId: z.string().min(1, 'Selecciona un proveedor'),
  grossWeight: z.coerce.number().min(0.01, 'El peso bruto debe ser mayor a 0'),
  driverName: z.string().min(2, 'El nombre del conductor es requerido'),
});

const itemSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  weight: z.coerce.number().min(0.01, 'El peso debe ser mayor a 0'),
  weightUnit: z.enum(['quintals', 'pounds', 'kilograms', 'tons'] as const),
  discountWeight: z.coerce.number().min(0).optional(),
});

const finishSchema = z.object({
  tareWeight: z.coerce.number().min(0.01, 'La tara debe ser mayor a 0'),
});

type ReportFormData = z.infer<typeof reportSchema>;
type ItemFormData = z.infer<typeof itemSchema>;
type FinishFormData = z.infer<typeof finishSchema>;

// ============================================
// 1. FORMULARIO: CREAR REPORTE
// ============================================

interface CreateReportFormProps {
  onSubmit: (data: CreateReportDto) => Promise<void>;
  suppliers: Proveedor[];
  products: Producto[];
  isLoading?: boolean;
}

export function CreateReportForm({
  onSubmit,
  suppliers,
  isLoading,
}: CreateReportFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportDate: new Date().toISOString().split('T')[0],
      plateNumber: '',
      supplierId: '',
      grossWeight: 0,
      driverName: '',
    },
  });

  const handleFormSubmit = async (data: ReportFormData) => {
    // ESTRUCTURA JSON EXACTA PARA EL BACKEND
    const payload: CreateReportDto = {
      reportDate: data.reportDate,
      plateNumber: data.plateNumber,
      supplierId: data.supplierId,
      grossWeight: Number(data.grossWeight),
      driverName: data.driverName,
      // Backend requiere items vacío al crear
      items: [],
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pt-2 px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportDate">Fecha de Ingreso *</Label>
            <Input
              id="reportDate"
              type="date"
              {...register('reportDate')}
              className={errors.reportDate ? "border-destructive" : ""}
            />
            {errors.reportDate && <p className="text-xs text-destructive">{errors.reportDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierId">Proveedor *</Label>
            <Select
              value={watch('supplierId')}
              onValueChange={(value) => setValue('supplierId', value)}
            >
              <SelectTrigger className={errors.supplierId ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverName">Conductor *</Label>
            <Input
              id="driverName"
              placeholder="Nombre del conductor"
              {...register('driverName')}
              className={errors.driverName ? "border-destructive" : ""}
            />
            {errors.driverName && <p className="text-xs text-destructive">{errors.driverName.message}</p>}
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plateNumber">Placa del Vehículo *</Label>
            <Input
              id="plateNumber"
              placeholder="P-123ABC"
              {...register('plateNumber')}
              className={errors.plateNumber ? "border-destructive uppercase" : "uppercase"}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('plateNumber').onChange(e);
              }}
            />
            {errors.plateNumber && <p className="text-xs text-destructive">{errors.plateNumber.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossWeight">Peso Bruto (qq) *</Label>
              <Input
                id="grossWeight"
                type="number"
                step="0.01"
                min="0"
                {...register('grossWeight')}
                className={errors.grossWeight ? "border-destructive" : ""}
              />
              {errors.grossWeight && <p className="text-xs text-destructive">{errors.grossWeight.message}</p>}
            </div>

          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t mt-4">
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Guardando Reporte
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// 2. FORMULARIO: AGREGAR ITEMS (Paso 2)
// ============================================

interface AddItemsFormProps {
  reportId: string;
  grossWeight: number;
  currentItems: (CreateReportItemDto & { id?: string })[];
  products: Producto[];
  onAddItem: (item: CreateReportItemDto) => Promise<any>;
  onRemoveItem: (index: number) => void;
  onFinish: () => void;
  isLoading?: boolean;
}

export function AddItemsForm({
  grossWeight,
  currentItems,
  products,
  onAddItem,
  onRemoveItem,
  onFinish,
  isLoading,
}: AddItemsFormProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      productId: '',
      weight: 0,
      weightUnit: 'quintals',
      discountWeight: 0,
    },
  });

  const handleAddItemSubmit = async (data: ItemFormData) => {
    await onAddItem({
      productId: data.productId,
      weight: data.weight,
      weightUnit: data.weightUnit as WeightUnit,
      discountWeight: data.discountWeight,
    });
    reset({
      productId: '',
      weight: 0,
      weightUnit: data.weightUnit,
      discountWeight: 0,
    });
  };

  const totalWeight = currentItems.reduce((sum, item) => sum + Number(item.weight), 0);
  const remainingWeight = grossWeight - totalWeight;

  return (
    <div className="space-y-6 pt-2">
      {/* Resumen de Pesos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/40 rounded-lg border">
        <div>
          <p className="text-sm text-muted-foreground">Peso Bruto</p>
          <p className="text-xl font-bold">{formatNumber(grossWeight)}qq</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Acumulado</p>
          <p className={`text-xl font-bold ${totalWeight > grossWeight ? 'text-destructive' : 'text-primary'}`}>
            {formatNumber(totalWeight)} qq
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Restante</p>
          <p className="text-xl font-bold text-muted-foreground">
            {formatNumber(remainingWeight)} qq
          </p>
        </div>
      </div>

      {/* Grid Principal: Ajustado a base 12 para mayor ancho en el formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Formulario Agregar - Ahora más ancho (5 de 12 columnas) */}
        <Card className="lg:col-span-5 h-fit border-[#009421] shadow-sm">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-primary" /> Nuevo Producto
            </h3>
            <form onSubmit={handleSubmit(handleAddItemSubmit)} className="space-y-5">
              {/* Selector de Producto */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Producto</Label>
                <Select
                  value={watch('productId')}
                  onValueChange={(val) => setValue('productId', val)}
                >
                  <SelectTrigger className={`h-11 ${errors.productId ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Seleccionar producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-xs text-destructive">{errors.productId.message}</p>}
              </div>

              {/* Fila de Peso: Input largo + Select */}
              <div className="space-y-2 ">
                <Label className="text-sm font-medium">Peso</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    {...register('weight')}
                    placeholder="0.00"
                    className={`flex-1 h-11 text-base ${errors.weight ? "border-destructive" : ""}`}
                  />
                  <Select
                    value={watch('weightUnit')}
                    onValueChange={(val) => setValue('weightUnit', val as WeightUnit)}
                  >
                    <SelectTrigger className="w-[125px] h-11 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pounds">Libras</SelectItem>
                      <SelectItem value="quintals">Quintales</SelectItem>
                      <SelectItem value="kilograms">Kilogramos</SelectItem>
                      <SelectItem value="tons">Toneladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
              </div>

              {/* Input de Descuento */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Descuento (Opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('discountWeight')}
                  placeholder="0.00"
                  className="h-11 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 mt-2 font-semibold bg-[#009421] hover:bg-green-700 text-white transition-colors"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Agregar Producto"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Productos Cargados (7 de 12 columnas) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Productos Cargados
            <span className="bg-muted px-2 py-0.5 rounded-full text-sm font-bold">
              {currentItems.length}
            </span>
          </h3>

          {currentItems.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
              No hay productos agregados aún.
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {currentItems.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#009421] border rounded-xl shadow-sm hover:border-primary/30 transition-all">
                    <div>
                      <p className="font-bold text-foreground text-base">{product?.name || 'Producto'}</p>
                      <p className="text-sm text-muted-foreground flex gap-2">
                        <span className="font-medium">{formatNumber(item.weight)} {item.weightUnit}</span>
                        {item.discountWeight ? (
                          <span className="text-destructive font-medium border-l pl-2">
                            -{item.discountWeight} desc.
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(index)}
                      className="text-muted-foreground hover:text-destructive hover:bg-[#009421] rounded-full"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Botón de Acción Final */}
      <div className="flex justify-end pt-6 border-t mt-4">
        <Button
          onClick={onFinish}
          disabled={currentItems.length === 0 || isLoading}
          size="lg"
          className="px-8 font-bold shadow-md"
        >
          Continuar a Finalizar
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// 3. FORMULARIO: FINALIZAR (TARA)
// ============================================

interface FinishFormProps {
  reportId: string;
  grossWeight: number;
  totalItemsWeight: number;
  onFinish: (data: { tareWeight: number }) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

export function FinishReportForm({
  grossWeight,
  totalItemsWeight,
  onFinish,
  onBack,
  isLoading,
}: FinishFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FinishFormData>({
    resolver: zodResolver(finishSchema),
    defaultValues: {
      tareWeight: 0,
    },
  });

  const tareWeight = watch('tareWeight') || 0;
  const netWeight = grossWeight - tareWeight;
  const difference = Math.abs(netWeight - totalItemsWeight);

  const onSubmit = async (data: FinishFormData) => {
    await onFinish(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Peso Bruto</p>
            <p className="text-2xl font-bold">{formatNumber(grossWeight)} qq</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Suma Productos</p>
            <p className="text-2xl font-bold text-primary">{formatNumber(totalItemsWeight)} qq</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="tareWeight" className="text-lg">Peso Tara (Camión Vacío) *</Label>
          <Input
            id="tareWeight"
            type="number"
            step="0.01"
            className="text-xl h-14 pl-4 font-bold"
            placeholder="0.00"
            {...register('tareWeight')}
          />
          {errors.tareWeight && <p className="text-sm text-destructive">{errors.tareWeight.message}</p>}
        </div>

        <div className="bg-card border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span>Peso Neto Calculado:</span>
            <span className="font-bold text-lg">{formatNumber(netWeight)} qq</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span>Diferencia (Neto vs Productos):</span>
            <span className={`font-bold ${difference > 5 ? 'text-destructive' : 'text-green-600'}`}>
              {formatNumber(difference)} qq
            </span>
          </div>
        </div>

        {/* El error aparece si la tara es mayor o igual al peso bruto */}
        
        { Number(tareWeight) > ((grossWeight - totalItemsWeight)) && (
          <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-medium text-center">
            ⚠️ Error: La tara no puede ser mayor o igual al peso bruto.
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-6">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="w-1/3">
          <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
        </Button>
        <Button type="submit" disabled={isLoading || tareWeight > (grossWeight - totalItemsWeight)} className="w-2/3">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Finalizar</>}
        </Button>
      </div>
    </form>
  );
}