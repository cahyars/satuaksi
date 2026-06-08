'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useSocket } from '@/hooks/useSocket';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Background from '@/components/Background';
import { AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRealLocation } from '@/utils/gps';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchProfile, loading } = useAuthStore();
  const { isSosTriggered, activeSosId, triggerSos, resolveAlert } = useEmergencyStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sosSending, setSosSending] = useState(false);

  // Initialize Socket triggers
  useSocket();

  const handleQuickSos = async () => {
    if (isSosTriggered && activeSosId) {
      const confirmCancel = window.confirm("🚨 APAKAH ANDA INGIN MEMATIKAN EMERGENCY SOS AKTIF ANDA?");
      if (!confirmCancel) return;
      setSosSending(true);
      const success = await resolveAlert(activeSosId, 'CANCELLED');
      setSosSending(false);
      if (success) toast.success('Emergency SOS berhasil dimatikan.');
      else toast.error('Gagal mematikan SOS.');
      return;
    }

    const confirmSos = window.confirm("🚨 APAKAH ANDA INGIN MENGAKTIFKAN EMERGENCY SOS DARURAT SEGERA?");
    if (!confirmSos) return;

    setSosSending(true);
    toast.loading('Mendeteksi lokasi GPS Anda...', { id: 'gps-loading' });

    try {
      const location = await getRealLocation((status) => {
        toast.loading(status, { id: 'gps-loading' });
      });
      const user = useAuthStore.getState().user;
      const isFallback = location.source === 'fallback';
      const isIpGeo = location.source === 'ip_geolocation';
      
      const messageSuffix = isFallback 
        ? ' (Lokasi Default)' 
        : isIpGeo 
          ? ' (Lokasi Perkiraan IP)' 
          : '';

      const alert = await triggerSos({
        type: 'SOS',
        latitude: location.latitude,
        longitude: location.longitude,
        message: `Quick SOS dari ${user?.name}${messageSuffix}`,
        isSilent: false,
        accuracy: location.accuracy,
        altitude: location.altitude,
        speed: location.speed
      });

      setSosSending(false);
      toast.dismiss('gps-loading');

      if (alert) {
        if (isFallback) {
          toast.success('⚠️ SOS DIKIRIM DENGAN LOKASI DEFAULT!');
        } else if (isIpGeo) {
          toast.success('⚠️ SOS DIKIRIM DENGAN LOKASI PERKIRAAN IP!');
        } else {
          toast.success('⚠️ SOS BERHASIL DIKIRIM KE ADMIN!');
        }
      } else {
        toast.error('Gagal mengirimkan SOS.');
      }
    } catch (error) {
      console.error('Quick SOS Layout Error:', error);
      setSosSending(false);
      toast.dismiss('gps-loading');
      toast.error('Terjadi kesalahan saat memicu sinyal SOS.');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // If user is already available (from login), check role immediately
      const existingUser = useAuthStore.getState().user;
      if (existingUser) {
        if (existingUser.role === 'ADMIN') {
          router.replace('/admin');
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
          router.replace('/login');
          return;
        }
        if (currentUser.role === 'ADMIN') {
          router.replace('/admin');
          return;
        }
        setAuthChecked(true);
      } catch (err) {
        if (!cancelled) {
          router.replace('/login');
        }
      }
    };

    checkAuth();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

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
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-1 flex-col md:pl-64 min-w-0 w-full max-w-full">
        <div className="sticky top-0 z-40 w-full">
          <Navbar setMobileOpen={setMobileOpen} />
        </div>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
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
