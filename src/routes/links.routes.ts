import express, { Router } from 'express';

import linkController from '../controllers/link.controller';

const router: Router = express.Router();

router.use((req, res, next) => {
  console.log(`[Public Link Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/:shortlink', linkController.getShortLink);

export default router;
