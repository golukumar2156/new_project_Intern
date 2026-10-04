import { Router } from 'express';
import { getStoresForUser, submitRating } from '../controllers/store.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken, requireRole('NORMAL_USER'));

router.get('/', getStoresForUser);
router.post('/:storeId/rating', submitRating);

export default router;
