'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, AlertOctagon, RefreshCw, User, LogOut, VolumeX, Volume2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { playEmergencyAlarm, stopEmergencyAlarm, isAlarmPlaying } from '@/utils/alarmSound';
import { getRealLocation, startContinuousTracking, stopContinuousTracking } from '@/utils/gps';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {
  setMobileOpen?: (open: boolean) => void;
  hideActions?: boolean;
}

export default function Navbar({ setMobileOpen, hideActions }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAllAsRead } = useNotificationStore();
  const { isSosTriggered, activeSosId, triggerSos, resolveAlert, setSosTriggered } = useEmergencyStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const prevSosTriggered = useRef(isSosTriggered);

  // Play alarm when SOS becomes active, stop when resolved
  useEffect(() => {
    if (isSosTriggered && !prevSosTriggered.current) {
      // SOS just activated
      setIsAlarmMuted(false);
      playEmergencyAlarm();
    } else if (!isSosTriggered && prevSosTriggered.current) {
      // SOS just resolved/cancelled
      stopEmergencyAlarm();
      setIsAlarmMuted(false);
    }
    prevSosTriggered.current = isSosTriggered;
  }, [isSosTriggered]);

  // Cleanup alarm on unmount
  useEffect(() => {
    return () => {
      stopEmergencyAlarm();
    };
  }, []);

  const handleSilenceAlarm = useCallback(() => {
    stopEmergencyAlarm();
    setIsAlarmMuted(true);
  }, []);

  const handleResumeAlarm = useCallback(() => {
    playEmergencyAlarm();
    setIsAlarmMuted(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications().finally(() => {
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

  const handleQuickSos = async () => {
    if (isSosTriggered && activeSosId) {
      const confirmCancel = window.confirm("🚨 APAKAH ANDA INGIN MENYELESAIKAN/MEMATIKAN EMERGENCY SOS AKTIF ANDA?");
      if (!confirmCancel) return;

      stopEmergencyAlarm();
      setIsAlarmMuted(false);
      const success = await resolveAlert(activeSosId, 'CANCELLED');
      if (success) {
        toast.success("Emergency SOS aktif Anda berhasil dimatikan/diselesaikan.");
      } else {
        toast.error("Gagal mematikan Emergency SOS aktif Anda.");
      }
      return;
    }

    const confirmSos = window.confirm("🚨 APAKAH ANDA INGIN MENGAKTIFKAN EMERGENCY SOS DARURAT SEGERA?");
    if (!confirmSos) return;

    toast.loading('Mendeteksi lokasi GPS Anda...', { id: 'gps-loading' });

    try {
      const location = await getRealLocation((status) => {
        toast.loading(status, { id: 'gps-loading' });
      });
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
        message: `Quick Emergency SOS triggered from navigation bar${messageSuffix}`,
        isSilent: false,
        accuracy: location.accuracy,
        altitude: location.altitude,
        speed: location.speed
      });

      toast.dismiss('gps-loading');

      if (alert) {
        if (isFallback) {
          toast.success("⚠️ EMERGENCY SOS BERHASIL DIKIRIMKAN MENGGUNAKAN LOKASI DEFAULT!");
        } else if (isIpGeo) {
          toast.success("⚠️ EMERGENCY SOS BERHASIL DIKIRIM MENGGUNAKAN LOKASI PERKIRAAN IP!");
        } else {
          toast.success(`⚠️ EMERGENCY SOS BERHASIL DIKIRIM! (Akurasi GPS: ${location.accuracy.toFixed(1)}m)`);
        }
      } else {
        toast.error("Gagal mengirimkan sinyal SOS.");
      }
    } catch (error) {
      console.error('Quick SOS Error:', error);
      toast.dismiss('gps-loading');
      toast.error("Terjadi kesalahan saat memicu sinyal SOS.");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md shadow-md md:px-6">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center space-x-3">
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-850 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-white border border-slate-100">
            <Image src="/logo.png" alt="Lifeline AI Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-extrabold text-sm text-slate-800 hidden sm:inline">LifeLine</span>
        </div>
      </div>

      {/* Action utilities */}
      {!hideActions && (
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Quick Refresh */}
          <button
            onClick={handleRefresh}
            className="hidden sm:block rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-850 transition-all duration-300"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
          </button>

          {/* Dynamic Quick SOS Trigger */}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickSos}
              className={`flex items-center justify-center p-1.5 sm:p-2.5 rounded-full border transition-all duration-300 ${
                isSosTriggered
                  ? 'bg-red-500/20 text-red-655 border-red-500/50 danger-pulse'
                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100/70'
              } sm:px-3 sm:py-1.5 sm:rounded-full text-xs font-bold`}
            >
              <AlertOctagon className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1.5">QUICK SOS</span>
            </motion.button>

            {/* Silence / Resume Alarm Button */}
            {isSosTriggered && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={isAlarmMuted ? handleResumeAlarm : handleSilenceAlarm}
                className={`flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full text-xs font-bold border transition-all duration-300 ${
                  isAlarmMuted
                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    : 'bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
                title={isAlarmMuted ? 'Nyalakan Alarm Kembali' : 'Bisukan Alarm Darurat'}
              >
                {isAlarmMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </motion.button>
            )}
          </div>

          {/* Emergency Center Navigation Button */}
          <Link href="/dashboard/emergency">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center p-1.5 sm:p-2.5 rounded-full border transition-all duration-300 ${
                isSosTriggered
                  ? 'bg-red-600 text-white border-red-700 shadow-md shadow-red-550/20 animate-pulse'
                  : 'bg-red-50 text-red-600 border-red-250 hover:bg-red-100'
              } sm:px-3 sm:py-1.5 sm:rounded-full text-xs font-bold`}
            >
              <ShieldAlert className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1.5">EMERGENCY CENTER</span>
            </motion.button>
          </Link>

          {/* Real-time notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl p-1.5 sm:p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-850 transition-all duration-300"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex h-2 w-2 rounded-full bg-cyan-500" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-20"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <span className="text-sm font-semibold text-slate-800">Notifikasi</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-cyan-600 hover:underline"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500">Tidak ada notifikasi baru</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              notif.isRead
                                ? 'bg-transparent border-transparent'
                                : 'bg-cyan-50/55 border-cyan-100'
                            }`}
                          >
                            <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

           {/* User Profile quick dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1 sm:p-1.5 rounded-full hover:bg-slate-100 transition-all duration-300"
            >
              <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold border border-slate-200">
                {user?.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`}
                    alt="Profile"
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
            </button>

            {/* Profile Menu Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-2.5 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl z-20"
                  >
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-750 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      <span>Profil Saya</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </header>
  );
}
