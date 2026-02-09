'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Calendar } from 'lucide-react';
import type { Proveedor as Supplier, Producto as Product, ReportFilters } from '@/types';

interface ReportFiltersComponentProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  suppliers: Supplier[];
  products: Product[];
}

export function ReportFiltersComponent({
  filters,
  onFiltersChange,
  suppliers,
  products,
}: ReportFiltersComponentProps) {
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasFilters =
    filters.startDate ||
    filters.endDate ||
    filters.supplierId ||
    filters.productId ||
    filters.search;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Fecha Inicio */}
        <div className="space-y-2">
          <Label className="text-card-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha Inicio
          </Label>
          <Input
            type="date"
            className="bg-input border-border text-foreground"
            value={filters.startDate || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                startDate: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* Fecha Fin */}
        <div className="space-y-2">
          <Label className="text-card-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha Fin
          </Label>
          <Input
            type="date"
            className="bg-input border-border text-foreground"
            value={filters.endDate || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                endDate: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* Proveedor */}
        <div className="space-y-2">
          <Label className="text-card-foreground">Proveedor</Label>
          <Select
            value={filters.supplierId || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                supplierId: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Producto */}
        <div className="space-y-2">
          <Label className="text-card-foreground">Producto</Label>
          <Select
            value={filters.productId || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                productId: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Buscar */}
        <div className="space-y-2">
          <Label className="text-card-foreground">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ticket, placa..."
              className="pl-10 bg-input border-border text-foreground"
              value={filters.search || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  search: e.target.value || undefined,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Botón limpiar filtros */}
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpiar Filtros
        </Button>
      )}
    </div>
  );
}