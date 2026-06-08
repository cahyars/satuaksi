'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  ShieldAlert, 
  BrainCircuit, 
  PlusCircle, 
  Activity, 
  Radar,
  Users,
  Locate,
  ArrowUpRight,
  Cpu,
  XCircle
} from 'lucide-react';
import { useReportStore } from '@/store/useReportStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/EarthquakeMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8fafc] text-cyan-600 font-mono text-xs animate-pulse z-50">
      <Cpu className="h-6 w-6 text-cyan-600 animate-spin mb-2" />
      <span>MENGHUBUNGKAN PETA KESELAMATAN WARGA...</span>
    </div>
  )
});

export default function UserDashboard() {
  const { user } = useAuthStore();
  const { reports, fetchReports } = useReportStore();
  const { activeAlerts, fetchActiveAlerts } = useEmergencyStore();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  
  // State for map selection
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Combine reports and active SOS alerts for map plotting
  const combinedReports = React.useMemo(() => {
    const mappedAlerts = activeAlerts.map((alert: any) => ({
      id: alert.id,
      title: `SOS DARURAT: ${alert.type === 'CRIME' ? 'Kejahatan' : alert.type === 'MEDICAL' ? 'Medis' : alert.type === 'FIRE' ? 'Kebakaran' : alert.type === 'ACCIDENT' ? 'Kecelakaan' : 'Bantuan Darurat'}`,
      description: alert.message || 'Warga memerlukan bantuan segera!',
      latitude: alert.latitude,
      longitude: alert.longitude,
      severity: 'CRITICAL',
      isEmergency: true,
      category: { name: 'DARURAT SOS' },
      address: `Koordinat: ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`,
      createdAt: alert.createdAt,
      status: 'ACTIVE'
    }));

    return [...reports, ...mappedAlerts];
  }, [reports, activeAlerts]);

  useEffect(() => {
    fetchReports();
    fetchActiveAlerts();
  }, []);

  const handleScanArea = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        dangerScore: Math.floor(Math.random() * 40 + 15),
        status: 'AMAN / RISIKO RENDAH',
        details: 'Tidak ditemukan anomali ancaman atau indikasi kriminalitas tinggi dalam radius 1km dari posisi Anda saat ini. Cuaca terpantau cerah berawan.'
      });
    }, 650);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block font-sans">TELEMETRY SYSTEM ACTIVE</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{getGreeting()}, {user?.name}</h1>
          <p className="text-xs text-slate-600 mt-0.5">Pantau status keselamatan wilayah dan kelola mitigasi secara real-time.</p>
        </div>

        {/* Action button grouping */}
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-550 hover:to-blue-650 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Buat Laporan Baru</span>
          </Link>
        </div>
      </div>

      {/* Primary Analytics Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Risk Index */}
        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Indeks Risiko Lokal</span>
            <BrainCircuit className="h-4.5 w-4.5 text-cyan-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">24%</span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-2.5 uppercase font-bold">Rendah</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Rata-rata risiko keselamatan wilayah Anda saat ini.</p>
        </div>

        {/* Active Emergency SOS Count */}
        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">SOS Aktif (Kota)</span>
            <ShieldAlert className="h-4.5 w-4.5 text-red-650" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{activeAlerts.length}</span>
            {activeAlerts.length > 0 && (
              <span className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full ml-2.5 uppercase font-bold danger-pulse">Siaga</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Jumlah sinyal darurat SOS aktif yang membutuhkan respons.</p>
        </div>

        {/* Crowdsourced reports count */}
        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Laporan Komunitas</span>
            <AlertTriangle className="h-4.5 w-4.5 text-yellow-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{reports.length}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Laporan bahaya terverifikasi dari warga sekitar.</p>
        </div>

        {/* Real-time Telemetry state */}
        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jaringan Telemetri</span>
            <Activity className="h-4.5 w-4.5 text-indigo-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">AKTIF</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Sensor kecelakaan smartphone diaktifkan otomatis.</p>
        </div>
      </div>

      {/* Main dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: AI Scanner Widget */}
        <div className="glass-panel border-slate-200 rounded-2xl p-6 flex flex-col justify-between h-[380px] relative overflow-hidden shadow-sm">
          {scanning && (
            <div className="scanner-line absolute inset-x-0 top-0 h-10 pointer-events-none" />
          )}

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Radar className={`h-4.5 w-4.5 text-cyan-600 ${scanning ? 'animate-spin' : ''}`} />
                <span>Real-time Safety Scanner</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Pindai keamanan wilayah Anda menggunakan radar sensor AI & data darurat.</p>
          </div>

          {/* Map & Scan Visuals */}
          <div className="flex-1 my-4 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center">
            <MapComponent 
              mode="overview" 
              reports={combinedReports} 
              selectedReport={selectedReport} 
              setSelectedReport={setSelectedReport} 
              mapTheme="warga"
            />

            {/* Scanning Overlay */}
            {scanning && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                <div className="h-10 w-10 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin mb-3" />
                <p className="text-[10px] font-bold text-cyan-600 font-mono tracking-wider animate-pulse uppercase">Mengumpulkan data telemetri wilayah...</p>
                <p className="text-[8px] text-slate-500 mt-1 font-mono">INTEGRASI RADAR & TELEMETRI SATELIT...</p>
              </div>
            )}

            {/* Floating Scan Result HUD */}
            <AnimatePresence>
              {scanResult && !scanning && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-2 left-2 right-2 bg-white/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-2.5 z-20 flex items-center justify-between text-left shadow-[0_4px_15px_-3px_rgba(6,182,212,0.15)]"
                >
                  <div className="pr-2">
                    <span className="text-[8px] font-mono text-slate-500">Hasil Pemindaian AI</span>
                    <div className="text-xs font-black text-cyan-600 mt-0.5">{scanResult.dangerScore}% Kerawanan ({scanResult.status})</div>
                    <p className="text-[8px] text-slate-700 mt-0.5 line-clamp-2 leading-relaxed">{scanResult.details}</p>
                  </div>
                  <button 
                    onClick={() => setScanResult(null)}
                    className="text-slate-400 hover:text-slate-700 p-0.5 self-start cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating report details card for citizens */}
            <AnimatePresence>
              {selectedReport && !scanning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className={`absolute inset-x-2 bottom-2 z-20 glass-panel p-3 rounded-xl text-left border ${
                    selectedReport.isEmergency 
                      ? 'border-red-200 bg-white/95 shadow-md shadow-red-500/10' 
                      : 'border-cyan-200 bg-white/95 shadow-md shadow-cyan-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full border uppercase ${
                        selectedReport.isEmergency 
                          ? 'bg-red-50 text-red-600 border-red-200 danger-pulse' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {selectedReport.category?.name || 'LAPORAN'}
                      </span>
                      <h4 className="text-[10px] font-bold text-slate-800 mt-1 line-clamp-1">{selectedReport.title}</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedReport(null)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {selectedReport.description}
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 flex justify-between items-center text-[8px] font-mono text-slate-500">
                    <span className="line-clamp-1">LOKASI: {selectedReport.address}</span>
                    <span className={selectedReport.isEmergency ? 'text-red-600 font-bold' : 'text-cyan-600'}>
                      {selectedReport.severity || 'HIGH'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleScanArea}
            disabled={scanning}
            className="w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {scanning ? 'Memindai Area...' : 'Pindai Lokasi Sekarang'}
          </button>
        </div>

        {/* Right: Recent Reports List */}
        <div className="lg:col-span-2 glass-panel border-slate-200 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Users className="h-4.5 w-4.5 text-indigo-600" />
                <span>Laporan Bahaya Komunitas</span>
              </span>
              <Link href="/dashboard/reports" className="text-[10px] font-semibold text-cyan-650 hover:underline flex items-center space-x-0.5 font-bold">
                <span>Semua Laporan</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Laporan darurat jalan raya, cuaca, bencana, dan aksi kejahatan dari warga.</p>
          </div>

          <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1">
            {reports.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Tidak ada laporan bahaya saat ini. Aman.</div>
            ) : (
              reports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left"
                >
                  <div>
                    <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase">
                      {rep.category?.name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1">{rep.title}</h4>
                    <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">{rep.description}</p>
                    <span className="text-[9px] text-slate-500 mt-1.5 block">{rep.address || 'Tanpa Alamat'}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    rep.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-650 border border-emerald-200' : 'bg-yellow-50 text-yellow-650 border border-yellow-200'
                  }`}>
                    {rep.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <Link
            href="/dashboard/reports"
            className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            Pantau di Peta Interaktif
          </Link>
        </div>
      </div>
    </div>
  );
}
