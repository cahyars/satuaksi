const router = require('express').Router();
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, broadcastNotification } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.post('/broadcast', broadcastNotification);
router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
