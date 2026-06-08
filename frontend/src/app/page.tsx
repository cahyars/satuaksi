'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  BrainCircuit,
  Activity,
  MapPin,
  CloudLightning,
  ChevronRight,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe2
} from 'lucide-react';
import Background from '@/components/Background';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const { isAuthenticated, user, login, logout, clearError } = useAuthStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dashboardHref = '/dashboard'; // Always default "Mulai Cepat" to citizen dashboard
  const mainCtaHref = mounted && isAuthenticated ? dashboardHref : '/register';
  const secondaryCtaHref = mounted && isAuthenticated ? dashboardHref : '/login';
  const signInHref = mounted && isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login';

  const handleQuickCitizenLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Jika sudah login sebagai warga, langsung ke dashboard
    if (isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Jika login sebagai ADMIN, logout
    if (isAuthenticated && user?.role === 'ADMIN') {
      logout();
    }

    // Arahkan ke form login warga
    router.push('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, damping: 20 } }
  } as const;

  return (
    <>
      <Toaster position="top-right" />
      <div className="relative min-h-screen text-slate-800 flex flex-col justify-between">
        {/* Premium ambient backdrop mesh */}
        <Background />

        {/* Floating Header */}
        <header className="fixed top-0 left-0 right-0 z-50 w-full glass-panel border-slate-200 border-b bg-white/70 backdrop-blur-md px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white border border-slate-100">
                <Image src="/logo.png" alt="Lifeline AI Logo" width={36} height={36} className="object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-slate-900 via-slate-850 to-slate-700 bg-clip-text text-transparent">LifeLine</span>
                <span className="text-cyan-600 text-[10px] block font-mono font-semibold tracking-wider">PREDICTIVE AI</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
              <Link href="#features" className="hover:text-slate-950 transition-all">Fitur Utama</Link>
              <Link href="#technology" className="hover:text-slate-950 transition-all">Teknologi LifeLine AI</Link>
              <Link href="#stats" className="hover:text-slate-950 transition-all">Efektivitas</Link>
              <Link href="#faq" className="hover:text-slate-950 transition-all">FAQs</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href={signInHref} className="text-xs font-semibold text-slate-700 hover:text-slate-950 transition-all px-3 py-1.5 rounded-lg">
                Sign In
              </Link>
              <button
                onClick={handleQuickCitizenLogin}
                className="text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 rounded-xl transition-all shadow-[0_4px_15px_-3px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                Mulai Cepat
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            {/* Tagline Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold tracking-wide mb-6 shadow-sm"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>AI-Driven Predictive Safety Network</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-slate-950 via-slate-850 to-slate-750 bg-clip-text text-transparent leading-[1.1]"
            >
              Mencegah Bahaya <br />
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Sebelum Kejadian Terjadi</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              LifeLine AI mendeteksi ancaman keselamatan publik secara real-time dengan menggabungkan telemetri sensor smartphone, laporan masyarakat terverifikasi, anomali cuaca, dan prediksi cerdas LifeLine AI Core.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={handleQuickCitizenLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 hover:shadow-[0_4px_25px_-3px_rgba(6,182,212,0.35)] transition-all duration-300 px-6 py-3.5 rounded-xl shadow-lg cursor-pointer"
              >
                <span>Aktifkan Monitoring</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href={secondaryCtaHref}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-semibold text-slate-700 hover:text-slate-950 glass-panel border-slate-200 hover:bg-slate-100/50 px-6 py-3.5 rounded-xl transition-all"
              >
                <span>Eksplorasi Dashboard</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Real-time Dashboard Graphic Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring', damping: 20 }}
            className="w-full max-w-5xl mt-20 relative rounded-2xl border border-slate-200 bg-white/70 p-2 shadow-2xl backdrop-blur-sm"
          >
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur opacity-30 pointer-events-none" />
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Window bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex space-x-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="text-[10px] font-mono text-slate-400 tracking-wider">LIFELINE_MONITOR_DASHBOARD.exe</div>
                <div className="w-9" />
              </div>

              {/* Mock system screen content */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Left pane: Active Threats */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500 danger-pulse inline-block" />
                      <span>Real-time Public Safety Grid Map</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-700 bg-cyan-55 border border-cyan-200 px-2 py-0.5 rounded">GPS ACTIVE</span>
                  </div>
                  {/* Visual Radar grid layout */}
                  <div className="h-64 rounded-xl border border-slate-200 bg-slate-50/50 relative overflow-hidden flex items-center justify-center">
                    <div className="scanner-line absolute inset-x-0 top-0 h-10" />
                    <Globe2 className="h-20 w-20 text-cyan-500/15 animate-pulse" />

                    {/* Glowing Radar rings */}
                    <div className="absolute w-32 h-32 rounded-full border border-cyan-500/15 animate-ping duration-3000" />
                    <div className="absolute w-48 h-48 rounded-full border border-cyan-500/10 animate-pulse" />

                    {/* Threat Points */}
                    <div className="absolute top-[20%] left-[30%] flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full bg-red-500 danger-pulse cursor-pointer" />
                      <span className="text-[9px] font-mono bg-white border border-red-200 text-red-650 px-1.5 py-0.5 rounded mt-1 shadow-sm">Lalu Lintas Darurat</span>
                    </div>
                    <div className="absolute top-[60%] right-[25%] flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full bg-amber-500 danger-pulse cursor-pointer" />
                      <span className="text-[9px] font-mono bg-white border border-amber-200 text-amber-650 px-1.5 py-0.5 rounded mt-1 shadow-sm">Kriminalitas Ringan</span>
                    </div>
                  </div>
                </div>

                {/* Right pane: LifeLine AI Prediction Output */}
                <div className="space-y-4 border-l border-slate-200 md:pl-6">
                  <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <BrainCircuit className="h-4.5 w-4.5 text-cyan-600" />
                    <span>LifeLine AI Predictive Engine</span>
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">Danger Risk Index</span>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-2xl font-extrabold text-slate-900">78%</span>
                        <span className="text-[9px] font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase">High Threat</span>
                      </div>
                    </div>

                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 w-[78%]" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-slate-600 block">AI Rekomendasi Mitigasi</span>
                      <ul className="text-[10px] text-slate-600 space-y-1.5 list-disc pl-3.5">
                        <li>Tingkatkan patroli keamanan di koridor utama Malioboro.</li>
                        <li>Alihkan arus lalu lintas dari Jalan Solo KM 4.</li>
                        <li>Kirimkan waspada otomatis ke pengguna dalam radius 500m.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-cyan-600 uppercase tracking-widest">Premium Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2 mb-4 leading-tight">Solusi Keselamatan Publik Terpadu</h2>
            <p className="text-sm text-slate-650">Teknologi sensor canggih dan algoritma kecerdasan buatan dalam satu platform modern.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel hover:glass-panel-glow border-slate-200 rounded-2xl p-6 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-200 group-hover:scale-110 transition-transform mb-6">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 mb-2">Safety Prediction Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Menghitung skor ancaman wilayah secara dinamis dengan menguji anomali sensor cuaca dan data historis setempat.</p>
            </div>

            <div className="glass-panel hover:glass-panel-glow border-slate-200 rounded-2xl p-6 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-200 group-hover:scale-110 transition-transform mb-6">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 mb-2">Live Crowdsourcing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Masyarakat dapat melaporkan kecelakaan atau kriminalitas dengan cepat lengkap dengan koordinat tepat, foto bukti, dan status.</p>
            </div>

            <div className="glass-panel hover:glass-panel-glow border-slate-200 rounded-2xl p-6 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-200 group-hover:scale-110 transition-transform mb-6">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 mb-2">Silent Panic Button SOS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Aktifkan tombol darurat instan yang melacak lokasi real-time Anda dan mengirimi kontak darurat peringatan darurat dalam senyap.</p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section id="technology" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-slate-200 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono font-bold text-cyan-600 uppercase tracking-widest">Next-Gen Integration</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 leading-tight">
                Sinergi LifeLine AI & Data Geospasial Nasional
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                LifeLine AI bukan sekadar alat pelaporan statis. Kami mengintegrasikan kecerdasan buatan LifeLine AI Core untuk memproses jutaan parameter cuaca dan seismik nasional secara waktu nyata.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="h-6.5 w-6.5 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-200 mt-0.5">
                    <Cpu className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">LifeLine AI Core Danger Radar</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      Memindai anomali seismik dan cuaca regional untuk menghitung indeks bahaya publik dalam hitungan milidetik.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="h-6.5 w-6.5 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-200 mt-0.5">
                    <CloudLightning className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Prakiraan Cuaca Digital Terpadu</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      Sinkronisasi otomatis dengan feed data XML cuaca nasional untuk mendeteksi potensi cuaca ekstrem di tingkat kecamatan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="h-6.5 w-6.5 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-200 mt-0.5">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Interactive Seismology Grid</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      Holographic heatmap visual yang memetakan getaran gempa felt dan gempa terkini dengan presisi koordinat mutlak.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel border-slate-200 rounded-2xl p-6 relative overflow-hidden bg-white/70">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-500/5 blur-[80px]" />
              <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded tracking-widest uppercase">Live API Status</span>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white/70 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 danger-pulse" />
                    <span className="text-xs font-semibold text-slate-800">Sensor Seismologi Terintegrasi</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE (100% UP)</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white/70 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 danger-pulse" />
                    <span className="text-xs font-semibold text-slate-800">LifeLine AI Core Engine</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">ONLINE (15ms LATENCY)</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white/70 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 danger-pulse" />
                    <span className="text-xs font-semibold text-slate-800">Crowdsourcing Geo-Sync</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">SYNCED (0.1s DELAY)</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block">Current Safety Network Status</span>
                  <span className="text-xs font-bold text-slate-800">Semua Sistem Beroperasi Normal</span>
                </div>
                <Activity className="h-5 w-5 text-emerald-600 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="max-w-7xl mx-auto px-6 py-20 w-full border-t border-slate-200 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-cyan-600 uppercase tracking-widest">Impact Analytics</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2 mb-4 leading-tight">Performa Tanpa Kompromi untuk Keselamatan</h2>
            <p className="text-sm text-slate-650">Statistik real-time performa sistem monitoring keselamatan publik kami.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel border-slate-200 rounded-2xl p-6 text-center hover:border-slate-300 transition-all shadow-sm">
              <span className="text-4xl font-extrabold text-cyan-600 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent block mb-1">99.8%</span>
              <span className="text-xs font-bold text-slate-850 block mb-1.5">Akurasi Prediksi</span>
              <span className="text-[10px] text-slate-600 leading-relaxed">Model data teruji dari LifeLine AI Core.</span>
            </div>

            <div className="glass-panel border-slate-200 rounded-2xl p-6 text-center hover:border-slate-300 transition-all shadow-sm">
              <span className="text-4xl font-extrabold text-cyan-600 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent block mb-1">&lt; 2s</span>
              <span className="text-xs font-bold text-slate-850 block mb-1.5">Respons Pemicu SOS</span>
              <span className="text-[10px] text-slate-600 leading-relaxed">Penyebaran peringatan kontak darurat instan.</span>
            </div>

            <div className="glass-panel border-slate-200 rounded-2xl p-6 text-center hover:border-slate-300 transition-all shadow-sm">
              <span className="text-4xl font-extrabold text-cyan-600 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent block mb-1">5.0+ SR</span>
              <span className="text-xs font-bold text-slate-850 block mb-1.5">Gempa Terintegrasi</span>
              <span className="text-[10px] text-slate-600 leading-relaxed">Peringatan otomatis gempa dari sensor seismik nasional.</span>
            </div>

            <div className="glass-panel border-slate-200 rounded-2xl p-6 text-center hover:border-slate-300 transition-all shadow-sm">
              <span className="text-4xl font-extrabold text-cyan-600 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent block mb-1">34 Prov</span>
              <span className="text-xs font-bold text-slate-850 block mb-1.5">Cakupan Wilayah</span>
              <span className="text-[10px] text-slate-600 leading-relaxed">Cuaca digital terperinci di seluruh Indonesia.</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto px-6 py-20 w-full border-t border-slate-200">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-bold text-cyan-600 uppercase tracking-widest">Help Center</span>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-2 mb-4 leading-tight">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-sm text-slate-650">Jawaban lengkap mengenai sistem kerja, kehandalan data, dan privasi LifeLine AI.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Bagaimana LifeLine AI memprediksi tingkat bahaya suatu wilayah?",
                answer: "LifeLine AI menggabungkan model data cuaca real-time dari satelit cuaca nasional, anomali aktivitas getaran seismik terintegrasi, serta data crowdsourcing laporan masyarakat. LifeLine AI Core memproses data ini secara berkelanjutan untuk menghasilkan skor risiko bahaya yang komprehensif bagi wilayah Anda."
              },
              {
                question: "Bagaimana cara kerja Silent Panic Button SOS?",
                answer: "Saat Anda mengaktifkan Silent Panic Button, platform akan merekam lokasi GPS presisi Anda secara real-time dan secara senyap mengirimkan notifikasi darurat instan kepada tim keamanan kota (Admin) serta nomor kontak darurat pribadi Anda tanpa mengeluarkan suara alarm dari perangkat Anda."
              },
              {
                question: "Apakah data cuaca dan gempa di LifeLine AI akurat?",
                answer: "Ya. LifeLine AI terintegrasi langsung dengan API data resmi satelit meteorologi, klimatologi, dan seismik nasional. Seluruh informasi prakiraan cuaca regional dan info gempa bumi dirujuk langsung dari feed database keselamatan publik yang mutakhir."
              },
              {
                question: "Bagaimana cara mengakses dashboard admin?",
                answer: "Dashboard Admin Command Center ditujukan untuk aparat penegak hukum dan petugas penyelamat kota. Anda dapat masuk menggunakan akun kredensial resmi melalui halaman login khusus Admin."
              }
            ].map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="glass-panel border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-xs text-slate-800 hover:text-slate-950 transition-all focus:outline-none"
                  >
                    <span>{item.question}</span>
                    <ChevronRight className={`h-4.5 w-4.5 text-cyan-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1.5 text-xs text-slate-650 leading-relaxed border-t border-slate-200 bg-slate-50/40">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full glass-panel border-slate-200 border-t bg-white/80 py-8 px-6 text-center text-xs text-slate-500 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-100">
                <Image src="/logo.png" alt="Lifeline AI Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="font-extrabold text-slate-800">LifeLine AI</span>
            </div>
            <p>© 2026 LifeLine AI. All rights reserved. Platform Prediktif Keselamatan Publik Masa Depan.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
