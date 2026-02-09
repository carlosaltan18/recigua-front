'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { isAdmin, type User } from '@/types';

// Pages that only admins can access
const adminOnlyPages = ['/dashboard', '/dashboard/usuarios', '/dashboard/configuracion'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    // Check authentication
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check role-based access
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user: User = JSON.parse(userStr);
      const userIsAdmin = isAdmin(user);
      
      // Check if current page requires admin access
      const requiresAdmin = adminOnlyPages.includes(pathname);
      
      if (requiresAdmin && !userIsAdmin) {
        // Redirect non-admin users to ingresos page
        router.push('/dashboard/ingresos');
        return;
      }
      
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  if (!isMounted || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <Header onMenuClick={() => setIsCollapsed(!isCollapsed)} isSidebarCollapsed={isCollapsed} />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
