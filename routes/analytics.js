import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import getLinkAnalytics from '../services/analytics.js';

const router = Router();

router.get('/:shortlink', authenticateToken, getLinkAnalytics);

export default router;

