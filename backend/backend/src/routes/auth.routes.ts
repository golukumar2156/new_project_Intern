import { Router } from 'express';
import { signup, ownerSignup, login, getMe, changePassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/owner-signup', ownerSignup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.patch('/change-password', authenticateToken, changePassword);

export default router;
