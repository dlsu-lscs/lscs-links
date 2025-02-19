import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import { handleRedirect } from '../services/link.js';
const router = Router();

router.get('/:shortlink', authenticateToken, handleRedirect);

export default router;

