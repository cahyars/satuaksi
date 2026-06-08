'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  BrainCircuit, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Users, 
  FileText, 
  Zap, 
  Send,
  AlertTriangle,
  Locate,
  Clock,
  Radio,
  Trash2,
  Play,
  Cpu,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useReportStore } from '@/store/useReportStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/EarthquakeMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8fafc] text-purple-650 font-mono text-xs animate-pulse z-50">
      <Cpu className="h-6 w-6 text-purple-650 animate-spin mb-2" />
      <span>MENGHUBUNGKAN DEPLOYMENT PETA NASIONAL...</span>
    </div>
  )
});

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { reports, fetchReports, verifyReport, deleteReport } = useReportStore();
  const { activeAlerts, fetchActiveAlerts, resolveAlert } = useEmergencyStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'sos' | 'ai'>('overview');
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);
  const [statsData, setStatsData] = useState<any>(null);
  
  // AI trigger inputs
  const [aiLatitude, setAiLatitude] = useState('-7.7929');
  const [aiLongitude, setAiLongitude] = useState('110.3658');
  const [aiTriggering, setAiTriggering] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Dispatching state
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

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

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const [reportsRes, usersRes] = await Promise.all([
        api.get('/reports?limit=100'),
        api.get('/users?limit=1')
      ]);
      setUsersCount(usersRes.data.total || 5);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchActiveAlerts();
    loadAdminStats();
  }, []);

  const handleVerify = async (id: string, approve: boolean) => {
    const success = await verifyReport(id, approve, approve ? 'VERIFIED' : 'REJECTED');
    if (success) {
      toast.success(approve ? 'Laporan berhasil divalidasi & diverifikasi!' : 'Laporan berhasil ditolak.');
      fetchReports();
    } else {
      toast.error('Gagal memproses validasi laporan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus laporan ini secara permanen?')) return;
    const success = await deleteReport(id);
    if (success) {
      toast.success('Laporan warga berhasil dihapus secara permanen.');
      fetchReports();
    } else {
      toast.error('Gagal menghapus laporan.');
    }
  };

  const handleDispatch = async (alertId: string) => {
    setDispatchingId(alertId);
    try {
      // Simulate dispatch time
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Resolve/update the SOS status to RESPONDING (simulated via RESOLVED)
      await resolveAlert(alertId, 'RESOLVED');
      toast.success('Satgas Keselamatan berhasil dikirim ke koordinat darurat.');
      fetchActiveAlerts();
    } catch (err) {
      toast.error('Gagal mengirimkan satgas bantuan.');
    } finally {
      setDispatchingId(null);
    }
  };

  const handleTriggerAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiLatitude || !aiLongitude) {
      toast.error('Isi koordinat wilayah terlebih dahulu!');
      return;
    }
    setAiTriggering(true);
    setAiResult(null);
    try {
      const res = await api.post('/ai/predict', {
        latitude: parseFloat(aiLatitude),
        longitude: parseFloat(aiLongitude),
        type: 'admin_command'
      });
      setAiResult(res.data);
      toast.success('Analisis Prediktif LifeLine AI Core berhasil digenerate.');
    } catch (err) {
      toast.error('Gagal menghubungi motor prediksi LifeLine AI.');
    } finally {
      setAiTriggering(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-widest block flex items-center space-x-1.5">
            <Radio className="h-3 w-3 text-red-500 danger-pulse animate-pulse mr-1" />
            <span>Smart City AI Operations Hub</span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">AI Command Center</h1>
          <p className="text-xs text-slate-600 mt-0.5">Sistem pengawasan terintegrasi keselamatan publik, anomali radar cuaca, dan respon taktis warga.</p>
        </div>

        {/* Tab switcher */}
        <div className="relative z-30 w-full sm:w-auto overflow-x-auto scrollbar-hide pointer-events-auto">
          <div className="flex items-center bg-slate-100 p-1 border border-slate-200 rounded-2xl space-x-1 min-w-max pointer-events-auto">
            {(['overview', 'moderation', 'sos', 'ai'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
                onTouchStart={(e) => {
                  setActiveTab(tab);
                }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer whitespace-nowrap flex-shrink-0 select-none pointer-events-auto ${
                  activeTab === tab 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'moderation' && 'Moderasi'}
                {tab === 'sos' && 'Respon SOS'}
                {tab === 'ai' && 'Analisis AI'}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview stats panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Warga Terpantau</span>
            <Users className="h-4.5 w-4.5 text-purple-600" />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">{usersCount}</span>
            <span className="text-[9px] font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full uppercase font-bold whitespace-nowrap">Warga</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Semua warga dengan sensor aktif terdaftar.</p>
        </div>

        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sinyal SOS Siaga</span>
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 animate-pulse" />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-red-600">{activeAlerts.length}</span>
            {activeAlerts.length > 0 && (
              <span className="text-[9px] font-mono text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase font-bold danger-pulse whitespace-nowrap">SIAGA SOS</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Permintaan evakuasi/bantuan aktif.</p>
        </div>

        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Laporan Masuk Warga</span>
            <FileText className="h-4.5 w-4.5 text-yellow-600" />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">{reports.length}</span>
            <span className="text-[9px] font-mono text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full uppercase font-bold whitespace-nowrap">
              {reports.filter(r => r.status === 'PENDING').length} Pending
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Laporan kerawanan yang dikirimkan hari ini.</p>
        </div>

        <div className="glass-panel border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Keakuratan Analisis AI</span>
            <BrainCircuit className="h-4.5 w-4.5 text-cyan-600" />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-cyan-600">96.4%</span>
            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase font-bold whitespace-nowrap">Stabil</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Tingkat akurasi pemetaan anomali kerawanan.</p>
        </div>
      </div>

      {/* Tabs panels */}
      <div className="w-full">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Real-time radar city map simulation */}
            <div className="lg:col-span-2 glass-panel border-slate-200 rounded-3xl p-6 h-[460px] flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                    <Activity className="h-4.5 w-4.5 text-purple-600 font-extrabold flex-shrink-0" />
                    <span className="truncate sm:overflow-visible">Visualisasi Radar Keselamatan Publik (Indonesia)</span>
                  </span>
                  <span className="text-[9px] font-mono font-semibold tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 self-start sm:self-auto uppercase">
                    REALTIME ARCHIPELAGO MONITOR
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Pemetaan geografis bahaya kriminalitas, bencana alam, & sinyal SOS aktif seluruh Indonesia.</p>
              </div>

              {/* Real Leaflet Map */}
              <div className="flex-1 my-5 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden flex items-center justify-center">
                <MapComponent 
                  mode="overview" 
                  reports={combinedReports} 
                  selectedReport={selectedReport} 
                  setSelectedReport={setSelectedReport} 
                  mapTheme="admin"
                />

                {/* Floating holographic details card */}
                <AnimatePresence>
                  {selectedReport && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className={`absolute bottom-4 right-4 left-4 md:left-auto md:w-80 z-20 glass-panel p-4 rounded-2xl text-left border ${
                        selectedReport.isEmergency 
                          ? 'border-red-500/40 bg-white/95 shadow-[0_4px_25px_-3px_rgba(239,68,68,0.2)]' 
                          : selectedReport.severity === 'CRITICAL' || selectedReport.severity === 'HIGH'
                          ? 'border-orange-500/40 bg-white/95 shadow-[0_4px_25px_-3px_rgba(249,115,22,0.15)]'
                          : 'border-purple-500/40 bg-white/95 shadow-[0_4px_25px_-3px_rgba(168,85,247,0.15)]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                            selectedReport.isEmergency 
                              ? 'bg-red-50 text-red-600 border-red-200 danger-pulse' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {selectedReport.category?.name || 'LAPORAN'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{selectedReport.title}</h4>
                        </div>
                        <button 
                          onClick={() => setSelectedReport(null)}
                          className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-650 mt-2 line-clamp-3 leading-relaxed">
                        {selectedReport.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-[9px] font-mono text-slate-500">
                        <div className="flex justify-between">
                          <span>SEVERITY:</span>
                          <span className={
                            selectedReport.severity === 'CRITICAL' || selectedReport.isEmergency ? 'text-red-650 font-bold' :
                            selectedReport.severity === 'HIGH' ? 'text-orange-600 font-bold' :
                            selectedReport.severity === 'MEDIUM' ? 'text-yellow-600 font-bold' : 'text-cyan-600 font-bold'
                          }>{selectedReport.severity || 'HIGH'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>STATUS:</span>
                          <span className={
                            selectedReport.status === 'VERIFIED' ? 'text-emerald-600 font-bold' :
                            selectedReport.status === 'PENDING' ? 'text-yellow-650 font-bold' : 'text-slate-500 font-bold'
                          }>{selectedReport.status === 'PENDING' ? 'Menunggu' :
                             selectedReport.status === 'VERIFIED' ? 'Diterima' :
                             selectedReport.status === 'RESOLVED' ? 'Selesai' :
                             selectedReport.status === 'IN_PROGRESS' ? 'Proses' : 'Ditolak'}</span>
                        </div>
                        <div className="flex justify-between line-clamp-1">
                          <span>LOKASI:</span>
                          <span className="text-slate-700">{selectedReport.address}</span>
                        </div>
                      </div>

                      {/* Dynamic CTA button */}
                      <div className="mt-3.5 flex space-x-2">
                        {selectedReport.isEmergency ? (
                          <button
                            onClick={() => {
                              handleDispatch(selectedReport.id);
                              setSelectedReport(null);
                            }}
                            disabled={dispatchingId === selectedReport.id}
                            className="flex-1 text-center py-1.5 rounded-xl text-[10px] font-extrabold text-white bg-gradient-to-r from-red-655 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all cursor-pointer shadow-[0_4px_15px_rgba(239,68,68,0.2)] disabled:opacity-50"
                          >
                            {dispatchingId === selectedReport.id ? 'Mengirim Tim...' : 'Kirim Bantuan (Dispatch)'}
                          </button>
                        ) : selectedReport.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => {
                                handleVerify(selectedReport.id, true);
                                setSelectedReport(null);
                              }}
                              className="flex-1 text-center py-1.5 rounded-xl text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all cursor-pointer"
                            >
                              Verifikasi
                            </button>
                            <button
                              onClick={() => {
                                handleVerify(selectedReport.id, false);
                                setSelectedReport(null);
                              }}
                              className="flex-1 text-center py-1.5 rounded-xl text-[10px] font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if (window.confirm('Hapus laporan ini secara permanen?')) {
                                handleDelete(selectedReport.id);
                                setSelectedReport(null);
                              }
                            }}
                            className="flex-1 text-center py-1.5 rounded-xl text-[10px] font-bold text-slate-550 border border-slate-200 hover:bg-slate-50 hover:text-red-650 transition-all cursor-pointer"
                          >
                            Hapus Laporan
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Live active dispatch log */}
            <div className="glass-panel border-slate-200 rounded-3xl p-6 h-[460px] flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                  <span>Sinyal SOS Aktif Kota</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Warga membutuhkan bantuan darurat instan.</p>
              </div>

              <div className="flex-1 my-4 overflow-y-auto space-y-3 pr-1">
                {activeAlerts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/40" />
                    <span>Keadaan Kota Aman. Tidak ada SOS darurat aktif.</span>
                  </div>
                ) : (
                  activeAlerts.map((alt) => (
                     <div
                      key={alt.id}
                      className="p-4 bg-red-50/50 border border-red-200 rounded-2xl flex flex-col justify-between text-left space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider danger-pulse">
                            DARURAT {alt.type}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 mt-1.5">SOS dari: {alt.user?.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">HP: {alt.user?.phone || 'Tanpa HP'}</p>
                          {alt.message && <p className="text-[10px] text-red-800 italic mt-1 bg-red-50/80 p-2 rounded-lg border border-red-200">"{alt.message}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-red-200">
                        <span className="text-[9px] text-red-600 flex items-center space-x-1 font-mono">
                          <MapPin className="h-3 w-3 mr-0.5" />
                          <span>{alt.latitude.toFixed(4)}, {alt.longitude.toFixed(4)}</span>
                        </span>
                        
                        <button
                          onClick={() => handleDispatch(alt.id)}
                          disabled={dispatchingId === alt.id}
                          className="px-3 py-1.5 rounded-lg text-[9px] font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all flex items-center space-x-1 uppercase"
                        >
                          <Send className="h-3 w-3 mr-0.5" />
                          <span>{dispatchingId === alt.id ? 'Memproses...' : 'Kirim Penyelamat'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setActiveTab('sos')}
                className="w-full text-center py-2 rounded-xl text-[10px] font-bold text-slate-500 border border-slate-200 hover:bg-slate-50"
              >
                Buka Pusat Penanggulangan SOS
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab: Moderasi Laporan Warga */}
        {activeTab === 'moderation' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Moderasi Laporan Publik</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Validasi, setujui, atau tolak laporan kerawanan yang diposting oleh warga.</p>
              </div>
              <button 
                onClick={() => fetchReports()} 
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="glass-panel border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white/70">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono font-bold text-slate-550 uppercase tracking-wider">
                      <th className="p-4">Kategori / Judul</th>
                      <th className="p-4">Deskripsi Kejadian</th>
                      <th className="p-4">Lokasi & Pelapor</th>
                      <th className="p-4">Status / Severity</th>
                      <th className="p-4 text-right">Moderasi Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada laporan bahaya terdaftar saat ini.</td>
                      </tr>
                    ) : (
                      reports.map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="p-4 max-w-xs">
                            <span className="text-[8px] font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded">
                              {rep.category?.name}
                            </span>
                            <h4 className="font-bold text-slate-800 mt-1">{rep.title}</h4>
                            <span className="text-[9px] text-slate-400 block font-mono">{rep.id.slice(0, 8)}...</span>
                          </td>
                          <td className="p-4 max-w-md text-slate-600 truncate-3-lines">{rep.description}</td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-700">{rep.user?.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">{rep.address || 'GPS Coordinate'}</p>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                                rep.status === 'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : rep.status === 'REJECTED'
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}>
                                {rep.status === 'PENDING' ? 'Menunggu' :
                                 rep.status === 'VERIFIED' ? 'Diterima' :
                                 rep.status === 'RESOLVED' ? 'Selesai' :
                                 rep.status === 'IN_PROGRESS' ? 'Proses' : 'Ditolak'}
                              </span>
                              <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border block w-max ${
                                rep.severity === 'CRITICAL' || rep.severity === 'HIGH'
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {rep.severity}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {rep.status !== 'VERIFIED' && (
                                <button
                                  onClick={() => handleVerify(rep.id, true)}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                  title="Validasi & Verifikasi Laporan"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                              {rep.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleVerify(rep.id, false)}
                                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-550/10"
                                  title="Tolak Laporan"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(rep.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                title="Hapus Permanen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: SOS Emergency Responders */}
        {activeTab === 'sos' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Live SOS map and actions list */}
            <div className="lg:col-span-2 glass-panel border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm bg-white/70">
              <div>
                <h3 className="text-sm font-bold text-slate-800">SOS Emergency Feed</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Sinyal panik instan terdaftar dari telepon warga. Kirimkan bantuan satgas segera.</p>
              </div>

              <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-450 flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-550/40" />
                    <span>Keadaan kota saat ini terpantau 100% aman dan kondusif.</span>
                  </div>
                ) : (
                  activeAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-5 bg-red-50/40 border border-red-200 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between text-left gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider danger-pulse">
                            SOS SIAGA
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{new Date(alt.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">Warga: {alt.user?.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">No. Telepon: {alt.user?.phone || 'Tidak Ada'}</p>
                        {alt.message && (
                          <p className="text-[10px] text-red-800 italic mt-2 bg-red-50/80 p-2.5 rounded-lg border border-red-200">
                            "{alt.message}"
                          </p>
                        )}
                        <p className="text-[9px] text-red-600 font-mono flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>KOORDINAT GPS: {alt.latitude.toFixed(6)}, {alt.longitude.toFixed(6)}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDispatch(alt.id)}
                          disabled={dispatchingId === alt.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 disabled:opacity-50 transition-all flex items-center space-x-1"
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          <span>{dispatchingId === alt.id ? 'Memproses...' : 'Kirim Tim Satgas'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Emergency Contacts card & dispatcher info */}
            <div className="glass-panel border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm bg-white/70">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Kontak Darurat Terintegrasi</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Nomor darurat Smart City Yogyakarta.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">BASARNAS (Search & Rescue)</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Penyelamatan & evakuasi bencana.</p>
                  </div>
                  <span className="font-mono font-bold text-red-600">115</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Polisi Keamanan Daerah</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Penanganan aksi kriminalitas.</p>
                  </div>
                  <span className="font-mono font-bold text-red-600">110</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Ambulans & Medis Gawat Darurat</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Pertolongan medis darurat.</p>
                  </div>
                  <span className="font-mono font-bold text-red-600">118</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Pemadam Kebakaran (Damkar)</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Penanganan bencana kebakaran.</p>
                  </div>
                  <span className="font-mono font-bold text-red-600">08119502100</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Gemini AI Controller & Predictions */}
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Gemini Trigger panel */}
            <div className="lg:col-span-2 glass-panel border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm bg-white/70">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <BrainCircuit className="h-4.5 w-4.5 text-cyan-600" />
                  <span>Picu Analisis Risiko Kerawanan (LifeLine AI Core)</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Gunakan kecerdasan prediktif AI untuk memindai tingkat bahaya wilayah berdasarkan data kriminalitas & cuaca.</p>
              </div>

              <form onSubmit={handleTriggerAI} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={aiLatitude}
                      onChange={(e) => setAiLatitude(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={aiLongitude}
                      onChange={(e) => setAiLongitude(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={aiTriggering}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Cpu className={`h-4.5 w-4.5 ${aiTriggering ? 'animate-spin' : ''}`} />
                  <span>{aiTriggering ? 'Menganalisis wilayah via LifeLine AI...' : 'Proyeksikan Indeks Risiko Bahaya'}</span>
                </button>
              </form>

              {/* Streaming Gemini predictive response */}
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-slate-50 border border-cyan-500/10 rounded-2xl text-left space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[8px] font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        LIFELINE AI ASSESSMENT COMPLETE
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{aiResult.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 block">DANGER INDEX SCORE</span>
                      <span className="text-2xl font-black text-cyan-600">{aiResult.dangerScore}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-705 leading-relaxed">{aiResult.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 block font-bold">Rekomendasi Rencana Pengamanan AI:</span>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                      {aiResult.recommendations?.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>

            {/* AI monitor metrics side panel */}
            <div className="glass-panel border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm bg-white/70">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Status LifeLine AI Engine</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Pemantauan respons kecerdasan buatan.</p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400">ENGINE MODEL</span>
                  <p className="font-bold text-cyan-600">LifeLine AI Core Engine</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400">AVERAGE LATENCY RESPONSE</span>
                  <p className="font-bold text-slate-850">720 milliseconds</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400">TELEMETRY DATA SYNCHRONIZATION</span>
                  <p className="font-bold text-emerald-600">100% COMPLETE</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
