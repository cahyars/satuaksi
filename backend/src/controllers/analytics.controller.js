const prisma = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalReports,
      activeEmergencies,
      totalUsers,
      pendingReports,
      recentReports,
      reportsByCategory,
      reportsByStatus,
      allReports,
      allReportsYearly
    ] = await Promise.all([
      prisma.report.count(),
      prisma.emergencyAlert.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.findMany({
        take: 10, orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true, color: true } }, user: { select: { name: true, avatar: true } } }
      }),
      prisma.report.groupBy({ by: ['categoryId'], _count: true }),
      prisma.report.groupBy({ by: ['status'], _count: true }),
      prisma.report.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true }
      }),
      prisma.report.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true }
      })
    ]);

    // 1. Generate Reports Trend - Daily (last 30 days)
    const reportsDailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const key = d.toDateString();
      reportsDailyTrend.push({ label, key, value: 0 });
    }
    allReports.forEach(r => {
      const dateStr = r.createdAt.toDateString();
      const found = reportsDailyTrend.find(t => t.key === dateStr);
      if (found) found.value += 1;
    });

    // 2. Generate Reports Trend - Monthly (last 12 months)
    const reportsMonthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      reportsMonthlyTrend.push({ label, key: monthKey, value: 0 });
    }
    allReportsYearly.forEach(r => {
      const monthKey = `${r.createdAt.getFullYear()}-${r.createdAt.getMonth()}`;
      const found = reportsMonthlyTrend.find(t => t.key === monthKey);
      if (found) found.value += 1;
    });

    // 3. Fetch BMKG Earthquakes Seismology Data
    let earthquakes = [];
    try {
      const resDirasakan = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
      if (resDirasakan.ok) {
        const data = await resDirasakan.json();
        if (data?.Infogempa?.gempa) {
          earthquakes = earthquakes.concat(data.Infogempa.gempa);
        }
      }
    } catch (e) {
      console.error("Failed to fetch felt earthquakes for analytics:", e);
    }

    try {
      const resTerkini = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
      if (resTerkini.ok) {
        const data = await resTerkini.json();
        if (data?.Infogempa?.gempa) {
          earthquakes = earthquakes.concat(data.Infogempa.gempa);
        }
      }
    } catch (e) {
      console.error("Failed to fetch recent earthquakes for analytics:", e);
    }

    // 4. Generate BMKG Trend - Daily (last 30 days)
    const bmkgDailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const key = d.toDateString();
      bmkgDailyTrend.push({ label, key, value: 0 });
    }
    earthquakes.forEach(eq => {
      if (eq.DateTime) {
        const d = new Date(eq.DateTime);
        const dateStr = d.toDateString();
        const found = bmkgDailyTrend.find(t => t.key === dateStr);
        if (found) found.value += 1;
      }
    });

    // 5. Generate BMKG Trend - Monthly (last 12 months)
    const bmkgMonthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      bmkgMonthlyTrend.push({ label, key: monthKey, value: 0 });
    }
    earthquakes.forEach(eq => {
      if (eq.DateTime) {
        const d = new Date(eq.DateTime);
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        const found = bmkgMonthlyTrend.find(t => t.key === monthKey);
        if (found) found.value += 1;
      }
    });

    const categories = await prisma.reportCategory.findMany({ select: { id: true, name: true, color: true } });
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));

    res.json({
      stats: {
        totalReports,
        activeEmergencies,
        totalUsers,
        pendingReports,
        resolvedReports: await prisma.report.count({ where: { status: 'RESOLVED' } }),
        aiPredictions: await prisma.aIPrediction.count()
      },
      recentReports,
      reportsByCategory: reportsByCategory.map(r => ({
        category: categoryMap[r.categoryId]?.name || 'Unknown',
        color: categoryMap[r.categoryId]?.color || '#666',
        count: r._count
      })),
      reportsByStatus: reportsByStatus.map(r => ({
        status: r.status,
        count: r._count
      })),
      reportsTrend: {
        daily: reportsDailyTrend,
        monthly: reportsMonthlyTrend
      },
      bmkgTrend: {
        daily: bmkgDailyTrend,
        monthly: bmkgMonthlyTrend
      }
    });
  } catch (error) { next(error); }
};

const getAnalyticsData = async (req, res, next) => {
  try {
    const { type = 'daily_reports', days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const data = await prisma.analytics.findMany({
      where: { type, date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });
    res.json(data);
  } catch (error) { next(error); }
};

const getHeatmapData = async (req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: { not: 'REJECTED' } },
      select: { latitude: true, longitude: true, severity: true, categoryId: true },
      take: 500
    });
    const predictions = await prisma.aIPrediction.findMany({
      where: { validUntil: { gte: new Date() } },
      select: { latitude: true, longitude: true, dangerScore: true, type: true, radius: true },
      take: 200
    });
    res.json({ reports, predictions });
  } catch (error) { next(error); }
};

module.exports = { getDashboardStats, getAnalyticsData, getHeatmapData };
