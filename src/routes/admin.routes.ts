import express, { Router } from 'express';

import * as adminController from '../controllers/admin.controller';

const router: Router = express.Router();

router.get('/link/:id', adminController.getLinkByID);

export default router;
