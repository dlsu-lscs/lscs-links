import express from 'express';
import cors from 'cors';
import path from 'path';
import adminRoutes from './routes/admin.routes';
import linksRoutes from './routes/links.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';
import connectDB from './config/db';
import config from './config/config';

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(express.json());
app.use('/admin', adminRoutes);
app.use('/', linksRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/auth', userRoutes);

connectDB();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;

