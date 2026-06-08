'use client';

import React from 'react';
import { Menu, Search, Bell, LogOut, ShieldAlert, VolumeX, Volume2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { playEmergencyAlarm, stopEmergencyAlarm } from '@/utils/alarmSound';
import { useState, useEffect, useRef, useCallback } from 'react';

interface AdminNavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export default function AdminNavbar({ setMobileOpen }: AdminNavbarProps) {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { activeAlerts, fetchActiveAlerts } = useEmergencyStore();
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const prevHasAlerts = useRef(false);

  // Check for active alerts that are not silent
  const hasActiveLoudAlerts = activeAlerts.some((alert) => !alert.isSilent);

  useEffect(() => {
    fetchActiveAlerts();
    // Also poll every 10 seconds for admin dashboard to ensure it gets real-time alerts if websockets fail
    const interval = setInterval(fetchActiveAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasActiveLoudAlerts && !prevHasAlerts.current) {
      // New loud alert came in
      setIsAlarmMuted(false);
      playEmergencyAlarm();
    } else if (!hasActiveLoudAlerts && prevHasAlerts.current) {
      // All loud alerts resolved
      stopEmergencyAlarm();
      setIsAlarmMuted(false);
    }
    prevHasAlerts.current = hasActiveLoudAlerts;
  }, [hasActiveLoudAlerts]);

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md md:px-6 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={() => setMobileOpen(true)}
          className="mr-4 text-slate-500 focus:outline-none md:hidden hover:text-slate-800"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search system logs..." 
            className="bg-transparent border-none text-xs text-slate-700 focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-mono font-bold text-emerald-600">SYSTEM ONLINE</span>
        </div>
        
        {/* Silence / Resume Alarm Button */}
        {hasActiveLoudAlerts && (
          <button
            onClick={isAlarmMuted ? handleResumeAlarm : handleSilenceAlarm}
            className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300 ${
              isAlarmMuted
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                : 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
            }`}
            title={isAlarmMuted ? 'Nyalakan Sirine' : 'Bisukan Sirine'}
          >
            {isAlarmMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
        
        <button className="relative text-slate-500 hover:text-slate-800 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{user?.name}</p>
            <p className="text-[9px] font-mono text-purple-600 uppercase tracking-widest">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-slate-500 ml-2"
            title="Secure Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
