import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import { createLink, getLinks, getLinkById, updateLink, deleteLink } from '../services/link.js';

const router = Router();

router.post('/create', authenticateToken, createLink);
router.get('/links', authenticateToken, getLinks);
router.get('/link/:id', authenticateToken, getLinkById);
router.put('/links/:id', authenticateToken, updateLink);
router.delete('/links/:id', authenticateToken, deleteLink);

export default router;

