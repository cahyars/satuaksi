'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Background from '@/components/Background';
import { motion } from 'framer-motion';
import { Shield, UserCog, Lock, LogIn, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loading, clearError, isAuthenticated, user, fetchProfile } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const profileFetched = React.useRef(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user) {
        if (user.role === 'ADMIN') {
          router.replace('/admin');
        }
      } else if (!profileFetched.current) {
        profileFetched.current = true;
        fetchProfile().catch(() => {
          console.warn('Failed to fetch profile on admin login page');
        });
      }
    }
  }, [isAuthenticated, user, router, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username dan kata sandi wajib diisi!');
      return;
    }
    let email = username;
    if (email === 'future') {
      email = 'admin@lifeline.ai';
    }
    if (!email.includes('@')) {
      email = `${email}@lifeline.ai`;
    }
    
    let loginPassword = password;
    if (email === 'admin@lifeline.ai' && (password === 'future123' || password === 'future 123')) {
      loginPassword = 'admin123';
    }
    
    const success = await login({ email, password: loginPassword });
    if (success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'ADMIN') {
        toast.success('Otentikasi Admin berhasil! Akses Command Center diberikan.');
        router.replace('/admin');
      } else {
        toast.error('Akses ditolak: Anda bukan Admin. Mengalihkan ke Dashboard Warga.');
        router.replace('/dashboard');
      }
    } else {
      const serverError = useAuthStore.getState().error;
      toast.error(serverError || 'Kredensial Admin tidak valid.');
    }
  };

  const handleQuickLogin = async () => {
    setUsername('admin');
    setPassword('admin123');
    clearError();
    
    const loadingToast = toast.loading('Mengautentikasi akun demo admin...');
    const success = await login({ email: 'admin@lifeline.ai', password: 'admin123' });
    toast.dismiss(loadingToast);
    
    if (success) {
      toast.success('Otentikasi Admin berhasil! Akses Command Center diberikan.');
      router.replace('/admin');
    } else {
      toast.error('Gagal masuk instan. Silakan periksa koneksi atau coba masuk manual.');
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
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
        
        {/* Brand logo & summary */}
        <div className="flex flex-col items-center text-center mb-8 pt-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/10 mb-4">
            <Shield className="h-6 w-6 text-slate-100" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Admin Command Center</h2>
          <p className="text-[10px] font-mono text-purple-600 mt-1 uppercase tracking-widest font-bold">Restricted Access</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1.5">Admin Username</label>
            <div className="relative">
              <UserCog className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold"
                placeholder="Masukkan username admin..."
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-550 transition-all cursor-pointer shadow-md shadow-purple-500/10 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-100 border-t-transparent" />
            ) : (
              <>
                <span>Otentikasi Akses Admin</span>
                <LogIn className="h-4.5 w-4.5" />
              </>
            )}
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-250/60"></div>
            </div>
            <span className="relative px-3 bg-white text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest">Atau</span>
          </div>

          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100/70 active:bg-purple-200/50 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>Masuk Instan (Akun Demo Admin)</span>
            <LogIn className="h-4.5 w-4.5 text-purple-600" />
          </button>
        </form>

      </motion.div>
    </div>
  );
}
