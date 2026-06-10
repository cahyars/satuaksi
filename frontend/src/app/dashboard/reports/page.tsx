'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReportStore } from '@/store/useReportStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  X, 
  Image, 
  Upload, 
  MapIcon, 
  AlertTriangle, 
  CheckCircle,
  AlertOctagon,
  Clock,
  Locate,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  Camera,
  ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRealLocation } from '@/utils/gps';
import { getBackendAssetUrl } from '@/utils/backend';

export default function CommunityReports() {
  const { reports, categories, loading, fetchReports, fetchCategories, createReport, verifyReport, deleteReport } = useReportStore();
  const { user } = useAuthStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    if (isCameraActive) {
      setCameraError(null);
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      }).then((stream) => {
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch((err) => {
        console.error('Error starting camera:', err);
        setCameraError('Gagal mengakses kamera. Pastikan izin diberikan.');
        toast.error('Kamera tidak diizinkan atau tidak ditemukan.');
        setIsCameraActive(false);
      });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(blob));
            
            // Stop stream tracks manually
            const stream = video.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            
            setIsCameraActive(false);
            toast.success('Foto berhasil diambil!');
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // User-friendly address geocoding states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchCategories();
  }, []);

  const handleGetCurrentLocation = async () => {
    toast.loading('Mendeteksi lokasi GPS Anda...', { id: 'gps-loading' });
    
    try {
      const location = await getRealLocation((status) => {
        toast.loading(status, { id: 'gps-loading' });
      });
      const isFallback = location.source === 'fallback';
      const isIpGeo = location.source === 'ip_geolocation';
      
      const lat = location.latitude.toString();
      const lng = location.longitude.toString();
      setLatitude(lat);
      setLongitude(lng);

      if (isFallback) {
        toast.success('Gagal mengambil GPS riil. Menggunakan lokasi default.', { id: 'gps-loading' });
      } else if (isIpGeo) {
        toast.success('GPS terblokir/tidak aktif. Menggunakan lokasi perkiraan IP Anda.', { id: 'gps-loading' });
      } else {
        toast.success(`Lokasi koordinat GPS Anda berhasil dideteksi (Akurasi: ±${location.accuracy.toFixed(1)}m).`, { id: 'gps-loading' });
      }

      // Reverse geocoding via OpenStreetMap Nominatim
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`);
        if (res.ok) {
          const data = await res.json();
          const friendlyName = data.display_name || `Lokasi GPS (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`;
          setAddress(friendlyName);
          setSearchQuery(friendlyName);
        }
      } catch (err) {
        console.error(err);
        setAddress(`Lokasi GPS (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`);
        setSearchQuery(`Lokasi GPS (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil lokasi Anda.', { id: 'gps-loading' });
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSuggestions([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=id`);
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          toast.error('Wilayah tidak ditemukan. Coba ketik nama jalan, desa, kecamatan, atau kota.');
        } else {
          setSuggestions(data);
        }
      } else {
        toast.error('Gagal mencari alamat wilayah.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat mencari wilayah.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (sug: any) => {
    setLatitude(sug.lat);
    setLongitude(sug.lon);
    setAddress(sug.display_name);
    setSearchQuery(sug.display_name);
    setSuggestions([]);
    toast.success('Lokasi berhasil dikonfigurasi!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId || !latitude || !longitude) {
      toast.error('Semua kolom wajib diisi!');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    // Safe fallback to a valid category UUID from SQLite to prevent Prisma foreign key constraint failure
    const finalCategoryId = categories.find(c => c.id === categoryId)?.id || categories[0]?.id || categoryId;
    formData.append('categoryId', finalCategoryId);
    formData.append('severity', severity);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('address', address);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const success = await createReport(formData);
    setSubmitting(false);

    if (success) {
      toast.success('Laporan berhasil dikirim ke satgas keselamatan!');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setLatitude('');
      setLongitude('');
      setAddress('');
      setImageFile(null);
      setPreviewUrl(null);
      setIsCameraActive(false);
      fetchReports();
    } else {
      toast.error('Gagal mengirimkan laporan bahaya Anda.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block font-sans">COMMUNITY DATA HUB</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Laporan Bahaya Komunitas</h1>
          <p className="text-xs text-slate-600 mt-0.5">Lihat laporan aktif dari warga atau kirimkan laporan bahaya di sekitar Anda.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-550 hover:to-blue-655 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Laporan Bahaya</span>
        </button>
      </div>

      {/* Reports Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && reports.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-panel border-slate-200 rounded-2xl p-6 h-60 shadow-sm animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-20 bg-slate-200 rounded w-full" />
            </div>
          ))
        ) : reports.length === 0 ? (
          <div className="md:col-span-3 py-16 text-center text-xs text-slate-500">Tidak ada laporan bahaya aktif di lingkungan Anda.</div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="glass-panel border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              {/* Evidence image preview */}
              <div className="h-44 bg-slate-100 border-b border-slate-200 relative overflow-hidden flex items-center justify-center">
                {rep.imageUrl ? (
                  <img src={getBackendAssetUrl(rep.imageUrl)} alt={rep.title} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500" />
                ) : (
                  <MapPin className="h-12 w-12 text-slate-300" />
                )}

                {/* Status indicator */}
                <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  rep.status === 'VERIFIED' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                }`}>
                  {rep.status === 'PENDING' ? 'Menunggu' :
                   rep.status === 'VERIFIED' ? 'Diterima' :
                   rep.status === 'RESOLVED' ? 'Selesai' :
                   rep.status === 'IN_PROGRESS' ? 'Proses' : 'Ditolak'}
                </span>

                {/* Severity indicator */}
                <span className={`absolute top-3 left-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  rep.severity === 'CRITICAL' || rep.severity === 'HIGH'
                    ? 'bg-red-50 text-red-655 border border-red-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {rep.severity} Severity
                </span>
              </div>

              {/* Text content details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-cyan-600 uppercase tracking-widest">{rep.category?.name}</span>
                  <h3 className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">{rep.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{rep.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[8px] font-bold">
                      {rep.user?.avatar ? (
                        <img src={getBackendAssetUrl(rep.user.avatar)} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        rep.user?.name?.charAt(0)
                      )}
                    </div>
                    <span>{rep.user?.name}</span>
                  </div>
                  <span className="flex items-center space-x-1"><Clock className="h-3.5 w-3.5" /> <span>{new Date(rep.createdAt).toLocaleDateString()}</span></span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full mt-2">
                  {user?.role === 'ADMIN' && rep.status !== 'VERIFIED' && (
                    <button
                      onClick={() => verifyReport(rep.id, true)}
                      className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Verifikasi</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if(window.confirm('Yakin ingin menghapus laporan ini?')) {
                        deleteReport(rep.id).then(() => {
                          toast.success('Laporan berhasil dihapus');
                        });
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 rounded-lg text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Report Dialog Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden z-10 max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-cyan-600" />
                  <span>Kirim Laporan Bahaya Publik</span>
                </span>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Judul Laporan</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold"
                    placeholder="Contoh: Pohon Tumbang di Pertigaan"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Deskripsi Kejadian</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold"
                    placeholder="Jelaskan secara rinci kronologi kejadian..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Kategori Bahaya</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Tingkat Kerawanan</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest">📍 Cari Wilayah / Alamat Kejadian</span>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="text-[9px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 hover:bg-cyan-100/50 cursor-pointer animate-pulse"
                    >
                      <Locate className="h-3 w-3" />
                      <span>Dapatkan Lokasi GPS</span>
                    </button>
                  </div>

                  {/* Search Box Input Form */}
                  <div className="relative flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ketik jalan, desa, kecamatan, atau kota..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchAddress(e);
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-8 text-xs text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSuggestions([]);
                            setAddress('');
                            setLatitude('');
                            setLongitude('');
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchAddress}
                      disabled={searching}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl p-2 text-xs flex items-center justify-center shrink-0 cursor-pointer transition-all h-[36px] w-[36px] shadow-sm shadow-cyan-500/10"
                      title="Cari Alamat"
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-4 right-4 z-50 bg-white/98 border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto backdrop-blur-md divide-y divide-slate-100 mt-1"
                      >
                        {suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(sug)}
                            className="w-full text-left px-3.5 py-2.5 text-[10px] font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-850 transition-colors block truncate"
                            title={sug.display_name}
                          >
                            📍 {sug.display_name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Alamat Terdeteksi / Terpilih */}
                  <input
                    type="text"
                    placeholder="Alamat Detail Kejadian (Wajib terisi, cari atau ketik manual)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-750 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    required
                  />

                  {/* Advanced Technical Coordinate Collapsible Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCoordinates(!showCoordinates)}
                      className="w-full flex items-center justify-between text-[8px] font-mono font-bold text-slate-500 hover:text-slate-750 uppercase tracking-widest transition-all focus:outline-none"
                    >
                      <span>{showCoordinates ? '🔒 Sembunyikan' : '⚙️ Tampilkan'} Koordinat Teknis (Advanced)</span>
                      {showCoordinates ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showCoordinates && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-2"
                        >
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <input
                              type="number"
                              step="any"
                              placeholder="Latitude"
                              value={latitude}
                              onChange={(e) => {
                                setLatitude(e.target.value);
                                setAddress(e.target.value ? `Manual Lat: ${e.target.value}, Lng: ${longitude}` : '');
                              }}
                              className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-750 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                              required
                            />
                            <input
                              type="number"
                              step="any"
                              placeholder="Longitude"
                              value={longitude}
                              onChange={(e) => {
                                setLongitude(e.target.value);
                                setAddress(e.target.value ? `Manual Lat: ${latitude}, Lng: ${e.target.value}` : '');
                              }}
                              className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-750 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                              required
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Evidence Photo upload */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">Bukti Foto Kejadian (Kamera)</label>
                  
                  {/* Hidden gallery input */}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {isCameraActive ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-200 shadow-inner flex flex-col justify-end">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex justify-between items-center z-10">
                        <button
                          type="button"
                          onClick={() => {
                            if (videoRef.current?.srcObject) {
                              const stream = videoRef.current.srcObject as MediaStream;
                              stream.getTracks().forEach(track => track.stop());
                            }
                            setIsCameraActive(false);
                          }}
                          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="h-12 w-12 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg border-4 border-slate-200/50 cursor-pointer transition-all transform active:scale-95"
                          title="Ambil Foto"
                        >
                          <div className="h-6 w-6 rounded-full bg-cyan-600"></div>
                        </button>
                        <div className="w-[52px]"></div> {/* Spacer to center the button */}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsCameraActive(true)}
                      className="border border-dashed border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-cyan-500/30 transition-all cursor-pointer"
                    >
                      {previewUrl ? (
                        <div className="space-y-2">
                          <img src={previewUrl} alt="Preview" className="h-28 rounded-lg object-cover mx-auto" />
                          <p className="text-[9px] text-slate-500 font-medium">Klik untuk ambil foto ulang dari Kamera</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="h-6 w-6 text-slate-400 mx-auto" />
                          <p className="text-[10px] font-semibold text-slate-600">Ambil Foto Kejadian</p>
                          <p className="text-[9px] text-slate-400">Klik di sini untuk membuka Kamera langsung</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isCameraActive && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="mt-1.5 w-full text-[9px] text-slate-400 hover:text-cyan-600 font-semibold text-center py-1 transition-colors flex items-center justify-center space-x-1"
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>atau pilih dari Galeri</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-550 hover:to-blue-650 transition-all cursor-pointer shadow-md shadow-cyan-500/10 disabled:opacity-50"
                >
                  {submitting ? 'Mengirim Laporan...' : 'Kirim Laporan Publik'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
