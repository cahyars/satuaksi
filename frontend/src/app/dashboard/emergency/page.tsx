'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  Activity, 
  CheckCircle,
  Locate,
  Clock,
  Compass,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { stopEmergencyAlarm, playEmergencyAlarm } from '@/utils/alarmSound';
import { getRealLocation } from '@/utils/gps';

const EmergencyMap = dynamic(() => import('@/components/EmergencyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
      <span className="text-[10px] font-semibold text-slate-500 animate-pulse">Memuat Peta Satelit...</span>
    </div>
  )
});

export default function EmergencyCenter() {
  const { activeAlerts, myAlerts, isSosTriggered, activeSosId, fetchActiveAlerts, fetchMyAlerts, triggerSos, resolveAlert } = useEmergencyStore();
  const { user } = useAuthStore();
  const [emergencyType, setEmergencyType] = useState<'SOS' | 'FIRE' | 'MEDICAL' | 'CRIME' | 'NATURAL_DISASTER'>('SOS');
  const [customMessage, setCustomMessage] = useState('');
  const [isSilent, setIsSilent] = useState(false);
  const [sending, setSending] = useState(false);

  // Precise location states
  const [latitude, setLatitude] = useState<string>('-7.7956');
  const [longitude, setLongitude] = useState<string>('110.3695');
  const [accuracy, setAccuracy] = useState<number>(9999);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [locationSource, setLocationSource] = useState<string>('fallback');
  const [selectedAddress, setSelectedAddress] = useState<string>('Mendeteksi lokasi GPS Anda...');

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);

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
      setAccuracy(location.accuracy);
      setAltitude(location.altitude);
      setSpeed(location.speed);
      setLocationSource(location.source);
      
      if (isFallback) {
        toast.success('Gagal mengambil GPS riil. Menggunakan lokasi default.', { id: 'gps-loading' });
      } else if (isIpGeo) {
        toast.success('GPS terblokir/tidak aktif. Menggunakan lokasi perkiraan IP Anda.', { id: 'gps-loading' });
      } else {
        toast.success(`Koordinat GPS Anda berhasil dideteksi (Akurasi: ±${location.accuracy.toFixed(1)}m).`, { id: 'gps-loading' });
      }
      
      setSelectedAddress('Mengidentifikasi nama wilayah dari satelit koordinat...');
      setSearchQuery(`Koordinat: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`);
        if (res.ok) {
          const data = await res.json();
          const friendlyName = data.display_name || `Lokasi Anda (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`;
          setSelectedAddress(friendlyName);
          setSearchQuery(friendlyName);
        }
      } catch (err) {
        console.error('Failed to reverse-geocode coordinates:', err);
        setSelectedAddress(`Lokasi Anda (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`);
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
    setAccuracy(10); // set to standard high accuracy since it's a specific address match
    setLocationSource('manual');
    setSelectedAddress(sug.display_name);
    setSearchQuery(sug.display_name);
    setSuggestions([]);
    toast.success('Wilayah darurat berhasil disesuaikan secara manual!');
  };

  useEffect(() => {
    fetchActiveAlerts();
    fetchMyAlerts();
    handleGetCurrentLocation();
  }, []);

  const handleTriggerSOS = async () => {
    setSending(true);

    try {
      const isFallback = locationSource === 'fallback';
      const isIpGeo = locationSource === 'ip_geolocation';
      const isManual = locationSource === 'manual';
      
      const messageSuffix = isFallback 
        ? ' (Lokasi Default)' 
        : isIpGeo 
          ? ' (Lokasi Perkiraan IP)' 
          : isManual
            ? ' (Lokasi Ditentukan Manual)'
            : '';

      const alert = await triggerSos({
        type: emergencyType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        message: customMessage || `Emergency ${emergencyType} alert triggered by ${user?.name}${messageSuffix}`,
        isSilent,
        accuracy,
        altitude,
        speed
      });

      setSending(false);

      if (alert) {
        if (isFallback) {
          toast.success('⚠️ EMERGENCY SOS BERHASIL DIKIRIMKAN MENGGUNAKAN LOKASI DEFAULT!');
        } else if (isIpGeo) {
          toast.success('⚠️ EMERGENCY SOS BERHASIL DIKIRIM MENGGUNAKAN LOKASI PERKIRAAN IP!');
        } else if (isManual) {
          toast.success('⚠️ EMERGENCY SOS BERHASIL DIKIRIM MENGGUNAKAN LOKASI MANUAL!');
        } else {
          toast.success(`⚠️ EMERGENCY SOS BERHASIL DIKIRIM! (Akurasi GPS: ${accuracy.toFixed(1)}m)`);
        }
        setCustomMessage('');
        fetchMyAlerts();
      } else {
        toast.error('Gagal mengirimkan sinyal SOS.');
      }
    } catch (error) {
      console.error('SOS Trigger Error:', error);
      setSending(false);
      toast.error('Terjadi kesalahan saat memicu sinyal SOS.');
    }
  };

  const handleCancelSOS = async () => {
    if (!activeSosId) {
      toast.error('ID SOS aktif tidak ditemukan.');
      return;
    }
    const confirmCancel = window.confirm("🚨 APAKAH ANDA INGIN MENYELESAIKAN/MEMATIKAN EMERGENCY SOS AKTIF ANDA?");
    if (!confirmCancel) return;

    setSending(true);
    const success = await resolveAlert(activeSosId, 'CANCELLED');
    setSending(false);
    if (success) {
      toast.success('Emergency SOS aktif Anda berhasil dimatikan.');
      fetchMyAlerts();
    } else {
      toast.error('Gagal mematikan Emergency SOS.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest block font-sans">EMERGENCY COORDINATION HUB</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Emergency Command Center</h1>
        <p className="text-xs text-slate-600 mt-0.5">Kirimkan sinyal darurat langsung ke pusat satgas pertolongan atau lihat status siaga.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: SOS Trigger Panel */}
        <div className="lg:col-span-1 glass-panel border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden h-auto min-h-[540px] space-y-6 pb-6 shadow-sm">
          {isSosTriggered && (
            <div className="absolute inset-0 bg-red-500/5 danger-pulse pointer-events-none" />
          )}

          <div className="w-full">
            <span className="text-xs font-bold text-slate-800 flex items-center justify-center space-x-2 mb-4">
              <AlertOctagon className="h-4.5 w-4.5 text-red-600" />
              <span>Pemicu Sinyal SOS Warga</span>
            </span>

            {/* Emergency dropdown */}
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1">Kategori Keadaan Darurat</label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-semibold"
                >
                  <option value="SOS">SOS / Bahaya Umum</option>
                  <option value="MEDICAL">Medis / Ambulans</option>
                  <option value="FIRE">Kebakaran / Damkar</option>
                  <option value="CRIME">Kekerasan / Kriminalitas / Begal</option>
                  <option value="NATURAL_DISASTER">Bencana Alam / Evakuasi</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1">Informasi Singkat Kejadian</label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-705 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-semibold"
                  placeholder="Contoh: Butuh pertolongan darurat..."
                />
              </div>

              {/* Silent mode checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="silent-mode"
                  checked={isSilent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsSilent(checked);
                    if (checked) {
                      stopEmergencyAlarm();
                    } else if (isSosTriggered) {
                      playEmergencyAlarm();
                    }
                  }}
                  className="rounded bg-white border-slate-300 text-red-600 focus:ring-red-550 cursor-pointer"
                />
                <label htmlFor="silent-mode" className="text-[10px] font-semibold text-slate-600 cursor-pointer select-none">
                  Aktifkan Silent Emergency Mode (SOS Diam-diam)
                </label>
              </div>

              {/* Address verification panel */}
              <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl relative">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest block">📍 Lokasi Darurat Anda</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-[9px] font-bold text-red-650 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center space-x-1 hover:bg-red-100/50 transition-all cursor-pointer animate-pulse shrink-0"
                  >
                    <Locate className="h-3 w-3" />
                    <span>Perbarui GPS</span>
                  </button>
                </div>

                {/* Search Box Input Form */}
                <div className="relative flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cari / sesuaikan alamat kejadian..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchAddress(e);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-2.5 pr-8 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-semibold shadow-sm"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSuggestions([]);
                          setSelectedAddress('');
                          setLatitude('-7.7956');
                          setLongitude('110.3695');
                          setLocationSource('fallback');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchAddress}
                    disabled={searching}
                    className="bg-red-600 hover:bg-red-750 text-white rounded-xl p-1.5 text-xs flex items-center justify-center shrink-0 cursor-pointer transition-all h-[28px] w-[28px] shadow-sm shadow-red-500/10"
                    title="Cari Alamat"
                  >
                    {searching ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
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
                      className="absolute left-2.5 right-2.5 z-50 bg-white/95 border border-slate-200 rounded-2xl shadow-xl max-h-40 overflow-y-auto backdrop-blur-md divide-y divide-slate-100 mt-1"
                    >
                      {suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(sug)}
                          className="w-full text-left px-3 py-2 text-[9px] font-semibold text-slate-700 hover:bg-red-50 hover:text-red-850 transition-colors block truncate"
                          title={sug.display_name}
                        >
                          📍 {sug.display_name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resolved address visual cue */}
                {selectedAddress && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-start space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-650 shrink-0 mt-0.5 animate-bounce" />
                    <div className="text-[9px] text-emerald-800 leading-normal font-semibold text-left">
                      <span className="font-bold text-emerald-900 block">Lokasi Siaga SOS:</span>
                      <span className="line-clamp-2">{selectedAddress}</span>
                    </div>
                  </div>
                )}

                {/* Map component for pinpoint accuracy */}
                <EmergencyMap
                  latitude={parseFloat(latitude)}
                  longitude={parseFloat(longitude)}
                  onChange={async (lat, lng) => {
                    setLatitude(lat.toString());
                    setLongitude(lng.toString());
                    setLocationSource('manual');
                    setSelectedAddress('Mengidentifikasi nama wilayah koordinat...');
                    setSearchQuery(`Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`);
                      if (res.ok) {
                        const data = await res.json();
                        const friendlyName = data.display_name || `Lokasi Anda (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                        setSelectedAddress(friendlyName);
                        setSearchQuery(friendlyName);
                      }
                    } catch (err) {
                      console.error('Failed to reverse-geocode map position:', err);
                      setSelectedAddress(`Lokasi Anda (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                    }
                  }}
                />

                {/* Advanced Technical Coordinate Collapsible Toggle */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowCoordinates(!showCoordinates)}
                    className="w-full flex items-center justify-between text-[7.5px] font-mono font-bold text-slate-500 hover:text-slate-750 uppercase tracking-widest transition-all focus:outline-none"
                  >
                    <span>{showCoordinates ? '🔒 Sembunyikan' : '⚙️ Tampilkan'} Koordinat Teknis</span>
                    <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-250 ${showCoordinates ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showCoordinates && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-1.5"
                      >
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <div>
                            <span className="text-[7px] font-mono text-slate-500 block mb-0.5">LATITUDE</span>
                            <input
                              type="number"
                              step="any"
                              value={latitude}
                              onChange={(e) => {
                                setLatitude(e.target.value);
                                setLocationSource('manual');
                                setSelectedAddress(e.target.value ? `Manual Lat: ${e.target.value}, Lng: ${longitude}` : '');
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono font-semibold"
                              required
                            />
                          </div>
                          <div>
                            <span className="text-[7px] font-mono text-slate-500 block mb-0.5">LONGITUDE</span>
                            <input
                              type="number"
                              step="any"
                              value={longitude}
                              onChange={(e) => {
                                setLongitude(e.target.value);
                                setLocationSource('manual');
                                setSelectedAddress(e.target.value ? `Manual Lat: ${latitude}, Lng: ${e.target.value}` : '');
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono font-semibold"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Glowing Red SOS Panic button */}
          <div className="my-8 relative flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center h-36 w-36">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute h-36 w-36 rounded-full bg-red-600/5 border border-red-500/10 filter blur-lg"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isSosTriggered ? handleCancelSOS : handleTriggerSOS}
                disabled={sending}
                className={`h-28 w-28 rounded-full border-4 border-white text-white font-black text-xl flex items-center justify-center cursor-pointer shadow-xl transition-all duration-300 ${
                  isSosTriggered
                    ? 'bg-red-600 hover:bg-red-750 danger-pulse'
                    : 'bg-red-600 hover:bg-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.35)]'
                }`}
              >
                {sending ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isSosTriggered ? (
                  'MATIKAN'
                ) : (
                  'SOS'
                )}
              </motion.button>
            </div>
            {isSosTriggered && (
              <button
                onClick={handleCancelSOS}
                disabled={sending}
                className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-full border border-red-200 shadow-sm transition-all duration-300 flex items-center space-x-1.5 z-10"
              >
                <AlertOctagon className="h-4 w-4 animate-pulse" />
                <span>Matikan SOS Aktif Saya</span>
              </button>
            )}
          </div>

          {/* Quick contact info */}
          <div className="w-full text-slate-550 text-[10px] space-y-1 font-medium">
            <p className="font-mono font-bold text-red-600">TELEMETRY COORDINATE ACTIVE</p>
            <p>Sinyal akan diteruskan langsung ke Satgas Penyelamat.</p>
          </div>
        </div>

        {/* Center/Right Column: Live Active SOS Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active alerts panel */}
          <div className="glass-panel border-slate-200 rounded-3xl p-6 h-[260px] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Compass className="h-4.5 w-4.5 text-red-600 animate-spin-slow" />
                <span>Daftar Siaga SOS Kota (Real-time)</span>
              </span>
              <p className="text-[10px] text-slate-550 mt-1">Daftar sinyal bahaya yang sedang ditangani oleh satgas tanggap darurat saat ini.</p>
            </div>

            <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1 text-left">
              {activeAlerts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">Tidak ada sinyal SOS kota yang aktif. Kondisi aman terkendali.</div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 bg-red-50/50 border border-red-200 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[8px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase">
                        {alt.type} ALERT
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">{alt.user?.name}</h4>
                      <p className="text-[10px] text-slate-655 mt-0.5 font-medium">{alt.message || 'Meminta pertolongan koordinasi darurat...'}</p>
                      <span className="text-[9px] text-slate-500 mt-1 block font-mono">Posisi: {alt.latitude}, {alt.longitude}</span>
                    </div>

                    {/* Admin or Alert Owner action to resolve/cancel alerts */}
                    {(user?.role === 'ADMIN' || alt.user?.id === user?.id) && (
                      <button
                        onClick={() => resolveAlert(alt.id, alt.user?.id === user?.id ? 'CANCELLED' : 'RESOLVED')}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          alt.user?.id === user?.id
                            ? 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100'
                            : 'text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{alt.user?.id === user?.id ? 'Matikan SOS' : 'Selesaikan'}</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* History of triggered alerts */}
          <div className="glass-panel border-slate-200 rounded-3xl p-6 h-[256px] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Clock className="h-4.5 w-4.5 text-slate-500" />
                <span>Riwayat Emergency Anda</span>
              </span>
              <p className="text-[10px] text-slate-550 mt-1">Daftar sinyal SOS yang pernah Anda kirimkan.</p>
            </div>

            <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1 text-left">
              {myAlerts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">Anda belum pernah memicu sinyal darurat SOS.</div>
              ) : (
                myAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <span className="text-[8px] font-mono font-bold text-slate-600 bg-white border border-slate-250 px-1.5 py-0.5 rounded uppercase">
                        {alt.type}
                      </span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{alt.message || 'Sinyal darurat dikirim'}</p>
                      <span className="text-[9px] text-slate-500 mt-0.5 block font-medium">{new Date(alt.createdAt).toLocaleString()}</span>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      alt.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-red-50 text-red-655 border border-red-200'
                    }`}>
                      {alt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
