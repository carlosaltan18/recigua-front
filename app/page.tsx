'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { isAdmin, type User } from '@/types';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Check user role to redirect appropriately
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user: User = JSON.parse(userStr);
        if (isAdmin(user)) {
          router.push('/dashboard');
        } else {
          router.push('/dashboard/ingresos');
        }
      } else {
        router.push('/dashboard/ingresos');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg p-2">
          <Image
            src="/logo.png"
            alt="Recigua Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-green-800">RECIGUA</h1>
        <p className="text-green-600 italic">Por un mundo verde</p>
        <div className="flex items-center gap-2 text-green-700 mt-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    </div>
  );
}
