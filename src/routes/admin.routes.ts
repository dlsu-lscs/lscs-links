import express, { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router: Router = express.Router();

// Logger for admin routes
router.use((req, res, next) => {
  console.log(`[Admin Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/create', authMiddleware, adminController.createLink);
router.get('/links', authMiddleware, adminController.getAllLinks);
router.get('/link/:id', authMiddleware, adminController.getLinkByID);
router.put('/links/:id', authMiddleware, adminController.updateLinkByID);
router.delete('/links/:id', authMiddleware, adminController.deleteLinkByID);

export default router;
