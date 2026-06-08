'use client';

import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  MapIcon,
  Globe2,
  Calendar
} from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState<'reports' | 'bmkg'>('reports');
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/stats');
        setData(res.data);
      } catch (err) {
        toast.error('Gagal mengambil data analitik.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4'];

  if (loading || !data) {
    return (
      <div className="h-[450px] flex items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600 h-10 w-10" />
      </div>
    );
  }

  const { stats, reportsByCategory, reportsByStatus, reportsTrend, bmkgTrend } = data;

  const chartData = dataType === 'reports'
    ? (reportsTrend?.[timeRange] || [])
    : (bmkgTrend?.[timeRange] || []);

  const strokeColor = dataType === 'reports' ? '#06b6d4' : '#d97706';
  const gradientId = dataType === 'reports' ? 'colorReports' : 'colorBmkg';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block font-sans">TELEMETRY ANALYTICS PLATFORM</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Sistem Statistik & Peta Kerawanan</h1>
        <p className="text-xs text-slate-600 mt-0.5">Analisis tren ancaman keselamatan wilayah terintegrasi visual grafik profesional.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel border-slate-200 rounded-2xl p-4 text-left shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 block">Total Laporan Warga</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalReports}</span>
        </div>
        <div className="glass-panel border-slate-200 rounded-2xl p-4 text-left shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 block">Status Siaga SOS Aktif</span>
          <span className="text-2xl font-black text-red-655 mt-1 block">{stats.activeEmergencies}</span>
        </div>
        <div className="glass-panel border-slate-200 rounded-2xl p-4 text-left shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 block">Laporan Menunggu Validasi</span>
          <span className="text-2xl font-black text-yellow-600 mt-1 block">{stats.pendingReports}</span>
        </div>
        <div className="glass-panel border-slate-200 rounded-2xl p-4 text-left shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 block">Proyeksi Radar AI</span>
          <span className="text-2xl font-black text-cyan-605 mt-1 block">{stats.aiPredictions}</span>
        </div>
      </div>

      {/* Visual Analytics graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area chart */}
        <div className="lg:col-span-2 glass-panel border-slate-200 rounded-3xl p-6 h-[460px] flex flex-col justify-between transition-all duration-300 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                {dataType === 'reports' ? (
                  <TrendingUp className="h-4.5 w-4.5 text-cyan-600" />
                ) : (
                  <Activity className="h-4.5 w-4.5 text-amber-600 animate-pulse" />
                )}
                <span>
                  {dataType === 'reports'
                    ? `Tren Laporan Bahaya Warga (${timeRange === 'daily' ? 'Bulanan' : 'Tahunan'})`
                    : `Tren Aktivitas Seismik Nasional Real-time (${timeRange === 'daily' ? 'Bulanan' : 'Tahunan'})`
                  }
                </span>
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                {dataType === 'reports'
                  ? `Grafik jumlah insiden terdaftar yang dilaporkan oleh warga (${timeRange === 'daily' ? '30 hari terakhir' : '12 bulan terakhir'}).`
                  : `Grafik jumlah aktivitas seismik / gempa bumi terbaru bersumber langsung dari sensor seismik nasional (${timeRange === 'daily' ? '30 hari terakhir' : '12 bulan terakhir'}).`
                }
              </p>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Tipe Data Toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setDataType('reports')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    dataType === 'reports'
                      ? 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                      : 'text-slate-500 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  Laporan Warga
                </button>
                <button
                  onClick={() => setDataType('bmkg')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    dataType === 'bmkg'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'text-slate-500 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  Seismik Nasional
                </button>
              </div>

              {/* Rentang Waktu Toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setTimeRange('daily')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    timeRange === 'daily'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setTimeRange('monthly')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    timeRange === 'monthly'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  Tahunan
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-6 w-full h-[280px]">
            {chartData.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Activity className="h-8 w-8 text-slate-300 animate-pulse" />
                <span className="text-[11px] font-mono text-slate-500">Tidak ada data tren tersedia</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBmkg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    labelStyle={{ color: '#475569', fontSize: 10, fontWeight: 'bold' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg">
                            <p className="text-[10px] font-mono font-bold text-slate-500 mb-1">{label}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`h-2 w-2 rounded-full ${dataType === 'reports' ? 'bg-cyan-600 shadow-[0_0_6px_#06b6d4]' : 'bg-amber-600 shadow-[0_0_6px_#d97706]'}`} />
                              <p className="text-xs font-bold text-slate-800">
                                {dataType === 'reports' ? 'Laporan Warga: ' : 'Aktivitas Seismik: '}
                                <span className={dataType === 'reports' ? 'text-cyan-600' : 'text-amber-605'}>
                                  {payload[0].value} {dataType === 'reports' ? 'insiden' : 'kejadian'}
                                </span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={strokeColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                    activeDot={{ r: 5, strokeWidth: 1, stroke: strokeColor }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Category distribution */}
        <div className="glass-panel border-slate-200 rounded-3xl p-6 h-[460px] flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <AlertTriangle className="h-4.5 w-4.5 text-indigo-600" />
              <span>Distribusi Kategori Bahaya</span>
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Proporsi ancaman terdaftar berdasarkan klasifikasi.</p>
          </div>

          <div className="flex-1 my-4 flex items-center justify-center">
            {reportsByCategory.length === 0 ? (
              <span className="text-xs text-slate-500">Tidak ada data.</span>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={reportsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {reportsByCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontSize: 10, color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-[9px] font-mono text-slate-600 font-medium">
            {reportsByCategory.map((c: any, i: number) => (
              <div key={i} className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span>{c.category} ({c.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
