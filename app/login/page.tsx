'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Ingresa un email valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginMutation } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast({
        title: 'Bienvenido',
        description: 'Has iniciado sesion correctamente',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Credenciales invalidas. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  // Demo login as Admin
  const handleDemoAdmin = () => {
    localStorage.setItem('auth_token', 'demo_token_admin');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '1',
        nombre: 'Admin',
        apellido: 'Demo',
        email: 'admin@recigua.com',
        roles: [{ id: '1', nombre: 'admin' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    router.push('/dashboard');
  };

  // Demo login as User
  const handleDemoUser = () => {
    localStorage.setItem('auth_token', 'demo_token_user');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '2',
        nombre: 'Usuario',
        apellido: 'Demo',
        email: 'usuario@recigua.com',
        roles: [{ id: '2', nombre: 'user' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    router.push('/dashboard/ingresos');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg p-2">
            <Image
              src="/logo.png"
              alt="Recigua Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800">RECIGUA</h1>
            <p className="text-green-600 italic">Por un mundo verde</p>
          </div>
        </div>

        <Card className="border-green-200 bg-white shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-green-800">Iniciar Sesion</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-800">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-800">
                  Contrasena
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </form>

           
          </CardContent>
        </Card>

        <p className="text-center text-sm text-green-700">
          RECIGUA - Sistema de Gestion
        </p>
      </div>
    </div>
  );
}
