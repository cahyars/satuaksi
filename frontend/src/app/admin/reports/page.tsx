'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, CheckCircle2, XCircle, Search, Filter, 
  MapPin, Clock, AlertTriangle, Eye, Trash2, Edit, X
} from 'lucide-react';
import { useReportStore } from '@/store/useReportStore';
import { Report } from '@/types';
import { getBackendAssetUrl } from '@/utils/backend';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const { reports, categories, fetchReports, fetchCategories, verifyReport, deleteReport, updateReport, loading } = useReportStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Edit State
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Status options for the edit modal
  const statusOptions = [
    { value: 'VERIFIED', label: 'Diterima' },
    { value: 'RESOLVED', label: 'Disetujui' },
    { value: 'REJECTED', label: 'Ditolak' },
    { value: 'PENDING', label: 'Menunggu' },
  ];

  useEffect(() => {
    fetchReports();
    fetchCategories();
  }, []);

  const handleVerify = async (id: string, approve: boolean) => {
    const status = approve ? 'VERIFIED' : 'REJECTED';
    const success = await verifyReport(id, approve, status);
    if (success) {
      toast.success(approve ? 'Laporan diverifikasi & diteruskan ke satgas!' : 'Laporan ditolak.');
    } else {
      toast.error('Gagal memproses laporan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus laporan ini secara permanen?')) return;
    const success = await deleteReport(id);
    if (success) {
      toast.success('Laporan berhasil dihapus.');
    } else {
      toast.error('Gagal menghapus laporan.');
    }
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || r.categoryId === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleOpenEdit = (report: Report) => {
    setEditingReport(report);
    setEditDesc(report.description);
    setEditStatus(report.status);
  };

  const handleSaveEdit = async () => {
    if (!editingReport) return;
    const isVerified = editStatus === 'VERIFIED' || editStatus === 'RESOLVED';
    const success = await updateReport(editingReport.id, { description: editDesc, status: editStatus, isVerified } as any);
    if (success) {
      toast.success('Laporan berhasil diperbarui.');
      setEditingReport(null);
    } else {
      toast.error('Gagal memperbarui laporan.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <span className="text-[10px] font-mono font-bold text-purple-650 uppercase tracking-widest block">ADMIN COMMAND SYSTEM</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Moderasi Laporan Warga</h1>
        <p className="text-xs text-slate-600 mt-0.5">Validasi dan kelola pelaporan masyarakat secara realtime sebelum diteruskan ke publik.</p>
      </div>

      {/* Control Panel */}
      <div className="glass-panel border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between z-10 relative">
        <div className="flex flex-wrap w-full md:w-auto items-center gap-2">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              categoryFilter === 'ALL' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === cat.id 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {loading && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600 mb-4" />
          <p className="text-sm font-medium text-slate-600">Memuat laporan keamanan...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-panel border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[300px] text-center shadow-sm">
          <ShieldAlert className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Tidak ada laporan</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm">
            Saat ini tidak ada laporan warga yang cocok dengan filter yang Anda pilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredReports.map((report) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={report.id}
                className="glass-panel border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col group relative"
              >
                {/* Status Indicator Bar */}
                <div className={`h-1.5 w-full ${
                  report.status === 'PENDING' ? 'bg-amber-400' :
                  report.status === 'VERIFIED' ? 'bg-blue-500' :
                  report.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {report.user?.avatar ? (
                          <img src={getBackendAssetUrl(report.user.avatar)} alt={report.user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-500">{report.user?.name?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{report.user?.name || 'Warga Anonim'}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(report.createdAt).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      report.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      report.status === 'VERIFIED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      report.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {report.status === 'PENDING' ? 'Menunggu' :
                       report.status === 'VERIFIED' ? 'Diterima' :
                       report.status === 'RESOLVED' ? 'Selesai' :
                       report.status === 'IN_PROGRESS' ? 'Proses' : 'Ditolak'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{report.category?.name || 'Insiden Keamanan'}</h3>
                  
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50/50 p-2 rounded-xl">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</span>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-3 mb-4 flex-1">
                    {report.description}
                  </p>

                  {/* Actions / Image Preview */}
                  <div className="mt-auto space-y-3">
                    {report.imageUrl && (
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 relative group-hover:shadow-md transition-all">
                        <img src={getBackendAssetUrl(report.imageUrl)} alt="Bukti laporan" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-[10px] font-bold flex items-center gap-1">
                            <Eye className="h-3 w-3" /> LIHAT BUKTI
                          </span>
                        </div>
                      </div>
                    )}

                    {report.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleVerify(report.id, true)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" /> VERIFIKASI
                        </button>
                        <button
                          onClick={() => handleVerify(report.id, false)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> TOLAK
                        </button>
                      </div>
                    )}
                    
                    {report.status !== 'PENDING' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleOpenEdit(report)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 py-2 rounded-xl text-[10px] font-bold transition-colors"
                        >
                          <Edit className="h-3 w-3" /> EDIT LAPORAN
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 py-2 rounded-xl text-[10px] font-bold transition-colors"
                        >
                          <Trash2 className="h-3 w-3" /> HAPUS PERMANEN
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Laporan</h3>
                  <p className="text-xs text-slate-500 mt-1">Perbarui kategori dan keterangan laporan</p>
                </div>
                <button 
                  onClick={() => setEditingReport(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Status Laporan</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Keterangan / Deskripsi</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
                <button
                  onClick={() => setEditingReport(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
