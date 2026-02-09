# ♻️ RECIGUA - Frontend

**RECIGUA - Por un mundo verde.**

Este es el frontend del sistema de gestión para la recicladora RECIGUA. La plataforma permite administrar el flujo de trabajo, incluyendo la gestión de ingresos y el cálculo de precios de reportes.

---

## 🚀 Tecnologías Utilizadas

- **[Next.js](https://nextjs.org)** (App Router) - Framework de React para producción.
- **[TypeScript](https://www.typescriptlang.org)** - Tipado estático para un desarrollo más robusto.
- **[Tailwind CSS](https://tailwindcss.com)** - Framework de utilidades para el diseño.
- **[Lucide React](https://lucide.dev)** - Librería de iconos.
- **[TanStack Query](https://tanstack.com/query/latest)** - Gestión de estado asíncrono y caché (React Query).
- **ShadCN UI** - Componentes de interfaz reutilizables (Toaster, etc.).

## ⚙️ Instalación y Ejecución

Sigue estos pasos para levantar el proyecto en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd recigua-front
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o si usas yarn/pnpm/bun:
   yarn install
   pnpm install
   bun install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Ver en el navegador:**
   Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📱 Funcionalidades

- **Autenticación:** Redirección inteligente basada en roles (Admin vs Usuario estándar).
- **Dashboard:** Panel de control principal.
- **Gestión de Ingresos:** Visualización y control de ingresos a la recicladora.
- **Cálculo de Precios:** Herramientas para calcular valores en los reportes.
