'use client';

import React, { useEffect, useState } from 'react';
import { Map as MapIcon, Radar, AlertTriangle, ShieldCheck, Landmark, Activity, Info, ShieldAlert, Cpu, ChevronUp, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/EarthquakeMap'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc] text-purple-600 font-mono text-xs animate-pulse z-50">MEMUAT PETA SATELIT KEBENCANAAN...</div>
});
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function AdminHeatmapPage() {
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEq, setSelectedEq] = useState<any | null>(null);

  // Weather States
  const [mapMode, setMapMode] = useState<'earthquake' | 'weather'>('earthquake');
  const [weatherCities, setWeatherCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [isCardExpanded, setIsCardExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsCardExpanded(true);
    } else {
      setIsCardExpanded(false);
    }
  }, [selectedEq, selectedCity]);

  const fetchBmkgTews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/tews-gempa');
      if (res.data) {
        setEarthquakes(res.data);
        if (res.data.length > 0) {
          setSelectedEq(res.data[0]);
        }
      }
    } catch (err) {
      toast.error('Gagal terhubung ke feed Pusat Seismik Nasional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      setWeatherLoading(true);
      const res = await api.get('/ai/weather-national');
      if (res.data) {
        setWeatherCities(res.data);
        if (res.data.length > 0) {
          setSelectedCity(res.data[0]);
        }
      }
    } catch (err) {
      toast.error('Gagal terhubung ke feed satelit cuaca nasional');
      console.error(err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchBmkgTews();
    fetchWeather();
    
    // Auto-refresh every 3 minutes
    const interval = setInterval(() => {
      fetchBmkgTews();
      fetchWeather();
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto lg:h-[calc(100vh-100px)] h-auto flex flex-col">
      {/* Admin Restricted Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-purple-655 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-purple-650 animate-pulse" />
            <span>COMMAND CENTER RESTRICTED // NATIONAL SEISMIC & METEOROLOGICAL RADAR</span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Heatmap Kebencanaan Nasional</h1>
          <p className="text-xs text-slate-600 mt-0.5">Pemantauan telemetry kebencanaan berskala nasional terintegrasi dengan Live Seismik & Satelit Cuaca Real-time.</p>
        </div>

        {/* Dynamic Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setMapMode('earthquake')}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === 'earthquake'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/15'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>RADAR SEISMIK</span>
          </button>
          <button
            onClick={() => setMapMode('weather')}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === 'weather'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/15'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Radar className="h-3.5 w-3.5 animate-pulse" />
            <span>SATELIT CUACA</span>
          </button>
        </div>

        {/* Restricted Command Center Indicator */}
        <div className="flex items-center space-x-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
          <Cpu className="h-4 w-4 text-purple-600 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-purple-600 font-bold uppercase tracking-wider">LifeLine AI Core</span>
            <span className="text-[10px] font-mono text-slate-700 font-semibold">ONLINE // RESTRICTED ACCESS</span>
          </div>
        </div>
      </div>

      {/* Main Tactical Grid View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 h-auto lg:h-full">
        
        {/* Left: Administrative Live Feed Panel */}
        <div className="lg:col-span-1 glass-panel border-slate-200 rounded-3xl p-5 flex flex-col min-h-0 overflow-hidden relative shadow-sm h-[400px] lg:h-full">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500/50 to-indigo-500/50" />
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-purple-600" />
              <span>{mapMode === 'earthquake' ? 'Feed Gempa & Seismik' : 'Satelit Cuaca Nasional'}</span>
            </h3>
            <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              {mapMode === 'earthquake' ? `${earthquakes.length} Gempa` : `${weatherCities.length} Kota`}
            </span>
          </div>

          {loading || weatherLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Radar className="h-8 w-8 text-purple-600 animate-spin mb-3" />
              <p className="text-[11px] text-slate-500">Sinkronisasi satelit cuaca &amp; radar seismik...</p>
            </div>
          ) : mapMode === 'earthquake' && earthquakes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-emerald-600">Status Aman</h4>
              <p className="text-[10px] text-slate-500 mt-1">Tidak ada laporan gempa terdeteksi dari satelit seismik saat ini.</p>
            </div>
          ) : mapMode === 'weather' && weatherCities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-emerald-600">Koneksi Cuaca Offline</h4>
              <p className="text-[10px] text-slate-500 mt-1">Gagal memuat peta satelit cuaca.</p>
            </div>
          ) : mapMode === 'earthquake' ? (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {earthquakes.map((eq: any, idx: number) => {
                const isSelected = selectedEq?.datetime === eq.datetime;
                const dangerColor = 
                  eq.dangerScore >= 80 ? 'border-red-200 bg-red-50 text-red-700' :
                  eq.dangerScore >= 50 ? 'border-amber-200 bg-amber-50 text-amber-700' :
                  'border-purple-200 bg-purple-50 text-purple-700';

                return (
                  <motion.div
                    key={`side-eq-${idx}`}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedEq(eq)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-white border-purple-500/60 shadow-md shadow-purple-500/5' 
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${dangerColor}`}>
                        {eq.type === 'terkini' ? 'M > 5.0' : 'Felt Gempa'}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">{eq.time}</span>
                    </div>
                    
                    <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{eq.region}</h4>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 font-mono">MAGNITUDE</span>
                        <span className="text-xs font-black text-slate-700">{eq.magnitude} SR</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 font-mono">KEDALAMAN</span>
                        <span className="text-xs font-black text-slate-700">{eq.depth}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200 animate-pulse col-span-1" />
                      <div className="flex flex-col ml-auto">
                        <span className="text-[8px] text-purple-650 font-mono text-right">RISIKO AI</span>
                        <span className="text-xs font-black text-purple-650 text-right">{eq.dangerScore}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {weatherCities.slice().sort((a, b) => b.dangerScore - a.dangerScore).map((city: any, idx: number) => {
                const isSelected = selectedCity?.name === city.name;
                const dangerColor = 
                  city.dangerScore >= 80 ? 'border-red-200 bg-red-50 text-red-700' :
                  city.dangerScore >= 50 ? 'border-amber-200 bg-amber-50 text-amber-700' :
                  'border-purple-200 bg-purple-50 text-purple-700';

                return (
                  <motion.div
                    key={`side-weather-${idx}`}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedCity(city)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-white border-purple-500/60 shadow-md shadow-purple-500/5' 
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${dangerColor}`}>
                        {city.condition}
                      </span>
                      <span className="text-[8px] font-mono text-slate-550">{city.province}</span>
                    </div>
                    
                    <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{city.name}</h4>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 font-mono">SUHU</span>
                        <span className="text-xs font-black text-slate-700">{city.temperature}°C</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 font-mono">ANGIN</span>
                        <span className="text-xs font-black text-slate-700">{city.windSpeed} km/h</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200 animate-pulse col-span-1" />
                      <div className="flex flex-col ml-auto">
                        <span className="text-[8px] text-purple-650 font-mono text-right">RISIKO AI</span>
                        <span className="text-xs font-black text-purple-650 text-right">{city.dangerScore}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-mono">AUTO-STREAM ENABLED</span>
            <button 
              onClick={mapMode === 'earthquake' ? fetchBmkgTews : fetchWeather}
              className="text-purple-600 hover:text-purple-750 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Force Refresh</span>
              <Activity className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Center/Right: Holographic Tactile Map View (3/4 width) */}
        <div className="lg:col-span-3 glass-panel border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col min-h-0 shadow-sm h-[550px] lg:h-full">
          
          {/* Tactical Holographic Radar Backdrop Grid */}
          <div className="absolute inset-0 bg-[#f8fafc] pointer-events-none z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f1f5f9_0%,transparent_100%)] opacity-85" />
            
            {/* Concentric radar rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-purple-500/10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-purple-500/[0.04] animate-[spin_80s_linear_infinite_reverse]" />
          </div>

          {/* Interactive Radar Blips Layer */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {!loading && (
              <MapComponent 
                earthquakes={earthquakes} 
                weatherCities={weatherCities}
                selectedEq={selectedEq} 
                setSelectedEq={setSelectedEq} 
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                mapTheme="admin" 
                mode={mapMode}
              />
            )}
          </div>

          {/* Selected Earthquake Information Panel Overlay (Holographic Card) */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-20 pointer-events-auto">
            <AnimatePresence mode="wait">
              {mapMode === 'earthquake' && selectedEq && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="glass-panel-glow border-purple-550/20 bg-white/95 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-purple-500 to-indigo-600" />
                  
                  {!isCardExpanded ? (
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-xl font-black text-xs ${
                          selectedEq.dangerScore >= 80 ? 'bg-red-500 text-white' :
                          selectedEq.dangerScore >= 50 ? 'bg-amber-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {selectedEq.dangerScore}%
                        </div>
                        <div className="min-w-0 text-left">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{selectedEq.title}</h4>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{selectedEq.region}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsCardExpanded(true)}
                        className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>ANALISIS AI</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[9px] font-mono font-bold text-purple-650 uppercase tracking-wider">COMMAND CENTER AI ANALYSIS</span>
                        <button
                          onClick={() => setIsCardExpanded(false)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="max-h-[280px] lg:max-h-none overflow-y-auto pr-1 space-y-4 custom-scrollbar flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl text-center md:w-32 flex-shrink-0">
                          <span className="text-[8px] font-mono font-bold text-slate-550 uppercase tracking-widest">Risk Factor</span>
                          <motion.span 
                            animate={{ scale: [1, 1.05, 1] }} 
                            transition={{ repeat: Infinity, duration: 2.5 }}
                            className={`text-3xl font-black mt-1 ${
                              selectedEq.dangerScore >= 80 ? 'text-red-650' :
                              selectedEq.dangerScore >= 50 ? 'text-amber-600' :
                              'text-purple-655'
                            }`}
                          >
                            {selectedEq.dangerScore}%
                          </motion.span>
                          <span className="text-[8.5px] font-bold text-slate-650 mt-1 uppercase tracking-wider font-mono">
                            {selectedEq.aiAssessment?.threatLevel || 'Sedang'}
                          </span>
                        </div>

                        <div className="flex-1 space-y-2 text-left min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[13px] font-bold text-slate-800">{selectedEq.title}</h3>
                            <span className="text-[8px] font-mono text-slate-550 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              LOCATION: {selectedEq.latitude?.toFixed(4)}, {selectedEq.longitude?.toFixed(4)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                            {selectedEq.description}
                          </p>

                          <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 p-2.5 rounded-xl">
                            <Info className="h-4 w-4 text-purple-650 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-[9px] font-mono font-bold text-purple-650 uppercase tracking-wider">COMMAND CENTER AI INSTRUCTION</h4>
                              <p className="text-[10px] text-slate-700 mt-0.5 font-medium leading-relaxed">
                                {selectedEq.aiAssessment?.mitigationNotes}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedEq.felt && (
                          <div className="md:w-52 bg-slate-50 border border-slate-200 p-3 rounded-xl text-left">
                            <span className="text-[8px] font-mono font-bold text-slate-555 uppercase tracking-widest block mb-1">
                              WILAYAH DIRASAKAN (MMI)
                            </span>
                            <p className="text-[10px] font-mono text-slate-700 leading-relaxed leading-4">
                              {selectedEq.felt}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {mapMode === 'weather' && selectedCity && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="glass-panel-glow border-purple-550/20 bg-white/95 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-purple-500 to-indigo-600" />
                  
                  {!isCardExpanded ? (
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-xl font-black text-xs ${
                          selectedCity.dangerScore >= 80 ? 'bg-red-500 text-white' :
                          selectedCity.dangerScore >= 50 ? 'bg-amber-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {selectedCity.dangerScore}%
                        </div>
                        <div className="min-w-0 text-left">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{selectedCity.condition} - {selectedCity.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{selectedCity.province}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsCardExpanded(true)}
                        className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>ANALISIS AI</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[9px] font-mono font-bold text-purple-650 uppercase tracking-wider">LifeLine AI Weather Assessment</span>
                        <button
                          onClick={() => setIsCardExpanded(false)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="max-h-[180px] md:max-h-[280px] lg:max-h-none overflow-y-auto pr-1 space-y-2 md:space-y-4 custom-scrollbar flex flex-col md:flex-row gap-2 md:gap-4">
                        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 p-2 md:p-4 rounded-xl text-center md:w-32 flex-shrink-0">
                          <span className="text-[8px] font-mono font-bold text-slate-555 uppercase tracking-widest">Weather Risk</span>
                          <motion.span 
                            animate={{ scale: [1, 1.05, 1] }} 
                            transition={{ repeat: Infinity, duration: 2.5 }}
                            className={`text-3xl font-black mt-1 ${
                              selectedCity.dangerScore >= 80 ? 'text-red-650' :
                              selectedCity.dangerScore >= 50 ? 'text-amber-600' :
                              'text-purple-650'
                            }`}
                          >
                            {selectedCity.dangerScore}%
                          </motion.span>
                          <span className="text-[8.5px] font-bold text-slate-650 mt-1 uppercase tracking-wider font-mono">
                            {selectedCity.aiAssessment?.threatLevel || 'Sedang'}
                          </span>
                        </div>

                        <div className="flex-1 space-y-2 text-left min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[13px] font-bold text-slate-800">Kondisi Cuaca: {selectedCity.name} ({selectedCity.province})</h3>
                            <span className="text-[8px] font-mono text-slate-555 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              LOCATION: {selectedCity.latitude?.toFixed(4)}, {selectedCity.longitude?.toFixed(4)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                            Suhu saat ini terpantau <span className="text-slate-800 font-bold">{selectedCity.temperature}°C</span> dengan kelembaban <span className="text-slate-800 font-bold">{selectedCity.humidity}%</span> dan kecepatan angin <span className="text-slate-800 font-bold">{selectedCity.windSpeed} km/h</span>. Cuaca dilaporkan <span className="text-purple-655 font-bold">{selectedCity.condition}</span>.
                          </p>

                          <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 p-2.5 rounded-xl">
                            <Info className="h-4 w-4 text-purple-655 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-[9px] font-mono font-bold text-purple-655 uppercase tracking-wider">COMMAND CENTER AI WEATHER ADVISORY</h4>
                              <p className="text-[10px] text-slate-700 mt-0.5 font-medium leading-relaxed font-mono">
                                {selectedCity.aiAssessment?.mitigationNotes}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="md:w-52 bg-slate-50 border border-slate-200 p-3 rounded-xl text-left flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-mono font-bold text-slate-555 uppercase tracking-widest block mb-1">
                              METODOLOGI KEBENCANAAN
                            </span>
                            <p className="text-[10px] text-slate-600 font-medium">
                              Sensor curah hujan dan kecepatan angin satelit dipantau 24/7 menggunakan satelit meteorologi nasional.
                            </p>
                          </div>
                          <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-[10px] font-mono text-purple-650">
                            <span>ANGIN: {selectedCity.windSpeed} KM/H</span>
                            <span>LEMBAB: {selectedCity.humidity}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compass Rose Grid labels */}
          <div className="absolute top-6 left-6 z-0 pointer-events-none flex flex-col space-y-1.5 opacity-60">
            <span className="text-[9px] font-mono text-purple-655 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Landmark className="h-3 w-3" />
              <span>TACTICAL RADAR VIEW // LIFELINE AI LIVE API INTEGRATION</span>
            </span>
            <span className="text-[8px] font-mono text-slate-550">MAPPED ON ARCHIPELAGO COORDINATES (INDONESIA)</span>
          </div>

          <div className="absolute top-6 right-6 z-0 pointer-events-none flex items-center gap-3">
            {/* Status Legend */}
            <div className="flex items-center gap-4 bg-white/90 border border-slate-200 px-3.5 py-1.5 rounded-xl backdrop-blur shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.3)] animate-pulse" />
                <span className="text-[8.5px] font-mono font-bold text-slate-600">Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)] animate-pulse" />
                <span className="text-[8.5px] font-mono font-bold text-slate-600">Warning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.3)] animate-pulse" />
                <span className="text-[8.5px] font-mono font-bold text-slate-600">Minor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

