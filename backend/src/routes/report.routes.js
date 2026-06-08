const router = require('express').Router();
const { getReports, getReportById, createReport, updateReport, deleteReport, addComment, getMyReports } = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(authenticate);
router.get('/', getReports);
router.get('/my', getMyReports);
router.get('/:id', getReportById);
router.post('/', upload.single('image'), createReport);
router.put('/:id', authorize('ADMIN', 'MODERATOR'), updateReport);
router.delete('/:id', authorize('ADMIN'), deleteReport);
router.post('/:id/comments', addComment);

module.exports = router;
