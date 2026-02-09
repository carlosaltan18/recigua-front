'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Package, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProductoForm } from '@/components/productos/producto-form';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/calculations';
import type { Producto } from '@/types';
// Importamos los hooks que creamos anteriormente
import { 
  useProductos, 
  useCreateProducto, 
  useUpdateProducto, 
  useDeleteProducto 
} from '@/hooks/use-productos';

export default function ProductosPage() {
  // Estados de UI y Paginación
  const [inputValue, setInputValue] = useState(''); // Valor inmediato del input
  const [debouncedSearch, setDebouncedSearch] = useState(''); // Valor con retardo para la API
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 1. Hook de Lectura (Query)
  // Se ejecutará automáticamente cuando cambie page o debouncedSearch
  const { 
    data: productosData, 
    isLoading: isQueryLoading, 
    isError 
  } = useProductos(page, pageSize, debouncedSearch);

  // 2. Hooks de Escritura (Mutations)
  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();

  // Estados de Modales
  const [formOpen, setFormOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  
  const { toast } = useToast();

  // Efecto para Debounce (esperar a que el usuario termine de escribir)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setPage(1); // Resetear a página 1 al buscar
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Manejadores de acciones
  const handleCreate = () => {
    setEditingProducto(null);
    setFormOpen(true);
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormOpen(true);
  };

  const handleDeleteClick = (producto: Producto) => {
    setProductoToDelete(producto);
    setDeleteDialogOpen(true);
  };

  // 3. Crear o Actualizar
  const handleFormSubmit = async (data: { nombre: string; precioPorQuintal: number }) => {
    try {
      if (editingProducto) {
        await updateMutation.mutateAsync({
          id: editingProducto.id,
          data: {
            name: data.nombre, // Mapeo: el form da 'nombre', el DTO espera 'name'
            pricePerQuintal: Number(data.precioPorQuintal)
          }
        });
        toast({ title: 'Producto actualizado', description: 'El producto se actualizó correctamente' });
      } else {
        await createMutation.mutateAsync({
          name: data.nombre,
          pricePerQuintal: Number(data.precioPorQuintal)
        });
        toast({ title: 'Producto creado', description: 'El producto se creó correctamente' });
      }
      setFormOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Ocurrió un error al guardar', 
        variant: 'destructive' 
      });
    }
  };

  // 4. Eliminar
  const handleDelete = async () => {
    if (!productoToDelete) return;
    try {
      await deleteMutation.mutateAsync(productoToDelete.id);
      toast({ title: 'Producto eliminado', description: 'El producto se eliminó correctamente' });
      setDeleteDialogOpen(false);
      setProductoToDelete(null);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'No se pudo eliminar el producto', 
        variant: 'destructive' 
      });
    }
  };

  // Definición de columnas
  const columns = [
    {
      key: 'name', // Ajustado a 'name' según la interfaz Producto
      header: 'Producto',
      render: (producto: Producto) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
            <Package className="w-4 h-4 text-primary" />
          </div>
          {/* Usamos producto.name porque así viene de la API */}
          <span className="font-medium">{producto.name}</span> 
        </div>
      ),
    },
    {
      key: 'pricePerQuintal',
      header: 'Precio por Quintal',
      render: (producto: Producto) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary">
              {formatCurrency(producto.pricePerQuintal)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Última Actualización',
      render: (producto: Producto) => (
        <span className="text-muted-foreground">
          {new Date(producto.updatedAt).toLocaleDateString('es-GT')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (producto: Producto) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(producto)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  // Calcular si hay alguna acción en progreso para bloquear UI
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestiona los productos y sus precios</p>
        </div>
        <Button onClick={handleCreate} disabled={isQueryLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Lista de Productos</CardTitle>
          <CardDescription>
            {isQueryLoading ? 'Cargando...' : `Total: ${productosData?.total || 0} productos`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={productosData?.data || []}
            page={page}
            totalPages={productosData?.totalPages || 1}
            onPageChange={setPage}
            isLoading={isQueryLoading} // Asegúrate que tu DataTable soporte esta prop
            emptyMessage={isError ? "Error al cargar productos" : "No se encontraron productos"}
          />
        </CardContent>
      </Card>

      <ProductoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        producto={editingProducto}
        isLoading={isMutating}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Producto"
        description={`¿Estás seguro de eliminar ${productoToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}