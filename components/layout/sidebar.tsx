'use client';

import React from "react"

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileInput,
  Building2,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { isAdmin } from '@/types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    title: 'Usuarios',
    href: '/dashboard/usuarios',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Reportes',
    href: '/dashboard/ingresos',
    icon: FileInput,
    adminOnly: false,
  },
  {
    title: 'Proveedores',
    href: '/dashboard/proveedores',
    icon: Building2,
    adminOnly: false,
  },
  {
    title: 'Productos',
    href: '/dashboard/productos',
    icon: Package,
    adminOnly: false,
  },
  /* {
    title: 'Configuracion',
    href: '/dashboard/configuracion',
    icon: Settings,
    adminOnly: true,
  }, */
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && !userIsAdmin) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-white overflow-hidden">
              <Image
                src="/logo.png"
                alt="Recigua Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sidebar-foreground text-lg">RECIGUA</span>
                <span className="text-xs text-sidebar-foreground/70">Por un mundo verde</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-sidebar-primary')} />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Role Badge */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-sidebar-border">
            <div className={cn(
              'text-xs px-2 py-1 rounded-full text-center',
              userIsAdmin 
                ? 'bg-sidebar-primary/20 text-sidebar-primary' 
                : 'bg-sidebar-accent text-sidebar-foreground'
            )}>
              {userIsAdmin ? 'Administrador' : 'Usuario'}
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Colapsar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
