const router = require('express').Router();
const { getDashboardStats, getAnalyticsData, getHeatmapData } = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/stats', getDashboardStats);
router.get('/data', getAnalyticsData);
router.get('/heatmap', getHeatmapData);

module.exports = router;
