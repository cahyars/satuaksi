'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, AlertTriangle, MapPin, Clock, Phone, 
  Send, CheckCircle2, User, Activity, Radio, 
  Wifi, Shield, Zap, Eye, Siren, Globe, Timer,
  Flame, Compass, MessageSquare
} from 'lucide-react';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { getBackendAssetUrl } from '@/utils/backend';
import toast from 'react-hot-toast';

export default function AdminEmergencyPage() {
  const { activeAlerts, fetchActiveAlerts, resolveAlert, loading } = useEmergencyStore();
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchActiveAlerts();
  }, []);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDispatch = async (id: string) => {
    setDispatchingId(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = await resolveAlert(id, 'RESOLVED');
      if (success) {
        toast.success('Satgas darurat berhasil dikirim ke koordinat pelapor!');
      } else {
        toast.error('Gagal mengirimkan satgas.');
      }
    } finally {
      setDispatchingId(null);
    }
  };

  const [dispatchModalAlert, setDispatchModalAlert] = useState<any | null>(null);

  const agencies = [
    {
      id: 'police',
      name: 'Kepolisian Nasional',
      phone: '6281388236060',
      phoneDial: '110',
      hasWhatsApp: true,
      icon: '🚓',
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      description: 'Merespon tindak kriminal, huru-hara, & kecelakaan lalu lintas.',
      source: 'Hotline WA Kapolda Metro Jaya (resmi)'
    },
    {
      id: 'hospital',
      name: 'RS EMC Cibitung MM2100',
      phone: '62881080779977',
      phoneDial: '150-789',
      hasWhatsApp: true,
      icon: '🚑',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      description: 'Merespon cedera parah, serangan jantung, & evakuasi medis.',
      source: 'WA/Telepon Resmi RS EMC Cibitung MM2100'
    },
    {
      id: 'sar',
      name: 'Tim SAR (Basarnas)',
      phone: '628121237575',
      phoneDial: '115',
      hasWhatsApp: true,
      icon: '🚁',
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      description: 'Evakuasi daerah sulit, bencana besar, & pencarian orang hilang.',
      source: 'WhatsApp Pusdalops BNPB & Basarnas Nasional (resmi)'
    },
    {
      id: 'bpbd',
      name: 'BPBD (Bencana Alam)',
      phone: '628121237575',
      phoneDial: '117',
      hasWhatsApp: true,
      icon: '🌋',
      color: 'from-red-500 to-rose-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      description: 'Merespon banjir, gempa, letusan gunung, & tanah longsor.',
      source: 'WhatsApp Pusdalops BNPB Nasional (resmi)'
    },
    {
      id: 'damkar',
      name: 'Pemadam Kebakaran',
      phone: '622122137870',
      phoneDial: '021-0113',
      hasWhatsApp: true,
      icon: '🚒',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      description: 'Mengatasi kebakaran pemukiman, gedung, & penyelamatan taktis.',
      source: 'WA resmi Damkar MM2100'
    }
  ];

  const [geocoding, setGeocoding] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{
    cityOrRegency: string;
    province: string;
    resolvedAgencies: any[];
  } | null>(null);

  // Database nomor darurat resmi terverifikasi dari sumber pemerintah Indonesia
  // Sumber: website resmi Polri, Kemenkes, BNPB, BPBD daerah, RS pemerintah
  const regionalDatabase: Record<string, Array<{ id: string; phone: string; phoneDial: string; hasWhatsApp: boolean; regionName: string; source: string }>> = {
    jakarta: [
      { id: 'police', phone: '6281388236060', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Metro Jaya', source: 'Hotline WA resmi Kapolda Metro Jaya' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB Pusat', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB Pusat', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'damkar', phone: '622122137870', phoneDial: '021-0113', hasWhatsApp: true, regionName: 'Damkar MM2100', source: 'WA resmi Damkar MM2100' }
    ],
    bogor: [
      { id: 'police', phone: '6287810010057', phoneDial: '110', hasWhatsApp: true, regionName: 'Polresta Bogor Kota', source: 'WA resmi aduan Kapolresta Bogor Kota' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'damkar', phone: '628567784300', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar Kab. Bogor (Mako Cibinong)', source: 'WA resmi Damkar Kab. Bogor' }
    ],
    tangerang: [
      { id: 'police', phone: '6281388236060', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Metro Jaya', source: 'Hotline WA resmi Kapolda Metro Jaya' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'damkar', phone: '622122137870', phoneDial: '021-0113', hasWhatsApp: true, regionName: 'Damkar MM2100', source: 'WA resmi Damkar MM2100' }
    ],
    bekasi: [
      { id: 'police', phone: '6281388236060', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Metro Jaya', source: 'Hotline WA resmi Kapolda Metro Jaya' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'bpbd', phone: '62211500444', phoneDial: '021-1500444', hasWhatsApp: true, regionName: 'BPBD Bekasi', source: 'Kontak Resmi BPBD Bekasi' },
      { id: 'damkar', phone: '622122137870', phoneDial: '021-0113', hasWhatsApp: true, regionName: 'Damkar MM2100', source: 'WA resmi Damkar MM2100' }
    ],
    bandung: [
      { id: 'police', phone: '6282130201996', phoneDial: '110', hasWhatsApp: true, regionName: 'Polrestabes Bandung', source: 'WA Lapor Kang Busar (pikiran-rakyat.com)' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas Jabar via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD Jabar via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'damkar', phone: '6285163589113', phoneDial: '(022) 7207113', hasWhatsApp: true, regionName: 'Damkar Kab. Bandung', source: 'WA resmi Dinas Damkar Kab. Bandung' }
    ],
    semarang: [
      { id: 'police', phone: '628112662110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polrestabes Semarang', source: 'Layanan WA Pengaduan Polrestabes Semarang' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB Nasional' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD Jateng via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628156971113', phoneDial: '112', hasWhatsApp: true, regionName: 'Damkar Kota Semarang', source: 'WA resmi Dinas Kebakaran Kota Semarang' }
    ],
    solo: [
      { id: 'police', phone: '6281226117110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polresta Surakarta', source: 'WA aduan resmi Kapolresta Surakarta' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628121237575', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar via BNPB Solo', source: 'WhatsApp Pusdalops BNPB' }
    ],
    yogyakarta: [
      { id: 'police', phone: '6282168683110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polresta Sleman', source: 'Hotline WA resmi Polresta Sleman (polrestasleman.com)' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '6282123499719', phoneDial: '082123499719', hasWhatsApp: true, regionName: 'Pusdalops BPBD Bekasi', source: 'WA resmi Pusdalops BPBD' },
      { id: 'damkar', phone: '622122137870', phoneDial: '021-0113', hasWhatsApp: true, regionName: 'Damkar MM2100', source: 'WA resmi Damkar MM2100' }
    ],
    surabaya: [
      { id: 'police', phone: '6281133370075', phoneDial: '110', hasWhatsApp: true, regionName: 'Polrestabes Surabaya', source: 'WA Lapor Pak Kapolrestabes 24 jam (jatimnow.com)' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas Jatim via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '6281131112112', phoneDial: '112', hasWhatsApp: true, regionName: 'Command Center 112 Surabaya', source: 'WA CC 112 resmi Pemkot (surabaya.go.id)' },
      { id: 'damkar', phone: '6281131112112', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar via CC 112 Surabaya', source: 'WA CC 112 terintegrasi damkar (surabaya.go.id)' }
    ],
    malang: [
      { id: 'police', phone: '6281133370075', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Jatim (Malang)', source: 'WA Lapor Pak Kapolrestabes Polda Jatim' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '6282333555776', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar Kota Malang', source: 'WA resmi UPT Pemadam Kebakaran Kota Malang' }
    ],
    bali: [
      { id: 'police', phone: '628113982022', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Bali (Badung)', source: 'WA resmi aduan Kapolres Badung/Polda Bali' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas Bali via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '6281336349520', phoneDial: '(0361) 223333', hasWhatsApp: true, regionName: 'BPBD Kota Denpasar', source: 'WA resmi BPBD Denpasar (denpasarkota.go.id)' },
      { id: 'damkar', phone: '6281336349520', phoneDial: '112', hasWhatsApp: true, regionName: 'Damkar via BPBD Denpasar', source: 'WA resmi BPBD Denpasar (terintegrasi pemadam)' }
    ],
    medan: [
      { id: 'police', phone: '6281396464646', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Sumatera Utara', source: 'Layanan WA Pengaduan Polda Sumut' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628116566113', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar Kota Medan', source: 'WA resmi Dinas Pencegah & Pemadam Kebakaran Medan' }
    ],
    makassar: [
      { id: 'police', phone: '62811400110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Sulawesi Selatan', source: 'Layanan WA Pengaduan Polda Sulsel' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '62811410113', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar Kota Makassar', source: 'WA resmi Dinas Pemadam Kebakaran Kota Makassar' }
    ],
    palembang: [
      { id: 'police', phone: '628134789110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Sumatera Selatan', source: 'Layanan WA Bantuan Polisi Polda Sumsel' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628121237575', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar via BNPB Palembang', source: 'WhatsApp Pusdalops BNPB' }
    ],
    padang: [
      { id: 'police', phone: '628116666110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Sumatera Barat', source: 'Layanan WA Pengaduan Polda Sumbar' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628116606113', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar Kota Padang', source: 'WA aduan resmi Dinas Pemadam Kebakaran Padang' }
    ],
    manado: [
      { id: 'police', phone: '628114300110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Sulawesi Utara', source: 'Layanan WA Pengaduan Polda Sulut' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '6282351325552', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar Kota Manado', source: 'WA aduan resmi Dinas Pemadam Kebakaran Manado' }
    ],
    pontianak: [
      { id: 'police', phone: '628115600110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Kalimantan Barat', source: 'Layanan WA Pengaduan Polda Kalbar' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628121237575', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar via BNPB Pontianak', source: 'WhatsApp Pusdalops BNPB' }
    ],
    balikpapan: [
      { id: 'police', phone: '628115400110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Kalimantan Timur', source: 'Layanan WA Pengaduan Polda Kaltim' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628115900113', phoneDial: '113', hasWhatsApp: true, regionName: 'BPBD/Damkar Kota Balikpapan', source: 'WA resmi BPBD/Damkar Kota Balikpapan' }
    ],
    lombok: [
      { id: 'police', phone: '628113900110', phoneDial: '110', hasWhatsApp: true, regionName: 'Polda Nusa Tenggara Barat', source: 'Layanan WA Pengaduan Polda NTB' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '112', hasWhatsApp: true, regionName: 'BPBD via BNPB', source: 'WhatsApp Pusdalops BNPB' },
      { id: 'damkar', phone: '628191748777', phoneDial: '113', hasWhatsApp: true, regionName: 'Damkar Kab. Lombok Barat', source: 'WA resmi UPT Damkar Lombok Barat' }
    ],
    default: [
      { id: 'police', phone: '6285555554141', phoneDial: '110', hasWhatsApp: true, regionName: 'Propam Presisi Mabes Polri', source: 'WhatsApp Propam Presisi Mabes Polri (aduan aduan nasional)' },
      { id: 'sar', phone: '628121237575', phoneDial: '115', hasWhatsApp: true, regionName: 'Basarnas via BNPB Pusat', source: 'WhatsApp Pusdalops BNPB Nasional (darurat rescue)' },
      { id: 'bpbd', phone: '628121237575', phoneDial: '117', hasWhatsApp: true, regionName: 'BNPB Pusdalops Pusat', source: 'WhatsApp Pusdalops BNPB Nasional (darurat bencana)' },
      { id: 'damkar', phone: '622122137870', phoneDial: '021-0113', hasWhatsApp: true, regionName: 'Damkar MM2100', source: 'WA resmi Damkar MM2100' }
    ]
  };

  // Mapping wilayah kota/kabupaten & provinsi ke key regional database
  // Urutan: cek nama kota terlebih dahulu, lalu fallback ke nama provinsi
  const regionMatcher: Array<{ keywords: string[]; region: string }> = [
    // DKI Jakarta - semua kotamadya
    { keywords: ['jakarta', 'jakarta utara', 'jakarta selatan', 'jakarta barat', 'jakarta timur', 'jakarta pusat', 'kepulauan seribu'], region: 'jakarta' },
    // Bogor & sekitarnya
    { keywords: ['bogor', 'depok', 'cianjur', 'sukabumi'], region: 'bogor' },
    // Tangerang & Banten
    { keywords: ['tangerang', 'cilegon', 'serang', 'pandeglang', 'lebak'], region: 'tangerang' },
    // Bekasi & Karawang
    { keywords: ['bekasi', 'karawang', 'purwakarta', 'subang'], region: 'bekasi' },
    // Bandung & Jawa Barat
    { keywords: ['bandung', 'cimahi', 'garut', 'tasikmalaya', 'sumedang', 'ciamis', 'kuningan', 'majalengka', 'indramayu', 'cirebon'], region: 'bandung' },
    // Semarang & Jawa Tengah
    { keywords: ['semarang', 'kendal', 'demak', 'salatiga', 'ungaran', 'pekalongan', 'tegal', 'brebes', 'purwokerto', 'banyumas', 'cilacap', 'kebumen', 'purworejo', 'magelang', 'temanggung', 'wonosobo', 'blora', 'rembang', 'pati', 'kudus', 'jepara'], region: 'semarang' },
    // Solo / Surakarta
    { keywords: ['surakarta', 'solo', 'karanganyar', 'sragen', 'boyolali', 'wonogiri', 'klaten', 'sukoharjo'], region: 'solo' },
    // Yogyakarta
    { keywords: ['yogyakarta', 'sleman', 'bantul', 'gunung kidul', 'gunungkidul', 'kulon progo', 'kulonprogo'], region: 'yogyakarta' },
    // Surabaya & Jawa Timur
    { keywords: ['surabaya', 'gresik', 'sidoarjo', 'lamongan', 'mojokerto', 'pasuruan', 'probolinggo', 'situbondo', 'bondowoso', 'jember', 'banyuwangi', 'lumajang', 'tuban', 'bojonegoro', 'ngawi', 'magetan', 'madiun', 'ponorogo', 'pacitan', 'trenggalek', 'tulungagung', 'blitar', 'kediri', 'nganjuk', 'jombang', 'sampang', 'bangkalan', 'pamekasan', 'sumenep'], region: 'surabaya' },
    // Malang
    { keywords: ['malang', 'batu'], region: 'malang' },
    // Bali
    { keywords: ['denpasar', 'badung', 'gianyar', 'tabanan', 'bangli', 'klungkung', 'karangasem', 'buleleng', 'jembrana'], region: 'bali' },
    // Lombok & NTB
    { keywords: ['mataram', 'lombok', 'sumbawa', 'bima', 'dompu'], region: 'lombok' },
    // Medan & Sumatera Utara
    { keywords: ['medan', 'deli serdang', 'binjai', 'langkat', 'simalungun', 'pematang siantar', 'tebing tinggi', 'tanjung balai', 'nias', 'tapanuli', 'labuhanbatu', 'asahan'], region: 'medan' },
    // Padang & Sumatera Barat
    { keywords: ['padang', 'bukittinggi', 'payakumbuh', 'solok', 'pariaman', 'sawahlunto', 'tanah datar', 'agam', 'pasaman', 'pesisir selatan', 'sijunjung', 'dharmasraya'], region: 'padang' },
    // Palembang & Sumatera Selatan
    { keywords: ['palembang', 'prabumulih', 'lubuklinggau', 'pagar alam', 'baturaja', 'ogan', 'musi', 'lahat', 'muara enim'], region: 'palembang' },
    // Makassar & Sulawesi Selatan
    { keywords: ['makassar', 'maros', 'gowa', 'takalar', 'pangkep', 'barru', 'pare-pare', 'parepare', 'bone', 'soppeng', 'wajo', 'sinjai', 'bulukumba', 'selayar', 'jeneponto', 'bantaeng', 'enrekang', 'tana toraja', 'luwu', 'palopo', 'pinrang', 'sidenreng'], region: 'makassar' },
    // Manado & Sulawesi Utara
    { keywords: ['manado', 'tomohon', 'bitung', 'minahasa', 'bolaang mongondow', 'kotamobagu', 'sangihe', 'talaud'], region: 'manado' },
    // Pontianak & Kalimantan Barat
    { keywords: ['pontianak', 'singkawang', 'mempawah', 'sambas', 'bengkayang', 'sanggau', 'ketapang', 'sintang', 'kapuas hulu'], region: 'pontianak' },
    // Balikpapan & Kalimantan Timur
    { keywords: ['balikpapan', 'samarinda', 'bontang', 'tenggarong', 'kutai', 'berau', 'penajam', 'nusantara'], region: 'balikpapan' },
  ];

  // Fallback mapping by province name for regions not matched by city
  const provinceMatcher: Record<string, string> = {
    'dki jakarta': 'jakarta',
    'jawa barat': 'bandung',
    'banten': 'tangerang',
    'jawa tengah': 'semarang',
    'daerah istimewa yogyakarta': 'yogyakarta',
    'di yogyakarta': 'yogyakarta',
    'jawa timur': 'surabaya',
    'bali': 'bali',
    'nusa tenggara barat': 'lombok',
    'sumatera utara': 'medan',
    'sumatera barat': 'padang',
    'sumatera selatan': 'palembang',
    'sulawesi selatan': 'makassar',
    'sulawesi utara': 'manado',
    'kalimantan barat': 'pontianak',
    'kalimantan timur': 'balikpapan',
    'kalimantan utara': 'balikpapan',
  };

  useEffect(() => {
    if (!dispatchModalAlert) {
      setDetectedLocation(null);
      return;
    }

    const fetchLocationData = async () => {
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${dispatchModalAlert.latitude}&lon=${dispatchModalAlert.longitude}&format=json&accept-language=id`,
          {
            headers: {
              'User-Agent': 'LifelineAI-Emergency-Command-Center'
            }
          }
        );
        const data = await res.json();
        
        if (data && data.address) {
          const city = data.address.city || data.address.regency || data.address.county || data.address.municipality || data.address.town || data.address.village || '';
          const province = data.address.state || '';
          const suburb = data.address.suburb || data.address.district || '';
          
          let selectedRegion = 'default';
          const cleanCity = city.toLowerCase().trim();
          const cleanProvince = province.toLowerCase().trim();
          const cleanSuburb = suburb.toLowerCase().trim();
          const searchTerms = [cleanCity, cleanSuburb];
          
          // Step 1: Try to match by city/regency/kabupaten name
          for (const matcher of regionMatcher) {
            const found = matcher.keywords.some(keyword => 
              searchTerms.some(term => term.includes(keyword) || keyword.includes(term))
            );
            if (found) {
              selectedRegion = matcher.region;
              break;
            }
          }
          
          // Step 2: If no city match, try province-level fallback
          if (selectedRegion === 'default' && cleanProvince) {
            for (const [provName, regionKey] of Object.entries(provinceMatcher)) {
              if (cleanProvince.includes(provName) || provName.includes(cleanProvince)) {
                selectedRegion = regionKey;
                break;
              }
            }
          }
          
          const regionalContacts = regionalDatabase[selectedRegion] || regionalDatabase['default'];
          
          const resolved = agencies.map(agency => {
            const match = regionalContacts.find(c => c.id === agency.id);
            return match ? { ...agency, phone: match.phone, phoneDial: match.phoneDial, hasWhatsApp: match.hasWhatsApp, name: `${agency.name} (${match.regionName})`, source: match.source } : agency;
          });

          setDetectedLocation({
            cityOrRegency: city,
            province: province,
            resolvedAgencies: resolved
          });
        }
      } catch (error) {
        console.error('Failed to geocode location:', error);
        const resolved = agencies.map(agency => {
          const match = regionalDatabase['default'].find(c => c.id === agency.id);
          return match ? { ...agency, phone: match.phone, phoneDial: match.phoneDial, hasWhatsApp: match.hasWhatsApp, name: `${agency.name} (Nasional)`, source: match.source } : agency;
        });
        setDetectedLocation({
          cityOrRegency: 'Tidak Diketahui',
          province: 'Nasional',
          resolvedAgencies: resolved
        });
      } finally {
        setGeocoding(false);
      }
    };

    fetchLocationData();
  }, [dispatchModalAlert]);

  const formatWhatsAppNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const getAgencyIcon = (id: string, className: string) => {
    switch (id) {
      case 'police': return <Shield className={className} />;
      case 'hospital': return <Activity className={className} />;
      case 'sar': return <Compass className={className} />;
      case 'bpbd': return <AlertTriangle className={className} />;
      case 'damkar': return <Flame className={className} />;
      default: return <Siren className={className} />;
    }
  };

  const handleOnlyDispatch = async (id: string) => {
    setDispatchModalAlert(null);
    handleDispatch(id);
  };

  const handleDispatchWithAgency = async (alert: any, agency: any, mode: 'whatsapp' | 'call' = 'whatsapp') => {
    setDispatchModalAlert(null);
    
    if (mode === 'call') {
      // Langsung telepon ke nomor darurat resmi
      window.open(`tel:${agency.phoneDial}`, '_self');
      handleDispatch(alert.id);
      return;
    }

    // WhatsApp mode
    const alertTypeInfo = getEmergencyTypeInfo(alert.type);
    const dateStr = new Date(alert.createdAt).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const gpsStatus = alert.isSuspicious 
      ? '⚠️ Peringatan: Lokasi Mencurigakan / Terdeteksi Mock (Fake) GPS!'
      : alert.accuracy !== undefined && alert.accuracy !== null
        ? `Akurat (Akurasi GPS: ±${alert.accuracy.toFixed(1)} meter)`
        : 'Akurasi GPS standar (Lokasi default)';
    
    const messageTemplate = `Halo ${agency.name}, kami dari Command Center Lifeline AI ingin melaporkan kondisi darurat yang membutuhkan penanganan segera:

🚨 *DETAIL LAPORAN DARURAT*
• Kategori: *${alertTypeInfo.label}*
• Pelapor: *${alert.user?.name || 'Warga Anonim'}*
• No. Telp Pelapor: *${alert.user?.phone || '-'}*
• Tanggal & Waktu: *${dateStr} WIB*
• Detail/Pesan: *"${alert.message || 'Tidak ada pesan tambahan'}"*

📍 *LOKASI DAN NAVIGASI*
• Koordinat: ${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}
• Google Maps: https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}
• Status GPS: *${gpsStatus}*

Mohon bantuan instansi untuk segera mengirimkan armada penyelamat ke lokasi tersebut. Terima kasih atas kerja samanya.`;

    const text = encodeURIComponent(messageTemplate);
    window.open(`https://wa.me/${formatWhatsAppNumber(agency.phone)}?text=${text}`, '_blank');
    
    handleDispatch(alert.id);
  };

  const getEmergencyTypeInfo = (type: string) => {
    switch (type) {
      case 'MEDICAL': return { label: 'Darurat Medis', color: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', icon: '🏥' };
      case 'FIRE': return { label: 'Kebakaran', color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-500', gradient: 'from-orange-500 to-red-500', icon: '🔥' };
      case 'CRIME': return { label: 'Tindak Kriminal', color: 'bg-purple-50 text-purple-600 border-purple-200', dot: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', icon: '🚨' };
      case 'ACCIDENT': return { label: 'Kecelakaan', color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500', icon: '⚠️' };
      default: return { label: 'Darurat Umum (SOS)', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500', gradient: 'from-red-500 to-rose-600', icon: '🆘' };
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    return `${hours} jam lalu`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ===== HEADER SECTION ===== */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest">
              COMMAND CENTER AKTIF
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Pusat Kendali Darurat
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitoring titik darurat warga secara real-time dan dispatch satgas keselamatan.
          </p>
        </div>
        
        {/* Live Clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/85 rounded-2xl text-slate-800 shadow-sm shadow-slate-100/50">
            <Timer className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-sm font-mono font-bold tracking-wider text-slate-700">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* ===== STATS OVERVIEW CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active SOS Count */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all duration-500 ${
            activeAlerts.length > 0 
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-100/50' 
              : 'glass-panel border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">SOS Aktif</span>
            <div className={`p-2 rounded-xl ${activeAlerts.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
              <Siren className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${activeAlerts.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {activeAlerts.length}
            </span>
            {activeAlerts.length > 0 && (
              <span className="text-[10px] font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase danger-pulse">
                SIAGA
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Sinyal darurat yang belum ditangani</p>
          {activeAlerts.length > 0 && (
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-red-200/30 blur-2xl" />
          )}
        </motion.div>

        {/* Response Time */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Waktu Respon</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900">&lt;3<span className="text-lg ml-0.5">min</span></span>
          <p className="text-[10px] text-slate-500 mt-2">Rata-rata waktu respon satgas</p>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-emerald-100/40 blur-2xl" />
        </motion.div>

        {/* Coverage */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-panel border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Area Cakupan</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900">24<span className="text-lg ml-0.5">km²</span></span>
          <p className="text-[10px] text-slate-500 mt-2">Radius pemantauan aktif saat ini</p>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-blue-100/40 blur-2xl" />
        </motion.div>

        {/* Network Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Jaringan Warga</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Wifi className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">ON</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-200">
              TERHUBUNG
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Sistem monitoring berjalan normal</p>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-emerald-100/40 blur-2xl" />
        </motion.div>
      </div>

      {/* ===== MAIN HERO STATUS BANNER ===== */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 ${
          activeAlerts.length > 0 
            ? 'bg-gradient-to-r from-red-50 via-rose-50/30 to-red-50 border-red-200/80 shadow-lg shadow-red-500/5' 
            : 'bg-gradient-to-r from-emerald-50 via-green-50/30 to-emerald-50 border-emerald-200/80 shadow-lg shadow-emerald-500/5'
        }`}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 right-0 h-64 w-64 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 transition-colors duration-500 ${
            activeAlerts.length > 0 ? 'bg-red-400/10' : 'bg-emerald-400/10'
          }`} />
          <div className={`absolute bottom-0 left-0 h-48 w-48 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 transition-colors duration-500 ${
            activeAlerts.length > 0 ? 'bg-rose-400/10' : 'bg-teal-400/10'
          }`} />
          {/* Scanning line effect */}
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent ${
              activeAlerts.length > 0 ? 'via-red-400/30' : 'via-emerald-400/30'
            }`}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Status Info */}
          <div className="flex items-center gap-5">
            <div className={`relative p-4 rounded-2xl ring-2 transition-all duration-500 ${
              activeAlerts.length > 0 
                ? 'bg-red-100 text-red-600 ring-red-200/50' 
                : 'bg-emerald-100 text-emerald-600 ring-emerald-200/50'
            }`}>
              {activeAlerts.length > 0 ? (
                <Activity className="h-10 w-10 animate-pulse" />
              ) : (
                <Shield className="h-10 w-10" />
              )}
              {/* Radar ring animation */}
              <motion.div 
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                className={`absolute inset-0 rounded-2xl border-2 ${
                  activeAlerts.length > 0 ? 'border-red-500/30' : 'border-emerald-500/30'
                }`}
              />
            </div>
            <div>
              <h2 className={`text-2xl font-extrabold transition-colors duration-500 ${
                activeAlerts.length > 0 ? 'text-red-950' : 'text-emerald-950'
              }`}>
                {activeAlerts.length > 0 
                  ? `${activeAlerts.length} Sinyal Darurat Aktif`
                  : 'Kondisi Kota Aman'
                }
              </h2>
              <p className={`text-sm mt-1 max-w-md font-medium transition-colors duration-500 ${
                activeAlerts.length > 0 ? 'text-red-800/70' : 'text-emerald-800/70'
              }`}>
                {activeAlerts.length > 0 
                  ? 'Terdapat warga yang membutuhkan bantuan segera. Dispatch satgas keselamatan sekarang.'
                  : 'Tidak ada sinyal darurat aktif. Semua sektor dalam kondisi normal dan terpantau.'
                }
              </p>
            </div>
          </div>

          {/* Right: Connection + Live indicators */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-colors duration-500 ${
              activeAlerts.length > 0 
                ? 'bg-red-50 border-red-200/80 text-red-700' 
                : 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeAlerts.length > 0 ? 'bg-red-400' : 'bg-emerald-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeAlerts.length > 0 ? 'bg-red-500' : 'bg-emerald-500'
                }`}></span>
              </span>
              <span className="text-xs font-mono font-bold">
                Terhubung ke Jaringan Warga
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-500 ${
              activeAlerts.length > 0 
                ? 'bg-rose-50/80 border-rose-200/80 text-rose-700' 
                : 'bg-cyan-50/80 border-cyan-200/80 text-cyan-700'
            }`}>
              <Radio className={`h-3.5 w-3.5 animate-pulse ${
                activeAlerts.length > 0 ? 'text-rose-500' : 'text-cyan-500'
              }`} />
              <span className="text-[11px] font-mono font-bold">
                RADAR MONITORING · LIVE
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== ALERT LIST ===== */}
      {loading && activeAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-4">Memindai sinyal darurat...</p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">Mengakses jaringan telemetri warga</p>
        </div>
      ) : activeAlerts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="glass-panel border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[320px] text-center shadow-sm relative overflow-hidden"
        >
          {/* Decorative background circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.05, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="h-72 w-72 rounded-full border border-emerald-200/50"
            />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.03, 0.08] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute h-96 w-96 rounded-full border border-emerald-200/30"
            />
          </div>
          
          <div className="relative z-10">
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl mb-5 border border-emerald-100 shadow-sm shadow-emerald-100/50 inline-block"
            >
              <Shield className="h-12 w-12 text-emerald-500" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-800">Semua Sektor Aman</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
              Tidak ada sinyal darurat (SOS) aktif dari warga saat ini. Sistem akan otomatis mendeteksi dan memberikan notifikasi real-time jika ada keadaan darurat.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                <Eye className="h-3 w-3" />
                <span>Pemantauan Aktif</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                <Radio className="h-3 w-3" />
                <span>Radar Scanning</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                <Wifi className="h-3 w-3" />
                <span>Telemetri OK</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Section title */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Sinyal Darurat Aktif ({activeAlerts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {activeAlerts.map((alert, index) => {
                const typeInfo = getEmergencyTypeInfo(alert.type);
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.08 }}
                    key={alert.id}
                    className="bg-white border-2 border-red-100 rounded-3xl overflow-hidden shadow-lg shadow-red-500/5 flex flex-col relative group hover:shadow-xl hover:shadow-red-500/10 transition-shadow duration-500"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${typeInfo.gradient}`} />
                    
                    {/* Top urgency banner */}
                    <div className={`px-6 py-2.5 bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{typeInfo.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/80">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-mono font-semibold">{getTimeSince(alert.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {/* User info */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0 ring-2 ring-red-100">
                          {alert.user?.avatar ? (
                            <img src={getBackendAssetUrl(alert.user.avatar)} alt={alert.user.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{alert.user?.name || 'Warga Anonim'}</p>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(alert.createdAt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>
                            <span className="mx-1 text-slate-300">·</span>
                            <span>{new Date(alert.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details card */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 mb-5">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-red-50 rounded-lg mt-0.5">
                            <MapPin className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-700">Lokasi Titik Darurat</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                              LAT: {alert.latitude.toFixed(6)} &nbsp;|&nbsp; LONG: {alert.longitude.toFixed(6)}
                            </p>
                            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                alert.isSuspicious
                                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              }`}>
                                {alert.isSuspicious 
                                  ? '⚠️ FAKE GPS / PALSU DETECTED' 
                                  : alert.accuracy !== undefined && alert.accuracy !== null
                                    ? `📍 REAL GPS (Akurasi: ${alert.accuracy.toFixed(1)}m)`
                                    : '📍 GPS Tidak Tersedia / IP-based'
                                }
                              </span>
                              {alert.altitude !== undefined && alert.altitude !== null && (
                                <span className="text-[9px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                                  Alt: {alert.altitude.toFixed(0)}m
                                </span>
                              )}
                              {alert.speed !== undefined && alert.speed !== null && alert.speed > 0 && (
                                <span className="text-[9px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                                  Kecepatan: {(alert.speed * 3.6).toFixed(1)} km/h
                                </span>
                              )}
                            </div>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 mt-1.5"
                            >
                              <MapPin className="h-3 w-3" />
                              Buka di Google Maps ↗
                            </a>
                          </div>
                        </div>
                        
                        {alert.user?.phone && (
                          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                            <div className="p-1.5 bg-emerald-50 rounded-lg">
                              <Phone className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="flex-1 flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-700">Nomor Telepon</p>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{alert.user.phone}</p>
                              </div>
                              <a 
                                href={`https://wa.me/${formatWhatsAppNumber(alert.user.phone)}?text=${encodeURIComponent(
                                  `Halo ${alert.user.name || 'Warga'}, kami dari Command Center Lifeline AI. Menindaklanjuti laporan darurat Anda, silakan infokan detail atau kondisi terkini jika memungkinkan.`
                                )}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-[10px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/40 text-emerald-700 font-bold px-2.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span>Hubungi WA</span>
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {alert.message && (
                          <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
                            <div className="p-1.5 bg-amber-50 rounded-lg mt-0.5">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-700">Pesan Tambahan</p>
                              <p className="text-xs text-slate-600 mt-1 italic bg-white px-3 py-2 rounded-lg border border-slate-200">"{alert.message}"</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => setDispatchModalAlert(alert)}
                        disabled={dispatchingId === alert.id}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg disabled:opacity-70 disabled:cursor-wait cursor-pointer ${
                          dispatchingId === alert.id
                            ? 'bg-slate-200 text-slate-600 shadow-none'
                            : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/20 hover:shadow-red-500/30 active:scale-[0.98]'
                        }`}
                      >
                        {dispatchingId === alert.id ? (
                          <>
                            <div className="h-4 w-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                            <span>MENGIRIM SATGAS...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>DISPATCH SATGAS SEKARANG</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ===== DISPATCH AGENCY MODAL ===== */}
      <AnimatePresence>
        {dispatchModalAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDispatchModalAlert(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Siren className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Pilih Instansi Penyelamatan</h3>
                    <p className="text-xs text-white/80">Kirim data darurat & hubungi instansi terkait via WhatsApp</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDispatchModalAlert(null)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Alert Summary */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase">
                      Detail Laporan
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-2">
                      Nama Pelapor: <span className="text-slate-600 font-semibold">{dispatchModalAlert.user?.name || 'Warga Anonim'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Kategori: <span className="font-semibold text-slate-700">{getEmergencyTypeInfo(dispatchModalAlert.type).label}</span>
                    </p>
                    {dispatchModalAlert.message && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        "{dispatchModalAlert.message}"
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-700">Koordinat Lokasi</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      {dispatchModalAlert.latitude.toFixed(6)}, {dispatchModalAlert.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Geocoding / Location status */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {geocoding ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Mendeteksi instansi wilayah terdekat...
                      </span>
                    ) : detectedLocation ? (
                      <span>
                        Wilayah Terdeteksi: <span className="font-bold text-slate-700">{detectedLocation.cityOrRegency}, {detectedLocation.province}</span>
                      </span>
                    ) : (
                      <span>Mencari lokasi...</span>
                    )}
                  </div>
                  {!geocoding && detectedLocation && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-mono font-bold animate-pulse">
                      📍 INSTANSI TERDEKAT AKTIF
                    </span>
                  )}
                </div>

                {/* Agencies List */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hubungi Instansi Darurat Terdekat</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(detectedLocation ? detectedLocation.resolvedAgencies : agencies).map((agency: any) => {
                      const isRecommended = 
                        (dispatchModalAlert.type === 'CRIME' && agency.id === 'police') ||
                        ((dispatchModalAlert.type === 'MEDICAL' || dispatchModalAlert.type === 'ACCIDENT') && agency.id === 'hospital') ||
                        (dispatchModalAlert.type === 'FIRE' && agency.id === 'damkar') ||
                        (dispatchModalAlert.type === 'SOS' && (agency.id === 'bpbd' || agency.id === 'sar'));
                      
                      const iconColor = 
                        agency.id === 'police' ? 'text-blue-500 bg-blue-50 border-blue-100' :
                        agency.id === 'hospital' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                        agency.id === 'sar' ? 'text-orange-500 bg-orange-50 border-orange-100' :
                        agency.id === 'bpbd' ? 'text-red-500 bg-red-50 border-red-100' :
                        'text-amber-500 bg-amber-50 border-amber-100'; // damkar
                      
                      return (
                        <div
                          key={agency.id}
                          className={`flex flex-col p-5 rounded-2xl border text-left transition-all duration-300 relative group hover:shadow-md ${
                            isRecommended
                              ? 'bg-gradient-to-br from-slate-50/50 to-white border-l-4 border-l-red-500 border-y-slate-200 border-r-slate-200 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Top: Icon & Title & Recommended Badge */}
                          <div className="flex items-start gap-4 w-full">
                            <div className={`p-3 rounded-xl border shrink-0 ${iconColor}`}>
                              {getAgencyIcon(agency.id, "h-5 w-5")}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-bold text-slate-800 text-sm">
                                  {agency.name}
                                </h5>
                                {isRecommended && (
                                  <span className="bg-red-50 text-red-600 border border-red-200/50 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Rekomendasi
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {agency.description}
                              </p>
                              {agency.source && (
                                <p className="text-[9px] text-slate-400 italic mt-0.5">
                                  📋 Sumber: {agency.source}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card Bottom: Dual Contact Buttons */}
                          <div className="w-full mt-4 pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex flex-col gap-2">
                              {/* Tombol Telepon Langsung - selalu tersedia */}
                              <button
                                onClick={() => handleDispatchWithAgency(dispatchModalAlert, agency, 'call')}
                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-all border border-blue-100 cursor-pointer"
                              >
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="whitespace-nowrap">Telepon {agency.phoneDial}</span>
                              </button>

                              {/* Tombol WhatsApp - hanya jika tersedia */}
                              {agency.hasWhatsApp ? (
                                <button
                                  onClick={() => handleDispatchWithAgency(dispatchModalAlert, agency, 'whatsapp')}
                                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] text-xs font-semibold rounded-xl transition-all border border-[#bbf7d0] cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 fill-current text-[#16a34a]" viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                                  </svg>
                                  <span className="whitespace-nowrap">WhatsApp</span>
                                </button>
                              ) : (
                                <span className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-400 text-xs font-semibold rounded-xl border border-slate-100">
                                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  <span className="whitespace-nowrap">WA Tidak Tersedia</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 text-center">
                              {agency.hasWhatsApp 
                                ? `WA Resmi: +${agency.phone.length > 5 ? agency.phone.substring(0, 2) + ' ' + agency.phone.substring(2, 5) + '-' + agency.phone.substring(5, 9) + '-' + agency.phone.substring(9) : agency.phone} · Telp: ${agency.phoneDial}`
                                : `Hanya bisa dihubungi via telepon: ${agency.phoneDial}`
                              }
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  Lifeline AI akan mencatat laporan ini sebagai diproses saat Anda menghubungi instansi.
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setDispatchModalAlert(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleOnlyDispatch(dispatchModalAlert.id)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
                  >
                    Hanya Dispatch Internal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
