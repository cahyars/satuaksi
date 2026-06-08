'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Background from '@/components/Background';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Mail, Lock, Phone, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, loading, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Nama, email, dan sandi wajib diisi!');
      return;
    }
    if (password.length < 6) {
      toast.error('Kata sandi minimal harus 6 karakter!');
      return;
    }
    const success = await register({ name, email, password, phone });
    if (success) {
      toast.success('Pendaftaran berhasil! Silakan masuk ke akun baru Anda.');
      router.replace('/login');
    } else {
      const serverError = useAuthStore.getState().error;
      toast.error(serverError || 'Registrasi gagal. Coba gunakan email lain.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <Background />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-md glass-panel border-slate-200 rounded-3xl p-8 relative overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/10 mb-4">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Buat Akun LifeLine</h2>
          <p className="text-xs text-slate-600 mt-1">Lengkapi informasi untuk terhubung ke jaringan keselamatan publik.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-semibold"
                placeholder="Budi Setiawan"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-semibold"
                placeholder="budi@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Nomor Telepon (Opsional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearError(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-semibold"
                placeholder="+628123456789"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-semibold"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-550 hover:to-blue-650 transition-all cursor-pointer shadow-md shadow-cyan-500/10 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <UserPlus className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-650">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-cyan-600 hover:text-cyan-700 hover:underline inline-flex items-center space-x-0.5 font-bold">
              <span>Masuk di sini</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
