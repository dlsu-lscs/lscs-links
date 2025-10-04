import express, { Router } from 'express';
import userController from '../controllers/user.controller';
const router: Router = express.Router();

router.post('/login', userController.userLogin);

export default router;
