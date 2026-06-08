'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Activity, Edit3, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block">IDENTITY MANAGEMENT</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Profil Warga</h1>
        <p className="text-xs text-slate-600 mt-0.5">Kelola identitas publik dan riwayat pelaporan Anda di LifeLine AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-4">
              <div className="h-24 w-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-[10px] text-slate-500 mt-1">{user?.email}</p>
            <span className="mt-3 inline-block px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
              {user?.role}
            </span>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2 mb-4">
              <Activity className="h-4 w-4 text-cyan-600" />
              <span>Aktivitas Publik</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] text-slate-500">Total Laporan</span>
                <span className="text-xs font-bold text-slate-800">0</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] text-slate-500">Sinyal SOS Dikeluarkan</span>
                <span className="text-xs font-bold text-slate-800">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Kontribusi Valid</span>
                <span className="text-xs font-bold text-emerald-600">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Edit3 className="h-4.5 w-4.5 text-slate-500" />
              <span>Edit Informasi Profil</span>
            </h3>
          </div>

          <form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                <input type="text" defaultValue={user?.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Alamat Email</label>
                <input type="email" disabled defaultValue={user?.email} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Nomor Telepon</label>
                <input type="tel" defaultValue={user?.phone || ''} placeholder="08..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Kontak Darurat</label>
                <input type="tel" defaultValue={user?.emergencyContact || ''} placeholder="Kontak Keluarga..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="pt-6">
              <button type="button" className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-colors">
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
