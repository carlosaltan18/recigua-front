'use client';

import { useState, useEffect, Suspense } from 'react';
import { Plus, Search, Pencil, Trash2, Shield, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserForm } from '@/components/usuarios/user-form';
import { useToast } from '@/hooks/use-toast';
import type { User, Role } from '@/types';
import Loading from './loading';

// Componentes de UI para el Modal de Roles (Asumiendo estructura ShadCN standard)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox" // O usa un input nativo si no tienes este componente

// Importamos los hooks reales
import { 
  useUsers, 
  useRoles,
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  useUpdateUserRoles 
} from '@/hooks/use-users';

export default function UsuariosPage() {
  // --- ESTADOS DE BÚSQUEDA Y PAGINACIÓN ---
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // --- HOOKS DE DATOS ---
  const { data: usersData, isLoading: isUsersLoading, isError } = useUsers(page, pageSize, debouncedSearch);
  const { data: rolesData = [] } = useRoles();

  // --- HOOKS DE MUTACIÓN ---
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const updateRolesMutation = useUpdateUserRoles();

  // --- ESTADOS DE LA UI ---
  // 1. Perfil (Crear / Editar Datos)
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 2. Roles (Gestión de Permisos)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [userToUpdateRoles, setUserToUpdateRoles] = useState<User | null>(null);

  // 3. Eliminar
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const { toast } = useToast();

  // Efecto Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // --- HANDLERS DE ACCIONES ---

  // A) Crear Nuevo Usuario
  const handleCreate = () => {
    setEditingUser(null);
    setProfileFormOpen(true);
  };

  // B) Editar Perfil (Datos Personales)
  const handleEditProfile = (user: User) => {
    setEditingUser(user);
    setProfileFormOpen(true);
  };

  // C) Editar Roles (Permisos)
  const handleEditRoles = (user: User) => {
    setUserToUpdateRoles(user);
    // Pre-llenar con los IDs de roles actuales del usuario
    setSelectedRoleIds(user.roles.map(r => r.id));
    setRoleDialogOpen(true);
  };

  // D) Eliminar
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // --- LÓGICA DE GUARDADO (SUBMITS) ---

  /**
   * 1. Guardar Perfil (Creación o Edición de datos básicos)
   * Nota: En edición, ignoramos los roles que vengan del form para no sobreescribirlos accidentalmente.
   */
  const handleProfileSubmit = async (data: { 
    nombre: string; 
    apellido: string; 
    email: string; 
    password?: string; 
    roleIds: string[] // El form envía esto, pero lo usaremos selectivamente
  }) => {
    try {
      if (editingUser) {
        // --- MODO EDICIÓN: Solo actualizamos datos básicos ---
        await updateMutation.mutateAsync({
          id: editingUser.id,
          data: {
            firstName: data.nombre,
            lastName: data.apellido,
            email: data.email,
            password: data.password || undefined, // Password opcional
          }
        });
        toast({ title: 'Perfil actualizado', description: 'Los datos del usuario se guardaron correctamente.' });
      } else {
        // --- MODO CREACIÓN: Creamos usuario y asignamos roles iniciales ---
        if (!data.password) throw new Error("La contraseña es obligatoria.");

        // 1. Traducir IDs a Nombres para la API
        const selectedRoleNames = rolesData
          .filter((r) => data.roleIds.includes(r.id))
          .map((r) => r.name);

        // 2. Crear usuario
        const newUser = await createMutation.mutateAsync({
          firstName: data.nombre,
          lastName: data.apellido,
          email: data.email,
          password: data.password,
        });

        // 3. Asignar roles si se seleccionaron
        if (selectedRoleNames.length > 0 && newUser.id) {
          await updateRolesMutation.mutateAsync({
            id: newUser.id,
            roleNames: selectedRoleNames
          });
        }
        toast({ title: 'Usuario creado', description: 'El usuario ha sido registrado exitosamente.' });
      }
      setProfileFormOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Error al procesar la solicitud', 
        variant: 'destructive' 
      });
    }
  };

  /**
   * 2. Guardar Roles (Actualización exclusiva de permisos)
   */
  const handleRoleSubmit = async () => {
    if (!userToUpdateRoles) return;

    try {
      // Traducir los IDs seleccionados (checkboxes) a Nombres de Roles (API)
      const roleNamesToSave = rolesData
        .filter(r => selectedRoleIds.includes(r.id))
        .map(r => r.name);

      await updateRolesMutation.mutateAsync({
        id: userToUpdateRoles.id,
        roleNames: roleNamesToSave
      });

      toast({ title: 'Roles actualizados', description: `Permisos actualizados para ${userToUpdateRoles.firstName}` });
      setRoleDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'No se pudieron actualizar los roles', 
        variant: 'destructive' 
      });
    }
  };

  // Manejo de checkboxes en el modal de roles
  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId) 
        : [...prev, roleId]
    );
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      toast({ title: 'Usuario eliminado', description: 'El usuario se eliminó correctamente' });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast({ title: 'Error', description: 'No se pudo eliminar el usuario', variant: 'destructive' });
    }
  };

  // --- DEFINICIÓN DE COLUMNAS ---
  const columns = [
    {
      key: 'firstName',
      header: 'Nombre',
      render: (user: User) => <span className="font-medium">{user.firstName} {user.lastName}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: User) => <span className="text-muted-foreground">{user.email}</span>,
    },
    {
      key: 'roles',
      header: 'Roles Actuales',
      render: (user: User) => (
        <div className="flex gap-1 flex-wrap">
          {user.roles?.map((role) => (
            <Badge key={role.id} variant="outline" className="text-xs border-primary/20 bg-primary/5">
              {role.name.replace('ROLE_', '')}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (user: User) => (
        <div className="flex items-center gap-1">
          {/* Botón 1: Editar Perfil */}
          <Button variant="ghost" size="icon" onClick={() => handleEditProfile(user)} title="Editar Datos Personales">
            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
          
          {/* Botón 2: Actualizar Roles */}
          <Button variant="ghost" size="icon" onClick={() => handleEditRoles(user)} title="Gestionar Roles">
            <Shield className="w-4 h-4 text-amber-600 hover:text-amber-700" />
          </Button>

          {/* Botón 3: Eliminar */}
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user)} title="Eliminar Usuario">
            <Trash2 className="w-4 h-4 text-destructive/80 hover:text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || updateRolesMutation.isPending;

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra perfiles y niveles de acceso</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>{isUsersLoading ? 'Cargando...' : `Total: ${usersData?.total || 0} usuarios`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-10"
              />
            </div>

            <DataTable
              columns={columns}
              data={usersData?.data || []}
              page={page}
              totalPages={usersData?.totalPages || 1}
              onPageChange={setPage}
              isLoading={isUsersLoading}
              emptyMessage={isError ? "Error al cargar usuarios" : "No se encontraron usuarios"}
            />
          </CardContent>
        </Card>

        {/* 1. FORMULARIO DE PERFIL (Crear / Editar Datos) */}
        <UserForm
          open={profileFormOpen}
          onOpenChange={setProfileFormOpen}
          onSubmit={handleProfileSubmit}
          // En modo edición, pasamos los datos. Mapeamos firstName -> nombre para compatibilidad.
          user={editingUser ? {
            ...editingUser,
            nombre: editingUser.firstName,
            apellido: editingUser.lastName,
            roleIds: editingUser.roles.map(r => r.id) // Solo para visualización si el form los muestra
          } as any : null}
          roles={rolesData.map(r => ({ ...r, nombre: r.name }))}
          isLoading={isMutating}
        />

        {/* 2. DIÁLOGO EXCLUSIVO DE ROLES */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gestionar Roles</DialogTitle>
              <DialogDescription>
                Asigna los niveles de acceso para <strong>{userToUpdateRoles?.firstName} {userToUpdateRoles?.lastName}</strong>.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <Label>Roles Disponibles</Label>
              <div className="grid gap-3 border rounded-lg p-4">
                {rolesData.map((role) => (
                  <div key={role.id} className="flex items-center space-x-3">
                    {/* Checkbox manual si no tienes el componente ShadCN */}
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRoleSelection(role.id)}
                    />
                    <div className="grid gap-0.5">
                      <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">
                        {role.name}
                      </Label>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleRoleSubmit} disabled={isMutating}>
                {isMutating ? 'Guardando...' : 'Actualizar Roles'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 3. DIÁLOGO DE ELIMINACIÓN */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Usuario"
          description={`¿Estás seguro de eliminar a ${userToDelete?.firstName}?`}
          confirmText="Eliminar Definitivamente"
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </Suspense>
  );
}