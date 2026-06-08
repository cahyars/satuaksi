'use client';

import React, { useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function UserNotificationsPage() {
  const { notifications, loading, fetchNotifications, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block">REALTIME ALERTS</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Notifikasi Anda</h1>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 transition-all cursor-pointer"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      <div className="glass-panel border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
        {loading && notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600 h-8 w-8" />
            <span className="text-xs text-slate-500">Memuat notifikasi...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Bell className="h-10 w-10 text-slate-300" />
            <span className="text-xs text-slate-500">Tidak ada notifikasi saat ini.</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border flex items-start space-x-3 transition-all ${
                notif.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-cyan-50/50 border-cyan-200/50'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                notif.isRead
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-cyan-100 text-cyan-600'
              }`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                <span className="text-[9px] text-slate-400 font-mono mt-1.5 block">
                  {new Date(notif.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
