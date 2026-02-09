'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReports,
  getReportById,
  createReport,
  addReportItem,
  removeReportItem, // [NUEVO]
  finishReport,
  cancelReport,
  downloadReportPdf,
  downloadReportsExcel,
} from '@/lib/api/queries/reportes.queries';
import type {
  CreateReportDto,
  CreateReportItemDto,
  FinishReportDto,
  ReportFilters,
} from '@/types';

// ... (useReports, useReport, useCreateReport se quedan igual) ...

export const useReports = (page: number = 1, pageSize: number = 10, filters?: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', page, pageSize, filters],
    queryFn: () => getReports(page, pageSize, filters),
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => getReportById(id),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportDto) => createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// ... (useAddReportItem actualizado para invalidar query específica) ...

export const useAddReportItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, item }: { reportId: string; item: CreateReportItemDto }) =>
      addReportItem(reportId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
};

// [NUEVO] Hook para eliminar items
export const useRemoveReportItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, itemId }: { reportId: string; itemId: string }) =>
      removeReportItem(reportId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
};

// ... (El resto se queda igual) ...

export const useFinishReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: FinishReportDto }) =>
      finishReport(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
};

export const useCancelReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => cancelReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useDownloadReportPdf = () => {
  return useMutation({
    mutationFn: (reportId: string) => downloadReportPdf(reportId),
  });
};

export const useDownloadReportsExcel = () => {
  return useMutation({
    mutationFn: (filters?: ReportFilters) => downloadReportsExcel(filters),
  });
};