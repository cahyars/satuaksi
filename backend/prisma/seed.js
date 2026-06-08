const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create categories
  const categoriesData = [
    { name: 'Kecelakaan Lalu Lintas', icon: 'AlertTriangle', color: '#EF4444', description: 'Kecelakaan tabrakan kendaraan atau kendala lalu lintas darurat.' },
    { name: 'Kriminalitas & Kekerasan', icon: 'ShieldAlert', color: '#F59E0B', description: 'Aktivitas kriminal, begal, perampokan, pencurian, atau tawuran warga.' },
    { name: 'Bencana Alam', icon: 'FlameKindling', color: '#3B82F6', description: 'Kebakaran, banjir, tanah longsor, gempa bumi, pohon tumbang.' },
    { name: 'Keadaan Darurat Medis', icon: 'HeartPulse', color: '#10B981', description: 'Warga membutuhkan pertolongan medis darurat segera di tempat umum.' },
    { name: 'Infrastruktur Rusak', icon: 'Construction', color: '#8B5CF6', description: 'Jalan berlubang, lampu jalan mati, kabel listrik menjuntai berbahaya.' },
    { name: 'Polusi & Lingkungan', icon: 'Droplets', color: '#06B6D4', description: 'Pembuangan limbah ilegal, kabut asap ekstrem, penumpukan sampah liar.' }
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const slug = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await prisma.reportCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name: cat.name,
        slug,
        icon: cat.icon,
        color: cat.color,
        description: cat.description
      }
    });
    categories.push(category);
  }
  console.log(`✅ Seeded ${categories.length} categories.`);

  // 2. Create users (Admin & General User)
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lifeline.ai' },
    update: {},
    create: {
      name: 'LifeLine Admin',
      email: 'admin@lifeline.ai',
      password: adminPassword,
      phone: '+628123456789',
      role: 'ADMIN',
      avatar: null,
      emergencyContact: '+628111111111'
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'warga@lifeline.ai' },
    update: {},
    create: {
      name: 'Budi Setiawan',
      email: 'warga@lifeline.ai',
      password: userPassword,
      phone: '+628987654321',
      role: 'USER',
      avatar: null,
      emergencyContact: '+628222222222'
    }
  });
  console.log('✅ Seeded users (admin@lifeline.ai / warga@lifeline.ai).');

  // 3. Create dummy locations for risk areas
  const locationsData = [
    { name: 'Kawasan Malioboro', type: 'crowd', latitude: -7.7929, longitude: 110.3658, dangerLevel: 1 },
    { name: 'Simpang Lima', type: 'traffic', latitude: -7.8012, longitude: 110.3745, dangerLevel: 2 },
    { name: 'Jalan Solo KM 5', type: 'accident_prone', latitude: -7.7829, longitude: 110.4012, dangerLevel: 3 }
  ];

  for (const loc of locationsData) {
    await prisma.location.create({
      data: loc
    });
  }
  console.log('✅ Seeded locations.');

  // 4. Create dummy reports
  const reportsData = [
    {
      title: 'Pohon Tumbang Menutup Jalan',
      description: 'Sebuah pohon beringin tua tumbang akibat angin kencang dan hujan lebat. Menutupi seluruh ruas jalan utama, menyebabkan kemacetan total. Mohon bantuan evakuasi segera.',
      latitude: -7.7932,
      longitude: 110.3688,
      address: 'Jl. Malioboro No. 42, Yogyakarta',
      severity: 'HIGH',
      status: 'VERIFIED',
      isEmergency: false,
      categoryId: categories.find(c => c.slug.includes('bencana-alam')).id,
      userId: user.id
    },
    {
      title: 'Tawuran Pelajar di Depan Sekolah',
      description: 'Sekelompok pelajar berkumpul dan saling serang menggunakan senjata tajam. Suasana sangat mencekam. Warga sekitar ketakutan untuk melintas.',
      latitude: -7.7815,
      longitude: 110.3924,
      address: 'Jl. Solo KM 4.5, Sleman',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      isEmergency: true,
      categoryId: categories.find(c => c.slug.includes('kriminalitas')).id,
      userId: user.id
    },
    {
      title: 'Jalan Berlubang Dalam di Tikungan Tajam',
      description: 'Terdapat lubang jalan sedalam kurang lebih 15cm tepat setelah tikungan. Sangat berbahaya bagi pengendara motor di malam hari karena minimnya penerangan.',
      latitude: -7.8042,
      longitude: 110.3812,
      address: 'Jl. Parangtritis KM 2, Bantul',
      severity: 'MEDIUM',
      status: 'PENDING',
      isEmergency: false,
      categoryId: categories.find(c => c.slug.includes('infrastruktur')).id,
      userId: user.id
    }
  ];

  for (const rep of reportsData) {
    await prisma.report.create({ data: rep });
  }
  console.log('✅ Seeded dummy reports.');

  // 5. Create AI Predictions
  const predictionsData = [
    {
      title: 'Kawasan Risiko Tinggi Cuaca Ekstrem',
      description: 'Analisis LifeLine AI mendeteksi konsentrasi awan kumulonimbus tebal di wilayah barat dengan risiko angin puting beliung setinggi 75% dalam 3 jam ke depan.',
      dangerScore: 78.5,
      type: 'weather',
      latitude: -7.7955,
      longitude: 110.3622,
      predictions: JSON.stringify([
        { type: 'angin_kencang', probability: 85, description: 'Potensi kerusakan atap ringan' },
        { type: 'banjir_genangan', probability: 60, description: 'Genangan air setinggi 10-30cm di area rendah' }
      ]),
      recommendations: JSON.stringify([
        'Hindari memarkir kendaraan di bawah pohon besar atau papan reklame',
        'Amankan dokumen penting ke tempat tinggi',
        'Pantau terus saluran evakuasi darurat lokal'
      ]),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: user.id
    }
  ];

  for (const pred of predictionsData) {
    await prisma.aIPrediction.create({ data: pred });
  }
  console.log('✅ Seeded AI predictions.');

  // 6. Create Analytics data for chart history
  const dailyReportsData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dailyReportsData.push({
      type: 'daily_reports',
      label: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      value: Math.floor(Math.random() * 15 + 3),
      date
    });
  }

  await prisma.analytics.createMany({
    data: dailyReportsData
  });
  console.log('✅ Seeded daily reports trend data.');

  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
