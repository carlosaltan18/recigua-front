'use client';

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface DataTableProps<T> {
  columns: {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'No hay datos disponibles',
}: DataTableProps<T>) {

  const safePage = Math.max(1, page);
  const safeTotalPages = Math.max(1, totalPages);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-muted-foreground font-semibold"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  {columns.map((column) => (
                    <TableCell
                      key={`${item.id}-${column.key}`}
                      className="text-foreground"
                    >
                      {column.render
                        ? column.render(item)
                        : (item as Record<string, unknown>)[
                            column.key
                          ] as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔥 Paginación mejorada */}
      {onPageChange && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Página {safePage} de {safeTotalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(safePage - 1)}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Botones numéricos opcionales */}
            {Array.from({ length: safeTotalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, safePage - 3),
                Math.min(safeTotalPages, safePage + 2)
              )
              .map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === safePage ? "default" : "outline"}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(safePage + 1)}
              disabled={safePage >= safeTotalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
