import api from '../axios-instance';
import type {
  Report,
  CreateReportDto,
  CreateReportItemDto,
  FinishReportDto,
  PaginatedResponse,
  ReportFilters,
} from '@/types';

// ... (Tus funciones createReport, getReports, getReportById se quedan igual) ...

export const createReport = async (data: CreateReportDto): Promise<Report> => {
  const { data: report } = await api.post<Report>('/reports', data);
  return report;
};

export const getReports = async (
  page: number = 1,
  pageSize: number = 5,
  filters?: ReportFilters
): Promise<PaginatedResponse<Report>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.supplierId) params.append('supplierId', filters.supplierId);
  if (filters?.productId) params.append('productId', filters.productId);
  if (filters?.search) params.append('search', filters.search);

  const { data } = await api.get<PaginatedResponse<Report>>(`/reports?${params}`);
  return data;
};

export const getReportById = async (id: string): Promise<Report> => {
  const { data } = await api.get<Report>(`/reports/${id}`);
  return data;
};

// ... (addReportItem y finishReport se quedan igual) ...

export const addReportItem = async (
  reportId: string,
  item: CreateReportItemDto
): Promise<Report> => {
  const { data } = await api.post<Report>(`/reports/${reportId}/items`, item);
  return data;
};

export const finishReport = async (
  reportId: string,
  data: FinishReportDto
): Promise<Report> => {
  const { data: report } = await api.patch<Report>(`/reports/${reportId}/finish`, data);
  return report;
};

// ============================================
// [NUEVO] REMOVER ITEM (Necesario para el Wizard)
// ============================================
export const removeReportItem = async (
  reportId: string, 
  itemId: string
): Promise<Report> => {
  // Asumiendo que el backend devuelve el reporte actualizado tras borrar
  const { data } = await api.delete<Report>(`/reports/${reportId}/items/${itemId}`);
  return data;
};

// ... (cancelReport, downloadReportPdf, downloadReportsExcel se quedan igual) ...

export const cancelReport = async (reportId: string): Promise<Report> => {
  const { data } = await api.patch<Report>(`/reports/${reportId}/cancel`);
  return data;
};

export const downloadReportPdf = async (reportId: string): Promise<void> => {
  const response = await api.get(`/reports/${reportId}/pdf`, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ticket-${reportId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadReportsExcel = async (filters?: ReportFilters): Promise<void> => {
  const params = new URLSearchParams();

  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.supplierId) params.append('supplierId', filters.supplierId);
  if (filters?.productId) params.append('productId', filters.productId);
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get(`/reports/export/excel?${params.toString()}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reportes-${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
