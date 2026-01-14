import express, { Router } from 'express';
import userController from '../controllers/user.controller';
const router: Router = express.Router();

router.use((req, res, next) => {
  console.log(`[User Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/login', userController.userLogin);

export default router;
