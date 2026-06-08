const prisma = require('../config/database');

const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, categoryId, severity, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(severity && { severity }),
      ...(search && { OR: [{ title: { contains: search } }, { description: { contains: search } }] })
    };
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where, skip, take: parseInt(limit),
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.report.count({ where })
    ]);
    res.json({ reports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) { next(error); }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        user: { select: { id: true, name: true, avatar: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    res.json(report);
  } catch (error) { next(error); }
};

const createReport = async (req, res, next) => {
  try {
    const { title, description, categoryId, latitude, longitude, address, severity, isEmergency } = req.body;
    if (!title || !description || !categoryId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Title, description, category, and location are required.' });
    }
    const data = {
      title, description, categoryId, userId: req.user.id,
      latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      address, severity: severity || 'MEDIUM', isEmergency: isEmergency === 'true' || isEmergency === true
    };
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;

    const report = await prisma.report.create({
      data,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    // Emit realtime event
    const io = req.app.get('io');
    if (io) io.emit('new-report', report);

    res.status(201).json(report);
  } catch (error) { next(error); }
};

const updateReport = async (req, res, next) => {
  try {
    const { title, description, status, severity, isVerified, categoryId } = req.body;
    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (status) data.status = status;
    if (severity) data.severity = severity;
    if (categoryId) data.categoryId = categoryId;
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (status === 'RESOLVED') data.resolvedAt = new Date();

    const report = await prisma.report.update({
      where: { id: req.params.id }, data,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true, avatar: true } }
      }
    });
    
    const io = req.app.get('io');
    if (io) io.emit('report-updated', report);
    
    res.json(report);
  } catch (error) { next(error); }
};

const deleteReport = async (req, res, next) => {
  try {
    const reportId = req.params.id;

    // Check if report exists first
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Use transaction to delete related records first, then the report
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { reportId } }),
      prisma.report.delete({ where: { id: reportId } }),
    ]);

    // Emit realtime event
    const io = req.app.get('io');
    if (io) io.emit('report-deleted', { id: reportId });

    res.json({ message: 'Report deleted successfully.' });
  } catch (error) { next(error); }
};

const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content is required.' });
    const comment = await prisma.comment.create({
      data: { content, reportId: req.params.id, userId: req.user.id },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });
    const io = req.app.get('io');
    if (io) io.emit('new-comment', { reportId: req.params.id, comment });
    res.status(201).json(comment);
  } catch (error) { next(error); }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.user.id },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) { next(error); }
};

module.exports = { getReports, getReportById, createReport, updateReport, deleteReport, addComment, getMyReports };
