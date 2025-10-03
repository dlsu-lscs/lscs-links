import express from 'express';

import linkController from '../controllers/link.controller';

const router = express.Router();

router.get('/:shortLink', linkController.getShortLink);

export default router;
