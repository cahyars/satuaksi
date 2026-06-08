const prisma = require('../config/database');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
    res.json({ notifications, unreadCount });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } });
    res.json({ message: 'Marked as read.' });
  } catch (error) { next(error); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    res.json({ message: 'All marked as read.' });
  } catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: 'Notification deleted.' });
  } catch (error) { next(error); }
};

const broadcastNotification = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can broadcast notifications.' });
    }
    
    const { title, message, type } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const users = await prisma.user.findMany({ select: { id: true } });
    
    const notifications = users.map(u => ({
      userId: u.id,
      title,
      message,
      type: type || 'SYSTEM'
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    // Optionally emit via socket io if accessible
    if (req.app.get('io')) {
      req.app.get('io').emit('broadcast', { title, message, type: type || 'SYSTEM', createdAt: new Date() });
    }

    res.json({ message: 'Broadcast sent successfully.', count: users.length });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, broadcastNotification };
