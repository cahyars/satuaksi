'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, Users, AlertTriangle, CheckCircle2, 
  BrainCircuit, TrendingUp, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [trendView, setTrendView] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/stats');
      setData(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengambil data analitik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
          <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-600 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">Menghubungkan ke Modul Analitik AI...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Gagal Memuat Data</h3>
        <button onClick={fetchAnalyticsData} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
          Coba Lagi
        </button>
      </div>
    );
  }

  const { stats, reportsTrend, bmkgTrend, reportsByCategory } = data;

  // Format data for Recharts PieChart
  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#64748b'];
  const pieData = reportsByCategory.map((item: any, index: number) => ({
    name: item.category,
    value: item.count,
    color: item.color || COLORS[index % COLORS.length]
  }));

  const activeTrend = trendView === 'daily' ? reportsTrend.daily : reportsTrend.monthly;
  const activeBmkgTrend = trendView === 'daily' ? bmkgTrend.daily : bmkgTrend.monthly;

  // Combine trends for AreaChart
  const combinedTrends = activeTrend.map((t: any, i: number) => ({
    label: t.label,
    Laporan: t.value,
    Gempa: activeBmkgTrend[i]?.value || 0
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <span className="text-[10px] font-mono font-bold text-purple-650 uppercase tracking-widest block">ADMIN COMMAND SYSTEM</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">AI & Data Analytics</h1>
        <p className="text-xs text-slate-600 mt-0.5">Grafik pemantauan tren bahaya dan performa prediksi keamanan kota.</p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Activity className="h-4 w-4" /></div>
            <p className="text-xs font-semibold text-slate-600">Total Laporan</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.totalReports}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-100 text-red-600"><AlertTriangle className="h-4 w-4" /></div>
            <p className="text-xs font-semibold text-slate-600">Darurat Aktif</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.activeEmergencies}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600"><ShieldAlert className="h-4 w-4" /></div>
            <p className="text-xs font-semibold text-slate-600">Menunggu Validasi</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.pendingReports}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>
            <p className="text-xs font-semibold text-slate-600">Terselesaikan</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.resolvedReports}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><BrainCircuit className="h-4 w-4" /></div>
            <p className="text-xs font-semibold text-slate-600">Prediksi AI</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.aiPredictions}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600"><Users className="h-4 w-4" /></div>
            <p className="text-xs font-semibold text-slate-600">Total Warga</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers}</h3>
        </motion.div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Spans 2 columns) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Tren Insiden & Anomali Seismik</h2>
                <p className="text-xs text-slate-500">Perbandingan laporan warga dengan gempa BMKG</p>
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTrendView('daily')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${trendView === 'daily' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setTrendView('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${trendView === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tahunan
              </button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLaporan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGempa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="Laporan" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLaporan)" />
                <Area type="monotone" dataKey="Gempa" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGempa)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categories Pie Chart & Bar Chart */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                <PieChartIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Distribusi Kategori</h2>
                <p className="text-xs text-slate-500">Persentase jenis bahaya</p>
              </div>
            </div>

            <div className="h-[200px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Belum ada data</div>
              )}
            </div>
            
            {/* Custom Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {pieData.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-medium text-slate-600 truncate">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Volume Kategori</h2>
                <p className="text-xs text-slate-500">Komparasi total insiden</p>
              </div>
            </div>

            <div className="h-[200px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Belum ada data</div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
