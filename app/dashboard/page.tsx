'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileInput, Building2, Package, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { useReports } from '@/hooks/use-reportes';
import { useAllProveedores } from '@/hooks/use-proveedores';
import { useAllProductos } from '@/hooks/use-productos';
import { formatCurrency, formatNumber } from '@/lib/utils/calculations';

export default function DashboardPage() {
  // 1. Cargar data real de los hooks
  // Usamos un tamaño de página grande para el dashboard o un endpoint específico de stats si lo tuvieras
  const { data: reportsData, isLoading: isLoadingReports } = useReports(1, 10, {}); 
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useAllProveedores();
  const { data: products = [], isLoading: isLoadingProducts } = useAllProductos();

  const reports = reportsData?.data || [];
  const isLoading = isLoadingReports || isLoadingSuppliers || isLoadingProducts;

  // 2. Cálculos dinámicos basados en la data
  const totalReportsToday = reports.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.reportDate.startsWith(today);
  }).length;

  const totalMonthlyRevenue = reports
    .filter(r => r.state === 'APPROVED')
    .reduce((acc, curr) => acc + Number(curr.totalPrice || 0), 0);

  // Agrupar ingresos por producto para la lista
  const revenueByProduct = reports.reduce((acc: Record<string, number>, report) => {
    report.items.forEach(item => {
      const name = item.product?.name || 'Otros';
      acc[name] = (acc[name] || 0) + (Number(item.weight) * Number(item.product?.pricePerQuintal || 0));
    });
    return acc;
  }, {});

  const stats = [
    {
      title: 'Usuarios Sistema',
      value: '4', // Este valor podrías traerlo de un useUsers si existiera
      description: 'Personal autorizado',
      icon: Users,
      trend: 'Activos ahora',
    },
    {
      title: 'Ingresos Hoy',
      value: totalReportsToday.toString(),
      description: 'Reportes pesados hoy',
      icon: FileInput,
      trend: 'Actualizado recién',
    },
    {
      title: 'Proveedores',
      value: suppliers.length.toString(),
      description: 'Empresas y recolectores',
      icon: Building2,
      trend: `+${suppliers.slice(-2).length} nuevos`,
    },
    {
      title: 'Productos',
      value: products.length.toString(),
      description: 'Categorías de reciclaje',
      icon: Package,
      trend: 'Precios vigentes',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen operativo de la recicladora</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center mt-2 text-xs text-primary font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Card Real 
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <DollarSign className="w-5 h-5 text-primary" />
              Ingresos Totales (Vista Actual)
            </CardTitle>
            <CardDescription>Basado en reportes aprobados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">
              {formatCurrency(totalMonthlyRevenue)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Desglose por material:</p>
            <div className="mt-4 space-y-3">
              {Object.entries(revenueByProduct).slice(0, 4).map(([name, value]) => (
                <div key={name} className="flex justify-between text-sm border-b border-border/50 pb-1">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="text-card-foreground font-medium">{formatCurrency(value)}</span>
                </div>
              ))}
              {Object.keys(revenueByProduct).length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-4">No hay datos de ingresos suficientes</p>
              )}
            </div>
          </CardContent>
        </Card> 
        */}

        {/* Actividad Reciente Real */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Últimos Ingresos</CardTitle>
            <CardDescription>Reportes registrados recientemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full ${report.state === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">
                      Ticket #{report.ticketNumber} - {report.supplier?.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {report.items.length} productos | {formatNumber(report.netWeight)} lb neto
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(report.reportDate).toLocaleDateString('es-GT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-10">No hay actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}