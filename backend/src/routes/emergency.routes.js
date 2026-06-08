const router = require('express').Router();
const { createEmergency, getEmergencies, updateEmergency, getMyEmergencies } = require('../controllers/emergency.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.post('/', createEmergency);
router.get('/', getEmergencies);
router.get('/my', getMyEmergencies);
router.put('/:id', updateEmergency);

module.exports = router;
