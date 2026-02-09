// =========================================
// Enums & Literals (Match DB & Backend Enums)
// =========================================

export type RoleName = 'ROLE_ADMIN' | 'ROLE_USER';

export type ReportState = 'PENDING' | 'APPROVED' | 'CANCELLED';

// Coincide con tu enum en PostgreSQL y el backend
export enum WeightUnit {
  QUINTALS = 'quintals',
  POUNDS = 'pounds',
  KILOGRAMS = 'kilograms',
  TONS = 'tons',
}

// =========================================
// 1. API & Pagination (Generics)
// =========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =========================================
// 2. Auth & Users
// =========================================

export interface Role {
  id: string;
  name: string; 
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string; // Backend Entity: firstName
  lastName: string;  // Backend Entity: lastName
  email: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// IMPORTANTE: Tu AuthService devuelve una estructura mapeada manualmente
export interface AuthResponse {
  user: {
    id: string;
    nombre: string;   // AuthService mapea firstName -> nombre
    apellido: string; // AuthService mapea lastName -> apellido
    email: string;
    roles: Role[];
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

// DTOs para Gestión de Usuarios
export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Admin puede asignar roles al crear (si tu backend lo soporta, sino usa updateRoles)
  roleIds?: string[]; 
}

export interface UpdateUserInput extends Partial<Omit<CreateUserInput, 'roleIds'>> {}

export interface ChangeRoleDto {
  roleNames: string[]; // Tu endpoint changeRole espera nombres (ej: ['ROLE_ADMIN'])
}

// =========================================
// 3. Suppliers (Proveedores)
// =========================================

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  representative: string;
  createdAt: string;
  updatedAt: string;
}

// Alias para compatibilidad si tu frontend usa 'Proveedor' en algunos lados
export type Proveedor = Supplier; 

export interface CreateSupplierDto {
  name: string;
  address: string;
  phone: string;
  representative: string;
}

// Alias para inputs del frontend
export type CreateProveedorInput = CreateSupplierDto;

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}
export type UpdateProveedorInput = UpdateSupplierDto;

// =========================================
// 4. Products (Productos)
// =========================================

export interface Product {
  id: string;
  name: string;
  pricePerQuintal: number; // Backend Entity: pricePerQuintal (mapped from price_per_quintal)
  createdAt: string;
  updatedAt: string;
}

// Alias para compatibilidad
export type Producto = Product;

export interface CreateProductDto {
  name: string;
  pricePerQuintal: number;
}

export type CreateProductoInput = CreateProductDto;

export interface UpdateProductDto extends Partial<CreateProductDto> {}
export type UpdateProductoInput = UpdateProductDto;

// =========================================
// 5. Reports (Reportes) - El Núcleo
// =========================================

export interface ReportItem {
  id: string;
  reportId: string;
  productId: string;
  product: Product; // Relación eager loaded
  weight: number;
  weightUnit: WeightUnit;
  weightInQuintals: number;
  pricePerQuintal: number; // Snapshot del precio al momento
  basePrice: number;
  discountWeight?: number;
  createdAt: string;
}

export interface Report {
  id: string;
  reportDate: string; // ISO Date String
  ticketNumber: string; // Generado por backend
  plateNumber: string;
  
  supplierId: string;
  supplier?: Supplier; // Relación eager loaded
  
  userId: string;
  user?: User; // Relación eager loaded
  
  // Pesos
  grossWeight: number; // Peso Bruto
  tareWeight: number;  // Peso Tara (0 al inicio)
  netWeight: number;   // Calculado
  
  // Precios
  extraPercentage: number;
  basePrice: number;
  totalPrice: number;
  
  driverName: string;
  state: ReportState;
  
  items: ReportItem[]; // Array de items
  
  createdAt: string;
  updatedAt: string;
}

// Alias para compatibilidad
export type Reporte = Report;

// --- DTOs de Entrada (Lo que enviamos al Backend) ---

export interface CreateReportDto {
  // Datos Cabecera
  reportDate?: string; // Opcional si el backend pone la fecha actual
  supplierId: string;
  plateNumber: string;
  grossWeight: number;
  driverName: string;
  // Items
  items: CreateReportItemDto[];
}

export type CreateReporteInput = CreateReportDto; 

export interface CreateReportItemDto {
  productId: string;
  weight: number;
  weightUnit: WeightUnit;
  discountWeight?: number;
}

export interface FinishReportDto {
  tareWeight: number;
}

// --- Filtros ---

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  productId?: string;
  search?: string; // Ticket o Placa
}

export type ReporteFilters = ReportFilters; // Alias

// =========================================
// 6. Configuración del Sistema
// =========================================

export interface SystemConfig {
  id: string;
  extraPercentage: number;
  updatedAt: string;
}

// Alias
export type ConfiguracionSistema = SystemConfig;

// =========================================
// 7. Helpers & Utilidades
// =========================================

export interface PrecioCalculado {
  precioBase: number;
  precioAdicional: number;
  precioTotal: number;
  pesoEnQuintales: number;
}

// Helper para verificar rol de Admin
export const isAdmin = (user: User | null | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((role) => role.name === 'ROLE_ADMIN');
};

export const hasRole = (user: User | null | undefined, roleName: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((role) => role.name === roleName);
};