'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import AdminSidebar from '@/components/AdminSidebar';
import AdminNavbar from '@/components/AdminNavbar';
import Background from '@/components/Background';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, fetchProfile, loading } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Initialize Socket triggers
  useSocket();

  useEffect(() => {
    // If it is /admin/login, bypass all admin auth check loops
    if (pathname?.startsWith('/admin/login')) {
      return;
    }

    let cancelled = false;

    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.replace('/admin/login');
        return;
      }

      // If user is already available (from login), check role immediately
      const existingUser = useAuthStore.getState().user;
      if (existingUser) {
        if (existingUser.role !== 'ADMIN') {
          toast.error('Akses ditolak: Anda bukan Admin.');
          router.replace('/dashboard');
          return;
        }
        if (!cancelled) setAuthChecked(true);
        // Refresh profile in background (don't block rendering)
        fetchProfile().catch(() => {});
        return;
      }

      // No user data yet — fetch profile first
      try {
        await fetchProfile();
        if (cancelled) return;
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          router.replace('/admin/login');
          return;
        }
        if (currentUser.role !== 'ADMIN') {
          toast.error('Akses ditolak: Anda bukan Admin.');
          router.replace('/dashboard');
          return;
        }
        setAuthChecked(true);
      } catch (err) {
        if (!cancelled) {
          router.replace('/admin/login');
        }
      }
    };

    checkAuth();

    return () => { cancelled = true; };
  }, [isAuthenticated, pathname]);

  // Bypass layout wrapper for Admin Login screen
  if (pathname?.startsWith('/admin/login')) {
    return (
      <>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: 'glass-panel border-slate-200 text-slate-800 rounded-xl text-sm shadow-md',
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              color: '#1e293b',
              borderRadius: '16px',
              backdropFilter: 'blur(8px)',
            }
          }}
        />
      </>
    );
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
          <span className="absolute text-[10px] font-mono text-cyan-600 font-bold uppercase tracking-wider animate-pulse">L</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Premium Ambient Backgrounds */}
      <Background />

      {/* Responsive Sidebar Navigation */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-1 flex-col md:pl-64 min-w-0 w-full max-w-full" style={{ overflowX: 'clip' }}>
        <div className="w-full sticky top-0 z-40">
          <AdminNavbar setMobileOpen={setMobileOpen} />
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8" style={{ overflowX: 'clip' }}>
          {children}
        </main>
      </div>

      {/* Global modern floating toast manager */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'glass-panel border-slate-200 text-slate-800 rounded-xl text-sm shadow-md',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            color: '#1e293b',
            borderRadius: '16px',
            backdropFilter: 'blur(8px)',
          }
        }}
      />
    </div>
  );
}
