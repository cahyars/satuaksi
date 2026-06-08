'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  Locate,
  History,
  TrendingDown,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Activity,
  Flame,
  ShieldAlert,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { getRealLocation } from '@/utils/gps';

export default function AIPrediction() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [predictionType, setPredictionType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Realtime Live Mode
  const [isLiveMode, setIsLiveMode] = useState(false);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // User location search and geocoding state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showCoordinates, setShowCoordinates] = useState(false);

  const handleGetCurrentLocation = async () => {
    toast.loading('Mendeteksi posisi GPS Anda...', { id: 'gps-loading' });
    
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
        toast.success(`Koordinat GPS Anda berhasil dideteksi (Akurasi: ±${location.accuracy.toFixed(1)}m).`, { id: 'gps-loading' });
      }
      
      // Instant visual feedback before Nominatim geocoding resolves
      setSelectedAddress('Mengidentifikasi nama wilayah dari satelit koordinat...');
      setSearchQuery(`Koordinat: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`);

      // Reverse geocode via OpenStreetMap Nominatim
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
      toast.error('Terjadi kesalahan saat menghubungi server peta.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (sug: any) => {
    setLatitude(sug.lat);
    setLongitude(sug.lon);
    setSelectedAddress(sug.display_name);
    setSearchQuery(sug.display_name);
    setSuggestions([]);
    toast.success('Wilayah terpilih berhasil dikonfigurasi!');
  };

  const fetchPredictionData = useCallback(async (isSilent = false) => {
    if (!latitude || !longitude) return;
    
    if (!isSilent) {
      setLoading(true);
      setResult(null);
    }
    
    try {
      const res = await api.post('/ai/predict', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        type: predictionType
      });
      setResult(res.data);
      if (!isSilent) toast.success('Prediksi Radar Cuaca & Bencana berhasil diproyeksikan!');
    } catch (err) {
      toast.error('Gagal menghubungi satelit mitigasi LifeLine AI.');
      setIsLiveMode(false);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [latitude, longitude, predictionType]);

  useEffect(() => {
    if (isLiveMode && latitude && longitude) {
      toast.success('Live Telemetry 30 detik diaktifkan!', { icon: '📡' });
      fetchPredictionData(false); // Initial load
      
      liveIntervalRef.current = setInterval(() => {
        toast('Radar sinkronisasi data terbaru...', { icon: '🔄', id: 'sync' });
        fetchPredictionData(true); // Silent load
      }, 30000);
    } else {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    }

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [isLiveMode, fetchPredictionData, latitude, longitude]);

  const handleGeneratePrediction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      toast.error('Silakan cari wilayah Anda atau gunakan GPS terlebih dahulu!');
      return;
    }
    fetchPredictionData(false);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory([...chatHistory, userMsg]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg.content, contextType: predictionType });
      setChatHistory(prev => [...prev, { role: 'model', content: res.data.response }]);
    } catch (err) {
      toast.error('Gagal terhubung dengan asisten tanggap darurat.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block font-sans">INTEGRATED METEOROLOGICAL & SEISMIC RADAR</span>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1">LifeLine AI Disaster Predictions</h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Ramalkan risiko bencana alam ekstrem, curah hujan lebat, dan getaran gempa bumi menggunakan data terintegrasi cuaca &amp; sensor seismik resmi <strong className="text-cyan-600 font-bold">Radar Cuaca &amp; Gempa</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="glass-panel border-slate-200 rounded-3xl p-6 h-fit space-y-6 shadow-sm">
          <span className="text-xs font-bold text-slate-800 flex items-center space-x-2.5">
            <Sparkles className="h-5 w-5 text-cyan-600 animate-pulse" />
            <span>Konfigurasi Satelit Radar</span>
          </span>

          <form onSubmit={handleGeneratePrediction} className="space-y-5">
            <div className="space-y-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">📍 Cari Wilayah / Alamat Warga</label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="text-[9px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 hover:bg-cyan-100/50 transition-all cursor-pointer animate-pulse"
                >
                  <Locate className="h-3.5 w-3.5" />
                  <span>Gunakan GPS Anda</span>
                </button>
              </div>

              {/* Search Box Input Form */}
              <div className="relative flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Contoh: Malioboro, Bantul, Sleman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchAddress(e);
                      }
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-8 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSuggestions([]);
                        setSelectedAddress('');
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
                    className="absolute left-4 right-4 z-50 bg-white/95 border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto backdrop-blur-md divide-y divide-slate-100 mt-1"
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

              {/* Resolved address visual cue */}
              {selectedAddress && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-[10px] text-emerald-800 leading-normal font-semibold">
                    <span className="font-bold text-emerald-900 block">Wilayah Terkonfigurasi:</span>
                    <span className="line-clamp-2">{selectedAddress}</span>
                  </div>
                </div>
              )}

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
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 block mb-1">LATITUDE</span>
                          <input
                            type="number"
                            step="any"
                            placeholder="-6.1751"
                            value={latitude}
                            onChange={(e) => {
                              setLatitude(e.target.value);
                              setSelectedAddress(e.target.value ? `Manual Lat: ${e.target.value}, Lng: ${longitude}` : '');
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono font-semibold"
                            required
                          />
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 block mb-1">LONGITUDE</span>
                          <input
                            type="number"
                            step="any"
                            placeholder="106.8271"
                            value={longitude}
                            onChange={(e) => {
                              setLongitude(e.target.value);
                              setSelectedAddress(e.target.value ? `Manual Lat: ${latitude}, Lng: ${e.target.value}` : '');
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono font-semibold"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1.5">Fokus Prediksi Ancaman</label>
              <select
                value={predictionType}
                onChange={(e) => setPredictionType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold"
              >
                <option value="general">🌐 Mode Umum (Proporsional)</option>
                <option value="perjalanan">🚗 Mode Perjalanan (Fokus Lalu Lintas & Cuaca)</option>
                <option value="keamanan">🚨 Mode Keamanan (Fokus Kriminalitas & Begal)</option>
                <option value="bencana">🌋 Mode Mitigasi Bencana (Fokus Gempa & Cuaca Ekstrem)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || isLiveMode}
              className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-550 hover:to-blue-650 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2"
            >
              <BrainCircuit className="h-4.5 w-4.5" />
              <span>{loading ? 'Menguji Telemetri Sensor...' : 'PROYEKSIKAN RADAR CUACA LIFELINE AI'}</span>
            </button>

            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-700">Live Auto-Refresh (30s)</span>
                <span className="text-[9px] text-slate-500">Pembaruan data telemetri real-time otomatis</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!latitude || !longitude) {
                    toast.error('Pilih lokasi terlebih dahulu untuk mengaktifkan Mode Live.');
                    return;
                  }
                  setIsLiveMode(!isLiveMode);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isLiveMode ? 'bg-cyan-600' : 'bg-slate-300'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isLiveMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </form>
        </div>

        {/* Center/Right Column: Prediction Output OR Asisten Chat */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm"
              >
                {/* Geocoding Location Panel */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-cyan-600 animate-ping" />
                      <span className="text-[9px] font-mono font-bold text-cyan-600 uppercase tracking-widest">Radar Lokasi Aktif</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-snug">
                      <MapPin className="h-5 w-5 text-red-500 shrink-0" />
                      <span>{result.addressName || result.title}</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Titik Koordinat: <span className="text-cyan-600 font-bold">{result.latitude}</span>, <span className="text-cyan-600 font-bold">{result.longitude}</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-center shrink-0 min-w-[125px] shadow-sm">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Danger Score</span>
                    <span className={`text-3xl font-black font-mono tracking-tighter ${result.dangerScore > 60 ? 'text-red-600 animate-pulse' : (result.dangerScore > 35 ? 'text-amber-600' : 'text-cyan-600')}`}>
                      {result.dangerScore}%
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5 font-bold uppercase tracking-wide">
                      {result.dangerScore > 60 ? 'Bahaya Tinggi' : (result.dangerScore > 35 ? 'Kewaspadaan' : 'Status Aman')}
                    </span>
                  </div>
                </div>

                {/* Weather & Geological Sensor panels */}
                {result.weather && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Weather Card */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest flex items-center gap-1.5">
                          <CloudRain className="h-4.5 w-4.5 text-cyan-600" />
                          <span>Integrasi Cuaca</span>
                        </span>
                        <span className="text-[8px] font-mono px-2 py-0.5 bg-cyan-50 text-cyan-600 rounded-full border border-cyan-200 font-bold">SENSOR ONLINE</span>
                      </div>
                      
                      <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-2xl shrink-0">
                          <CloudRain className="h-8 w-8 text-cyan-600 animate-bounce" />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Kondisi Cuaca saat ini</span>
                          <span className="text-sm font-bold text-slate-700">{result.weather.condition}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <Thermometer className="h-4.5 w-4.5 text-orange-500 mx-auto mb-1" />
                          <span className="text-[8px] font-mono text-slate-500 block">SUHU</span>
                          <span className="text-xs font-bold text-slate-700">{result.weather.temp}°C</span>
                        </div>
                        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <Droplets className="h-4.5 w-4.5 text-cyan-500 mx-auto mb-1" />
                          <span className="text-[8px] font-mono text-slate-500 block">HUMIDITY</span>
                          <span className="text-xs font-bold text-slate-700">{result.weather.humidity}%</span>
                        </div>
                        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <Wind className="h-4.5 w-4.5 text-teal-600 mx-auto mb-1" />
                          <span className="text-[8px] font-mono text-slate-500 block">ANGIN</span>
                          <span className="text-xs font-bold text-slate-700">{result.weather.windSpeed} km/h</span>
                        </div>
                      </div>

                      {result.weather.precipitation > 0 && (
                        <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-center">
                          <span className="text-[9px] text-cyan-600 font-bold block animate-pulse">
                            🚨 Intensitas Hujan Sensor Cuaca: {result.weather.precipitation} mm
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Geological/Earthquake Card */}
                    <div className={`p-5 border rounded-2xl space-y-4 shadow-sm transition-all ${
                      result.bmkg && result.bmkg.magnitude > 5.0
                        ? 'bg-red-50/50 border-red-200 shadow-red-500/5'
                        : 'bg-slate-50 border border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className={`h-4.5 w-4.5 text-amber-600 ${result.bmkg && result.bmkg.magnitude > 5.0 ? 'animate-ping' : ''}`} />
                          <span>Sistem Seismologi</span>
                        </span>
                        <span className="text-[8px] font-mono px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200 font-bold">SENSOR GEMPA</span>
                      </div>

                      {result.bmkg && result.bmkg.magnitude > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className={`px-2.5 py-1.5 rounded-xl font-mono font-black text-xs text-center shrink-0 ${
                              result.bmkg.magnitude > 5.0 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
                            }`}>
                              M {result.bmkg.magnitude}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[8px] font-mono text-slate-500 uppercase block">Pusat Guncangan Gempa</span>
                              <span className="text-xs font-bold text-slate-700 truncate block">{result.bmkg.region}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center text-[10px] bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
                            <div>
                              <span className="text-[8px] text-slate-500 block uppercase">Kedalaman</span>
                              <span className="font-bold text-slate-700">{result.bmkg.depth}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-500 block uppercase">Tsunami</span>
                              <span className={`font-bold uppercase ${result.bmkg.potential.includes('Tidak') ? 'text-green-600' : 'text-red-600 animate-pulse'}`}>
                                {result.bmkg.potential.includes('Tidak') ? 'Aman' : 'Potensial'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[8px] font-mono text-slate-500 block text-right font-medium">Pembaruan Sistem: {result.bmkg.date}</span>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center py-6 text-center text-slate-500 space-y-2">
                          <ShieldAlert className="h-7 w-7 text-slate-300" />
                          <span className="text-xs font-semibold leading-normal">Aktivitas seismik regional stabil.<br/>Tidak ada gempa bumi dirasakan.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Detailed Hazard Description */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block">Analisis AI Predictive</span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 border border-slate-200 rounded-2xl font-medium">
                    {result.description}
                  </p>
                </div>

                {/* Sub-predictions breakdown */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block">Proyeksi Risiko Bahaya Masa Depan</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.predictions?.map((pred: any, i: number) => {
                      const isHigh = pred.probability >= 60;
                      const isMedium = pred.probability >= 30 && pred.probability < 60;
                      const levelText = isHigh ? 'AWAS (Tinggi)' : (isMedium ? 'WASPADA (Sedang)' : 'AMAN (Rendah)');
                      const levelColor = isHigh 
                        ? 'from-red-50 to-white border-red-200 text-red-600 shadow-sm' 
                        : (isMedium ? 'from-amber-50 to-white border-amber-200 text-amber-600 shadow-sm' : 'from-slate-50 to-white border-slate-200 text-green-600 shadow-sm');
                      
                      return (
                        <div key={i} className={`p-4 bg-gradient-to-br border rounded-2xl space-y-2 transition-all hover:scale-[1.01] ${levelColor}`}>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                              {pred.type === 'weather' && <CloudRain className="h-4 w-4 text-cyan-600 shrink-0" />}
                              {pred.type === 'geological' && <Activity className="h-4 w-4 text-amber-600 shrink-0" />}
                              {pred.type === 'traffic' && <TrendingDown className="h-4 w-4 text-blue-600 shrink-0" />}
                              {pred.type === 'crime' && <AlertTriangle className="h-4 w-4 text-purple-600 shrink-0" />}
                              <span>{pred.type}</span>
                            </span>
                            <span className="font-mono text-sm tracking-tighter">{pred.probability}%</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold tracking-wider uppercase">
                              {levelText}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-600 leading-relaxed font-medium pt-1.5 border-t border-slate-100">
                            {pred.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase tracking-widest block">Mitigasi &amp; Kesiapsiagaan Darurat</span>
                  <ul className="space-y-2.5">
                    {result.recommendations?.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-600 leading-normal font-medium">
                        <ShieldCheck className="h-4.5 w-4.5 text-cyan-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Open Data Attribution Statement */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 text-[8px] text-slate-500 font-mono gap-2 font-medium">
                  <span>LifeLine AI public safety predictive satellite radar.</span>
                  <span className="flex items-center gap-1.5">
                    Sumber Data Terbuka: <strong className="text-slate-600 font-bold">Satelit Meteorologi &amp; Seismik Nasional</strong>
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel border-slate-200 rounded-3xl p-6 h-[480px] flex flex-col justify-between shadow-sm">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <Activity className="h-4.5 w-4.5 text-cyan-600" />
                  <span>Sistem Konsol Analisis Bencana Terpadu</span>
                </span>

                {/* Chat feed container */}
                <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 text-left">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500 py-6">
                      <ShieldCheck className="h-9 w-9 text-slate-200 animate-pulse" />
                      <p className="text-xs font-semibold max-w-xs leading-normal">Masukkan kueri analisis ancaman cuaca, data gempa bumi, status lalu lintas, atau mitigasi kerawanan wilayah.</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-cyan-50 border border-cyan-200 text-cyan-700 ml-auto font-semibold'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 mr-auto font-medium'
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="bg-slate-50 border border-slate-200 text-slate-500 p-3 rounded-2xl mr-auto max-w-[40%] text-xs animate-pulse">
                      Memproses data telemetri...
                    </div>
                  )}
                </div>

                {/* Chat Form */}
                <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2 border-t border-slate-100 pt-4">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-semibold"
                    placeholder="Masukkan kueri parameter atau analisis lapangan..."
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                  >
                    Kirim
                  </button>
                </form>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
