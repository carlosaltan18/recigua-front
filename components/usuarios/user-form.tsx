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
import { Checkbox } from '@/components/ui/checkbox';
import type { User, Role } from '@/types';

const userSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres').optional().or(z.literal('')),
  roleIds: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  user?: User | null;
  roles: Role[];
  isLoading?: boolean;
}

export function UserForm({ open, onOpenChange, onSubmit, user, roles, isLoading }: UserFormProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nombre: user?.firstName || '',
      apellido: user?.lastName || '',
      email: user?.email || '',
      password: '',
      roleIds: user?.roles.map((r) => r.id) || [],
    },
  });

  const selectedRoles = watch('roleIds');

  const handleRoleToggle = (roleId: string) => {
    const current = selectedRoles || [];
    if (current.includes(roleId)) {
      setValue('roleIds', current.filter((id) => id !== roleId));
    } else {
      setValue('roleIds', [...current, roleId]);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza la informacion del usuario' : 'Completa los datos del nuevo usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-card-foreground">Nombre</Label>
              <Input
                id="nombre"
                className="bg-input border-border text-foreground"
                {...register('nombre')}
              />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido" className="text-card-foreground">Apellido</Label>
              <Input
                id="apellido"
                className="bg-input border-border text-foreground"
                {...register('apellido')}
              />
              {errors.apellido && <p className="text-sm text-destructive">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              className="bg-input border-border text-foreground"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground">
              {isEditing ? 'Contrasena (dejar vacio para no cambiar)' : 'Contrasena'}
            </Label>
            <Input
              id="password"
              type="password"
              className="bg-input border-border text-foreground"
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Roles</Label>
            <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles?.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <label
                    htmlFor={`role-${role.id}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {role.name}
                    {role.description && (
                      <span className="text-muted-foreground ml-1">- {role.description}</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
            {errors.roleIds && <p className="text-sm text-destructive">{errors.roleIds.message}</p>}
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
                'Crear Usuario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
