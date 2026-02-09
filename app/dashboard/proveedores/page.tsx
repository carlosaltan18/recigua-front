'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Building2, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProveedorForm } from '@/components/proveedores/proveedor-form';
import { useToast } from '@/hooks/use-toast';
import type { Proveedor } from '@/types';
import { Suspense } from 'react';
import Loading from './loading';

// Importamos los hooks generados
import { 
  useProveedores, 
  useCreateProveedor, 
  useUpdateProveedor, 
  useDeleteProveedor 
} from '@/hooks/use-proveedores';

export default function ProveedoresPage() {
  // Estados para búsqueda y paginación
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 1. Hook de Lectura (Query)
  const { 
    data: proveedoresData, 
    isLoading: isQueryLoading,
    isError
  } = useProveedores(page, pageSize, debouncedSearch);

  // 2. Hooks de Escritura (Mutations)
  const createMutation = useCreateProveedor();
  const updateMutation = useUpdateProveedor();
  const deleteMutation = useDeleteProveedor();

  // Estados de UI
  const [formOpen, setFormOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null);
  
  const { toast } = useToast();

  // Efecto Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Handlers de UI
  const handleCreate = () => {
    setEditingProveedor(null);
    setFormOpen(true);
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setFormOpen(true);
  };

  const handleDeleteClick = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor);
    setDeleteDialogOpen(true);
  };

  // 3. Crear / Actualizar
  const handleFormSubmit = async (data: { 
    nombre: string; 
    direccion: string; 
    telefono: string; 
    representante: string 
  }) => {
    try {
      // Mapeo de datos: Formulario (Español) -> API (Inglés)
      const apiData = {
        name: data.nombre,
        address: data.direccion,
        phone: data.telefono,
        representative: data.representante
      };

      if (editingProveedor) {
        await updateMutation.mutateAsync({
          id: editingProveedor.id,
          data: apiData
        });
        toast({ title: 'Proveedor actualizado', description: 'El proveedor se actualizó correctamente' });
      } else {
        await createMutation.mutateAsync(apiData);
        toast({ title: 'Proveedor creado', description: 'El proveedor se creó correctamente' });
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
    if (!proveedorToDelete) return;
    try {
      await deleteMutation.mutateAsync(proveedorToDelete.id);
      toast({ title: 'Proveedor eliminado', description: 'El proveedor se eliminó correctamente' });
      setDeleteDialogOpen(false);
      setProveedorToDelete(null);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'No se pudo eliminar el proveedor', 
        variant: 'destructive' 
      });
    }
  };

  // Definición de Columnas (Usando las propiedades en inglés que vienen de la API)
  const columns = [
    {
      key: 'name', // API devuelve 'name'
      header: 'Nombre',
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium">{proveedor.name}</span>
        </div>
      ),
    },
    {
      key: 'representative', // API devuelve 'representative'
      header: 'Representante',
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-4 h-4" />
          {proveedor.representative}
        </div>
      ),
    },
    {
      key: 'phone', // API devuelve 'phone'
      header: 'Teléfono',
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4" />
          {proveedor.phone}
        </div>
      ),
    },
    {
      key: 'address', // API devuelve 'address'
      header: 'Dirección',
      render: (proveedor: Proveedor) => (
        <span className="text-muted-foreground truncate max-w-[200px] block">
          {proveedor.address}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(proveedor)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(proveedor)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
            <p className="text-muted-foreground">Gestiona los proveedores del sistema</p>
          </div>
          <Button onClick={handleCreate} disabled={isQueryLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Lista de Proveedores</CardTitle>
            <CardDescription>
              {isQueryLoading ? 'Cargando...' : `Total: ${proveedoresData?.total || 0} proveedores`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar proveedores..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                />
              </div>
            </div>

            <DataTable
              columns={columns}
              data={proveedoresData?.data || []}
              page={page}
              totalPages={proveedoresData?.totalPages || 1}
              onPageChange={setPage}
              isLoading={isQueryLoading}
              emptyMessage={isError ? "Error al cargar proveedores" : "No se encontraron proveedores"}
            />
          </CardContent>
        </Card>

        {/* Mapeo inverso para el Formulario (Si tu componente ProveedorForm espera las props en español) */}
        <ProveedorForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
        proveedor={editingProveedor}
          isLoading={isMutating}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Proveedor"
          description={`¿Estás seguro de eliminar a ${proveedorToDelete?.name}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </Suspense>
  );
}