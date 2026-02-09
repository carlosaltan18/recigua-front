'use client';

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Calendar, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateUser } from '@/hooks/use-users'; 
import { isAdmin } from '@/types';

export default function PerfilPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userIsAdmin = isAdmin(user);
  const updateUserMutation = useUpdateUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    currentPassword: '', // Solo para validación front
    newPassword: '',     // Se enviará como 'password'
    confirmPassword: '', // Solo para validación front
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.firstName || '',
        apellido: user.lastName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // --- VALIDACIONES FRONTEND ---
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      // 1. Forzar que escriba la actual para estar seguro (Validación Front)
      if (!formData.currentPassword) {
        toast({
          title: 'Validación',
          description: 'Por seguridad, ingresa tu contraseña actual para confirmar los cambios',
          variant: 'destructive',
        });
        return;
      }

      // 2. Validar que la nueva y la confirmación coincidan
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'La nueva contraseña y la confirmación no coinciden',
          variant: 'destructive',
        });
        return;
      }

      // 3. Longitud mínima
      if (formData.newPassword.length < 6) {
        toast({
          title: 'Error',
          description: 'La nueva contraseña debe tener al menos 6 caracteres',
          variant: 'destructive',
        });
        return;
      }
    }

    // --- PREPARACIÓN DE DATOS PARA EL BACKEND ---
    const updateData: any = {
      firstName: formData.nombre,
      lastName: formData.apellido,
      email: formData.email,
    };

    // Si hay una nueva contraseña validada, se envía al campo 'password' que pide tu backend
    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }

    if (!user?.id) return;

    updateUserMutation.mutate(
      { id: user.id, data: updateData },
      {
        onSuccess: () => {
          toast({
            title: 'Perfil actualizado',
            description: 'Tus datos se han guardado correctamente',
          });
          setIsEditing(false);
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        },
        onError: (error: any) => {
          toast({
            title: 'Error al actualizar',
            description: error.response?.data?.message || 'No se pudo actualizar el perfil',
            variant: 'destructive',
          });
        }
      }
    );
  };

  const handleCancel = () => {
    setFormData({
      nombre: user?.firstName || '',
      apellido: user?.lastName || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y seguridad</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20">
                {userIsAdmin ? <Shield className="w-12 h-12 text-primary" /> : <User className="w-12 h-12 text-primary" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleInputChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="pl-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Seguridad (Validación Local)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Confirma tu identidad"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Esta se enviará al backend"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={updateUserMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Editar Perfil
          </Button>
        )}
      </div>
    </div>
  );
}