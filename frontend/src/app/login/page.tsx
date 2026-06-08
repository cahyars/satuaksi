'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, Lock, LogIn, ArrowRight, MapPin, Bell, Radio, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, loading, clearError, isAuthenticated, user, fetchProfile } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const profileFetched = React.useRef(false);

  React.useEffect(() => {
    if (isAuthenticated && !user && !profileFetched.current) {
      profileFetched.current = true;
      fetchProfile().catch(() => {
        // If profile fetch fails, clear stale auth state
        // The store already handles this, just log
        console.warn('Failed to fetch profile on login page');
      });
    }
  }, [isAuthenticated, user, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan kata sandi wajib diisi!');
      return;
    }
    const success = await login({ email, password });
    if (success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'ADMIN') {
        toast.success('Otentikasi Admin berhasil! Akses Command Center diberikan.');
        router.replace('/admin');
      } else {
        toast.success('Sign in berhasil! Selamat datang di LifeLine AI.');
        router.replace('/dashboard');
      }
    } else {
      const serverError = useAuthStore.getState().error;
      toast.error(serverError || 'Kombinasi email atau sandi Anda salah.');
    }
  };

  const handleQuickLogin = async () => {
    setEmail('warga@lifeline.ai');
    setPassword('user123');
    clearError();
    
    const loadingToast = toast.loading('Mengautentikasi akun demo warga...');
    const success = await login({ email: 'warga@lifeline.ai', password: 'user123' });
    toast.dismiss(loadingToast);
    
    if (success) {
      toast.success('Sign in berhasil! Selamat datang di LifeLine AI.');
      router.replace('/dashboard');
    } else {
      toast.error('Gagal masuk instan. Silakan periksa koneksi atau coba masuk manual.');
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[#f8fafc]">
      {/* Subtle background dots pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      {/* ===== LEFT PANEL: Hero Image & Branding ===== */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700" />
        
        {/* Animated geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/5"
          />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 right-10 w-4 h-4 rounded-full bg-cyan-300/30"
          />
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/3 left-16 w-3 h-3 rounded-full bg-blue-300/20"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Top brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white border border-white/20">
              <Image src="/logo.png" alt="Lifeline AI Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <span className="text-white font-extrabold text-lg tracking-tight">LifeLine AI</span>
              <span className="block text-cyan-200/80 text-[9px] font-mono font-bold uppercase tracking-[0.2em]">Citizen Safety Platform</span>
            </div>
          </div>

          {/* Center hero image */}
          <div className="flex-1 flex items-center justify-center py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-cyan-400/10 rounded-3xl blur-3xl scale-110" />
              <img
                src="/login-hero.png"
                alt="LifeLine AI - Emergency Response System"
                className="relative w-full max-w-[380px] xl:max-w-[440px] h-auto drop-shadow-2xl rounded-2xl"
              />
            </motion.div>
          </div>

          {/* Bottom features */}
          <div className="space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white text-2xl xl:text-3xl font-bold leading-tight tracking-tight"
            >
              Lindungi Keluarga Anda<br />
              <span className="text-cyan-300">Dengan Respons Darurat Cepat</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-5"
            >
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-white/80 text-xs font-semibold">GPS Real-time</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                  <Bell className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-white/80 text-xs font-semibold">SOS Instan</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                  <Radio className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-white/80 text-xs font-semibold">AI Prediksi</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ===== RIGHT PANEL: Login Form ===== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile-only branding (hidden on desktop where left panel shows) */}
          <div className="flex items-center space-x-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white border border-slate-100">
              <Image src="/logo.png" alt="Lifeline AI Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <span className="text-slate-900 font-extrabold text-lg tracking-tight">LifeLine AI</span>
              <span className="block text-cyan-600 text-[9px] font-mono font-bold uppercase tracking-[0.2em]">Citizen Safety Platform</span>
            </div>
          </div>

          {/* Greeting & description */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Masuk ke platform keselamatan warga untuk akses<br className="hidden sm:block" />
              <span className="text-cyan-600 font-semibold">prediksi bencana, SOS darurat,</span> dan <span className="text-cyan-600 font-semibold">telemetry real-time.</span>
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Alamat Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-300 transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="budi@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Kata Sandi</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-300 transition-all font-semibold placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center space-x-2.5 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Sign In ke Platform</span>
                    <LogIn className="h-4.5 w-4.5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Atau</span>
            </div>

            {/* Quick demo login */}
            <motion.button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full inline-flex items-center justify-center space-x-2.5 py-3.5 rounded-xl text-sm font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100/80 active:bg-cyan-200/50 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Masuk Instan (Akun Demo Warga)</span>
              <ChevronRight className="h-4.5 w-4.5 text-cyan-500" />
            </motion.button>
          </div>

          {/* Footer links */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-sm text-slate-500">
              Belum terdaftar?{' '}
              <Link href="/register" className="text-cyan-600 hover:text-cyan-700 hover:underline inline-flex items-center space-x-0.5 font-bold">
                <span>Buat Akun Baru</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Akses admin?{' '}
              <Link href="/admin/login" className="text-slate-500 hover:text-slate-700 hover:underline font-semibold">
                Admin Login →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
