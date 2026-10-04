import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/owner.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken, requireRole('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);

export default router;
