'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, ShieldAlert, CheckCircle2, MessageSquare, Info, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Judul dan pesan tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/notifications/broadcast', { title, message, type });
      toast.success(`Broadcast berhasil dikirim ke ${res.data.count} warga!`);
      
      // Tambahkan ke riwayat lokal sementara
      setRecentBroadcasts(prev => [
        { id: Date.now(), title, message, type, createdAt: new Date() },
        ...prev
      ]);
      
      setTitle('');
      setMessage('');
      setType('SYSTEM');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengirim broadcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'DANGER': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'SYSTEM': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <MessageSquare className="h-5 w-5 text-slate-500" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'WARNING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DANGER': return 'bg-red-100 text-red-800 border-red-200';
      case 'SYSTEM': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] font-mono font-bold text-purple-650 uppercase tracking-widest block">ADMIN COMMAND SYSTEM</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Sistem Broadcast Notifikasi</h1>
        <p className="text-xs text-slate-600 mt-0.5">Pusat kendali peringatan dini (push notification) ke semua warga.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-650 border border-purple-200 shadow-sm">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Buat Broadcast Baru</h2>
              <p className="text-xs text-slate-500">Pesan ini akan dikirim ke aplikasi warga secara real-time</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tipe Peringatan</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setType('SYSTEM')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                    type === 'SYSTEM' 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm ring-1 ring-blue-500/20' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Info className="h-4 w-4" /> Info Sistem
                </button>
                <button
                  type="button"
                  onClick={() => setType('WARNING')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                    type === 'WARNING' 
                      ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm ring-1 ring-amber-500/20' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" /> Peringatan
                </button>
                <button
                  type="button"
                  onClick={() => setType('DANGER')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                    type === 'DANGER' 
                      ? 'bg-red-50 border-red-200 text-red-700 shadow-sm ring-1 ring-red-500/20' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertCircle className="h-4 w-4" /> Bahaya (Darurat)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Judul Broadcast</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: Peringatan Cuaca Ekstrem"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Isi Pesan</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tuliskan pesan detail yang akan diterima warga..."
                rows={5}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm resize-none"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title || !message}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Kirim Broadcast Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[500px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Riwayat Terakhir</h2>
              <p className="text-xs text-slate-500">Log broadcast sesi ini</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
            {recentBroadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <ShieldAlert className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-600">Belum ada broadcast</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Broadcast yang Anda kirim akan muncul di sini.</p>
              </div>
            ) : (
              recentBroadcasts.map((b) => (
                <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getIconForType(b.type)}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getColorForType(b.type)}`}>
                        {b.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {b.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{b.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{b.message}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
