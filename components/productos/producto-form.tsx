'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Producto } from '@/types';

const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  precioPorQuintal: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
});

type ProductoFormData = z.infer<typeof productoSchema>;

interface ProductoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductoFormData) => void;
  producto?: Producto | null;
  isLoading?: boolean;
}

export function ProductoForm({ open, onOpenChange, onSubmit, producto, isLoading }: ProductoFormProps) {
  const isEditing = !!producto;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: producto?.nombre || '',
      precioPorQuintal: producto?.precioPorQuintal || 0,
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleFormSubmit = (data: ProductoFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza la informacion del producto' : 'Completa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-card-foreground">Nombre del Producto</Label>
            <Input
              id="nombre"
              className="bg-input border-border text-foreground"
              placeholder="Carton, Plastico PET, Aluminio..."
              {...register('nombre')}
            />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="precioPorQuintal" className="text-card-foreground">Precio por Quintal (Q)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Q</span>
              <Input
                id="precioPorQuintal"
                type="number"
                step="0.01"
                min="0"
                className="bg-input border-border text-foreground pl-8"
                placeholder="0.00"
                {...register('precioPorQuintal')}
              />
            </div>
            {errors.precioPorQuintal && <p className="text-sm text-destructive">{errors.precioPorQuintal.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                'Actualizar'
              ) : (
                'Crear Producto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
