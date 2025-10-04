import express, { Router } from 'express';

import linkController from '../controllers/link.controller';

const router: Router = express.Router();

router.get('/:shortLink', linkController.getShortLink);

export default router;
