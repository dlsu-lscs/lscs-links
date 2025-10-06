import express, { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router: Router = express.Router();

router.get(
  '/:shortLink',
  authMiddleware,
  analyticsController.getShortLinksAnalytics,
);

export default router;
