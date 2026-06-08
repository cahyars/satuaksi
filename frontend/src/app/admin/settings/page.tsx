'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] font-mono font-bold text-purple-650 uppercase tracking-widest block">ADMIN COMMAND SYSTEM</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Konfigurasi Sistem</h1>
        <p className="text-xs text-slate-600 mt-0.5">Pengaturan API eksternal, kunci layanan AI, dan mode perbaikan.</p>
      </div>
      <div className="glass-panel border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center shadow-sm">
        <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Modul Konfigurasi Aktif</h3>
        <p className="text-xs text-slate-650 max-w-md mt-2">Sistem routing telah diisolasi secara sempurna di belakang autentikasi Admin.</p>
      </div>
    </div>
  );
}
