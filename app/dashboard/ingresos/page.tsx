'use client';

import { useState } from 'react';
import { Plus, Printer, Eye, Ban, Download, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ReportWizard } from '@/components/reportes/report-wizard';
import { ReportFiltersComponent } from '@/components/reportes/report-filters';
import { ReportDetailDialog } from '@/components/reportes/report-detail-dialog';
import { AddItemsDialog } from '@/components/reportes/add-items-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatNumber } from '@/lib/utils/calculations';
import type { Report, ReportFilters, ReportState, CreateReportDto, CreateReportItemDto } from '@/types';

// Importar Hooks Reales
import {
  useReports,
  useCreateReport,
  useAddReportItem,
  useRemoveReportItem,
  useFinishReport,
  useCancelReport,
  useDownloadReportPdf,
  useDownloadReportsExcel,
} from '@/hooks/use-reportes';

import { useAllProveedores } from '@/hooks/use-proveedores'; 
import { useAllProductos } from '@/hooks/use-productos';     

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Estados de Modales
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [addItemsReport, setAddItemsReport] = useState<Report | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reportToCancel, setReportToCancel] = useState<Report | null>(null);
  
  const { toast } = useToast();

  const { data: reportsData, isLoading: isLoadingReports, refetch } = useReports(page, pageSize, filters);
  const { data: suppliers = [] } = useAllProveedores(); 
  const { data: products = [] } = useAllProductos();

  const createReportMutation = useCreateReport();
  const addItemMutation = useAddReportItem();
  const removeItemMutation = useRemoveReportItem();
  const finishReportMutation = useFinishReport();
  const cancelReportMutation = useCancelReport();
  const downloadPdfMutation = useDownloadReportPdf();
  const downloadExcelMutation = useDownloadReportsExcel();

  const reports = reportsData?.data || [];
  const totalPages = reportsData?.totalPages || 1;

  const handleCreateReport = async (data: CreateReportDto): Promise<string> => {
    const result = await createReportMutation.mutateAsync(data);
    return result.id; 
  };

  const handleAddItem = async (reportId: string, item: CreateReportItemDto) => {
    return await addItemMutation.mutateAsync({ reportId, item });
  };

  // [CORREGIDO] Agregado handler para remover item
  const handleRemoveItem = async (reportId: string, itemId: string) => {
    return await removeItemMutation.mutateAsync({ reportId, itemId });
  };

  const handleFinishReport = async (reportId: string, tareWeight: number) => {
    await finishReportMutation.mutateAsync({ reportId, data: { tareWeight } });
  };

  const handleView = (report: Report) => setViewReport(report);

  const handlePrint = async (report: Report) => {
    try {
      await downloadPdfMutation.mutateAsync(report.id);
      toast({ title: 'PDF generado', description: 'El PDF se descargó correctamente' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo generar el PDF', variant: 'destructive' });
    }
  };

  const handleAddItems = (report: Report) => setAddItemsReport(report);

  const handleCancelClick = (report: Report) => {
    setReportToCancel(report);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!reportToCancel) return;
    try {
      await cancelReportMutation.mutateAsync(reportToCancel.id);
      toast({ title: 'Reporte cancelado', description: 'El reporte se canceló correctamente' });
      setCancelDialogOpen(false);
      setReportToCancel(null);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cancelar el reporte', variant: 'destructive' });
    }
  };

  const handleExportExcel = async () => {
    try {
      await downloadExcelMutation.mutateAsync(filters);
      toast({ title: 'Excel generado', description: 'El archivo se descargó correctamente' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo generar el Excel', variant: 'destructive' });
    }
  };

  // ... (Funciones auxiliares de renderizado getStateColor, etc. igual que antes) ...
  const getStateColor = (state: ReportState) => {
    switch (state) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'APPROVED': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStateLabel = (state: ReportState) => {
    switch (state) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobado';
      case 'CANCELLED': return 'Cancelado';
      default: return state;
    }
  };

  const columns = [
    {
      key: 'reportDate',
      header: 'Fecha',
      render: (r: Report) => <span className="text-muted-foreground">{new Date(r.reportDate).toLocaleDateString('es-GT')}</span>,
    },
    {
      key: 'ticketNumber',
      header: 'Ticket',
      render: (r: Report) => <span className="font-medium">{r.ticketNumber}</span>,
    },
    {
      key: 'supplier',
      header: 'Proveedor',
      render: (r: Report) => r.supplier?.name || '-',
    },
    {
      key: 'items',
      header: 'Productos',
      render: (r: Report) => (
        <span className="text-sm">
          {r.items.length > 0 ? r.items.map((item) => item.product?.name).join(', ') : 'Sin productos'}
        </span>
      ),
    },
    {
      key: 'netWeight',
      header: 'Peso Neto (lb)',
      render: (r: Report) => <span>{formatNumber(r.netWeight)}</span>,
    },
    {
      key: 'totalPrice',
      header: 'Total',
      render: (r: Report) => <span className="font-semibold text-primary">{formatCurrency(r.totalPrice)}</span>,
    },
    {
      key: 'state',
      header: 'Estado',
      render: (r: Report) => <Badge className={getStateColor(r.state)}>{getStateLabel(r.state)}</Badge>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (r: Report) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleView(r)}>
            <Eye className="w-4 h-4" />
          </Button>
          {r.state === 'APPROVED' && (
            <Button variant="ghost" size="icon" onClick={() => handlePrint(r)}>
              <Printer className="w-4 h-4" />
            </Button>
          )}
          {r.state === 'PENDING' && (
            <Button variant="ghost" size="icon" onClick={() => handleAddItems(r)} title="Agregar productos">
              <PackagePlus className="w-4 h-4 text-blue-600" />
            </Button>
          )}
          {r.state !== 'CANCELLED' && (
            <Button variant="ghost" size="icon" onClick={() => handleCancelClick(r)} title="Cancelar">
              <Ban className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const totalWeight = reports.reduce((acc: number, r: Report) => acc + Number(r.netWeight || 0), 0);
  const totalAmount = reports.reduce((acc: number, r: Report) => acc + Number(r.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ingresos</h1>
          <p className="text-muted-foreground">Gestiona los reportes de ingreso de materiales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" /> Descargar Excel
          </Button>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo Ingreso
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Filtros</CardTitle>
          <CardDescription>Filtra los reportes por fecha, proveedor o producto</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            suppliers={suppliers}
            products={products}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Reportes</div>
            <div className="text-2xl font-bold text-foreground">{reportsData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Peso Total</div>
            <div className="text-2xl font-bold text-foreground">{formatNumber(totalWeight)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Monto Total</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Lista de Reportes</CardTitle>
          <CardDescription>Mostrando {reports.length} reportes</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reports}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyMessage="No se encontraron reportes"
            isLoading={isLoadingReports}
          />
        </CardContent>
      </Card>

      {/* Wizard para crear reporte */}
      <ReportWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        suppliers={suppliers}
        products={products}
        onCreateReport={handleCreateReport}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem} // CORRECCIÓN: Pasar la función
        onFinish={handleFinishReport}
        onSuccess={refetch}
      />

      {/* Diálogo para ver detalle */}
      {viewReport && (
        <ReportDetailDialog
          report={viewReport}
          open={!!viewReport}
          onOpenChange={() => setViewReport(null)}
          onPrint={handlePrint}
        />
      )}

      {/* Diálogo para agregar items a reporte pendiente */}
      {addItemsReport && (
        <AddItemsDialog
          report={addItemsReport}
          open={!!addItemsReport}
          onOpenChange={() => setAddItemsReport(null)}
          products={products}
          onAddItem={handleAddItem}
          onFinish={handleFinishReport}
          onSuccess={refetch}
        />
      )}

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancelar Reporte"
        description={`¿Estás seguro de cancelar el reporte ${reportToCancel?.ticketNumber}?`}
        confirmText="Cancelar Reporte"
        onConfirm={handleCancelConfirm}
        isLoading={cancelReportMutation.isPending}
      />
    </div>
  );
}