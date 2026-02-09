'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, Settings, Percent, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const configSchema = z.object({
  porcentajeAdicional: z.coerce.number().min(0, 'El porcentaje debe ser mayor o igual a 0').max(100, 'El porcentaje no puede ser mayor a 100'),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function ConfiguracionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      porcentajeAdicional: 5,
    },
  });

  const onSubmit = (data: ConfigFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: 'Configuracion guardada',
        description: `El porcentaje adicional se actualizo a ${data.porcentajeAdicional}%`,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="text-muted-foreground">Ajusta los parametros del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Percent className="w-5 h-5 text-primary" />
              Porcentaje Adicional
            </CardTitle>
            <CardDescription>
              Este porcentaje se aplica automaticamente al precio base de todos los reportes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="porcentajeAdicional" className="text-card-foreground">
                  Porcentaje (%)
                </Label>
                <div className="relative max-w-xs">
                  <Input
                    id="porcentajeAdicional"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="bg-input border-border text-foreground pr-10"
                    {...register('porcentajeAdicional')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                {errors.porcentajeAdicional && (
                  <p className="text-sm text-destructive">{errors.porcentajeAdicional.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
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
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Info className="w-5 h-5 text-primary" />
              Informacion del Sistema
            </CardTitle>
            <CardDescription>Datos generales de la aplicacion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Ambiente</span>
                <span className="text-foreground font-medium">Produccion</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Ultima actualizacion</span>
                <span className="text-foreground font-medium">Enero 2026</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Desarrollado por</span>
                <span className="text-foreground font-medium">v0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Settings className="w-5 h-5 text-primary" />
              Guia de Uso
            </CardTitle>
            <CardDescription>Instrucciones rapidas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-medium text-foreground mb-2">Crear un Reporte</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Ve a la seccion de Ingresos</li>
                  <li>Haz clic en "Nuevo Ingreso"</li>
                  <li>Completa los datos del formulario</li>
                  <li>El precio se calcula automaticamente</li>
                  <li>Guarda el reporte</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-medium text-foreground mb-2">Exportar Datos</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Ve a la seccion de Ingresos</li>
                  <li>Aplica los filtros deseados</li>
                  <li>Haz clic en "Exportar"</li>
                  <li>Selecciona el formato (Detallado o Resumen)</li>
                  <li>El archivo CSV se descargara automaticamente</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-medium text-foreground mb-2">Imprimir Ticket</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Busca el reporte en la lista</li>
                  <li>Haz clic en el icono de impresora</li>
                  <li>Se generaran 2 copias en una hoja</li>
                  <li>Confirma la impresion</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-medium text-foreground mb-2">Calculo de Precios</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Precio Base = Precio/Quintal x Peso en Quintales</li>
                  <li>Adicional = Precio Base x Porcentaje</li>
                  <li>Total = Precio Base + Adicional</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
