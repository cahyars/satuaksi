const router = require('express').Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', authorize('ADMIN'), getUserById);
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id', authorize('ADMIN'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;
