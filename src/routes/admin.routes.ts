import express, { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router: Router = express.Router();

router.post('/create', authMiddleware, adminController.createLink);
router.get('/links', authMiddleware, adminController.getAllLinks);
router.get('/link/:id', authMiddleware, adminController.getLinkByID);

export default router;
