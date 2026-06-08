const prisma = require('../config/database');

const createEmergency = async (req, res, next) => {
  try {
    const { type, latitude, longitude, message, isSilent, accuracy, altitude, speed } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ error: 'Location is required.' });

    // Validate GPS authenticity:
    // Real mobile GPS chips have a typical accuracy range of 3.0 to 30.0+ meters.
    // If accuracy is too perfect (e.g. exactly 0.0, or <= 1.0m), it's highly indicative of OS-level Mock/Fake GPS software.
    const isSuspicious = (accuracy !== undefined && accuracy !== null && (accuracy <= 1.0 || accuracy === 0));

    const alert = await prisma.emergencyAlert.create({
      data: { 
        userId: req.user.id, 
        type: type || 'SOS', 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        altitude: altitude ? parseFloat(altitude) : null,
        speed: speed ? parseFloat(speed) : null,
        isSuspicious: !!isSuspicious,
        message, 
        isSilent: isSilent || false 
      },
      include: { user: { select: { id: true, name: true, phone: true, avatar: true } } }
    });
    const io = req.app.get('io');
    if (io) io.emit('emergency-alert', alert);
    // Create notification for admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    await prisma.notification.createMany({
      data: admins.map(a => ({ userId: a.id, title: '🚨 Emergency SOS', message: `${req.user.name} has triggered an emergency alert!`, type: 'EMERGENCY', data: JSON.stringify({ alertId: alert.id, lat: latitude, lng: longitude }) }))
    });
    res.status(201).json(alert);
  } catch (error) { next(error); }
};

const getEmergencies = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { ...(status && { status }) };
    const alerts = await prisma.emergencyAlert.findMany({
      where, include: { user: { select: { id: true, name: true, phone: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }, take: 50
    });
    res.json(alerts);
  } catch (error) { next(error); }
};

const updateEmergency = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Check if the emergency alert exists
    const existing = await prisma.emergencyAlert.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Emergency alert not found.' });
    }

    // Check if current user is ADMIN, MODERATOR, or the owner of the alert
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR' && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions. You can only update your own alerts.' });
    }

    const data = { status };
    if (status === 'RESOLVED' || status === 'CANCELLED') data.resolvedAt = new Date();
    
    const alert = await prisma.emergencyAlert.update({ 
      where: { id: req.params.id }, 
      data,
      include: { user: { select: { id: true, name: true, phone: true, avatar: true } } }
    });
    
    const io = req.app.get('io');
    if (io) io.emit('emergency-updated', alert);
    res.json(alert);
  } catch (error) { next(error); }
};

const getMyEmergencies = async (req, res, next) => {
  try {
    const alerts = await prisma.emergencyAlert.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) { next(error); }
};

module.exports = { createEmergency, getEmergencies, updateEmergency, getMyEmergencies };
