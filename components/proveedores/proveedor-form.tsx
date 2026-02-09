'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Proveedor } from '@/types';

const proveedorSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  direccion: z.string().min(5, 'La direccion debe tener al menos 5 caracteres'),
  telefono: z.string().min(8, 'El telefono debe tener al menos 8 caracteres'),
  representante: z.string().min(2, 'El representante debe tener al menos 2 caracteres'),
});

type ProveedorFormData = z.infer<typeof proveedorSchema>;

interface ProveedorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProveedorFormData) => void;
  proveedor?: Proveedor | null;
  isLoading?: boolean;
}

export function ProveedorForm({ open, onOpenChange, onSubmit, proveedor, isLoading }: ProveedorFormProps) {
  const isEditing = !!proveedor;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre: proveedor?.nombre || '',
      direccion: proveedor?.direccion || '',
      telefono: proveedor?.telefono || '',
      representante: proveedor?.representante || '',
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleFormSubmit = (data: ProveedorFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza la informacion del proveedor' : 'Completa los datos del nuevo proveedor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-card-foreground">Nombre</Label>
            <Input
              id="nombre"
              className="bg-input border-border text-foreground"
              placeholder="Reciclados del Norte S.A."
              {...register('nombre')}
            />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="representante" className="text-card-foreground">Representante</Label>
            <Input
              id="representante"
              className="bg-input border-border text-foreground"
              placeholder="Juan Perez"
              {...register('representante')}
            />
            {errors.representante && <p className="text-sm text-destructive">{errors.representante.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-card-foreground">Telefono</Label>
            <Input
              id="telefono"
              className="bg-input border-border text-foreground"
              placeholder="5555-1234"
              {...register('telefono')}
            />
            {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion" className="text-card-foreground">Direccion</Label>
            <Textarea
              id="direccion"
              className="bg-input border-border text-foreground min-h-[80px]"
              placeholder="Zona 5, Ciudad de Guatemala"
              {...register('direccion')}
            />
            {errors.direccion && <p className="text-sm text-destructive">{errors.direccion.message}</p>}
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
                'Crear Proveedor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
