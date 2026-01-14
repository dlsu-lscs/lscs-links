import express, { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router: Router = express.Router();

// Logger for admin routes
router.use((req, res, next) => {
  console.log(`[Admin Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/admin/create', authMiddleware, adminController.createLink);
router.get('/admin/links', authMiddleware, adminController.getAllLinks);
router.get('/admin/link/:id', authMiddleware, adminController.getLinkByID);
router.put('/admin/links/:id', authMiddleware, adminController.updateLinkByID);
router.delete(
  '/admin/links/:id',
  authMiddleware,
  adminController.deleteLinkByID,
);

export default router;
