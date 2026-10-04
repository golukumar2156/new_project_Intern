import { Router } from 'express';
import {
  getDashboardStats,
  addUser,
  getUsers,
  getUserById,
  updateUserStatus,
  addStore,
  getStores,
} from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken, requireRole('SYSTEM_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.post('/users', addUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.post('/stores', addStore);
router.get('/stores', getStores);

export default router;
